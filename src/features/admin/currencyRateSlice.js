import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiEndPoints } from '../../config/path';
import { showError, showSuccess } from '../../helpers/messageHelper';
import { getApi, postApi } from '../../services/api';

const initialState = {
  isLoading: false,
  isRefreshing: false,
  isError: false,
  rates: [],
  totalCount: 0,
  page: 1,
  limit: 20,
};

// Fetch paginated list of stored currency rate records
export const getCurrencyRates = createAsyncThunk(
  'currencyRate/getList',
  async ({ page = 1, limit = 20, date = '' } = {}) => {
    try {
      const params = new URLSearchParams({ page, limit });
      if (date) params.append('date', date);
      const payload = await getApi(`${apiEndPoints.GET_CURRENCY_RATES}?${params.toString()}`);
      return payload;
    } catch (e) {
      showError(e.response?.data?.message || 'Failed to fetch currency rates');
      throw e;
    }
  },
);

// Manually trigger a live API fetch and upsert today's record
export const refreshCurrencyRate = createAsyncThunk(
  'currencyRate/refresh',
  async () => {
    try {
      const payload = await postApi(apiEndPoints.REFRESH_CURRENCY_RATE, {});
      showSuccess('Currency rates refreshed successfully.');
      return payload;
    } catch (e) {
      showError(e.response?.data?.message || 'Failed to refresh currency rates');
      throw e;
    }
  },
);

const currencyRateSlice = createSlice({
  name: 'currencyRate',
  initialState,
  reducers: {
    clearCurrencyRateState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // getCurrencyRates
      .addCase(getCurrencyRates.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(getCurrencyRates.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.rates = payload?.data?.data?.rates || [];
        state.totalCount = payload?.data?.data?.totalCount || 0;
        state.page = payload?.data?.data?.page || 1;
        state.limit = payload?.data?.data?.limit || 20;
      })
      .addCase(getCurrencyRates.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
      })

      // refreshCurrencyRate
      .addCase(refreshCurrencyRate.pending, (state) => {
        state.isRefreshing = true;
        state.isError = false;
      })
      .addCase(refreshCurrencyRate.fulfilled, (state) => {
        state.isRefreshing = false;
      })
      .addCase(refreshCurrencyRate.rejected, (state) => {
        state.isRefreshing = false;
        state.isError = true;
      });
  },
});

export const { clearCurrencyRateState } = currencyRateSlice.actions;
export const currencyRateReducer = currencyRateSlice.reducer;
