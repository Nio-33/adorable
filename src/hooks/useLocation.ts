import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { User } from '../types';

interface LocationState {
  location: Location.LocationObject | null;
  error: string | null;
}

export const useLocation = (userId?: string) => {
  const [state, setState] = useState<LocationState>({
    location: null,
    error: null,
  });

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

  return {
    location: state.location?.coords,
    timestamp: state.location?.timestamp,
    error: state.error,
  };
}; 