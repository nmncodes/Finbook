import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as api from '../api/index'

export const getInvoicesByUser = createAsyncThunk(
  'invoices/getByUser',
  async (searchQuery) => {
    const { data: { data } } = await api.fetchInvoicesByUser(searchQuery)
    return data
  }
)

export const getInvoice = createAsyncThunk(
  'invoices/getOne',
  async (id) => {
    const user = JSON.parse(localStorage.getItem('profile'))
    const { data } = await api.fetchInvoice(id)
    const businessDetails = await api.fetchProfilesByUser({
      search: user?.result?._id || user?.result?.googleId,
    })
    return { ...data, businessDetails }
  }
)

export const createInvoice = createAsyncThunk(
  'invoices/create',
  async ({ invoice, history }) => {
    const { data } = await api.addInvoice(invoice)
    history.push(`/invoice/${data._id}`)
    return data
  }
)

export const updateInvoice = createAsyncThunk(
  'invoices/update',
  async ({ id, invoice }) => {
    const { data } = await api.updateInvoice(id, invoice)
    return data
  }
)

export const deleteInvoice = createAsyncThunk(
  'invoices/delete',
  async ({ id, openSnackbar }) => {
    await api.deleteInvoice(id)
    openSnackbar("Invoice deleted successfully")
    return id
  }
)

const invoiceSlice = createSlice({
  name: 'invoices',
  initialState: { isLoading: true, invoices: [] },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // getInvoicesByUser
      .addCase(getInvoicesByUser.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getInvoicesByUser.fulfilled, (state, action) => {
        state.invoices = action.payload
        state.isLoading = false
      })
      // getInvoice
      .addCase(getInvoice.fulfilled, (state, action) => {
        state.invoice = action.payload
      })
      // createInvoice
      .addCase(createInvoice.pending, (state) => {
        state.isLoading = true
      })
      .addCase(createInvoice.fulfilled, (state, action) => {
        state.invoices.push(action.payload)
        state.isLoading = false
      })
      // updateInvoice
      .addCase(updateInvoice.fulfilled, (state, action) => {
        const index = state.invoices.findIndex((inv) => inv._id === action.payload._id)
        if (index !== -1) state.invoices[index] = action.payload
      })
      // deleteInvoice
      .addCase(deleteInvoice.fulfilled, (state, action) => {
        state.invoices = state.invoices.filter((inv) => inv._id !== action.payload)
      })
  },
})

export default invoiceSlice.reducer
