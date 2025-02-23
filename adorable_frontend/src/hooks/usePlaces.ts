import { useState, useCallback } from 'react';
import { apiService } from '../services/api';
import { Place, Review } from '../types';
import { PLACE_CATEGORIES } from '../config/constants';
import { transformData } from '../utils/typeGuards';

interface PlacesState {
  places: Place[];
  selectedPlace: Place | null;
  loading: boolean;
  refreshing: boolean;
  hasMore: boolean;
  page: number;
  error: string | undefined;
}

export type SortOption = 'rating' | 'distance' | 'name' | 'newest';
export type FilterOptions = {
  minRating?: number;
  maxDistance?: number;
  priceRange?: string[];
};

interface UsePlaces {
  places: Place[];
  selectedPlace: Place | null;
  loading: boolean;
  refreshing: boolean;
  hasMore: boolean;
  error: string | undefined;
  searchPlaces: (query: string) => Promise<void>;
  getPlaceDetails: (placeId: string) => Promise<void>;
  addPlace: (placeData: Partial<Place>) => Promise<void>;
  updatePlace: (placeId: string, placeData: Partial<Place>) => Promise<void>;
  addReview: (placeId: string, reviewData: Partial<Review>) => Promise<void>;
  getPlacesByCategory: (
    category: typeof PLACE_CATEGORIES[number],
    sortBy?: SortOption,
    filters?: FilterOptions
  ) => Promise<void>;
  loadMorePlaces: () => Promise<void>;
  refreshPlaces: () => Promise<void>;
  getPopularPlaces: () => Promise<void>;
  getRecommendedPlaces: () => Promise<void>;
}

const ITEMS_PER_PAGE = 20;

