import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiEndPoints } from "../../config/path";
import { showError } from "../../helpers/messageHelper";
import { getApi } from "../../services/api";

const initialState = {
  isLoading: false,
  isSuccess: false,
  isError: false,
  responseCode: 0,
  emailCampaigns: [],
  totalCount: 0,
};

export const fetchEmailCampaigns = createAsyncThunk(
  "/fetchEmailCampaigns",
  async ({ page = 1, limit = 10 }) => {
    try {
      const payload = await getApi(
        `${apiEndPoints.GET_EMAIL_CAMPAIGNS}?page=${page}&limit=${limit}`
      );
      return payload;
    } catch (e) {
      showError(e?.response?.data?.message || "Failed to fetch email campaigns");
      throw e;
    }
  }
);

export const emailCampaignsSlice = createSlice({
  name: "emailCampaigns",
  initialState,
  reducers: {
    clearEmailCampaignsState: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.responseCode = 0;
      state.emailCampaigns = [];
      state.totalCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmailCampaigns.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
      })
      .addCase(fetchEmailCampaigns.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.responseCode = payload?.status || 0;
        const data = payload?.data?.data || {};
        state.emailCampaigns = data.email_campaigns || [];
        state.totalCount = data.total_count || 0;
      })
      .addCase(fetchEmailCampaigns.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
      });
  },
});

export const { clearEmailCampaignsState } = emailCampaignsSlice.actions;
export const emailCampaignsReducer = emailCampaignsSlice.reducer;
