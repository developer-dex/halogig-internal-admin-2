import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiEndPoints } from "../../config/path";
import { showError, showSuccess } from "../../helpers/messageHelper";
import { getApi, postApi, deleteApi, putApi, patchApi } from "../../services/api";

const initialState = {
    isLoading: false,
    isSuccess: false,
    isError: false,
    responseCode: 0,
    responseData: {},
    uploadResponse: null,
    uploadLoading: false,
    uploadError: null,
};

// Upload Excel file
export const uploadWebsiteDataExcel = createAsyncThunk(
    "/uploadWebsiteDataExcel",
    async (formData) => {
        try {
            const payload = await postApi(apiEndPoints.WEBSITE_DATA_UPLOAD_EXCEL, formData);
            showSuccess(payload.data.message || "Excel file uploaded successfully");
            return payload;
        } catch (e) {
            showError(e.response?.data?.message || "Failed to upload Excel file");
            throw e;
        }
    }
);

// Get all website data with pagination
export const getWebsiteData = createAsyncThunk(
    "/getWebsiteData",
    async ({ page = 1, limit = 10, serviceName }) => {
        try {
            let url = `${apiEndPoints.GET_WEBSITE_DATA}?page=${page}&limit=${limit}`;
            if (serviceName) url += `&serviceName=${serviceName}`;
            
            const payload = await getApi(url);
            return payload;
        } catch (e) {
            showError(e.response?.data?.message || "Failed to fetch website data");
            throw e;
        }
    }
);

// Get website data by ID
export const getWebsiteDataById = createAsyncThunk(
    "/getWebsiteDataById",
    async (id) => {
        try {
            const payload = await getApi(`${apiEndPoints.GET_WEBSITE_DATA_BY_ID}/${id}`);
            return payload;
        } catch (e) {
            showError(e.response?.data?.message || "Failed to fetch website data details");
            throw e;
        }
    }
);

// Delete website data
export const deleteWebsiteData = createAsyncThunk(
    "/deleteWebsiteData",
    async (id) => {
        try {
            const payload = await deleteApi(`/${apiEndPoints.DELETE_WEBSITE_DATA}/${id}`);
            showSuccess("Website data deleted successfully");
            return payload;
        } catch (e) {
            showError(e.response?.data?.message || "Failed to delete website data");
            throw e;
        }
    }
);

// Create new website data
export const createWebsiteData = createAsyncThunk(
    "/createWebsiteData",
    async (formData) => {
        try {
            const payload = await postApi(apiEndPoints.CREATE_WEBSITE_DATA, formData);
            showSuccess("Website data created successfully");
            return payload;
        } catch (e) {
            showError(e.response?.data?.message || "Failed to create website data");
            throw e;
        }
    }
);

// Update website data
export const updateWebsiteData = createAsyncThunk(
    "/updateWebsiteData",
    async ({ id, data }) => {
        try {
            const payload = await putApi(`${apiEndPoints.UPDATE_WEBSITE_DATA}/${id}`, data);
            showSuccess("Website data updated successfully");
            return payload;
        } catch (e) {
            showError(e.response?.data?.message || "Failed to update website data");
            throw e;
        }
    }
);

// Delete all website data
export const deleteAllWebsiteData = createAsyncThunk(
    "/deleteAllWebsiteData",
    async () => {
        try {
            const payload = await deleteApi(`/${apiEndPoints.DELETE_ALL_WEBSITE_DATA}`);
            showSuccess("All website data deleted successfully");
            return payload;
        } catch (e) {
            showError(e.response?.data?.message || "Failed to delete all website data");
            throw e;
        }
    }
);

// Download website data as Excel
export const downloadWebsiteDataExcel = createAsyncThunk(
    "/downloadWebsiteDataExcel",
    async (filters = {}) => {
        try {
            let url = apiEndPoints.WEBSITE_DATA_DOWNLOAD_EXCEL;
            const params = new URLSearchParams();
            
            if (filters.serviceName) params.append('serviceName', filters.serviceName);
            
            if (params.toString()) {
                url += `?${params.toString()}`;
            }
            
            // Use fetch instead of axios for blob download
            const adminToken = localStorage.getItem('adminToken');
            const response = await fetch(`${process.env.REACT_APP_WEBSITE_API_URL}/${url}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${adminToken}`,
                    'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to download Excel file');
            }

            const blob = await response.blob();
            showSuccess("Excel file downloaded successfully");
            return { blob };
        } catch (e) {
            showError(e.message || "Failed to download Excel file");
            throw e;
        }
    }
);

