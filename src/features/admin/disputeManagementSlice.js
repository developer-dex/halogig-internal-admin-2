import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiEndPoints } from "../../config/path";
import { showError } from "../../helpers/messageHelper";
import { getApi } from "../../services/api";

const initialState = {
    isLoading: false,
    isSuccess: false,
    isError: false,
    responseCode: 0,
    responseData: {},
};

export const getDisputesByType = createAsyncThunk(
    "/getDisputesByType",
    async ({ type, page, limit }) => {
        try {
            const payload = await getApi(`${apiEndPoints.GET_DISPUTES_BY_TYPE}?type=${type}&page=${page}&limit=${limit}`);
            return payload;
        } catch (e) {
            showError(e.response?.data?.message || 'Failed to fetch disputes');
            throw e;
        }
    }
);

export const disputeManagementSlice = createSlice({
    name: "disputeManagement",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
        .addCase(getDisputesByType.pending, (state) => {
            state.isLoading = true;
        })
        .addCase(getDisputesByType.fulfilled, (state, { payload }) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.responseCode = payload?.status;
            state.responseData = payload?.data?.data || {};
        })
        .addCase(getDisputesByType.rejected, (state) => {
            state.isLoading = false;
            state.isError = true;
        });
    },
});

export const disputeManagementReducer = disputeManagementSlice.reducer;

