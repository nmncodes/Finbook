import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as api from '../api/index'

// Async thunks
export const signin = createAsyncThunk(
  'auth/signin',
  async ({ formData, openSnackbar, setLoading }, { rejectWithValue }) => {
    try {
      const { data } = await api.signIn(formData)
      openSnackbar("Signin successfull")
      window.location.href = "/dashboard"
      return data
    } catch (error) {
      openSnackbar(error?.response?.data?.message)
      setLoading(false)
      return rejectWithValue(error?.response?.data?.message)
    }
  }
)

export const signup = createAsyncThunk(
  'auth/signup',
  async ({ formData, openSnackbar, setLoading }, { rejectWithValue }) => {
    try {
      const { data } = await api.signUp(formData)
      const { info } = await api.createProfile({
        name: data?.result?.name,
        email: data?.result?.email,
        userId: data?.result?._id,
        phoneNumber: '',
        businessName: '',
        contactAddress: '',
        logo: '',
        website: '',
      })
      window.location.href = "/dashboard"
      openSnackbar("Sign up successfull")
      return { authData: data, profileData: info }
    } catch (error) {
      console.log(error)
      openSnackbar(error?.response?.data?.message)
      setLoading(false)
      return rejectWithValue(error?.response?.data?.message)
    }
  }
)

export const forgot = createAsyncThunk('auth/forgot', async (formData) => {
  await api.forgot(formData)
})

export const reset = createAsyncThunk('auth/reset', async ({ formData, history }) => {
  try {
    await api.reset(formData)
    history.push('/dashboard')
  } catch (error) {
    alert(error)
  }
})

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState: { authData: null },
  reducers: {
    logout(state) {
      localStorage.removeItem('profile')
      state.authData = null
    },
    googleLogin(state, action) {
      localStorage.setItem('profile', JSON.stringify({ ...action.payload }))
      state.authData = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signin.fulfilled, (state, action) => {
        localStorage.setItem('profile', JSON.stringify({ ...action.payload }))
        state.authData = action.payload
      })
      .addCase(signup.fulfilled, (state, action) => {
        localStorage.setItem('profile', JSON.stringify({ ...action.payload.authData }))
        state.authData = action.payload.authData
      })
  },
})

export const { logout, googleLogin } = authSlice.actions
export default authSlice.reducer
