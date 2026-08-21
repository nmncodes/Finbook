import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as api from '../api/index'

export const getClient = createAsyncThunk(
  'clients/getOne',
  async (id) => {
    const { data } = await api.fetchClient(id)
    return data
  }
)

export const getClientsByUser = createAsyncThunk(
  'clients/getByUser',
  async (searchQuery) => {
    const { data: { data } } = await api.fetchClientsByUser(searchQuery)
    return data
  }
)

export const createClient = createAsyncThunk(
  'clients/create',
  async ({ client, openSnackbar }) => {
    const { data } = await api.addClient(client)
    openSnackbar("Customer added successfully")
    return data
  }
)

export const updateClient = createAsyncThunk(
  'clients/update',
  async ({ id, client, openSnackbar }) => {
    const { data } = await api.updateClient(id, client)
    openSnackbar("Customer updated successfully")
    return data
  }
)

export const deleteClient = createAsyncThunk(
  'clients/delete',
  async ({ id, openSnackbar }) => {
    await api.deleteClient(id)
    openSnackbar("Customer deleted successfully")
    return id
  }
)

const clientSlice = createSlice({
  name: 'clients',
  initialState: { isLoading: true, clients: [] },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // getClient
      .addCase(getClient.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getClient.fulfilled, (state, action) => {
        state.client = action.payload
        state.isLoading = false
      })
      // getClientsByUser
      .addCase(getClientsByUser.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getClientsByUser.fulfilled, (state, action) => {
        state.clients = action.payload
        state.isLoading = false
      })
      // createClient
      .addCase(createClient.fulfilled, (state, action) => {
        state.clients.push(action.payload)
      })
      // updateClient
      .addCase(updateClient.fulfilled, (state, action) => {
        const index = state.clients.findIndex((c) => c._id === action.payload._id)
        if (index !== -1) state.clients[index] = action.payload
      })
      // deleteClient
      .addCase(deleteClient.fulfilled, (state, action) => {
        state.clients = state.clients.filter((c) => c._id !== action.payload)
      })
  },
})

export default clientSlice.reducer
