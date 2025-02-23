import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ViewStyle,
} from 'react-native';
import { Star, MapPin } from 'lucide-react-native';
import { PlaceDetails } from '../../types/map';
import { PopularPlace } from '../../services/DiscoverService';

interface PlaceCardProps {
  place: PlaceDetails | PopularPlace;
  onPress: () => void;
  style?: ViewStyle;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({ place, onPress, style }) => {
  const isPopularPlace = 'visitCount' in place;

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Image
        source={
          place.photos && place.photos.length > 0
            ? { uri: place.photos[0].url }
            : require('../../assets/images/placeholder.png')
        }
        style={styles.image}
      />
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {place.name}
        </Text>
        <View style={styles.infoRow}>
          <MapPin size={14} strokeWidth={2} color="#666" />
          <Text style={styles.address} numberOfLines={1}>
            {place.address}
          </Text>
        </View>
        <View style={styles.footer}>
          {place.rating && (
            <View style={styles.ratingContainer}>
              <Star size={14} strokeWidth={2} color="#FFD700" fill="#FFD700" />
              <Text style={styles.rating}>{place.rating.toFixed(1)}</Text>
            </View>
          )}
          {isPopularPlace && (
            <View style={styles.statsContainer}>
              <Text style={styles.statsText}>
                {(place as PopularPlace).visitCount} visits
              </Text>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.statsText}>
                {(place as PopularPlace).savedCount} saves
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 250,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  content: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  address: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsText: {
    fontSize: 12,
    color: '#666',
  },
  dot: {
    fontSize: 12,
    color: '#666',
    marginHorizontal: 4,
  },
});
