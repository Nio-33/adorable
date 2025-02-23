import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Platform,
  Alert,
  TouchableOpacity,
  Text,
  TextInput,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Navigation2, User, Layers, X, MapPin, Phone, Globe, Clock } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MapView, Camera, UserLocation } from '@rnmapbox/maps';
import { MapStackParamList } from '../../types/navigation';
import { Location, SearchResult, NearbyUser, PlaceDetails } from '../../types/map';
import { mapService } from '../../services/MapService';
import { userLocationService } from '../../services/UserLocationService';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from '../../hooks/useLocation';
import { ENV } from '../../config/env';
import { Icon } from '../../components/common/Icon';
import { ErrorView } from '../../components/common/ErrorView';
import { useMapService } from '../../hooks/useMapService';
import { MapNavigationProp } from '../../types/navigation';
import { COLORS } from '../../config/theme';

// Initialize Mapbox
MapboxGL.setAccessToken(ENV.MAPS.MAPBOX_ACCESS_TOKEN);

type MapScreenNavigationProp = StackNavigationProp<MapStackParamList, 'Map'>;

const INITIAL_ZOOM = 15;
const MAX_ZOOM_LEVEL = 20;
const MIN_ZOOM_LEVEL = 10;
const SEARCH_RADIUS = 5000; // 5km in meters
const LOCATION_UPDATE_INTERVAL = 30000; // 30 seconds

