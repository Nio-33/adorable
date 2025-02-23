export interface Location {
  latitude: number;
  longitude: number;
}

export interface Photo {
  url: string;
  width: number;
  height: number;
}

export interface Review {
  authorName: string;
  rating: number;
  text: string;
  time: number;
}

export interface OpeningHours {
  isOpen: boolean;
  periods: {
    open: { day: number; time: string };
    close: { day: number; time: string };
  }[];
}

export interface SearchResult {
  id: string;
  placeId: string;
  name: string;
  address: string;
  location: Location;
  provider: 'google' | 'mapbox';
  types?: string[];
  distance?: number;
  rating?: number;
}

export interface PlaceDetails extends SearchResult {
  photos: string[];
  userRatingsTotal?: number;
  openingHours?: OpeningHours;
  website?: string;
  phoneNumber?: string;
  types: string[];
  priceLevel?: number;
  reviews?: Review[];
}

export interface NearbyUser {
  id: string;
  displayName: string;
  photoURL?: string;
  location: Location;
  isOnline?: boolean;
  lastSeen?: number;
}

export interface MapProvider {
  searchPlaces(query: string, location: Location): Promise<SearchResult[]>;
  getPlaceDetails(placeId: string, provider: 'google' | 'mapbox'): Promise<PlaceDetails>;
  getPlacePhoto(photoReference: string): string;
  getNearbyPlaces(location: Location, radius: number, type?: string): Promise<SearchResult[]>;
  getDirections(origin: Location, destination: Location): Promise<any>;
  getNearbyUsers(location: Location, radiusInKm: number): Promise<NearbyUser[]>;
}
