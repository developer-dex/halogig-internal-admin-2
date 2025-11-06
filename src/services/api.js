import ApiInstance from "./http";
import { config } from "../config/config";

// Removed TypeScript interfaces

export const getApi = async (url) => {
  const data = await ApiInstance.get(`${url}`);
  return data;
};

export const getApiClient = async (url) => {
  const data = await ApiInstance.get(`${url}`);
  return data;
};

export const postApi = async (url, apiData) => {
  console.log('=== POST API CALLED ===');
  console.log('URL:', url);
  console.log('API Data:', apiData);
  
  try {
    console.log('About to call ApiInstance.post with:', { url, apiData });
    const data = await ApiInstance.post(`${url}`, apiData);
    console.log('API Response received:', data);
    return data;
  } catch (error) {
    console.error('API Error:', error);
    console.error('Error response:', error.response);
    throw error;
  }
};

export const postClientApi = (url, apiData) => {
  return ApiInstance.post(`${url}`, apiData);
};

export const authPostApi = async (url, apiData) => {
  console.log('=== AUTH POST API CALLED ==='); // Debug log
  console.log('URL:', url); // Debug log
  console.log('API Data:', apiData); // Debug log
  
  try {
    console.log('About to call ApiInstance.post with:', { url, apiData }); // Debug log
    const data = await ApiInstance.post(`${url}`, apiData);
    console.log('API Response received:', data); // Debug log
    return data;
  } catch (error) {
    console.error('API Error:', error); // Debug log
    console.error('Error response:', error.response); // Debug log
    throw error;
  }
};

export const patchApi = (url, apiData) => {
  return ApiInstance.patch(`${url}`, apiData);
};

export const patchClientApi = (url, apiData) => {
  return ApiInstance.patch(`${url}`, apiData);
};

export const putApi = (url, apiData) => {
  return ApiInstance.put(`${url}`, apiData);
};

export const putClientApi = (url, apiData) => {
  return ApiInstance.put(`${url}`, apiData);
};

export const deleteApi = (url) => {
  return ApiInstance.delete(`${config.apiBaseUrl}${url}`);
};

export const deleteApiClient = (url) => {
  return ApiInstance.delete(`${config.apiBaseUrl}${url}`);
};
