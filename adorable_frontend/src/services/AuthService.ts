import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, handleApiError, ApiError } from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  displayName: string;
  photoURL?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  isEmailVerified: boolean;
}

class AuthService {
  private static instance: AuthService;
  private currentUser: AuthUser | null = null;

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(credentials: LoginCredentials): Promise<AuthUser> {
    try {
      const response = await api.post<AuthTokens>('/auth/login/', credentials);
      const { access, refresh } = response.data;
      
      await this.setTokens(access, refresh);
      return await this.fetchUserProfile();
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async register(data: RegisterData): Promise<AuthUser> {
    try {
      const response = await api.post<AuthTokens>('/auth/register/', data);
      const { access, refresh } = response.data;
      
      await this.setTokens(access, refresh);
      return await this.fetchUserProfile();
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      if (refreshToken) {
        await api.post('/auth/logout/', { refresh: refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await this.clearTokens();
      this.currentUser = null;
    }
  }

  async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      if (!refreshToken) return null;

      const response = await api.post<{ access: string }>('/auth/refresh/', {
        refresh: refreshToken,
      });

      const { access } = response.data;
      await AsyncStorage.setItem('auth_token', access);
      return access;
    } catch (error) {
      await this.clearTokens();
      throw handleApiError(error);
    }
  }

  async fetchUserProfile(): Promise<AuthUser> {
    try {
      const response = await api.get<AuthUser>('/auth/profile/');
      this.currentUser = response.data;
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async updateProfile(data: Partial<AuthUser>): Promise<AuthUser> {
    try {
      const response = await api.patch<AuthUser>('/auth/profile/', data);
      this.currentUser = response.data;
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await api.post('/auth/reset-password/', { email });
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async verifyEmail(token: string): Promise<void> {
    try {
      await api.post('/auth/verify-email/', { token });
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      return !!token;
    } catch {
      return false;
    }
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  private async setTokens(access: string, refresh: string): Promise<void> {
    await AsyncStorage.multiSet([
      ['auth_token', access],
      ['refresh_token', refresh],
    ]);
  }

  private async clearTokens(): Promise<void> {
    await AsyncStorage.multiRemove(['auth_token', 'refresh_token']);
  }
}

export const authService = AuthService.getInstance(); 