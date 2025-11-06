// src/features/auth/loginSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authPostApi, getApiClient, patchApi, postApi, postClientApi } from "../../services/api";
import { apiEndPoints } from "../../config/path";
import { showError } from "../../helpers/messageHelper";

const initialState = {
  isLoading: false,
  isSuccess: false,
  isError: false,
  responseCode: 0,
  responseData: {},
  token: "",
};

export const adminLogin = createAsyncThunk(
  "/adminLogin",
  async (values) => {
    console.log('=== ADMIN LOGIN THUNK STARTED ==='); // Debug log
    console.log('Login values received:', values); // Debug log
    console.log('API endpoint:', apiEndPoints.ADMIN_LOGIN); // Debug log
    
    try {
      const valuesData = { ...values };
      console.log('About to call authPostApi with:', valuesData); // Debug log
      
      const payload = await authPostApi(apiEndPoints.ADMIN_LOGIN, valuesData);
      console.log("Admin login payload received:", payload); // Debug log
      return payload;
    } catch (e) {
      console.error('Admin login error:', e); // Debug log
      console.error('Error response:', e.response); // Debug log
      showError(e.response?.data?.message || "Login failed");
      throw e;
    }
  }
);

export const fetchDataStatus = createAsyncThunk(
  "/fetchDataStatus",
  async () => {
    try {
      const payload = await getApiClient(apiEndPoints.GET_SOFTWARE_STATUS);
      return payload;
    } catch (e) {
      showError(e.response?.data?.message || "Failed to fetch data");
      throw e;
    }
  }
);

export const profilePicture = createAsyncThunk(
  "/profilePicture",
  async (values) => {
    try {
      const payload = await patchApi(apiEndPoints.PROFILE_PICTURE, values);
      return payload;
    } catch (e) {
      showError(e.response?.data?.message || "Failed to update profile picture");
      throw e;
    }
  }
);

export const loginDataSlice = createSlice({
  name: "loginData",
  initialState,
  reducers: {
    clearLoginState: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.responseCode = 0;
      state.responseData = {};
      state.token = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(adminLogin.pending, (state) => {
        console.log('adminLogin.pending - Setting loading to true'); // Debug log
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
      })
      .addCase(adminLogin.fulfilled, (state, { payload }) => {
        console.log('adminLogin.fulfilled - Success!', payload); // Debug log
        state.isLoading = false;
        state.isSuccess = true;
        state.responseCode = payload && payload.status;
        state.responseData = payload && payload.data.data;
        state.token = payload && payload.data.data.token;
      })
      .addCase(adminLogin.rejected, (state, action) => {
        console.log('adminLogin.rejected - Failed!', action.error); // Debug log
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
      })
      .addCase(fetchDataStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchDataStatus.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.responseCode = payload && payload.status;
        state.responseData = payload && payload.data.data;
      })
      .addCase(fetchDataStatus.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
      })
      .addCase(profilePicture.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(profilePicture.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.responseCode = payload && payload.status;
        state.responseData = payload && payload.data.data;
      })
      .addCase(profilePicture.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
      });
  },
});

export const { clearLoginState } = loginDataSlice.actions;
export const loginDataReducer = loginDataSlice.reducer;
