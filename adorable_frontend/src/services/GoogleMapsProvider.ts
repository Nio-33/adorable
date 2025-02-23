import { MapProvider, SearchResult, PlaceDetails, Location } from '../types/map';
import { ENV } from '../config/env';

export class GoogleMapsProvider implements MapProvider {
  private static PLACES_API_BASE_URL = 'https://maps.googleapis.com/maps/api/place';
  private static DIRECTIONS_API_BASE_URL = 'https://maps.googleapis.com/maps/api/directions';

  async searchPlaces(query: string, location: Location): Promise<SearchResult[]> {
    try {
      const response = await fetch(
        `${GoogleMapsProvider.PLACES_API_BASE_URL}/textsearch/json?query=${encodeURIComponent(
          query
        )}&location=${location.latitude},${location.longitude}&radius=5000&key=${ENV.MAPS.GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      
      if (!data.results) {
        throw new Error('No results found');
      }

      return data.results.map((place: any) => ({
        id: place.place_id,
        placeId: place.place_id,
        name: place.name,
        address: place.formatted_address,
        location: {
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
        },
        rating: place.rating,
        photos: place.photos?.map((photo: any) => ({
          url: `${GoogleMapsProvider.PLACES_API_BASE_URL}/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${ENV.MAPS.GOOGLE_MAPS_API_KEY}`,
          width: photo.width,
          height: photo.height,
        })) || [],
        provider: 'google',
      }));
    } catch (error) {
      console.error('Error searching places:', error);
      throw error;
    }
  }

  async getPlaceDetails(placeId: string): Promise<PlaceDetails> {
    try {
      const response = await fetch(
        `${GoogleMapsProvider.PLACES_API_BASE_URL}/details/json?place_id=${placeId}&fields=name,formatted_address,geometry,rating,reviews,photos,opening_hours,formatted_phone_number,website,price_level,types&key=${ENV.MAPS.GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      
      if (!data.result) {
        throw new Error('Place details not found');
      }

      const result = data.result;
      return {
        id: placeId,
        placeId,
        name: result.name,
        address: result.formatted_address,
        location: {
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
        },
        rating: result.rating,
        reviews: result.reviews?.map((review: any) => ({
          authorName: review.author_name,
          rating: review.rating,
          text: review.text,
          time: review.time,
        })) || [],
        photos: result.photos?.map((photo: any) => ({
          url: `${GoogleMapsProvider.PLACES_API_BASE_URL}/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${ENV.MAPS.GOOGLE_MAPS_API_KEY}`,
          width: photo.width,
          height: photo.height,
        })) || [],
        openingHours: result.opening_hours?.weekday_text || [],
        phoneNumber: result.formatted_phone_number,
        website: result.website,
        priceLevel: result.price_level,
        categories: result.types || [],
      };
    } catch (error) {
      console.error('Error getting place details:', error);
      throw error;
    }
  }

  getPlacePhoto(photoReference: string): string {
    return `${GoogleMapsProvider.PLACES_API_BASE_URL}/photo?maxwidth=400&photoreference=${photoReference}&key=${ENV.MAPS.GOOGLE_MAPS_API_KEY}`;
  }

  async getNearbyPlaces(location: Location, radius: number, type?: string): Promise<SearchResult[]> {
    try {
      const typeParam = type ? `&type=${type}` : '';
      const response = await fetch(
        `${GoogleMapsProvider.PLACES_API_BASE_URL}/nearbysearch/json?location=${location.latitude},${location.longitude}&radius=${radius}${typeParam}&key=${ENV.MAPS.GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();

      if (!data.results) {
        throw new Error('No nearby places found');
      }

      return data.results.map((place: any) => ({
        id: place.place_id,
        placeId: place.place_id,
        name: place.name,
        address: place.vicinity,
        location: {
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
        },
        rating: place.rating,
        photos: place.photos?.map((photo: any) => ({
          url: `${GoogleMapsProvider.PLACES_API_BASE_URL}/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${ENV.MAPS.GOOGLE_MAPS_API_KEY}`,
          width: photo.width,
          height: photo.height,
        })) || [],
        provider: 'google',
      }));
    } catch (error) {
      console.error('Error getting nearby places:', error);
      throw error;
    }
  }

  async getDirections(origin: Location, destination: Location): Promise<any> {
    try {
      const response = await fetch(
        `${GoogleMapsProvider.DIRECTIONS_API_BASE_URL}/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&mode=driving&key=${ENV.MAPS.GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();

      if (!data.routes || data.routes.length === 0) {
        throw new Error('No route found');
      }

      const route = data.routes[0];
      return {
        distance: route.legs[0].distance.text,
        duration: route.legs[0].duration.text,
        startAddress: route.legs[0].start_address,
        endAddress: route.legs[0].end_address,
        steps: route.legs[0].steps.map((step: any) => ({
          distance: step.distance.text,
          duration: step.duration.text,
          instructions: step.html_instructions,
          maneuver: step.maneuver,
          startLocation: {
            latitude: step.start_location.lat,
            longitude: step.start_location.lng,
          },
          endLocation: {
            latitude: step.end_location.lat,
            longitude: step.end_location.lng,
          },
        })),
        polyline: route.overview_polyline.points,
      };
    } catch (error) {
      console.error('Error getting directions:', error);
      throw error;
    }
  }
} 