const MapScreen: React.FC = () => {
  const { location: userLocation, error: locationError, refreshLocation } = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [nearbyPlaces, setNearbyPlaces] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceDetails | null>(null);
  const [mapType, setMapType] = useState<'streets' | 'satellite'>('streets');

  const navigation = useNavigation<MapScreenNavigationProp>();
  const mapRef = useRef<MapboxGL.MapView>(null);
  const cameraRef = useRef<MapboxGL.Camera>(null);
  const searchTimeout = useRef<NodeJS.Timeout>();
  const locationTrackingCleanup = useRef<(() => void) | null>(null);
  const { user } = useAuth();
  const { getNearbyPlaces, getNearbyUsers } = useMapService();

  useEffect(() => {
    if (userLocation) {
      loadNearbyPlaces();
      loadNearbyUsers();
      const cleanup = startLocationTracking();
      locationTrackingCleanup.current = cleanup;
    }
    return () => {
      if (locationTrackingCleanup.current) {
        locationTrackingCleanup.current();
      }
    };
  }, [userLocation]);

  const startLocationTracking = () => {
    if (userLocation) {
      // Implementation of location tracking
      // This is just a placeholder - actual implementation would depend on your requirements
      return () => {
        // Cleanup function
      };
    }
    return () => {};
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      try {
        setLoading(true);
        if (!userLocation) {
          throw new Error('Location not available');
        }
        const results = await mapService.searchPlaces(query, userLocation);
        setSearchResults(results);
      } catch (error) {
        Alert.alert('Error', 'Failed to search places');
      } finally {
        setLoading(false);
      }
    }, 500);
  };

  const loadNearbyUsers = async () => {
    if (userLocation) {
      try {
        const users = await getNearbyUsers(userLocation);
        setNearbyUsers(users);
      } catch (error) {
        console.error('Error loading nearby users:', error);
      }
    }
  };

  const loadNearbyPlaces = async () => {
    if (userLocation) {
      try {
        const places = await getNearbyPlaces(userLocation);
        setNearbyPlaces(places);
      } catch (error) {
        console.error('Error loading nearby places:', error);
      }
    }
  };

  const handlePlacePress = useCallback(async (place: SearchResult) => {
    try {
      setLoading(true);
      const details = await mapService.getPlaceDetails(place.placeId, place.provider);
      setSelectedPlace(details);
      cameraRef.current?.setCamera({
        centerCoordinate: [place.location.longitude, place.location.latitude],
        zoomLevel: INITIAL_ZOOM,
        animationDuration: 1000,
      });
    } catch (error) {
      console.error('Error fetching place details:', error);
      Alert.alert('Error', 'Failed to load place details');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleUserPress = useCallback((userId: string) => {
    navigation.navigate('UserProfile', { userId });
  }, [navigation]);

  const handleMapPress = useCallback(() => {
    setSelectedPlace(null);
    Keyboard.dismiss();
  }, []);

  const toggleMapType = useCallback(() => {
    setMapType(prev => prev === 'streets' ? 'satellite' : 'streets');
  }, []);

  const centerOnUser = useCallback(() => {
    if (!userLocation) {
      refreshLocation();
      return;
    }

    cameraRef.current?.setCamera({
      centerCoordinate: [userLocation.longitude, userLocation.latitude],
      zoomLevel: INITIAL_ZOOM,
      animationDuration: 1000,
    });
  }, [userLocation, refreshLocation]);

  if (locationError) {
    return <ErrorView message={locationError} onRetry={refreshLocation} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon icon={Search} size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search places..."
            value={searchQuery}
            onChangeText={handleSearch}
            onFocus={() => setShowSearch(true)}
            returnKeyType="search"
          />
          {searchQuery ? (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setSearchResults([]);
              }}
            >
              <Icon icon={X} size={20} color="#666" />
            </TouchableOpacity>
          ) : null}
          {loading && <ActivityIndicator size="small" color="#666" style={styles.loader} />}
        </View>
      </View>

      {/* Map View */}
      <MapView style={styles.map}>
        <UserLocation visible={true} />
        <Camera
          ref={cameraRef}
          zoomLevel={INITIAL_ZOOM}
          maxZoomLevel={MAX_ZOOM_LEVEL}
          minZoomLevel={MIN_ZOOM_LEVEL}
          centerCoordinate={
            userLocation
              ? [userLocation.longitude, userLocation.latitude]
              : [3.3792, 6.5244] // Lagos coordinates
          }
        />

        {/* Search Results */}
        {searchResults.map((result) => (
          <MapboxGL.PointAnnotation
            key={result.id}
            id={result.id}
            coordinate={[result.location.longitude, result.location.latitude]}
            onSelected={() => handlePlacePress(result)}
          >
            <View style={[
              styles.markerContainer,
              selectedPlace?.id === result.id && styles.selectedMarker,
            ]}>
              <Icon icon={MapPin} size={24} color="#1e1b4b" />
            </View>
            <MapboxGL.Callout title={result.name} />
          </MapboxGL.PointAnnotation>
        ))}

        {/* Nearby Places */}
        {!searchQuery && nearbyPlaces.map((place) => (
          <MapboxGL.PointAnnotation
            key={place.id}
            id={place.id}
            coordinate={[place.location.longitude, place.location.latitude]}
            onSelected={() => handlePlacePress(place)}
          >
            <View style={[
              styles.markerContainer,
              selectedPlace?.id === place.id && styles.selectedMarker,
            ]}>
              <Icon icon={MapPin} size={24} color="#4338ca" />
            </View>
            <MapboxGL.Callout title={place.name} />
          </MapboxGL.PointAnnotation>
        ))}

        {/* Nearby Users */}
        {nearbyUsers.map((nearbyUser) => (
          <MapboxGL.PointAnnotation
            key={nearbyUser.id}
            id={nearbyUser.id}
            coordinate={[nearbyUser.location.longitude, nearbyUser.location.latitude]}
            onSelected={() => handleUserPress(nearbyUser.id)}
          >
            <View style={[styles.userMarker, nearbyUser.isOnline && styles.onlineUser]}>
              <Icon icon={User} size={24} color="#1e1b4b" />
            </View>
            <MapboxGL.Callout title={nearbyUser.displayName} />
          </MapboxGL.PointAnnotation>
        ))}
      </MapView>

      {/* Map Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={toggleMapType}
        >
          <Icon icon={Layers} size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={centerOnUser}
        >
          <Icon icon={Navigation2} size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Selected Place Card */}
      {selectedPlace && (
        <View style={styles.placeCard}>
          <View style={styles.placeInfo}>
            <Text style={styles.placeName}>{selectedPlace.name}</Text>
            <Text style={styles.placeAddress}>{selectedPlace.address}</Text>
            <View style={styles.placeDetails}>
              {selectedPlace.rating && (
                <Text style={styles.rating}>⭐ {selectedPlace.rating.toFixed(1)} ({selectedPlace.userRatingsTotal})</Text>
              )}
              {selectedPlace.openingHours?.isOpen !== undefined && (
                <View style={styles.detailRow}>
                  <Icon icon={Clock} size={16} color="#666" />
                  <Text style={styles.detailText}>
                    {selectedPlace.openingHours.isOpen ? 'Open' : 'Closed'}
                  </Text>
                </View>
              )}
              {selectedPlace.phoneNumber && (
                <View style={styles.detailRow}>
                  <Icon icon={Phone} size={16} color="#666" />
                  <Text style={styles.detailText}>{selectedPlace.phoneNumber}</Text>
                </View>
              )}
              {selectedPlace.website && (
                <View style={styles.detailRow}>
                  <Icon icon={Globe} size={16} color="#666" />
                  <Text style={styles.detailText} numberOfLines={1}>
                    {selectedPlace.website}
                  </Text>
                </View>
              )}
            </View>
          </View>
          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() => navigation.navigate('PlaceDetails', { placeId: selectedPlace.placeId })}
          >
            <Text style={styles.detailsButtonText}>Details</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    flex: 1,
  },
  searchContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    width: '100%',
    paddingHorizontal: 20,
    zIndex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#1e1b4b',
  },
  loader: {
    marginLeft: 10,
  },
  controls: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    gap: 10,
  },
  controlButton: {
    backgroundColor: '#1e1b4b',
    padding: 16,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  markerContainer: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  marker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1e1b4b',
    borderWidth: 2,
    borderColor: '#fff',
  },
  selectedMarker: {
    transform: [{ scale: 1.2 }],
  },
  userMarker: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#1e1b4b',
  },
  placeCard: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  placeInfo: {
    flex: 1,
    marginRight: 12,
  },
  placeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e1b4b',
    marginBottom: 4,
  },
  placeAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  rating: {
    fontSize: 14,
    color: '#1e1b4b',
  },
  detailsButton: {
    backgroundColor: '#1e1b4b',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  detailsButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  placeDetails: {
    marginTop: 8,
    gap: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  onlineUser: {
    borderColor: '#22c55e',
    borderWidth: 2,
  },
});

export default MapScreen;
