import { useState, useEffect, useCallback } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { firebaseService } from '../services/firebase';
import { apiService } from '../services/api';
import { User, ApiResponse } from '../types';
import { storage } from '../utils/helpers';
import { STORAGE_KEYS } from '../config/constants';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface UseAuth {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export function useAuth(): UseAuth {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  const handleError = (error: any) => {
    console.error('Auth error:', error);
    setState(prev => ({ ...prev, error: error.message, loading: false }));
  };

  // Convert Firebase user to our User type
  const transformUser = async (firebaseUser: FirebaseUser): Promise<User> => {
    try {
      // Fetch additional user data from our backend
      const response = await apiService.get<User>(`/users/${firebaseUser.uid}`);
      return response.data;
    } catch (error) {
      // If user doesn't exist in our backend yet, create basic profile
      return {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        username: firebaseUser.displayName || firebaseUser.email!.split('@')[0],
        displayName: firebaseUser.displayName || '',
        photoURL: firebaseUser.photoURL || '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
  };

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = firebaseService.onAuthStateChanged(async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const user = await transformUser(firebaseUser);
          setState({ user, loading: false, error: null });
          await storage.setItem(STORAGE_KEYS.USER_DATA, user);
        } else {
          setState({ user: null, loading: false, error: null });
          await storage.removeItem(STORAGE_KEYS.USER_DATA);
        }
      } catch (error) {
        handleError(error);
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      await firebaseService.signIn(email, password);
    } catch (error) {
      handleError(error);
      throw error;
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, username: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const { user: firebaseUser } = await firebaseService.signUp(email, password);
      
      // Update Firebase profile
      await firebaseService.updateUserProfile(username);
      
      // Create user in our backend
      const userData: Partial<User> = {
        id: firebaseUser.uid,
        email,
        username,
        displayName: username,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await apiService.post('/users', userData);
    } catch (error) {
      handleError(error);
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      await firebaseService.signOut();
    } catch (error) {
      handleError(error);
      throw error;
    }
  }, []);

  const updateProfile = useCallback(async (data: Partial<User>) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Update Firebase profile if display name or photo changed
      if (data.displayName || data.photoURL) {
        await firebaseService.updateUserProfile(data.displayName, data.photoURL);
      }
      
      // Update backend profile
      const response = await apiService.put<User>(`/users/${state.user?.id}`, data);
      setState(prev => ({
        ...prev,
        user: response.data,
        loading: false,
        error: null,
      }));
      
      await storage.setItem(STORAGE_KEYS.USER_DATA, response.data);
    } catch (error) {
      handleError(error);
      throw error;
    }
  }, [state.user?.id]);

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };
} 