import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiEndPoints } from "../../config/path";
import { showError } from "../../helpers/messageHelper";
import { getApi, patchApi, postApi, deleteApi } from "../../services/api";


// Removed TypeScript type annotations
const initialState = {
    isLoading: false,
    isSuccess: false,
    isError: false,
    responseCode: 0,
    responseData: {},
    enrollAsData: [],
    countryData: []
};

// Removed TypeScript type annotations
export const contactData = createAsyncThunk(
    "/contactData",
    async ({ category, page, pageLimit }) => { // Updated to accept page and pageLimit
        try {
            const payload = await getApi(`${apiEndPoints.GET_CONTACT_US}?page=${page}&limit=${pageLimit}`); // Updated API call
            return payload;
        } catch (e) {
            showError(e.response.data.message);
            // return e;
        }
    }
);

export const getEnrollAsData = createAsyncThunk(
    "/getEnrollAsData",
    async () => {
        try {
            const payload = await getApi(apiEndPoints.GET_ENROLL_AS);
            return payload;
        } catch (e) {
            showError(e.response.data.message);
        }
    }
);
export const getIndustryData = createAsyncThunk(
    "/getIndustryData",
    async () => {
        try {
            const payload = await getApi(apiEndPoints.GET_INDUSTRY);
            return payload;
        } catch (e) {
            showError(e.response.data.message);
        }
    }
);

export const getCountryData = createAsyncThunk(
    "/getCountryData",
    async () => {
        try {
            const payload = await getApi(apiEndPoints.GET_COUNTRIES);
            return payload;
        } catch (e) {
            showError(e.response.data.message);
        }
    }
);

export const updateClientStatusInContactUsByAdmin = createAsyncThunk(
    "/updateClientStatusInContactUsByAdmin",
    async (data) => {
        try {
            const payload = await postApi(apiEndPoints.UPDATE_CLIENT_STATUS_IN_CONTACT_US_BY_ADMIN, data);
            return payload;
        } catch (e) {
            showError(e.response.data.message);
            throw e;
        }
    }
);

export const createUserByAdmin = createAsyncThunk(
    "/createUserByAdmin",
    async (data) => {
        try {
            console.log('createUserByAdmin thunk called with data:', data);
            console.log('API endpoint:', apiEndPoints.CREATE_USER_BY_ADMIN);
            
            const payload = await postApi(apiEndPoints.CREATE_USER_BY_ADMIN, data);
            console.log('createUserByAdmin API response:', payload);
            
            return payload;
        } catch (e) {
            console.error('createUserByAdmin API error:', e);
            console.error('Error response:', e.response);
            // Let the component handle the error display
            throw e;
        }
    }
);

export const deleteContactUsByAdmin = createAsyncThunk(
    "/deleteContactUsByAdmin",
    async (contactUsId) => {
        try {
            const payload = await deleteApi(`${apiEndPoints.DELETE_CONTACT_US_BY_ADMIN}/${contactUsId}/delete`);
            return payload;
        } catch (e) {
            showError(e.response?.data?.message || 'Failed to delete contact');
            throw e;
        }
    }
);

export const contactDataSlice = createSlice({
    name: "contactData",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
        .addCase(contactData.pending, (state) => {
            state.isLoading = true;
        })
        .addCase(contactData.fulfilled, (state, { payload }) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.responseCode = payload?.status;
            state.responseData = payload?.data?.data || {};
        })
        .addCase(contactData.rejected, (state) => {
            state.isLoading = false;
            state.isError = true;
        })
        // Add cases for enrollAs data
        .addCase(getEnrollAsData.pending, (state) => {
            state.isLoading = true;
        })
        .addCase(getEnrollAsData.fulfilled, (state, { payload }) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.enrollAsData = payload?.data?.data || [];
        })
        .addCase(getEnrollAsData.rejected, (state) => {
            state.isLoading = false;
            state.isError = true;
        })
        // Add cases for country data
        .addCase(getCountryData.pending, (state) => {
            state.isLoading = true;
        })
        .addCase(getCountryData.fulfilled, (state, { payload }) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.countryData = payload?.data?.data || [];
        })
        .addCase(getCountryData.rejected, (state) => {
            state.isLoading = false;
            state.isError = true;
        })
        .addCase(updateClientStatusInContactUsByAdmin.pending, (state) => {
            state.isLoading = true;
        })
        .addCase(updateClientStatusInContactUsByAdmin.fulfilled, (state, { payload }) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.responseCode = payload?.status;
            state.responseData = payload?.data?.data || {};
        })
        .addCase(updateClientStatusInContactUsByAdmin.rejected, (state) => {
            state.isLoading = false;
            state.isError = true;
        })
        .addCase(getIndustryData.pending, (state) => {
            state.isLoading = true;
        })
        .addCase(getIndustryData.fulfilled, (state, { payload }) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.industryData = payload?.data?.data || [];
        })
        .addCase(getIndustryData.rejected, (state) => {
            state.isLoading = false;
            state.isError = true;
        })
        .addCase(createUserByAdmin.pending, (state) => {
            state.isLoading = true;
            state.isError = false;
        })
        .addCase(createUserByAdmin.fulfilled, (state, { payload }) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.responseCode = payload?.status;
            state.responseData = payload?.data?.data || {};
        })
        .addCase(createUserByAdmin.rejected, (state) => {
            state.isLoading = false;
            state.isError = true;
        })
        .addCase(deleteContactUsByAdmin.pending, (state) => {
            state.isLoading = true;
        })
        .addCase(deleteContactUsByAdmin.fulfilled, (state, { payload }) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.responseCode = payload?.status;
        })
        .addCase(deleteContactUsByAdmin.rejected, (state) => {
            state.isLoading = false;
            state.isError = true;
        })
        
    },
});

export const contactDataReducer = contactDataSlice.reducer;
