import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiEndPoints } from "../../config/path";
import { showError, showSuccess } from "../../helpers/messageHelper";
import { getApi } from "../../services/api";

const initialState = {
    isLoading: false,
    isSuccess: false,
    isError: false,
    responseCode: 0,
    responseData: {},
};

// Get all web rotation data with pagination
export const getWebRotData = createAsyncThunk(
    "/getWebRotData",
    async ({
        page = 1,
        limit = 10,
        serviceName,
        industry,
        slugLink,
        batchNo,
        status,
    }) => {
        try {
            let url = `${apiEndPoints.GET_WEB_ROT_DATA}?page=${page}&limit=${limit}`;
            if (serviceName) url += `&serviceName=${serviceName}`;
            if (industry) url += `&industry=${industry}`;
            if (slugLink) url += `&slugLink=${slugLink}`;
            if (batchNo) url += `&batchNo=${batchNo}`;
            if (status) url += `&status=${status}`;
            
            const payload = await getApi(url);
            return payload;
        } catch (e) {
            showError(e.response?.data?.message || "Failed to fetch web rotation data");
            throw e;
        }
    }
);

export const webRotDataSlice = createSlice({
    name: "webRotData",
    initialState,
    reducers: {
        resetState: (state) => {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder
            // Get web rotation data
            .addCase(getWebRotData.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getWebRotData.fulfilled, (state, { payload }) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.responseCode = payload?.status;
                state.responseData = payload?.data || {};
            })
            .addCase(getWebRotData.rejected, (state) => {
                state.isLoading = false;
                state.isError = true;
            });
    },
});

export const { resetState } = webRotDataSlice.actions;
export const webRotDataReducer = webRotDataSlice.reducer;
