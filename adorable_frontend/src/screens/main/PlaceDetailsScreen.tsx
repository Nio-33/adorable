import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Share,
  Alert,
  ActivityIndicator,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Star,
  Share as ShareIcon,
  BookmarkPlus,
  Navigation2,
  MapPin,
  Phone,
  Globe,
  Clock,
  Camera,
  CheckCircle,
  Plus,
} from 'lucide-react-native';
import { MapStackParamList } from '../../types/navigation';
import { PlaceDetails } from '../../types/map';
import { mapService } from '../../services/MapService';
import { placeInteractionService } from '../../services/PlaceInteractionService';
import { mediaPickerService } from '../../services/MediaPickerService';
import { useAuth } from '../../contexts/AuthContext';
import { Icon } from '../../components/common/Icon';
import { ErrorView } from '../../components/common/ErrorView';

type PlaceDetailsScreenNavigationProp = NativeStackNavigationProp<MapStackParamList, 'PlaceDetails'>;
type PlaceDetailsScreenRouteProp = RouteProp<MapStackParamList, 'PlaceDetails'>;

const PlaceDetailsScreen: React.FC = () => {
  const [place, setPlace] = useState<PlaceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  
  const navigation = useNavigation<PlaceDetailsScreenNavigationProp>();
  const route = useRoute<PlaceDetailsScreenRouteProp>();
  const { user } = useAuth();
  const { placeId } = route.params;

  useEffect(() => {
    loadPlaceDetails();
    if (user) {
      loadUserInteractions();
    }
  }, [placeId, user]);

  const loadPlaceDetails = async () => {
    try {
      const placeDetails = await mapService.getPlaceDetails(placeId, 'google');
      setPlace(placeDetails);
      const placePhotos = await placeInteractionService.getPlacePhotos(placeId);
      setPhotos(placePhotos.map(photo => photo.url));
    } catch (error) {
      Alert.alert('Error', 'Failed to load place details');
    } finally {
      setLoading(false);
    }
  };

  const loadUserInteractions = async () => {
    if (!user) return;
    try {
      // Check if place is saved
      const savedPlaces = await placeInteractionService.getSavedPlaces(user.uid);
      setIsSaved(savedPlaces.some(p => p.placeId === placeId));

      // Check if user is checked in
      const checkIns = await placeInteractionService.getCheckIns(user.uid);
      setIsCheckedIn(checkIns.some(c => c.placeId === placeId));
    } catch (error) {
      console.error('Error loading user interactions:', error);
    }
  };

  const handleSavePlace = async () => {
    try {
      if (!user) {
        Alert.alert('Error', 'Please sign in to save places');
        return;
      }
      if (!place) return;

      await placeInteractionService.savePlace(user.uid, place);
      setIsSaved(true);
      Alert.alert('Success', 'Place saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save place');
    }
  };

  const handleSharePlace = async () => {
    try {
      if (!place) return;
      await Share.share({
        message: `Check out ${place.name} on Adorable!\nAddress: ${place.address}`,
        url: `adorable://place/${place.placeId}`, // Deep link URL
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share place');
    }
  };

  const handleCheckIn = async () => {
    try {
      if (!user) {
        Alert.alert('Error', 'Please sign in to check in');
        return;
      }
      if (!place) return;

      await placeInteractionService.checkIn(user.uid, place.placeId);
      setIsCheckedIn(true);
      Alert.alert('Success', 'Checked in successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to check in');
    }
  };

  const handleAddPhoto = async () => {
    try {
      if (!user) {
        Alert.alert('Error', 'Please sign in to add photos');
        return;
      }

      const response = await mediaPickerService.pickFromGallery({
        mediaType: 'photo',
        quality: 1,
      });

      if (response.assets && response.assets.length > 0) {
        setUploading(true);
        const asset = response.assets[0];
        await placeInteractionService.uploadPlacePhoto(user.uid, placeId, asset.uri!);
        await loadPlaceDetails(); // Reload to get new photos
        Alert.alert('Success', 'Photo uploaded successfully');
      }
    } catch (error) {
      if (error instanceof Error && error.message !== 'User cancelled image picker') {
        Alert.alert('Error', 'Failed to upload photo');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleTakePhoto = async () => {
    try {
      if (!user) {
        Alert.alert('Error', 'Please sign in to add photos');
        return;
      }

      const response = await mediaPickerService.takePhoto({
        mediaType: 'photo',
        quality: 1,
      });

      if (response.assets && response.assets.length > 0) {
        setUploading(true);
        const asset = response.assets[0];
        await placeInteractionService.uploadPlacePhoto(user.uid, placeId, asset.uri!);
        await loadPlaceDetails(); // Reload to get new photos
        Alert.alert('Success', 'Photo uploaded successfully');
      }
    } catch (error) {
      if (error instanceof Error && error.message !== 'User cancelled camera') {
        Alert.alert('Error', 'Failed to take photo');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleAddReview = () => {
    if (!user) {
      Alert.alert('Error', 'Please sign in to write a review');
      return;
    }
    navigation.navigate('AddReview', { placeId });
  };

  const handleGetDirections = () => {
    if (!place) return;

    const scheme = Platform.select({ ios: 'maps:', android: 'geo:' });
    const latLng = `${place.location.latitude},${place.location.longitude}`;
    const label = place.name;
    const url = Platform.select({
      ios: `${scheme}?q=${label}&ll=${latLng}`,
      android: `${scheme}0,0?q=${latLng}(${label})`,
    });

    if (url) {
      Linking.openURL(url);
    }
  };

  const handleCall = () => {
    if (!place?.phoneNumber) return;
    Linking.openURL(`tel:${place.phoneNumber}`);
  };

  const handleVisitWebsite = () => {
    if (!place?.website) return;
    Linking.openURL(place.website);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e1b4b" />
      </View>
    );
  }

  if (!place) {
    return <ErrorView message="Failed to load place details" onRetry={loadPlaceDetails} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Photos Section */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.imageContainer}
        >
          {[...place.photos, ...photos].map((photo, index) => (
            <Image
              key={index}
              source={{ uri: typeof photo === 'string' ? photo : photo.url }}
              style={styles.image}
              defaultSource={{ uri: 'https://via.placeholder.com/400x300?text=Loading' }}
            />
          ))}
          {user && (
            <View style={[styles.image, styles.addPhotoContainer]}>
              <TouchableOpacity style={styles.addPhotoButton} onPress={handleAddPhoto}>
                <Icon icon={Plus} size={32} color="#1e1b4b" />
                <Text style={styles.addPhotoText}>Add Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addPhotoButton} onPress={handleTakePhoto}>
                <Icon icon={Camera} size={32} color="#1e1b4b" />
                <Text style={styles.addPhotoText}>Take Photo</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        <View style={styles.content}>
          <Text style={styles.name}>{place.name}</Text>
          <Text style={styles.address}>{place.address}</Text>

          <View style={styles.ratingContainer}>
            <Icon icon={Star} size={20} color="#FFD700" />
            <Text style={styles.rating}>{place.rating?.toFixed(1) || 'N/A'}</Text>
            <TouchableOpacity onPress={handleAddReview}>
              <Text style={styles.reviewCount}>
                ({place.userRatingsTotal || 0} reviews) - Write a Review
              </Text>
            </TouchableOpacity>
          </View>

          {/* Quick Info */}
          <View style={styles.quickInfo}>
            {place.openingHours?.isOpen !== undefined && (
              <View style={styles.infoRow}>
                <Icon icon={Clock} size={16} color="#666" />
                <Text style={styles.infoText}>
                  {place.openingHours.isOpen ? 'Open Now' : 'Closed'}
                </Text>
              </View>
            )}
            {place.phoneNumber && (
              <TouchableOpacity style={styles.infoRow} onPress={handleCall}>
                <Icon icon={Phone} size={16} color="#666" />
                <Text style={styles.infoText}>{place.phoneNumber}</Text>
              </TouchableOpacity>
            )}
            {place.website && (
              <TouchableOpacity style={styles.infoRow} onPress={handleVisitWebsite}>
                <Icon icon={Globe} size={16} color="#666" />
                <Text style={styles.infoText} numberOfLines={1}>
                  {place.website}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, isSaved && styles.actionButtonActive]}
              onPress={handleSavePlace}
            >
              <Icon icon={BookmarkPlus} size={24} color={isSaved ? '#fff' : '#1e1b4b'} />
              <Text style={[styles.actionButtonText, isSaved && styles.actionButtonTextActive]}>
                {isSaved ? 'Saved' : 'Save'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleSharePlace}>
              <Icon icon={ShareIcon} size={24} color="#1e1b4b" />
              <Text style={styles.actionButtonText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, isCheckedIn && styles.actionButtonActive]}
              onPress={handleCheckIn}
            >
              <Icon icon={CheckCircle} size={24} color={isCheckedIn ? '#fff' : '#1e1b4b'} />
              <Text style={[styles.actionButtonText, isCheckedIn && styles.actionButtonTextActive]}>
                {isCheckedIn ? 'Checked In' : 'Check In'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleGetDirections}>
              <Icon icon={Navigation2} size={24} color="#1e1b4b" />
              <Text style={styles.actionButtonText}>Directions</Text>
            </TouchableOpacity>
          </View>

          {/* Reviews Section */}
          <View style={styles.reviewsSection}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            {place.reviews?.map((review, index) => (
              <View key={index} style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewAuthor}>{review.authorName}</Text>
                  <Text style={styles.reviewRating}>
                    {review.rating.toFixed(1)} <Icon icon={Star} size={14} color="#FFD700" />
                  </Text>
                </View>
                <Text style={styles.reviewText}>{review.text}</Text>
                <Text style={styles.reviewDate}>
                  {new Date(review.time * 1000).toLocaleDateString()}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {uploading && (
        <View style={styles.uploadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.uploadingText}>Uploading photo...</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    height: 300,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  addPhotoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  addPhotoButton: {
    alignItems: 'center',
    marginVertical: 12,
  },
  addPhotoText: {
    marginTop: 8,
    fontSize: 14,
    color: '#1e1b4b',
  },
  content: {
    padding: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e1b4b',
    marginBottom: 8,
  },
  address: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  rating: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e1b4b',
    marginLeft: 8,
    marginRight: 4,
  },
  reviewCount: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 4,
  },
  quickInfo: {
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  actionButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  actionButtonActive: {
    backgroundColor: '#1e1b4b',
  },
  actionButtonText: {
    marginTop: 8,
    fontSize: 14,
    color: '#1e1b4b',
  },
  actionButtonTextActive: {
    color: '#fff',
  },
  reviewsSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e1b4b',
    marginBottom: 16,
  },
  reviewItem: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reviewAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e1b4b',
  },
  reviewRating: {
    fontSize: 14,
    color: '#1e1b4b',
  },
  reviewText: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 8,
  },
  reviewDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    color: '#fff',
    marginTop: 12,
    fontSize: 16,
  },
});

export default PlaceDetailsScreen; 