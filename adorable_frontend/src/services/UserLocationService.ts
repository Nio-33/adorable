import { Location, NearbyUser } from '../types/map';
import { firestore } from '../config/firebase';
import { collection, query, where, getDocs, updateDoc, doc, GeoPoint, serverTimestamp, addDoc } from 'firebase/firestore';
import { auth } from '../config/firebase';
import { calculateDistance } from '../utils/location';

class UserLocationService {
  private static instance: UserLocationService;
  private usersCollection = collection(firestore, 'users');
  private locationUpdatesCollection = collection(firestore, 'location_updates');

  private constructor() {}

  static getInstance(): UserLocationService {
    if (!UserLocationService.instance) {
      UserLocationService.instance = new UserLocationService();
    }
    return UserLocationService.instance;
  }

  async updateUserLocation(location: Location): Promise<void> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const userRef = doc(this.usersCollection, currentUser.uid);
      await updateDoc(userRef, {
        location: new GeoPoint(location.latitude, location.longitude),
        lastLocationUpdate: serverTimestamp()
      });

      // Store location update history
      await this.storeLocationUpdate(location);
    } catch (error) {
      console.error('Error updating user location:', error);
      throw error;
    }
  }

  private async storeLocationUpdate(location: Location): Promise<void> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      await addDoc(this.locationUpdatesCollection, {
        userId: currentUser.uid,
        location: new GeoPoint(location.latitude, location.longitude),
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error storing location update:', error);
    }
  }

  async getNearbyUsers(location: Location, radiusInKm: number = 5): Promise<NearbyUser[]> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Get all users (in a production app, you'd want to implement proper geoqueries)
      const usersSnapshot = await getDocs(this.usersCollection);
      const nearbyUsers: NearbyUser[] = [];

      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        if (
          doc.id !== currentUser.uid && 
          userData.location instanceof GeoPoint
        ) {
          const userLocation: Location = {
            latitude: userData.location.latitude,
            longitude: userData.location.longitude
          };

          const distance = calculateDistance(location, userLocation);
          if (distance <= radiusInKm) {
            nearbyUsers.push({
              id: doc.id,
              displayName: userData.displayName || 'Anonymous',
              location: userLocation,
              lastActive: userData.lastActive?.toDate() || new Date(),
              isOnline: userData.isOnline || false,
              avatar: userData.avatar,
              distance
            });
          }
        }
      });

      // Sort by distance
      return nearbyUsers.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    } catch (error) {
      console.error('Error getting nearby users:', error);
      return [];
    }
  }

  async startLocationTracking(onLocationUpdate: (location: Location) => void): Promise<() => void> {
    let watchId: number;

    const success = (position: GeolocationPosition) => {
      const location: Location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
      onLocationUpdate(location);
      this.updateUserLocation(location).catch(console.error);
    };

    const error = (err: GeolocationPositionError) => {
      console.error('Error getting location:', err);
    };

    watchId = navigator.geolocation.watchPosition(success, error, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    });

    // Return cleanup function
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }
}

export const userLocationService = UserLocationService.getInstance(); 