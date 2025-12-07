import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiEndPoints } from "../../config/path";
import { showError } from "../../helpers/messageHelper";
import { getApi, patchApi, putApi } from "../../services/api";

const initialState = {
    isLoading: false,
    isSuccess: false,
    isError: false,
    responseCode: 0,
    responseData: {},
};

export const projectData = createAsyncThunk(
    "/projectData",
    async ({ page, limit }) => {
        try {
            const payload = await getApi(`${apiEndPoints.GET_CLIENT_PROJECTS}?page=${page}&limit=${limit}`);
            return payload;
        } catch (e) {
            console.error('API Error:', e);
            if (e.response && e.response.data) {
                showError(e.response.data.message);
            } else {
                showError('Failed to fetch projects');
            }
            throw e;
        }
    }
);

export const updateProject = createAsyncThunk(
    "/updateProject",
    async ({ projectId, projectData }) => {
        try {
            console.log('Updating project with data:', projectData);
            const payload = await putApi(`${apiEndPoints.UPDATE_PROJECT}/${projectId}/update`, projectData);
            console.log('Update response:', payload);
            return payload;
        } catch (e) {
            console.error('Update API Error:', e);
            if (e.response && e.response.data) {
                showError(e.response.data.message);
            } else {
                showError('Failed to update project');
            }
            throw e;
        }
    }
);

export const updateProjectStatus = createAsyncThunk(
    "/updateProjectStatus",
    async ({ projectId, status }) => {
        try {
            const payload = await patchApi(`${apiEndPoints.UPDATE_PROJECT_STATUS}/${projectId}/status`, { status });
            return { projectId, status };
        } catch (e) {
            console.error('Status Update API Error:', e);
            if (e.response && e.response.data) {
                showError(e.response.data.message);
            } else {
                showError('Failed to update project status');
            }
            throw e;
        }
    }
);

export const projectDataSlice = createSlice({
    name: "projectData",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
        .addCase(projectData.pending, (state) => {
            state.isLoading = true;
        })
        .addCase(projectData.fulfilled, (state, { payload }) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.responseCode = payload?.status;
            state.responseData = payload || {};
        })
        .addCase(projectData.rejected, (state) => {
            state.isLoading = false;
            state.isError = true;
        })
        .addCase(updateProject.pending, (state) => {
            state.isLoading = true;
        })
        .addCase(updateProject.fulfilled, (state, { payload }) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.responseCode = payload?.status;
        })
        .addCase(updateProject.rejected, (state) => {
            state.isLoading = false;
            state.isError = true;
        })
        .addCase(updateProjectStatus.pending, (state) => {
            state.isLoading = true;
        })
        .addCase(updateProjectStatus.fulfilled, (state, { payload }) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.responseCode = payload?.status;
        })
        .addCase(updateProjectStatus.rejected, (state) => {
            state.isLoading = false;
            state.isError = true;
        })
    },
});

export const projectDataReducer = projectDataSlice.reducer;
