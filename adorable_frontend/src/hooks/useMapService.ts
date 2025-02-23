import { useCallback } from 'react';
import { Location, SearchResult, NearbyUser } from '../types/map';
import { mapService } from '../services/MapService';

const SEARCH_RADIUS = 5000; // 5km in meters

export const useMapService = () => {
  const getNearbyPlaces = useCallback(async (location: Location): Promise<SearchResult[]> => {
    try {
      return await mapService.getNearbyPlaces(location, SEARCH_RADIUS);
    } catch (error) {
      console.error('Error getting nearby places:', error);
      return [];
    }
  }, []);

  const getNearbyUsers = useCallback(async (location: Location): Promise<NearbyUser[]> => {
    try {
      return await mapService.getNearbyUsers(location, SEARCH_RADIUS);
    } catch (error) {
      console.error('Error getting nearby users:', error);
      return [];
    }
  }, []);

  return {
    getNearbyPlaces,
    getNearbyUsers,
  };
}; 