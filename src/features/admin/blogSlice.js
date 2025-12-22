import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiEndPoints } from "../../config/path";
import { showError, showSuccess } from "../../helpers/messageHelper";
import { getApi, postApi, putApi, deleteApi } from "../../services/api";

const initialState = {
  isLoading: false,
  isSuccess: false,
  isError: false,
  responseCode: 0,
  responseData: {},
  blogList: [],
  selectedBlog: null,
  totalCount: 0,
  createLoading: false,
  createError: null,
};

// Create a new blog
export const createBlog = createAsyncThunk(
  "/createBlog",
  async (formData) => {
    try {
      const payload = await postApi(apiEndPoints.CREATE_BLOG, formData);
      showSuccess(payload.data.message || "Blog created successfully");
      return payload;
    } catch (e) {
      showError(e.response?.data?.message || "Failed to create blog");
      throw e;
    }
  }
);

// Get all blogs with pagination
export const getAllBlogs = createAsyncThunk(
  "/getAllBlogs",
  async ({ page = 1, limit = 10, search = "" }) => {
    try {
      let url = `${apiEndPoints.GET_ALL_BLOGS}?page=${page}&limit=${limit}`;
      if (search) url += `&search=${search}`;

      const payload = await getApi(url);
      return payload;
    } catch (e) {
      showError(e.response?.data?.message || "Failed to fetch blogs");
      throw e;
    }
  }
);

// Get blog by ID
export const getBlogById = createAsyncThunk(
  "/getBlogById",
  async (id) => {
    try {
      const payload = await getApi(`${apiEndPoints.GET_BLOG_BY_ID}/${id}`);
      return payload;
    } catch (e) {
      showError(e.response?.data?.message || "Failed to fetch blog details");
      throw e;
    }
  }
);

// Update blog
export const updateBlog = createAsyncThunk(
  "/updateBlog",
  async ({ id, formData }) => {
    try {
      const payload = await putApi(`${apiEndPoints.UPDATE_BLOG}/${id}`, formData);
      showSuccess(payload.data.message || "Blog updated successfully");
      return payload;
    } catch (e) {
      showError(e.response?.data?.message || "Failed to update blog");
      throw e;
    }
  }
);

// Delete blog
export const deleteBlog = createAsyncThunk(
  "/deleteBlog",
  async (id) => {
    try {
      const payload = await deleteApi(`/${apiEndPoints.DELETE_BLOG}/${id}`);
      showSuccess("Blog deleted successfully");
      return payload;
    } catch (e) {
      showError(e.response?.data?.message || "Failed to delete blog");
      throw e;
    }
  }
);

export const blogSlice = createSlice({
  name: "blog",
  initialState,
  reducers: {
    clearSelectedBlog: (state) => {
      state.selectedBlog = null;
    },
    resetBlogState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Blog
      .addCase(createBlog.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createBlog.fulfilled, (state, { payload }) => {
        state.createLoading = false;
        state.isSuccess = true;
        state.responseCode = payload?.status;
      })
      .addCase(createBlog.rejected, (state, { error }) => {
        state.createLoading = false;
        state.createError = error.message;
        state.isError = true;
      })

      // Get All Blogs
      .addCase(getAllBlogs.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllBlogs.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.responseCode = payload?.status;
        state.blogList = payload?.data?.data?.data || [];
        state.totalCount = payload?.data?.data?.pagination?.totalRecords || 0;
        state.responseData = payload?.data || {};
      })
      .addCase(getAllBlogs.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
      })

      // Get Blog by ID
      .addCase(getBlogById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getBlogById.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.selectedBlog = payload?.data?.data || null;
      })
      .addCase(getBlogById.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
      })

      // Update Blog
      .addCase(updateBlog.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateBlog.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.responseCode = payload?.status;
      })
      .addCase(updateBlog.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
      })

      // Delete Blog
      .addCase(deleteBlog.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteBlog.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.responseCode = payload?.status;
      })
      .addCase(deleteBlog.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
      });
  },
});

export const { clearSelectedBlog, resetBlogState } = blogSlice.actions;
export const blogReducer = blogSlice.reducer;

