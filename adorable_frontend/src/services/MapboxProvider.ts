import { MapProvider, SearchResult, PlaceDetails, Location } from '../types/map';
import { ENV } from '../config/env';

export class MapboxProvider implements MapProvider {
  private accessToken: string;
  private baseUrl = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

  constructor() {
    this.accessToken = ENV.MAPS.MAPBOX_ACCESS_TOKEN;
    if (!this.accessToken) {
      throw new Error('Mapbox access token is required');
    }
  }

  async searchPlaces(query: string, location: Location): Promise<SearchResult[]> {
    try {
      const proximity = `${location.longitude},${location.latitude}`;
      const url = `${this.baseUrl}/${encodeURIComponent(query)}.json?access_token=${this.accessToken}&proximity=${proximity}&types=poi,place&limit=10`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      return data.features.map((feature: any) => ({
        id: feature.id,
        placeId: feature.id,
        name: feature.text,
        address: feature.place_name,
        location: {
          latitude: feature.center[1],
          longitude: feature.center[0]
        },
        provider: 'mapbox',
        types: feature.place_type,
        distance: feature.properties?.distance
      }));
    } catch (error) {
      console.error('Error searching places:', error);
      return [];
    }
  }

  async getPlaceDetails(placeId: string): Promise<PlaceDetails> {
    try {
      const url = `${this.baseUrl}/${placeId}?access_token=${this.accessToken}`;
      const response = await fetch(url);
      const data = await response.json();
      const feature = data.features[0];

      return {
        id: feature.id,
        placeId: feature.id,
        name: feature.text,
        address: feature.place_name,
        location: {
          latitude: feature.center[1],
          longitude: feature.center[0]
        },
        types: feature.place_type,
        photos: [],
        rating: feature.properties?.rating,
        userRatingsTotal: feature.properties?.ratings_count,
        openingHours: feature.properties?.hours,
        website: feature.properties?.website,
        phoneNumber: feature.properties?.phone
      };
    } catch (error) {
      console.error('Error getting place details:', error);
      throw error;
    }
  }

  getPlacePhoto(photoReference: string): string {
    // Mapbox doesn't provide place photos directly
    // Return a placeholder or empty string
    return '';
  }

  async getNearbyPlaces(location: Location, radius: number, type?: string): Promise<SearchResult[]> {
    try {
      // Convert radius from meters to degrees (approximate)
      const radiusDegrees = radius / 111000; // 1 degree ≈ 111km
      const bbox = [
        location.longitude - radiusDegrees,
        location.latitude - radiusDegrees,
        location.longitude + radiusDegrees,
        location.latitude + radiusDegrees
      ].join(',');

      let url = `${this.baseUrl}/${type || 'poi'}.json?access_token=${this.accessToken}&bbox=${bbox}&limit=50`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      return data.features.map((feature: any) => ({
        id: feature.id,
        placeId: feature.id,
        name: feature.text,
        address: feature.place_name,
        location: {
          latitude: feature.center[1],
          longitude: feature.center[0]
        },
        provider: 'mapbox',
        types: feature.place_type,
        distance: feature.properties?.distance
      }));
    } catch (error) {
      console.error('Error getting nearby places:', error);
      return [];
    }
  }

  async getDirections(origin: Location, destination: Location): Promise<any> {
    try {
      const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`;
      const url = `${directionsUrl}?access_token=${this.accessToken}&geometries=geojson&overview=full`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      return {
        route: data.routes[0].geometry,
        distance: data.routes[0].distance,
        duration: data.routes[0].duration,
        steps: data.routes[0].legs[0].steps
      };
    } catch (error) {
      console.error('Error getting directions:', error);
      throw error;
    }
  }
} 