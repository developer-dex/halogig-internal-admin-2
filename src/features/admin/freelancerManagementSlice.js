import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiEndPoints } from "../../config/path";
import { showError, showSuccess } from "../../helpers/messageHelper";
import { getApi, postApi, patchApi, deleteApi } from "../../services/api";


// Removed TypeScript type annotations
const initialState = {
    isLoading: false,
    isSuccess: false,
    isError: false,
    responseCode: 0,
    responseData: {},
    // New state for complete data
    completeDataLoading: false,
    completeDataSuccess: false,
    completeDataError: false,
    completeData: null,
    
    // Country preferences state
    countryPreferencesLoading: false,
    countryPreferencesSuccess: false,
    countryPreferencesError: false,
    countryPreferences: [],
    
    // Country preferences actions loading states
    addingCountryPreference: false,
    updatingCountryPreference: false,
    deletingCountryPreference: false,
    
    // Max values loading states
    updatingMaxProposalValue: false,
    updatingMaxDeliveryInProgress: false,
};

// Removed TypeScript type annotations
export const freelancerData = createAsyncThunk(
    "/freelancerData",
    async ({ page, pageLimit, status, excludeStatus }) => { // Updated to accept page, pageLimit, status, and excludeStatus
        try {
            let url = `${apiEndPoints.GET_FRELANCER_DATA}?page=${page}&limit=${pageLimit}`;
            if (status) {
                url += `&status=${status}`;
            }
            if (excludeStatus) {
                url += `&excludeStatus=${excludeStatus}`;
            }
            const payload = await getApi(url); // Updated API call
            return payload;
        } catch (e) {
            showError(e.response.data.message);
            // return e;
        }
    }
);

// New async thunk for getting complete freelancer data
export const freelancerCompleteData = createAsyncThunk(
    "/freelancerCompleteData",
    async ({ userId }) => {
        try {
            const payload = await getApi(`${apiEndPoints.GET_FREELANCER_COMPLETE_DATA}/${userId}/complete-data`);
            return payload;
        } catch (e) {
            showError(e.response?.data?.message || 'Failed to fetch freelancer details');
            throw e;
        }
    }
);

// Country Preferences async thunks
export const getFreelancerCountryPreferences = createAsyncThunk(
    "/getFreelancerCountryPreferences",
    async ({ userId }) => {
        try {
            const payload = await getApi(`${apiEndPoints.GET_FREELANCER_COUNTRY_PREFERENCES}/${userId}/current-country-preferences`);
            return payload;
        } catch (e) {
            showError(e.response?.data?.message || 'Failed to fetch country preferences');
            throw e;
        }
    }
);

export const addFreelancerCountryPreference = createAsyncThunk(
    "/addFreelancerCountryPreference", 
    async ({ userId, countryData }) => {
        try {
            const payload = await postApi(`${apiEndPoints.ADD_FREELANCER_COUNTRY_PREFERENCE}/${userId}/current-country-preferences`, countryData);
            showSuccess('Country preference added successfully');
            return payload;
        } catch (e) {
            showError(e.response?.data?.message || 'Failed to add country preference');
            throw e;
        }
    }
);

export const updateFreelancerCountryPreference = createAsyncThunk(
    "/updateFreelancerCountryPreference",
    async ({ userId, updateData }) => {
        try {
            const payload = await patchApi(`${apiEndPoints.UPDATE_FREELANCER_COUNTRY_PREFERENCE}/${userId}/current-country-preferences`, updateData);
            showSuccess('Country preference updated successfully');
            return payload;
        } catch (e) {
            showError(e.response?.data?.message || 'Failed to update country preference');
            throw e;
        }
    }
);

export const deleteFreelancerCountryPreference = createAsyncThunk(
    "/deleteFreelancerCountryPreference",
    async ({ userId, preferenceId }) => {
        try {
            const payload = await deleteApi(`${apiEndPoints.DELETE_FREELANCER_COUNTRY_PREFERENCE}/${userId}/current-country-preferences/${preferenceId}`);
            showSuccess('Country preference deleted successfully');
            return { payload, preferenceId };
        } catch (e) {
            showError(e.response?.data?.message || 'Failed to delete country preference');
            throw e;
        }
    }
);

// Max Values async thunks
export const updateMaxProposalValue = createAsyncThunk(
    "/updateMaxProposalValue",
    async ({ userId, maxProposalValue }) => {
        try {
            const payload = await patchApi(`${apiEndPoints.UPDATE_MAX_PROPOSAL_VALUE}/${userId}/max-proposal-value`, { maxProposalValue });
            showSuccess('Max proposal value updated successfully');
            return payload;
        } catch (e) {
            showError(e.response?.data?.message || 'Failed to update max proposal value');
            throw e;
        }
    }
);

