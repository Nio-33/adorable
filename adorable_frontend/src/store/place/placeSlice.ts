import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Location {
  latitude: number;
  longitude: number;
}

export interface PlacePhoto {
  id: string;
  url: string;
  uploadedBy: string;
  createdAt: string;
}

export interface PlaceReview {
  id: string;
  userId: string;
  rating: number;
  text: string;
  photos: PlacePhoto[];
  createdAt: string;
  updatedAt: string;
}

export interface CheckIn {
  id: string;
  userId: string;
  placeId: string;
  photos: PlacePhoto[];
  comment: string | null;
  createdAt: string;
}

export interface Place {
  id: string;
  name: string;
  description: string | null;
  location: Location;
  address: string;
  category: string;
  photos: PlacePhoto[];
  rating: number;
  reviewCount: number;
  checkInCount: number;
  savedCount: number;
  reviews: PlaceReview[];
  checkIns: CheckIn[];
  createdAt: string;
  updatedAt: string;
}

export interface PlaceState {
  places: Place[];
  selectedPlace: Place | null;
  nearbyPlaces: Place[];
  savedPlaces: Place[];
  recentCheckIns: CheckIn[];
  isLoading: boolean;
  error: string | null;
}

const initialState: PlaceState = {
  places: [],
  selectedPlace: null,
  nearbyPlaces: [],
  savedPlaces: [],
  recentCheckIns: [],
  isLoading: false,
  error: null,
};

const placeSlice = createSlice({
  name: 'place',
  initialState,
  reducers: {
    setPlaces: (state, action: PayloadAction<Place[]>) => {
      state.places = action.payload;
    },
    addPlace: (state, action: PayloadAction<Place>) => {
      state.places.push(action.payload);
    },
    updatePlace: (state, action: PayloadAction<Place>) => {
      const index = state.places.findIndex(place => place.id === action.payload.id);
      if (index !== -1) {
        state.places[index] = action.payload;
        if (state.selectedPlace?.id === action.payload.id) {
          state.selectedPlace = action.payload;
        }
      }
    },
    setSelectedPlace: (state, action: PayloadAction<Place | null>) => {
      state.selectedPlace = action.payload;
    },
    setNearbyPlaces: (state, action: PayloadAction<Place[]>) => {
      state.nearbyPlaces = action.payload;
    },
    setSavedPlaces: (state, action: PayloadAction<Place[]>) => {
      state.savedPlaces = action.payload;
    },
    addSavedPlace: (state, action: PayloadAction<Place>) => {
      state.savedPlaces.push(action.payload);
    },
    removeSavedPlace: (state, action: PayloadAction<string>) => {
      state.savedPlaces = state.savedPlaces.filter(place => place.id !== action.payload);
    },
    addReview: (state, action: PayloadAction<{ placeId: string; review: PlaceReview }>) => {
      const place = state.places.find(p => p.id === action.payload.placeId);
      if (place) {
        place.reviews.push(action.payload.review);
        place.reviewCount += 1;
        place.rating = place.reviews.reduce((acc, rev) => acc + rev.rating, 0) / place.reviews.length;
      }
    },
    addCheckIn: (state, action: PayloadAction<{ placeId: string; checkIn: CheckIn }>) => {
      const place = state.places.find(p => p.id === action.payload.placeId);
      if (place) {
        place.checkIns.push(action.payload.checkIn);
        place.checkInCount += 1;
      }
      state.recentCheckIns.unshift(action.payload.checkIn);
    },
    setRecentCheckIns: (state, action: PayloadAction<CheckIn[]>) => {
      state.recentCheckIns = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

export const {
  setPlaces,
  addPlace,
  updatePlace,
  setSelectedPlace,
  setNearbyPlaces,
  setSavedPlaces,
  addSavedPlace,
  removeSavedPlace,
  addReview,
  addCheckIn,
  setRecentCheckIns,
  setLoading,
  setError,
} = placeSlice.actions;

export const placeReducer = placeSlice.reducer; 