import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiEndPoints } from "../../config/path";
import { showError } from "../../helpers/messageHelper";
import { getApi } from "../../services/api";

const initialState = {
  isLoading: false,
  isSuccess: false,
  isError: false,
  responseCode: 0,
  rows: [],
  totalCount: 0,
};

export const fetchEmailDomainAnalysis = createAsyncThunk(
  "/fetchEmailDomainAnalysis",
  async ({ page = 1, limit = 10, search = "" }) => {
    try {
      const payload = await getApi(
        `${apiEndPoints.GET_EMAIL_DOMAIN_ANALYSIS}?page=${page}&limit=${limit}&search=${encodeURIComponent(
          search
        )}`
      );
      return payload;
    } catch (e) {
      showError(e?.response?.data?.message || "Failed to fetch email domain analysis");
      throw e;
    }
  }
);

export const emailDomainAnalysisSlice = createSlice({
  name: "emailDomainAnalysis",
  initialState,
  reducers: {
    clearEmailDomainAnalysisState: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.responseCode = 0;
      state.rows = [];
      state.totalCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmailDomainAnalysis.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
      })
      .addCase(fetchEmailDomainAnalysis.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.responseCode = payload?.status || 0;
        const data = payload?.data?.data || {};
        state.rows = data.rows || [];
        state.totalCount = data.count || 0;
      })
      .addCase(fetchEmailDomainAnalysis.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
      });
  },
});

export const { clearEmailDomainAnalysisState } = emailDomainAnalysisSlice.actions;
export const emailDomainAnalysisReducer = emailDomainAnalysisSlice.reducer;

