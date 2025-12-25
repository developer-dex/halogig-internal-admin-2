import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiEndPoints } from "../../config/path";
import { showError } from "../../helpers/messageHelper";
import { getApi } from "../../services/api";

const initialState = {
  isLoading: false,
  isSuccess: false,
  isError: false,
  freelancer: 0,
  client: 0,
};

export const getPendingViewCounts = createAsyncThunk(
  "/getPendingViewCounts",
  async () => {
    try {
      const payload = await getApi(apiEndPoints.GET_PENDING_VIEW_COUNTS);
      return payload;
    } catch (e) {
      if (e.response?.data?.message) {
        showError(e.response.data.message);
      } else {
        showError("Failed to fetch pending view counts");
      }
      throw e;
    }
  }
);

export const pendingViewCountsSlice = createSlice({
  name: "pendingViewCounts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getPendingViewCounts.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(getPendingViewCounts.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.isSuccess = true;
        if (payload?.data?.data) {
          state.freelancer = payload.data.data.freelancer || 0;
          state.client = payload.data.data.client || 0;
        }
      })
      .addCase(getPendingViewCounts.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
      });
  },
});

export const pendingViewCountsReducer = pendingViewCountsSlice.reducer;

