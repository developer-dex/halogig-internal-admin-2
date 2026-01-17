import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiEndPoints } from "../../config/path";
import { showError } from "../../helpers/messageHelper";
import { getApi } from "../../services/api";

const initialState = {
    categories: [],
    subcategories: [],
    technologies: [],
    industries: [],
    isLoading: false,
    isSuccess: false,
    isError: false,
};

export const fetchCategories = createAsyncThunk(
    "/fetchCategories",
    async () => {
        try {
            console.log('Fetching categories from:', apiEndPoints.GET_CATEGORIES);
            const payload = await getApi(apiEndPoints.GET_CATEGORIES);
            console.log('Categories API response:', payload);
            return payload;
        } catch (e) {
            console.error('API Error:', e);
            if (e.response && e.response.data) {
                showError(e.response.data.message);
            } else {
                showError('Failed to fetch categories');
            }
            throw e;
        }
    }
);

export const fetchSubcategories = createAsyncThunk(
    "/fetchSubcategories",
    async (categoryId) => {
        try {
            const payload = await getApi(`${apiEndPoints.GET_SUBCATEGORIES}/${categoryId}`);
            return payload;
        } catch (e) {
            console.error('API Error:', e);
            if (e.response && e.response.data) {
                showError(e.response.data.message);
            } else {
                showError('Failed to fetch subcategories');
            }
            throw e;
        }
    }
);

export const fetchTechnologies = createAsyncThunk(
    "/fetchTechnologies",
    async () => {
        try {
            const payload = await getApi(apiEndPoints.GET_TECHNOLOGIES);
            return payload;
        } catch (e) {
            console.error('API Error:', e);
            if (e.response && e.response.data) {
                showError(e.response.data.message);
            } else {
                showError('Failed to fetch technologies');
            }
            throw e;
        }
    }
);

export const fetchIndustries = createAsyncThunk(
    "/fetchIndustries",
    async () => {
        try {
            const payload = await getApi(apiEndPoints.GET_INDUSTRIES);
            return payload;
        } catch (e) {
            console.error('API Error:', e);
            if (e.response && e.response.data) {
                showError(e.response.data.message);
            } else {
                showError('Failed to fetch industries');
            }
            throw e;
        }
    }
);

export const dropdownDataSlice = createSlice({
    name: "dropdownData",
    initialState,
    reducers: {
        clearSubcategories: (state) => {
            state.subcategories = [];
        },
    },
    extraReducers: (builder) => {
        builder
        // Categories
        .addCase(fetchCategories.pending, (state) => {
            state.isLoading = true;
        })
        .addCase(fetchCategories.fulfilled, (state, { payload }) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.categories = Array.isArray(payload?.data?.data) 
                ? payload.data.data 
                : (Array.isArray(payload?.data) ? payload.data : []);
        })
        .addCase(fetchCategories.rejected, (state) => {
            state.isLoading = false;
            state.isError = true;
        })
        // Subcategories
        .addCase(fetchSubcategories.pending, (state) => {
            state.isLoading = true;
        })
        .addCase(fetchSubcategories.fulfilled, (state, { payload }) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.subcategories = Array.isArray(payload?.data?.data) 
                ? payload.data.data 
                : (Array.isArray(payload?.data) ? payload.data : []);
        })
        .addCase(fetchSubcategories.rejected, (state) => {
            state.isLoading = false;
            state.isError = true;
        })
        // Technologies
        .addCase(fetchTechnologies.pending, (state) => {
            state.isLoading = true;
        })
        .addCase(fetchTechnologies.fulfilled, (state, { payload }) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.technologies = Array.isArray(payload?.data?.data) 
                ? payload.data.data 
                : (Array.isArray(payload?.data) ? payload.data : []);
        })
        .addCase(fetchTechnologies.rejected, (state) => {
            state.isLoading = false;
            state.isError = true;
        })
        // Industries
        .addCase(fetchIndustries.pending, (state) => {
            state.isLoading = true;
        })
        .addCase(fetchIndustries.fulfilled, (state, { payload }) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.industries = Array.isArray(payload?.data?.data) 
                ? payload.data.data 
                : (Array.isArray(payload?.data) ? payload.data : []);
        })
        .addCase(fetchIndustries.rejected, (state) => {
            state.isLoading = false;
            state.isError = true;
        });
    },
});

export const { clearSubcategories } = dropdownDataSlice.actions;
export const dropdownDataReducer = dropdownDataSlice.reducer;