// Get website data slugs
export const getWebsiteDataSlugs = createAsyncThunk(
    "/getWebsiteDataSlugs",
    async () => {
        try {
            const payload = await getApi(apiEndPoints.GET_WEBSITE_DATA_SLUGS);
            return payload;
        } catch (e) {
            showError(e.response?.data?.message || "Failed to fetch website data slugs");
            throw e;
        }
    }
);

// Update website data order
export const updateWebsiteDataOrder = createAsyncThunk(
    "/updateWebsiteDataOrder",
    async (data) => {
        try {
            const payload = await patchApi(apiEndPoints.UPDATE_WEBSITE_DATA_ORDER, data);
            showSuccess("Sections order updated successfully");
            return payload;
        } catch (e) {
            showError(e.response?.data?.message || "Failed to update sections order");
            throw e;
        }
    }
);

export const websiteDataSlice = createSlice({
    name: "websiteData",
    initialState,
    reducers: {
        clearUploadResponse: (state) => {
            state.uploadResponse = null;
            state.uploadError = null;
        },
        resetState: (state) => {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder
            // Upload Excel
            .addCase(uploadWebsiteDataExcel.pending, (state) => {
                state.uploadLoading = true;
                state.uploadError = null;
            })
            .addCase(uploadWebsiteDataExcel.fulfilled, (state, { payload }) => {
                state.uploadLoading = false;
                state.uploadResponse = payload?.data;
            })
            .addCase(uploadWebsiteDataExcel.rejected, (state, { error }) => {
                state.uploadLoading = false;
                state.uploadError = error.message;
            })
            
            // Get website data
            .addCase(getWebsiteData.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getWebsiteData.fulfilled, (state, { payload }) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.responseCode = payload?.status;
                state.responseData = payload?.data || {};
            })
            .addCase(getWebsiteData.rejected, (state) => {
                state.isLoading = false;
                state.isError = true;
            })
            
            // Get website data by ID
            .addCase(getWebsiteDataById.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getWebsiteDataById.fulfilled, (state, { payload }) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.responseCode = payload?.status;
            })
            .addCase(getWebsiteDataById.rejected, (state) => {
                state.isLoading = false;
                state.isError = true;
            })
            
            // Delete website data
            .addCase(deleteWebsiteData.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(deleteWebsiteData.fulfilled, (state, { payload }) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.responseCode = payload?.status;
            })
            .addCase(deleteWebsiteData.rejected, (state) => {
                state.isLoading = false;
                state.isError = true;
            })
            
            // Create website data
            .addCase(createWebsiteData.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createWebsiteData.fulfilled, (state, { payload }) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.responseCode = payload?.status;
            })
            .addCase(createWebsiteData.rejected, (state) => {
                state.isLoading = false;
                state.isError = true;
            })
            
            // Update website data
            .addCase(updateWebsiteData.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updateWebsiteData.fulfilled, (state, { payload }) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.responseCode = payload?.status;
            })
            .addCase(updateWebsiteData.rejected, (state) => {
                state.isLoading = false;
                state.isError = true;
            })
            
            // Delete all website data
            .addCase(deleteAllWebsiteData.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(deleteAllWebsiteData.fulfilled, (state, { payload }) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.responseCode = payload?.status;
            })
            .addCase(deleteAllWebsiteData.rejected, (state) => {
                state.isLoading = false;
                state.isError = true;
            })
            
            // Download website data as Excel
            .addCase(downloadWebsiteDataExcel.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(downloadWebsiteDataExcel.fulfilled, (state, { payload }) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.responseCode = payload?.status;
            })
            .addCase(downloadWebsiteDataExcel.rejected, (state) => {
                state.isLoading = false;
                state.isError = true;
            });
    },
});

export const { clearUploadResponse, resetState } = websiteDataSlice.actions;
export const websiteDataReducer = websiteDataSlice.reducer;
