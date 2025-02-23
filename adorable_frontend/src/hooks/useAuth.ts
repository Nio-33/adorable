import { useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { firebase } from '../services/firebase';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged(async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Get additional user data from your database
          const userData = await firebase.getUserById(firebaseUser.uid);
          setState({
            user: userData,
            loading: false,
            error: null,
          });
        } else {
          setState({
            user: null,
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        setState({
          user: null,
          loading: false,
          error: 'Error loading user data',
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      await firebase.auth().signInWithEmailAndPassword(email, password);
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Invalid email or password',
      }));
      throw error;
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, userData: Partial<User>) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const { user: firebaseUser } = await firebase.auth().createUserWithEmailAndPassword(email, password);

      if (firebaseUser) {
        // Create user profile in your database
        await firebase.createUser({
          id: firebaseUser.uid,
          email,
          ...userData,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Error creating account',
      }));
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      await firebase.auth().signOut();
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Error signing out',
      }));
      throw error;
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    try {
      if (!state.user) {throw new Error('No user logged in');}

      setState(prev => ({ ...prev, loading: true, error: null }));
      await firebase.updateUser(state.user.id, updates);

      setState(prev => ({
        ...prev,
        loading: false,
        user: prev.user ? { ...prev.user, ...updates } : null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Error updating profile',
      }));
      throw error;
    }
  }, [state.user]);

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };
};
