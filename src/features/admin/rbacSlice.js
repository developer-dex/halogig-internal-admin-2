import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getApi } from '../../services/api';
import { apiEndPoints } from '../../config/path';
import { showError } from '../../helpers/messageHelper';

const initialState = {
  isLoading: false,
  isError: false,
  permissions: {}, // moduleKey -> { view, create, edit, delete }
  permissionsVersion: 1,
  admin: null,
};

export const fetchAdminProfile = createAsyncThunk(
  'rbac/fetchAdminProfile',
  async () => {
    try {
      const response = await getApi(apiEndPoints.ADMIN_PROFILE);
      return response?.data?.data;
    } catch (e) {
      showError(e.response?.data?.message || 'Failed to load admin profile');
      throw e;
    }
  },
);

const rbacSlice = createSlice({
  name: 'rbac',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminProfile.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(fetchAdminProfile.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.isError = false;
        if (payload) {
          state.admin = payload;
          state.permissions = payload.permissions || {};
          state.permissionsVersion = payload.permissions_version || 1;
        }
      })
      .addCase(fetchAdminProfile.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
      });
  },
});

export const rbacReducer = rbacSlice.reducer;

