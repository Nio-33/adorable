import axios from 'axios';
import type { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG, STORAGE_KEYS } from '../config/constants';
import { storage } from '../utils/helpers';
import { ApiResponse, ApiError } from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.api.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = await storage.getItem<string>(STORAGE_KEYS.AUTH_TOKEN);
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response.data;
      },
      (error: AxiosError) => {
        return this.handleError(error);
      }
    );
  }

  private handleError(error: AxiosError): Promise<ApiError> {
    if (error.response) {
      // Server responded with error
      const errorData = error.response.data as ApiError;
      return Promise.reject(errorData);
    } else if (error.request) {
      // Request made but no response
      return Promise.reject({
        code: 'NETWORK_ERROR',
        message: 'Network error occurred',
      });
    } else {
      // Something else happened
      return Promise.reject({
        code: 'REQUEST_ERROR',
        message: error.message || 'Unknown error occurred',
      });
    }
  }

  // Generic request methods
  async get<T>(url: string, params?: object): Promise<ApiResponse<T>> {
    return this.api.get<ApiResponse<T>>(url, { params }).then(response => response.data);
  }

  async post<T>(url: string, data?: object): Promise<ApiResponse<T>> {
    return this.api.post<ApiResponse<T>>(url, data).then(response => response.data);
  }

  async put<T>(url: string, data?: object): Promise<ApiResponse<T>> {
    return this.api.put<ApiResponse<T>>(url, data).then(response => response.data);
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    return this.api.delete<ApiResponse<T>>(url).then(response => response.data);
  }

  // File upload
  async uploadFile(url: string, file: FormData): Promise<ApiResponse<string>> {
    return this.api.post<ApiResponse<string>>(url, file, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(response => response.data);
  }
}

export const apiService = new ApiService(); 