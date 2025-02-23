import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { firebaseService } from '../services/firebase';
import { apiService } from '../services/api';
import { DEFAULT_LOCATION } from '../config/constants';
import { Place } from '../types';

interface LocationState {
  location: Location.LocationObject | null;
  errorMsg: string | null;
  loading: boolean;
}

interface UseLocation {
  location: Location.LocationObject | null;
  errorMsg: string | null;
  loading: boolean;
  requestPermission: () => Promise<boolean>;
  updateLocation: () => Promise<void>;
  getNearbyPlaces: (radius?: number) => Promise<Place[]>;
  watchLocation: () => Promise<void>;
  stopWatchingLocation: () => void;
}

export function useLocation(userId?: string): UseLocation {
  const [state, setState] = useState<LocationState>({
    location: null,
    errorMsg: null,
    loading: true,
  });
  const [locationWatcher, setLocationWatcher] = useState<Location.LocationSubscription | null>(null);

  const requestPermission = async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setState(prev => ({
          ...prev,
          errorMsg: 'Permission to access location was denied',
          loading: false,
        }));
        return false;
      }
      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        errorMsg: 'Error requesting location permission',
        loading: false,
      }));
      return false;
    }
  };

  const updateLocation = async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true, errorMsg: null }));
      
      const hasPermission = await requestPermission();
      if (!hasPermission) return;

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setState(prev => ({
        ...prev,
        location,
        loading: false,
        errorMsg: null,
      }));

      // If userId is provided, update location in Firebase
      if (userId) {
        await firebaseService.updateUserLocation(userId, {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        errorMsg: 'Error getting location',
        loading: false,
      }));
    }
  };

  const watchLocation = async (): Promise<void> => {
    try {
      const hasPermission = await requestPermission();
      if (!hasPermission) return;

      const watcher = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        async (location) => {
          setState(prev => ({
            ...prev,
            location,
            loading: false,
            errorMsg: null,
          }));

          // Update location in Firebase if userId is provided
          if (userId) {
            await firebaseService.updateUserLocation(userId, {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            });
          }
        }
      );

      setLocationWatcher(watcher);
    } catch (error) {
      setState(prev => ({
        ...prev,
        errorMsg: 'Error watching location',
        loading: false,
      }));
    }
  };

  const stopWatchingLocation = useCallback(() => {
    if (locationWatcher) {
      locationWatcher.remove();
      setLocationWatcher(null);
    }
  }, [locationWatcher]);

  const getNearbyPlaces = useCallback(async (radius: number = 1000): Promise<Place[]> => {
    try {
      const currentLocation = state.location?.coords || DEFAULT_LOCATION;
      const response = await apiService.get<Place[]>('/places/nearby', {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        radius,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching nearby places:', error);
      return [];
    }
  }, [state.location]);

  // Cleanup location watcher on unmount
  useEffect(() => {
    return () => {
      stopWatchingLocation();
    };
  }, [stopWatchingLocation]);

  return {
    location: state.location,
    errorMsg: state.errorMsg,
    loading: state.loading,
    requestPermission,
    updateLocation,
    getNearbyPlaces,
    watchLocation,
    stopWatchingLocation,
  };
} 