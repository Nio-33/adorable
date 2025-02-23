import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DiscoverStackParamList } from './navigation/DiscoverNavigator';
import { usePlaces, SortOption, FilterOptions } from '../../hooks/usePlaces';
import { List, ListItem, Card } from '../../components/molecules';
import { Typography, Button } from '../../components/atoms';
import { ErrorBoundary } from '../../components/atoms/ErrorBoundary';
import { Place } from '../../types';
import { PLACE_CATEGORIES } from '../../config/constants';
import { COLORS, SPACING, SHADOWS } from '../../config/theme';

type Props = NativeStackScreenProps<DiscoverStackParamList, 'Category'>;

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Rating', value: 'rating' },
  { label: 'Distance', value: 'distance' },
  { label: 'Name', value: 'name' },
  { label: 'Newest', value: 'newest' },
];

function CategoryScreenContent({ route, navigation }: Props) {
  const { category } = route.params;
  const {
    places,
    loading,
    refreshing,
    hasMore,
    error,
    getPlacesByCategory,
    loadMorePlaces,
    refreshPlaces,
  } = usePlaces();

  const [sortBy, setSortBy] = useState<SortOption>('rating');
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    minRating: 0,
    maxDistance: undefined,
    priceRange: undefined,
  });

  useEffect(() => {
    getPlacesByCategory(category as typeof PLACE_CATEGORIES[number], sortBy, filters);
  }, [category, sortBy, filters, getPlacesByCategory]);

  const handlePlacePress = (placeId: string) => {
    navigation.navigate('PlaceDetails', { placeId });
  };

  const handleSortChange = (option: SortOption) => {
    setSortBy(option);
    setShowSortOptions(false);
  };

  const renderSortOptions = () => (
    <View style={styles.sortOptionsContainer}>
      {SORT_OPTIONS.map(option => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.sortOption,
            sortBy === option.value && styles.sortOptionSelected,
          ]}
          onPress={() => handleSortChange(option.value)}
        >
          <Typography
            variant="body2"
            color={sortBy === option.value ? COLORS.primary : COLORS.text.secondary}
          >
            {option.label}
          </Typography>
        </TouchableOpacity>
      ))}
    </View>
  );

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
        <Typography variant="h4" style={styles.title}>{category}</Typography>
        <Button
          variant="outline"
          size="small"
          onPress={() => setShowSortOptions(!showSortOptions)}
        >
          Sort
        </Button>
      </View>

      {showSortOptions && renderSortOptions()}

      <List<Place>
        data={places}
        loading={loading}
        error={error}
        refreshing={refreshing}
        onRefresh={refreshPlaces}
        emptyText={`No places found in ${category}`}
        renderItem={renderPlaceItem}
        onEndReached={loadMorePlaces}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
}

export function CategoryScreen(props: Props) {
  return (
    <ErrorBoundary>
      <CategoryScreenContent {...props} />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  title: {
    flex: 1,
  },
  sortOptionsContainer: {
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: COLORS.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  sortOption: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: SPACING.xs,
  },
  sortOptionSelected: {
    backgroundColor: COLORS.background.primary,
    ...SHADOWS.small,
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
