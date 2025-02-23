import { MapProvider, SearchResult, PlaceDetails, Location, NearbyUser } from '../types/map';
import { GoogleMapsProvider } from './GoogleMapsProvider';
import { MapboxProvider } from './MapboxProvider';
import { userLocationService } from './UserLocationService';
import { ENV } from '../config/env';

class MapService implements MapProvider {
  private provider: MapProvider;
  private static instance: MapService;

  private constructor() {
    // Choose provider based on available credentials
    if (ENV.MAPS.GOOGLE_MAPS_API_KEY) {
      this.provider = new GoogleMapsProvider();
    } else if (ENV.MAPS.MAPBOX_ACCESS_TOKEN) {
      this.provider = new MapboxProvider();
    } else {
      throw new Error('No map provider credentials available');
    }
  }

  static getInstance(): MapService {
    if (!MapService.instance) {
      MapService.instance = new MapService();
    }
    return MapService.instance;
  }

  setProvider(provider: 'google' | 'mapbox') {
    if (provider === 'google' && ENV.MAPS.GOOGLE_MAPS_API_KEY) {
      this.provider = new GoogleMapsProvider();
    } else if (provider === 'mapbox' && ENV.MAPS.MAPBOX_ACCESS_TOKEN) {
      this.provider = new MapboxProvider();
    } else {
      throw new Error(`Cannot set provider to ${provider}: missing credentials`);
    }
  }

  async searchPlaces(query: string, location: Location): Promise<SearchResult[]> {
    return this.provider.searchPlaces(query, location);
  }

  async getPlaceDetails(placeId: string, provider: 'google' | 'mapbox'): Promise<PlaceDetails> {
    return this.provider.getPlaceDetails(placeId, provider);
  }

  getPlacePhoto(photoReference: string): string {
    return this.provider.getPlacePhoto(photoReference);
  }

  async getNearbyPlaces(location: Location, radius: number, type?: string): Promise<SearchResult[]> {
    return this.provider.getNearbyPlaces(location, radius, type);
  }

  async getDirections(origin: Location, destination: Location): Promise<any> {
    return this.provider.getDirections(origin, destination);
  }

  async getNearbyUsers(location: Location, radiusInKm: number = 5): Promise<NearbyUser[]> {
    try {
      return await userLocationService.getNearbyUsers(location, radiusInKm);
    } catch (error) {
      console.error('Error getting nearby users:', error);
      return [];
    }
  }
}

export const mapService = MapService.getInstance(); 