export function usePlaces(): UsePlaces {
  const [state, setState] = useState<PlacesState>({
    places: [],
    selectedPlace: null,
    loading: false,
    refreshing: false,
    hasMore: true,
    page: 1,
    error: undefined,
  });

  const [currentCategory, setCurrentCategory] = useState<typeof PLACE_CATEGORIES[number] | undefined>();
  const [currentSort, setCurrentSort] = useState<SortOption | undefined>();
  const [currentFilters, setCurrentFilters] = useState<FilterOptions | undefined>();

  const handleError = (error: any) => {
    console.error('Places error:', error);
    setState(prev => ({
      ...prev,
      error: error.message || 'An unexpected error occurred',
      loading: false,
      refreshing: false,
    }));
  };

  const searchPlaces = useCallback(async (query: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: undefined }));
      const response = await apiService.get<Place[]>('/places/search', { query });
      setState(prev => ({
        ...prev,
        places: response.data.map(place => transformData(place)),
        loading: false,
      }));
    } catch (error) {
      handleError(error);
    }
  }, []);

  const getPlaceDetails = useCallback(async (placeId: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: undefined }));
      const response = await apiService.get<Place>(`/places/${placeId}`);
      setState(prev => ({
        ...prev,
        selectedPlace: transformData(response.data),
        loading: false,
      }));
    } catch (error) {
      handleError(error);
    }
  }, []);

  const addPlace = useCallback(async (placeData: Partial<Place>) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: undefined }));
      const response = await apiService.post<Place>('/places', placeData);
      const transformedPlace = transformData(response.data);
      setState(prev => ({
        ...prev,
        places: [...prev.places, transformedPlace],
        selectedPlace: transformedPlace,
        loading: false,
      }));
    } catch (error) {
      handleError(error);
    }
  }, []);

  const updatePlace = useCallback(async (placeId: string, placeData: Partial<Place>) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: undefined }));
      const response = await apiService.put<Place>(`/places/${placeId}`, placeData);
      const transformedPlace = transformData(response.data);
      setState(prev => ({
        ...prev,
        places: prev.places.map(p => (p.id === placeId ? transformedPlace : p)),
        selectedPlace: transformedPlace,
        loading: false,
      }));
    } catch (error) {
      handleError(error);
    }
  }, []);

  const addReview = useCallback(async (placeId: string, reviewData: Partial<Review>) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: undefined }));
      const response = await apiService.post<Review>(`/places/${placeId}/reviews`, reviewData);
      const transformedReview = transformData(response.data);

      if (state.selectedPlace && state.selectedPlace.id === placeId) {
        const updatedPlace = {
          ...state.selectedPlace,
          reviews: [...(state.selectedPlace.reviews || []), transformedReview],
        };

        setState(prev => ({
          ...prev,
          selectedPlace: updatedPlace,
          loading: false,
        }));
      }
    } catch (error) {
      handleError(error);
    }
  }, [state.selectedPlace]);

  const getPlacesByCategory = useCallback(async (
    category: typeof PLACE_CATEGORIES[number],
    sortBy?: SortOption,
    filters?: FilterOptions
  ) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: undefined, page: 1 }));
      setCurrentCategory(category);
      setCurrentSort(sortBy);
      setCurrentFilters(filters);

      const response = await apiService.get<Place[]>('/places', {
        category,
        sortBy,
        ...filters,
        page: 1,
        limit: ITEMS_PER_PAGE,
      });

      const transformedPlaces = response.data.map(place => transformData(place));
      setState(prev => ({
        ...prev,
        places: transformedPlaces,
        loading: false,
        hasMore: transformedPlaces.length === ITEMS_PER_PAGE,
      }));
    } catch (error) {
      handleError(error);
    }
  }, []);

  const loadMorePlaces = useCallback(async () => {
    if (!state.hasMore || state.loading || !currentCategory) {return;}

    try {
      setState(prev => ({ ...prev, loading: true, error: undefined }));
      const nextPage = state.page + 1;

      const response = await apiService.get<Place[]>('/places', {
        category: currentCategory,
        sortBy: currentSort,
        ...currentFilters,
        page: nextPage,
        limit: ITEMS_PER_PAGE,
      });

      const transformedPlaces = response.data.map(place => transformData(place));
      setState(prev => ({
        ...prev,
        places: [...prev.places, ...transformedPlaces],
        loading: false,
        hasMore: transformedPlaces.length === ITEMS_PER_PAGE,
        page: nextPage,
      }));
    } catch (error) {
      handleError(error);
    }
  }, [state.hasMore, state.loading, state.page, currentCategory, currentSort, currentFilters]);

  const refreshPlaces = useCallback(async () => {
    if (!currentCategory) {return;}

    try {
      setState(prev => ({ ...prev, refreshing: true, error: undefined }));
      const response = await apiService.get<Place[]>('/places', {
        category: currentCategory,
        sortBy: currentSort,
        ...currentFilters,
        page: 1,
        limit: ITEMS_PER_PAGE,
      });

      const transformedPlaces = response.data.map(place => transformData(place));
      setState(prev => ({
        ...prev,
        places: transformedPlaces,
        refreshing: false,
        hasMore: transformedPlaces.length === ITEMS_PER_PAGE,
        page: 1,
      }));
    } catch (error) {
      handleError(error);
    }
  }, [currentCategory, currentSort, currentFilters]);

  const getPopularPlaces = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: undefined }));
      const response = await apiService.get<Place[]>('/places/popular');
      setState(prev => ({
        ...prev,
        places: response.data.map(place => transformData(place)),
        loading: false,
      }));
    } catch (error) {
      handleError(error);
    }
  }, []);

  const getRecommendedPlaces = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: undefined }));
      const response = await apiService.get<Place[]>('/places/recommended');
      setState(prev => ({
        ...prev,
        places: response.data.map(place => transformData(place)),
        loading: false,
      }));
    } catch (error) {
      handleError(error);
    }
  }, []);

  return {
    places: state.places,
    selectedPlace: state.selectedPlace,
    loading: state.loading,
    refreshing: state.refreshing,
    hasMore: state.hasMore,
    error: state.error,
    searchPlaces,
    getPlaceDetails,
    addPlace,
    updatePlace,
    addReview,
    getPlacesByCategory,
    loadMorePlaces,
    refreshPlaces,
    getPopularPlaces,
    getRecommendedPlaces,
  };
}
