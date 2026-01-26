import axios from 'axios';
import { SecureStorageService } from '../services/secure-storage-service';

export const API_BASE = 'https://84.201.180.219:80/';
// export const API_BASE = 'http://172.20.10.2:3000/'; // Replace X with your actual IP

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStorageService.getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Parse and log error silently (without showing alert)
    // const appError = handleErrorSilent(error);

    // Handle 401 - clear auth and let screens handle navigation
    // if (appError.statusCode === 401) {
    //   try {
    //     await SecureStorageService.clearAll();
    //     console.warn("401 Unauthorized - cleared auth storage");
    //   } catch (clearError) {
    //     console.error("Error clearing storage:", clearError);
    //   }
    // }

    // Reject with the original error so calling code can handle it
    return Promise.reject(error);
  }
);

export default api;
