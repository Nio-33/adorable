import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING } from '../../config/theme';
import { Typography, Loading, Button } from '../../components/atoms';
import { Card, List, ListItem } from '../../components/molecules';
import { usePlaces } from '../../hooks/usePlaces';
import { PLACE_CATEGORIES } from '../../config/constants';
import type { DiscoverStackParamList } from './navigation/DiscoverNavigator';

type DiscoverScreenNavigationProp = NativeStackNavigationProp<DiscoverStackParamList, 'DiscoverMain'>;

export const DiscoverScreen: React.FC = () => {
  const navigation = useNavigation<DiscoverScreenNavigationProp>();
  const {
    places: popularPlaces,
    loading: popularLoading,
    error: popularError,
    getPopularPlaces,
  } = usePlaces();

  const {
    places: recommendedPlaces,
    loading: recommendedLoading,
    error: recommendedError,
    getRecommendedPlaces,
  } = usePlaces();

  React.useEffect(() => {
    getPopularPlaces();
    getRecommendedPlaces();
  }, [getPopularPlaces, getRecommendedPlaces]);

  const handleCategoryPress = (category: string) => {
    navigation.navigate('Category', { category });
  };

  const handlePlacePress = (placeId: string) => {
    navigation.navigate('PlaceDetails', { placeId });
  };

  const handleViewAllPopular = () => {
    navigation.navigate('PopularPlaces');
  };

  const handleViewAllRecommended = () => {
    navigation.navigate('Recommendations');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Typography variant="h4" style={styles.sectionTitle}>
          Categories
        </Typography>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.categoriesContainer}>
            {PLACE_CATEGORIES.map((category) => (
              <Card
                key={category}
                title={category}
                onPress={() => handleCategoryPress(category)}
                style={styles.categoryCard}
              />
            ))}
          </View>
        </ScrollView>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Typography variant="h4" style={styles.sectionTitle}>
            Popular Places
          </Typography>
          <Button
            variant="text"
            size="small"
            onPress={handleViewAllPopular}
          >
            View All
          </Button>
        </View>
        {popularLoading ? (
          <Loading />
        ) : popularError ? (
          <Typography variant="body2" color={COLORS.status.error}>
            {popularError}
          </Typography>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.placesContainer}>
              {popularPlaces.slice(0, 5).map((place) => (
                <Card
                  key={place.id}
                  title={place.name}
                  subtitle={place.category}
                  image={place.photos?.[0] ? { uri: place.photos[0] } : undefined}
                  onPress={() => handlePlacePress(place.id)}
                  style={styles.placeCard}
                />
              ))}
            </View>
          </ScrollView>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Typography variant="h4" style={styles.sectionTitle}>
            Recommended for You
          </Typography>
          <Button
            variant="text"
            size="small"
            onPress={handleViewAllRecommended}
          >
            View All
          </Button>
        </View>
        {recommendedLoading ? (
          <Loading />
        ) : recommendedError ? (
          <Typography variant="body2" color={COLORS.status.error}>
            {recommendedError}
          </Typography>
        ) : (
          <View style={styles.recommendedContainer}>
            {recommendedPlaces.slice(0, 3).map((place) => (
              <ListItem
                key={place.id}
                title={place.name}
                subtitle={place.category}
                leftContent={
                  place.photos?.[0] ? (
                    <Card
                      image={{ uri: place.photos[0] }}
                      style={styles.recommendedImage}
                    />
                  ) : undefined
                }
                onPress={() => handlePlacePress(place.id)}
              />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  section: {
    paddingVertical: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    flex: 1,
  },
  categoriesContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
  },
  categoryCard: {
    width: 120,
    marginRight: SPACING.md,
  },
  placesContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
  },
  placeCard: {
    width: 200,
    marginRight: SPACING.md,
  },
  recommendedContainer: {
    paddingHorizontal: SPACING.lg,
  },
  recommendedImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
}); 