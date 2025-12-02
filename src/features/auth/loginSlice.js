import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authPostApi } from "../../services/api";
import { apiEndPoints } from "../../config/path";
import { showError, showSuccess } from "../../helpers/messageHelper";

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
    try {
      const valuesData = { ...values };
      const payload = await authPostApi(apiEndPoints.ADMIN_LOGIN, valuesData);
      
      if (payload?.data?.data?.requiresOtp) {
        showSuccess("OTP sent to your email!");
      } else if (payload?.data?.data?.token) {
        showSuccess("Login successful!");
      }
      
      return payload;
    } catch (e) {
      showError(e.response?.data?.message || "Login failed");
      throw e;
    }
  }
);

export const verifyOtp = createAsyncThunk(
  "/verifyOtp",
  async (values) => {
    try {
      const valuesData = { ...values };
      const payload = await authPostApi(apiEndPoints.ADMIN_VERIFY_OTP, valuesData);
      
      if (payload?.data?.data?.token) {
        showSuccess("Login successful!");
      }
      
      return payload;
    } catch (e) {
      showError(e.response?.data?.message || "Invalid or expired OTP");
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
    logout: (state) => {
      // Clear state
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.responseCode = 0;
      state.responseData = {};
      state.token = "";
      
      // Clear localStorage
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      localStorage.removeItem('isAdminLogIn');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(adminLogin.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
      })
      .addCase(adminLogin.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.responseCode = payload && payload.status;
        state.responseData = payload && payload.data.data;
        state.token = payload && payload.data.data.token;
      })
      .addCase(adminLogin.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
      })
      .addCase(verifyOtp.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
      })
      .addCase(verifyOtp.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.responseCode = payload && payload.status;
        state.responseData = payload && payload.data.data;
        state.token = payload && payload.data.data.token;
      })
      .addCase(verifyOtp.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
      });
  },
});

export const { clearLoginState, logout } = loginDataSlice.actions;
export const loginDataReducer = loginDataSlice.reducer;
