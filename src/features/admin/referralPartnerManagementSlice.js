import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiEndPoints } from '../../config/path';
import { showError } from '../../helpers/messageHelper';
import { getApi } from '../../services/api';

const initialState = {
  isLoading: false,
  isSuccess: false,
  isError: false,
  responseCode: 0,
  responseData: {},
};

export const referralPartnerData = createAsyncThunk(
  '/referralPartnerData',
  async ({
    page,
    pageLimit,
    status,
    excludeStatus,
  }) => {
    try {
      let url = `${apiEndPoints.GET_REFERRAL_PARTNER_DATA}?page=${page}&limit=${pageLimit}`;
      if (status) {
        url += `&status=${status}`;
      }
      if (excludeStatus) {
        url += `&excludeStatus=${excludeStatus}`;
      }
      const payload = await getApi(url);
      return payload;
    } catch (e) {
      showError(e?.response?.data?.message || 'Failed to load referral partners');
    }
  },
);

export const referralPartnerDataSlice = createSlice({
  name: 'referralPartnerData',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(referralPartnerData.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(referralPartnerData.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.responseCode = payload?.status;
        state.responseData = payload?.data?.data || {};
      })
      .addCase(referralPartnerData.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
      });
  },
});

export const referralPartnerDataReducer = referralPartnerDataSlice.reducer;
