import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING } from '../../config/theme';
import { List, ListItem } from '../../components/molecules';
import { Typography } from '../../components/atoms';
import { usePlaces } from '../../hooks/usePlaces';
import type { MapStackParamList } from './navigation/MapNavigator';

type SearchResultsRouteProp = RouteProp<MapStackParamList, 'SearchResults'>;
type SearchResultsNavigationProp = NativeStackNavigationProp<MapStackParamList>;

export const SearchResultsScreen: React.FC = () => {
  const route = useRoute<SearchResultsRouteProp>();
  const navigation = useNavigation<SearchResultsNavigationProp>();
  const { query } = route.params;
  const { places, loading, error, searchPlaces } = usePlaces();

  useEffect(() => {
    if (query) {
      searchPlaces(query);
    }
  }, [query, searchPlaces]);

  const handlePlacePress = (placeId: string) => {
    navigation.navigate('PlaceDetails', { placeId });
  };

  return (
    <List
      loading={loading}
      error={error}
      emptyText="No places found"
      style={styles.container}
    >
      {places.map((place) => (
        <ListItem
          key={place.id}
          title={place.name}
          subtitle={place.description || ''}
          onPress={() => handlePlacePress(place.id)}
          rightContent={
            place.rating ? (
              <Typography variant="body2" color={COLORS.text.secondary}>
                {place.rating.toFixed(1)} ★
              </Typography>
            ) : undefined
          }
        />
      ))}
    </List>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
    paddingHorizontal: SPACING.md,
  },
}); 