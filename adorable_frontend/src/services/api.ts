import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from '../config/env';

export const api: AxiosInstance = axios.create({
  baseURL: ENV.API.URL,
  timeout: ENV.API.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for API calls
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && originalRequest) {
      // Handle token refresh here
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${ENV.API.URL}/auth/refresh/`, {
            refresh: refreshToken,
          });
          
          const { access } = response.data;
          await AsyncStorage.setItem('auth_token', access);
          
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return axios(originalRequest);
        } catch (refreshError) {
          // Handle refresh token failure (e.g., logout user)
          await AsyncStorage.multiRemove(['auth_token', 'refresh_token']);
          // Redirect to login or dispatch logout action
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export interface ApiError {
  error: true;
  message: string;
  status?: number;
}

export const handleApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message || error.message;
    return {
      error: true,
      message,
      status: error.response?.status,
    };
  }
  return {
    error: true,
    message: 'An unexpected error occurred',
    status: 500,
  };
};

export default api;
