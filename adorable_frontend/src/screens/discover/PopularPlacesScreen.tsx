import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DiscoverStackParamList } from './navigation/DiscoverNavigator';
import { usePlaces, SortOption, FilterOptions } from '../../hooks/usePlaces';
import { List, Card } from '../../components/molecules';
import { Typography, Button } from '../../components/atoms';
import { ErrorBoundary } from '../../components/atoms/ErrorBoundary';
import { COLORS, SPACING } from '../../config/theme';
import { Place } from '../../types';

type Props = NativeStackScreenProps<DiscoverStackParamList, 'PopularPlaces'>;

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Rating', value: 'rating' },
  { label: 'Distance', value: 'distance' },
  { label: 'Name', value: 'name' },
  { label: 'Newest', value: 'newest' },
];

function PopularPlacesContent({ navigation }: Props) {
  const {
    places,
    loading,
    refreshing,
    hasMore,
    error,
    getPopularPlaces,
    loadMorePlaces,
    refreshPlaces
  } = usePlaces();

  const [sortBy, setSortBy] = useState<SortOption>('rating');
  const [filters, setFilters] = useState<FilterOptions>({
    minRating: 4, // Default to high-rated places
    maxDistance: undefined,
    priceRange: undefined,
  });

  useEffect(() => {
    getPopularPlaces();
  }, [sortBy, filters, getPopularPlaces]);

  const handlePlacePress = (placeId: string) => {
    navigation.navigate('PlaceDetails', { placeId });
  };

  const renderPlaceItem = ({ item: place }: { item: Place }) => (
    <Card
      style={styles.placeCard}
      onPress={() => handlePlacePress(place.id)}
      image={place.photos?.[0] ? { uri: place.photos[0] } : undefined}
      imageAspectRatio={16 / 9}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Typography variant="subtitle1" style={styles.placeName}>
            {place.name}
          </Typography>
          {place.rating && (
            <View style={styles.ratingContainer}>
              <Typography variant="body2" color={COLORS.text.secondary}>
                {place.rating.toFixed(1)}
              </Typography>
              <Typography variant="body2" color={COLORS.primary}>
                ★
              </Typography>
            </View>
          )}
        </View>
        {place.description && (
          <Typography
            variant="body2"
            color={COLORS.text.secondary}
            numberOfLines={2}
            style={styles.description}
          >
            {place.description}
          </Typography>
        )}
        <View style={styles.cardFooter}>
          <Typography variant="caption" color={COLORS.text.tertiary}>
            {place.address}
          </Typography>
        </View>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Typography variant="h4" style={styles.title}>Popular Places</Typography>
        <View style={styles.headerActions}>
          {SORT_OPTIONS.map(option => (
            <Button
              key={option.value}
              variant={sortBy === option.value ? 'primary' : 'outline'}
              size="small"
              onPress={() => setSortBy(option.value)}
              style={styles.sortButton}
            >
              {option.label}
            </Button>
          ))}
        </View>
      </View>

      <List<Place>
        data={places}
        loading={loading}
        error={error}
        refreshing={refreshing}
        onRefresh={refreshPlaces}
        emptyText="No popular places found"
        renderItem={renderPlaceItem}
        onEndReached={hasMore ? loadMorePlaces : undefined}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
}

export function PopularPlacesScreen(props: Props) {
  return (
    <ErrorBoundary>
      <PopularPlacesContent {...props} />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    padding: SPACING.lg,
  },
  title: {
    marginBottom: SPACING.md,
  },
  headerActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  sortButton: {
    marginRight: SPACING.xs,
  },
  placeCard: {
    margin: SPACING.md,
    marginTop: 0,
  },
  cardContent: {
    padding: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  placeName: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  description: {
    marginTop: SPACING.xs,
  },
  cardFooter: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
  },
}); 