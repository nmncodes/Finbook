import React, { createContext, useContext, useMemo, useState } from 'react'
import Snackbar from '@material-ui/core/Snackbar'
import { makeStyles } from '@material-ui/core/styles'

const SnackbarContext = createContext(null)

const useStyles = makeStyles(() => ({
  snackbar: {
    '& .MuiSnackbarContent-root': {
      backgroundColor: '#1f2937',
      color: '#fff',
      borderRadius: 8,
      boxShadow: '0 12px 30px rgba(0, 0, 0, 0.18)',
    },
  },
}))

const SnackbarProvider = ({ children }) => {
  const classes = useStyles()
  const [state, setState] = useState({ open: false, message: '' })

  const openSnackbar = (message) => {
    setState({ open: true, message: message || '' })
  }

  const closeSnackbar = () => {
    setState((current) => ({ ...current, open: false }))
  }

  const value = useMemo(() => ({ openSnackbar, closeSnackbar }), [])

  return (
    <SnackbarContext.Provider value={value}>
      {children}
      <Snackbar
        className={classes.snackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={state.open}
        autoHideDuration={3000}
        onClose={closeSnackbar}
        message={state.message}
      />
    </SnackbarContext.Provider>
  )
}

const useSnackbar = () => {
  const context = useContext(SnackbarContext)

  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider')
  }

  return [context.openSnackbar, context.closeSnackbar]
}

export { useSnackbar }
export default SnackbarProvider
