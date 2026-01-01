import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiEndPoints } from "../../config/path";
import { showError, showSuccess } from "../../helpers/messageHelper";
import { getApi, postApi, deleteApi } from "../../services/api";

const initialState = {
  isLoading: false,
  isSuccess: false,
  isError: false,
  responseCode: 0,
  responseData: {},
  testimonialList: [],
  totalCount: 0,
  createLoading: false,
  createError: null,
};

// Create a new testimonial
export const createTestimonial = createAsyncThunk(
  "/createTestimonial",
  async (formData) => {
    try {
      const payload = await postApi(apiEndPoints.CREATE_TESTIMONIAL, formData);
      showSuccess(payload.data.message || "Testimonial created successfully");
      return payload;
    } catch (e) {
      showError(e.response?.data?.message || "Failed to create testimonial");
      throw e;
    }
  }
);

// Get all testimonials with pagination
export const getAllTestimonials = createAsyncThunk(
  "/getAllTestimonials",
  async ({ page = 1, limit = 50 }) => {
    try {
      const url = `${apiEndPoints.GET_ALL_TESTIMONIALS}?page=${page}&limit=${limit}`;
      const payload = await getApi(url);
      return payload;
    } catch (e) {
      showError(e.response?.data?.message || "Failed to fetch testimonials");
      throw e;
    }
  }
);

// Delete testimonial
export const deleteTestimonial = createAsyncThunk(
  "/deleteTestimonial",
  async (testimonialId) => {
    try {
      const payload = await deleteApi(`${apiEndPoints.DELETE_TESTIMONIAL}/${testimonialId}/delete`);
      showSuccess("Testimonial deleted successfully");
      return payload;
    } catch (e) {
      showError(e.response?.data?.message || "Failed to delete testimonial");
      throw e;
    }
  }
);

export const testimonialSlice = createSlice({
  name: "testimonial",
  initialState,
  reducers: {
    resetTestimonialState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Testimonial
      .addCase(createTestimonial.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createTestimonial.fulfilled, (state, { payload }) => {
        state.createLoading = false;
        state.isSuccess = true;
        state.responseCode = payload?.status;
      })
      .addCase(createTestimonial.rejected, (state, { error }) => {
        state.createLoading = false;
        state.createError = error.message;
        state.isError = true;
      })

      // Get All Testimonials
      .addCase(getAllTestimonials.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllTestimonials.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.responseCode = payload?.status;
        state.testimonialList = payload?.data?.data?.testimonials || [];
        state.totalCount = payload?.data?.data?.total_count || 0;
        state.responseData = payload?.data || {};
      })
      .addCase(getAllTestimonials.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
      })

      // Delete Testimonial
      .addCase(deleteTestimonial.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteTestimonial.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.responseCode = payload?.status;
      })
      .addCase(deleteTestimonial.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
      });
  },
});

export const { resetTestimonialState } = testimonialSlice.actions;
export const testimonialReducer = testimonialSlice.reducer;

