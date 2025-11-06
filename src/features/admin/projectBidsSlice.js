import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiEndPoints } from "../../config/path";
import { showError } from "../../helpers/messageHelper";
import { getApi, postApi } from "../../services/api";

const initialState = {
  isLoading: false,
  isSuccess: false,
  isError: false,
  responseCode: 0,
  responseData: {},
  bids: [],
  totalCount: 0,
  currentBid: null,
  billingInfo: null,
  isSavingInvoice: false,
  saveInvoiceSuccess: false,
  saveInvoiceError: false,
  isApprovingMilestone: false,
  approveMilestoneSuccess: false,
  approveMilestoneError: false,
};

// Get all project bids (admin view)
export const getAllProjectBids = createAsyncThunk(
  "/getAllProjectBids",
  async ({ page, pageLimit }) => {
    try {
      const payload = await getApi(`${apiEndPoints.GET_ALL_PROJECT_BIDS}?page=${page}&limit=${pageLimit}`);
      return payload;
    } catch (e) {
      showError(e.response?.data?.message || "Failed to fetch project bids");
      throw e;
    }
  }
);

// Get project bid details by ID
export const getProjectBidDetails = createAsyncThunk(
  "/getProjectBidDetails",
  async (bidId) => {
    try {
      const payload = await getApi(`${apiEndPoints.GET_PROJECT_BID_DETAILS}/${bidId}`);
      return payload;
    } catch (e) {
      showError(e.response?.data?.message || "Failed to fetch bid details");
      throw e;
    }
  }
);

// Get billing information for invoice by milestone and project bid
export const getBillingInformation = createAsyncThunk(
  "/getBillingInformation",
  async ({ milestoneId, projectbidId }) => {
    try {
      const payload = await getApi(`admin/billing/${milestoneId}/details/${projectbidId}/information`);
      return payload;
    } catch (e) {
      showError(e.response?.data?.message || "Failed to fetch billing information");
      throw e;
    }
  }
);

// Save sale order invoice information
export const saveSaleOrderInvoiceInformation = createAsyncThunk(
  "/saveSaleOrderInvoiceInformation",
  async (formData) => {
    try {
      const payload = await postApi("admin/save-sale-order-information", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return payload;
    } catch (e) {
      showError(e.response?.data?.message || "Failed to save sale order invoice information");
      throw e;
    }
  }
);

export const saveInvoiceInformation = createAsyncThunk(
  "/saveInvoiceInformation",
  async (formData) => {
    try {
      const payload = await postApi("admin/save-invoice-information", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return payload;
    } catch (e) {
      showError(e.response?.data?.message || "Failed to save invoice information");
      throw e;
    }
  }
);

// Approve milestone by admin
export const approveMilestoneByAdmin = createAsyncThunk(
  "/approveMilestoneByAdmin",
  async (milestoneId) => {
    try {
      const payload = await postApi("admin/milestone-approved-by-admin", { milestoneId });
      return payload;
    } catch (e) {
      showError(e.response?.data?.message || "Failed to approve milestone");
      throw e;
    }
  }
);

export const projectBidsSlice = createSlice({
  name: "projectBids",
  initialState,
  reducers: {
    clearProjectBidsState: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.responseCode = 0;
      state.responseData = {};
      state.bids = [];
      state.totalCount = 0;
      state.currentBid = null;
    },
    clearCurrentBid: (state) => {
      state.currentBid = null;
    },
    clearSaveInvoiceState: (state) => {
      state.isSavingInvoice = false;
      state.saveInvoiceSuccess = false;
      state.saveInvoiceError = false;
    },
    clearApproveMilestoneState: (state) => {
      state.isApprovingMilestone = false;
      state.approveMilestoneSuccess = false;
      state.approveMilestoneError = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // GetAllProjectBids
      .addCase(getAllProjectBids.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
      })
      .addCase(getAllProjectBids.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.responseCode = payload?.status;
        state.bids = payload?.data?.data?.bids || [];
        state.totalCount = payload?.data?.data?.total_count || 0;
      })
      .addCase(getAllProjectBids.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
      })
      // GetProjectBidDetails
      .addCase(getProjectBidDetails.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
      })
      .addCase(getProjectBidDetails.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.responseCode = payload?.status;
        state.currentBid = payload?.data?.data || null;
      })
      .addCase(getProjectBidDetails.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
      })
      // GetBillingInformation
      .addCase(getBillingInformation.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
      })
      .addCase(getBillingInformation.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.responseCode = payload?.status;
        state.billingInfo = payload?.data?.data || null;
      })
      .addCase(getBillingInformation.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
      })
      // SaveSaleOrderInvoiceInformation
      .addCase(saveSaleOrderInvoiceInformation.pending, (state) => {
        state.isSavingInvoice = true;
        state.saveInvoiceError = false;
        state.saveInvoiceSuccess = false;
      })
      .addCase(saveSaleOrderInvoiceInformation.fulfilled, (state, { payload }) => {
        state.isSavingInvoice = false;
        state.saveInvoiceSuccess = true;
        state.responseCode = payload?.status;
      })
      .addCase(saveSaleOrderInvoiceInformation.rejected, (state) => {
        state.isSavingInvoice = false;
        state.saveInvoiceError = true;
        state.saveInvoiceSuccess = false;
      })
      // SaveInvoiceInformation
      .addCase(saveInvoiceInformation.pending, (state) => {
        state.isSavingInvoice = true;
        state.saveInvoiceError = false;
        state.saveInvoiceSuccess = false;
      })
      .addCase(saveInvoiceInformation.fulfilled, (state, { payload }) => {
        state.isSavingInvoice = false;
        state.saveInvoiceSuccess = true;
        state.responseCode = payload?.status;
      })
      .addCase(saveInvoiceInformation.rejected, (state) => {
        state.isSavingInvoice = false;
        state.saveInvoiceError = true;
        state.saveInvoiceSuccess = false;
      })
      // ApproveMilestoneByAdmin
      .addCase(approveMilestoneByAdmin.pending, (state) => {
        state.isApprovingMilestone = true;
        state.approveMilestoneError = false;
        state.approveMilestoneSuccess = false;
      })
      .addCase(approveMilestoneByAdmin.fulfilled, (state, { payload }) => {
        state.isApprovingMilestone = false;
        state.approveMilestoneSuccess = true;
        state.responseCode = payload?.status;
      })
      .addCase(approveMilestoneByAdmin.rejected, (state) => {
        state.isApprovingMilestone = false;
        state.approveMilestoneError = true;
        state.approveMilestoneSuccess = false;
      });
  },
});

export const { clearProjectBidsState, clearCurrentBid, clearSaveInvoiceState, clearApproveMilestoneState } = projectBidsSlice.actions;
export const projectBidsReducer = projectBidsSlice.reducer;
