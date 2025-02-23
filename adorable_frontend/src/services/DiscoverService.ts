import database from '@react-native-firebase/database';
import { PlaceDetails, Location } from '../types/map';
import { mapService } from './MapService';

export interface Category {
  id: string;
  name: string;
  icon: string;
  description?: string;
}

export interface PopularPlace extends PlaceDetails {
  visitCount: number;
  savedCount: number;
}

export interface UserPreferences {
  preferredCategories: string[];
  visitedPlaces: string[];
  savedPlaces: string[];
  favoriteAreas: Location[];
  ratings: { [placeId: string]: number };
}

export class DiscoverService {
  private static instance: DiscoverService;
  private readonly CATEGORIES_REF = 'categories';
  private readonly POPULAR_PLACES_REF = 'popular_places';
  private readonly USER_PREFERENCES_REF = 'user_preferences';
  private readonly PLACE_RATINGS_REF = 'place_ratings';

  private constructor() {}

  static getInstance(): DiscoverService {
    if (!DiscoverService.instance) {
      DiscoverService.instance = new DiscoverService();
    }
    return DiscoverService.instance;
  }

  async getCategories(): Promise<Category[]> {
    try {
      const snapshot = await database().ref(this.CATEGORIES_REF).once('value');
      const categories = snapshot.val() || {};
      return Object.values(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  async getPopularPlaces(location: Location, limit: number = 10): Promise<PopularPlace[]> {
    try {
      const snapshot = await database()
        .ref(this.POPULAR_PLACES_REF)
        .orderByChild('visitCount')
        .limitToLast(limit)
        .once('value');

      const popularPlaces = [];
      const places = snapshot.val() || {};

      for (const [placeId, popularity] of Object.entries(places)) {
        try {
          const placeDetails = await mapService.getPlaceDetails(placeId, 'google');
          popularPlaces.push({
            ...placeDetails,
            visitCount: (popularity as any).visitCount || 0,
            savedCount: (popularity as any).savedCount || 0,
          });
        } catch (error) {
          console.error(`Error fetching details for place ${placeId}:`, error);
          // Continue with other places if one fails
          continue;
        }
      }

      return popularPlaces.sort((a, b) => b.visitCount - a.visitCount);
    } catch (error) {
      console.error('Error fetching popular places:', error);
      throw error;
    }
  }

  async getRecommendedPlaces(
    userId: string,
    location: Location,
    limit: number = 10
  ): Promise<PlaceDetails[]> {
    try {
      // Get user preferences
      const preferencesSnapshot = await database()
        .ref(`${this.USER_PREFERENCES_REF}/${userId}`)
        .once('value');
      const preferences: UserPreferences = preferencesSnapshot.val() || {
        preferredCategories: [],
        visitedPlaces: [],
        savedPlaces: [],
        favoriteAreas: [],
        ratings: {},
      };

      // Get places based on multiple factors
      const recommendedPlaces: PlaceDetails[] = [];
      const seenPlaceIds = new Set<string>();

      // 1. Get places from preferred categories
      for (const category of preferences.preferredCategories) {
        const categoryPlaces = await mapService.getNearbyPlaces(location, 5000, category);
        for (const place of categoryPlaces) {
          if (!seenPlaceIds.has(place.placeId)) {
            recommendedPlaces.push(place);
            seenPlaceIds.add(place.placeId);
          }
        }
      }

      // 2. Get places near favorite areas
      for (const area of preferences.favoriteAreas) {
        const nearbyPlaces = await mapService.getNearbyPlaces(area, 2000);
        for (const place of nearbyPlaces) {
          if (!seenPlaceIds.has(place.placeId)) {
            recommendedPlaces.push(place);
            seenPlaceIds.add(place.placeId);
          }
        }
      }

      // 3. Get highly rated places nearby
      const nearbyPlaces = await mapService.getNearbyPlaces(location, 5000);
      for (const place of nearbyPlaces) {
        if (!seenPlaceIds.has(place.placeId)) {
          recommendedPlaces.push(place);
          seenPlaceIds.add(place.placeId);
        }
      }

      // Calculate recommendation score for each place
      const scoredPlaces = recommendedPlaces.map(place => {
        let score = place.rating || 0;

        // Boost score based on user preferences
        if (preferences.preferredCategories.some(cat => place.categories?.includes(cat))) {
          score += 2;
        }
        if (preferences.savedPlaces.includes(place.placeId)) {
          score += 1;
        }
        if (preferences.ratings[place.placeId]) {
          score += preferences.ratings[place.placeId] / 2;
        }

        return { place, score };
      });

      // Sort by score and return top results
      return scoredPlaces
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(item => item.place);
    } catch (error) {
      console.error('Error fetching recommended places:', error);
      throw error;
    }
  }

  async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<void> {
    try {
      await database()
        .ref(`${this.USER_PREFERENCES_REF}/${userId}`)
        .update(preferences);
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }

  async addUserRating(userId: string, placeId: string, rating: number): Promise<void> {
    try {
      // Update user's ratings
      await database()
        .ref(`${this.USER_PREFERENCES_REF}/${userId}/ratings/${placeId}`)
        .set(rating);

      // Update place's average rating
      const ratingRef = database().ref(`${this.PLACE_RATINGS_REF}/${placeId}`);
      await ratingRef.transaction((current) => {
        const ratings = current || { sum: 0, count: 0 };
        return {
          sum: ratings.sum + rating,
          count: ratings.count + 1,
          average: (ratings.sum + rating) / (ratings.count + 1),
        };
      });
    } catch (error) {
      console.error('Error adding user rating:', error);
      throw error;
    }
  }

  async incrementPlaceVisits(placeId: string): Promise<void> {
    try {
      const ref = database().ref(`${this.POPULAR_PLACES_REF}/${placeId}/visitCount`);
      await ref.transaction((currentCount) => (currentCount || 0) + 1);
    } catch (error) {
      console.error('Error incrementing place visits:', error);
      throw error;
    }
  }

  async incrementPlaceSaves(placeId: string): Promise<void> {
    try {
      const ref = database().ref(`${this.POPULAR_PLACES_REF}/${placeId}/savedCount`);
      await ref.transaction((currentCount) => (currentCount || 0) + 1);
    } catch (error) {
      console.error('Error incrementing place saves:', error);
      throw error;
    }
  }
}

export const discoverService = DiscoverService.getInstance();
