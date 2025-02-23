import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { User } from '../types';
import { LocationObjectCoords } from 'expo-location';

interface LocationState {
  location: Location.LocationObject | null;
  error: string | null;
}

export const useLocation = (userId?: string) => {
  const [state, setState] = useState<LocationState>({
    location: null,
    error: null,
  });

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setState(prev => ({
          ...prev,
          error: 'Location permission denied',
        }));
        return false;
      }
      return true;
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: 'Error requesting location permission',
      }));
      return false;
    }
  };

  const getCurrentLocation = async () => {
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) return;

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setState(prev => ({
        ...prev,
        location: location,
        error: null,
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: 'Error getting location',
      }));
    }
  };

  const refreshLocation = async () => {
    await getCurrentLocation();
  };

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    const getLocationPermission = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setState(prev => ({
            ...prev,
            error: 'Permission to access location was denied',
          }));
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setState(prev => ({ ...prev, location }));

        // Start watching position
        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 5000,
            distanceInterval: 10,
          },
          (location: Location.LocationObject) => {
            setState(prev => ({ ...prev, location }));
            // TODO: Update user's location in the database
          }
        );
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: 'Error getting location',
        }));
      }
    };

    getLocationPermission();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [userId]);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  return {
    location: state.location?.coords,
    timestamp: state.location?.timestamp,
    error: state.error,
    refreshLocation,
  };
};
