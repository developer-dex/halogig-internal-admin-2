import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getApi, postApi, putApi } from '../../services/api';
import { apiEndPoints } from '../../config/path';
import { showError, showSuccess } from '../../helpers/messageHelper';

const initialState = {
  isLoading: false,
  isError: false,
  admins: [],
};

export const fetchAdmins = createAsyncThunk(
  'admins/fetchAdmins',
  async () => {
    try {
      const response = await getApi(apiEndPoints.ADMINS);
      return response?.data?.data?.admins || [];
    } catch (e) {
      showError(e.response?.data?.message || 'Failed to load admins');
      throw e;
    }
  },
);

export const createAdmin = createAsyncThunk(
  'admins/createAdmin',
  async (payload) => {
    try {
      const response = await postApi(apiEndPoints.ADMINS, payload);
      showSuccess('Admin created successfully');
      return response?.data?.data;
    } catch (e) {
      showError(e.response?.data?.message || 'Failed to create admin');
      throw e;
    }
  },
);

export const updateAdmin = createAsyncThunk(
  'admins/updateAdmin',
  async ({ adminId, data }) => {
    try {
      const response = await putApi(`${apiEndPoints.ADMINS}/${adminId}`, data);
      showSuccess('Admin updated successfully');
      return response?.data?.data;
    } catch (e) {
      showError(e.response?.data?.message || 'Failed to update admin');
      throw e;
    }
  },
);

const adminsSlice = createSlice({
  name: 'admins',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdmins.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(fetchAdmins.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.isError = false;
        state.admins = payload || [];
      })
      .addCase(fetchAdmins.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
      })
      .addCase(createAdmin.fulfilled, (state, { payload }) => {
        if (payload) {
          state.admins.unshift(payload);
        }
      })
      .addCase(updateAdmin.fulfilled, (state, { payload }) => {
        if (!payload) return;
        state.admins = state.admins.map((a) => (a.id === payload.id ? payload : a));
      });
  },
});

export const adminsReducer = adminsSlice.reducer;

