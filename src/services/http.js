// src/services/http.js
import axios from "axios";
import { config } from "../config/config";
import { UNAUTHORIZED } from "../config/httpStatusCodes";
import { clearSession } from "../config/localStorage";
import { adminLogout } from "../helpers/messageHelper";

const instance = axios.create({
  baseURL: config.apiBaseUrl,
});

// Request interceptor to add authorization header
instance.interceptors.request.use(
  (config) => {
    const adminToken = localStorage.getItem('adminToken');
    
    // Don't add authorization header for login requests
    if (config.url && !config.url.includes('/login') && adminToken) {
      config.headers.authorization = `Bearer ${adminToken}`;
    }
    
    // Set default headers (but don't override Content-Type for FormData)
    if (!(config.data instanceof FormData)) {
    config.headers.Accept = "application/json";
    }
    config.headers["Accept-Language"] = "en";
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const { response } = error;
    if (response && response.status === UNAUTHORIZED) {
      // Use the centralized logout function for consistency
      adminLogout();
    }
    if (response && response.status === 409) {
      window.location.href = config.baseName || '';
    }
    throw error;
  }
);

export default instance;