export const updateMaxDeliveryInProgress = createAsyncThunk(
    "/updateMaxDeliveryInProgress",
    async ({ userId, maxDeliveryInProgress }) => {
        try {
            const payload = await patchApi(`${apiEndPoints.UPDATE_MAX_DELIVERY_IN_PROGRESS}/${userId}/max-delivery-in-progress`, { maxDeliveryInProgress });
            showSuccess('Max delivery in progress updated successfully');
            return payload;
        } catch (e) {
            showError(e.response?.data?.message || 'Failed to update max delivery in progress');
            throw e;
        }
    }
);

export const freelancerDataSlice = createSlice({
    name: "freelancerData",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
        .addCase(freelancerData.pending, (state) => {
            state.isLoading = true;
        })
        .addCase(freelancerData.fulfilled, (state, { payload }) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.responseCode = payload?.status;
            state.responseData = payload?.data?.data || {};
        })
        .addCase(freelancerData.rejected, (state) => {
            state.isLoading = false;
            state.isError = true;
        })
        // New cases for complete data
        .addCase(freelancerCompleteData.pending, (state) => {
            state.completeDataLoading = true;
            state.completeDataError = false;
        })
        .addCase(freelancerCompleteData.fulfilled, (state, { payload }) => {
            state.completeDataLoading = false;
            state.completeDataSuccess = true;
            // Handle both response structures: payload.data.data or payload.data
            const responseData = payload?.data?.data || payload?.data || null;
            state.completeData = responseData;
        })
        .addCase(freelancerCompleteData.rejected, (state) => {
            state.completeDataLoading = false;
            state.completeDataError = true;
            state.completeData = null;
        })
        // Country preferences cases
        .addCase(getFreelancerCountryPreferences.pending, (state) => {
            state.countryPreferencesLoading = true;
            state.countryPreferencesError = false;
        })
        .addCase(getFreelancerCountryPreferences.fulfilled, (state, { payload }) => {
            state.countryPreferencesLoading = false;
            state.countryPreferencesSuccess = true;
            state.countryPreferences = payload?.data?.data || [];
        })
        .addCase(getFreelancerCountryPreferences.rejected, (state) => {
            state.countryPreferencesLoading = false;
            state.countryPreferencesError = true;
            state.countryPreferences = [];
        })
        // Add country preference
        .addCase(addFreelancerCountryPreference.pending, (state) => {
            state.addingCountryPreference = true;
        })
        .addCase(addFreelancerCountryPreference.fulfilled, (state, { payload }) => {
            state.addingCountryPreference = false;
            // Add the new preference to the list
            if (payload?.data?.data) {
                state.countryPreferences.push(payload.data.data);
            }
        })
        .addCase(addFreelancerCountryPreference.rejected, (state) => {
            state.addingCountryPreference = false;
        })
        // Update country preference
        .addCase(updateFreelancerCountryPreference.pending, (state) => {
            state.updatingCountryPreference = true;
        })
        .addCase(updateFreelancerCountryPreference.fulfilled, (state, { payload }) => {
            state.updatingCountryPreference = false;
            // Update the preference in the list if needed
            // This will be handled by refetching the list in the component
        })
        .addCase(updateFreelancerCountryPreference.rejected, (state) => {
            state.updatingCountryPreference = false;
        })
        // Delete country preference
        .addCase(deleteFreelancerCountryPreference.pending, (state) => {
            state.deletingCountryPreference = true;
        })
        .addCase(deleteFreelancerCountryPreference.fulfilled, (state, { payload }) => {
            state.deletingCountryPreference = false;
            // Remove the preference from the list
            const { preferenceId } = payload;
            state.countryPreferences = state.countryPreferences.filter(pref => pref.id !== preferenceId);
        })
        .addCase(deleteFreelancerCountryPreference.rejected, (state) => {
            state.deletingCountryPreference = false;
        })
        // Max proposal value
        .addCase(updateMaxProposalValue.pending, (state) => {
            state.updatingMaxProposalValue = true;
        })
        .addCase(updateMaxProposalValue.fulfilled, (state) => {
            state.updatingMaxProposalValue = false;
        })
        .addCase(updateMaxProposalValue.rejected, (state) => {
            state.updatingMaxProposalValue = false;
        })
        // Max delivery in progress
        .addCase(updateMaxDeliveryInProgress.pending, (state) => {
            state.updatingMaxDeliveryInProgress = true;
        })
        .addCase(updateMaxDeliveryInProgress.fulfilled, (state) => {
            state.updatingMaxDeliveryInProgress = false;
        })
        .addCase(updateMaxDeliveryInProgress.rejected, (state) => {
            state.updatingMaxDeliveryInProgress = false;
        })
    },
});

export const freelancerDataReducer = freelancerDataSlice.reducer;
