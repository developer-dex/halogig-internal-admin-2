import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiEndPoints } from "../../config/path";
import { showError } from "../../helpers/messageHelper";
import { getApi } from "../../services/api";

const initialState = {
  isLoading: false,
  isSuccess: false,
  isError: false,
  responseCode: 0,
  responseData: {},
  payments: [],
  totalCount: 0,
};

// Get all freelancer payments (admin view)
export const getAllFreelancerPayments = createAsyncThunk(
  "/getAllFreelancerPayments",
  async ({ page, pageLimit }) => {
    try {
      const payload = await getApi(`${apiEndPoints.GET_ALL_FREELANCER_PAYMENTS}?page=${page}&limit=${pageLimit}`);
      return payload;
    } catch (e) {
      showError(e.response?.data?.message || "Failed to fetch freelancer payments");
      throw e;
    }
  }
);

export const freelancerPaymentsSlice = createSlice({
  name: "freelancerPayments",
  initialState,
  reducers: {
    clearFreelancerPaymentsState: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.responseCode = 0;
      state.responseData = {};
      state.payments = [];
      state.totalCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // GetAllFreelancerPayments
      .addCase(getAllFreelancerPayments.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
      })
      .addCase(getAllFreelancerPayments.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.responseCode = payload?.status;
        state.payments = payload?.data?.data?.payments || [];
        state.totalCount = payload?.data?.data?.total_count || 0;
      })
      .addCase(getAllFreelancerPayments.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
      });
  },
});

export const { clearFreelancerPaymentsState } = freelancerPaymentsSlice.actions;
export const freelancerPaymentsReducer = freelancerPaymentsSlice.reducer;

