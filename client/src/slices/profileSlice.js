import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as api from '../api/index'

export const getProfile = createAsyncThunk(
  'profiles/getOne',
  async (id) => {
    const { data } = await api.fetchProfile(id)
    return data
  }
)

export const getProfiles = createAsyncThunk(
  'profiles/getAll',
  async () => {
    const { data } = await api.fetchProfiles()
    return data
  }
)

export const getProfilesByUser = createAsyncThunk(
  'profiles/getByUser',
  async (searchQuery) => {
    const { data: { data } } = await api.fetchProfilesByUser(searchQuery)
    return data
  }
)

export const getProfilesBySearch = createAsyncThunk(
  'profiles/getBySearch',
  async (searchQuery) => {
    const { data: { data } } = await api.fetchProfilesBySearch(searchQuery)
    return data
  }
)

export const createProfile = createAsyncThunk(
  'profiles/create',
  async (profile) => {
    const { data } = await api.createProfile(profile)
    return data
  }
)

export const updateProfile = createAsyncThunk(
  'profiles/update',
  async ({ id, form, openSnackbar }) => {
    const { data } = await api.updateProfile(id, form)
    openSnackbar("Profile updated successfully")
    return data
  }
)

export const deleteProfile = createAsyncThunk(
  'profiles/delete',
  async (id) => {
    await api.deleteProfile(id)
    return id
  }
)

const profileSlice = createSlice({
  name: 'profiles',
  initialState: { isLoading: true, profiles: [] },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // getProfile
      .addCase(getProfile.fulfilled, (state, action) => {
        state.profile = action.payload
      })
      // getProfiles
      .addCase(getProfiles.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getProfiles.fulfilled, (state, action) => {
        state.profiles = action.payload
        state.isLoading = false
      })
      // getProfilesByUser
      .addCase(getProfilesByUser.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getProfilesByUser.fulfilled, (state, action) => {
        state.profiles = action.payload
        state.isLoading = false
      })
      // getProfilesBySearch
      .addCase(getProfilesBySearch.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getProfilesBySearch.fulfilled, (state, action) => {
        state.profiles = action.payload.data
        state.isLoading = false
      })
      // createProfile
      .addCase(createProfile.fulfilled, (state, action) => {
        state.profiles.push(action.payload)
      })
      // updateProfile
      .addCase(updateProfile.fulfilled, (state, action) => {
        const index = state.profiles.findIndex((p) => p._id === action.payload._id)
        if (index !== -1) state.profiles[index] = action.payload
      })
      // deleteProfile
      .addCase(deleteProfile.fulfilled, (state, action) => {
        state.profiles = state.profiles.filter((p) => p._id !== action.payload)
      })
  },
})

export default profileSlice.reducer
