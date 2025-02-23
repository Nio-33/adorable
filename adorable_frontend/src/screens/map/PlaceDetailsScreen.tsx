import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { COLORS, SPACING } from '../../config/theme';
import { Typography, Button, Loading } from '../../components/atoms';
import { Card } from '../../components/molecules';
import { usePlaces } from '../../hooks/usePlaces';
import type { MapStackParamList } from './navigation/MapNavigator';

type PlaceDetailsRouteProp = RouteProp<MapStackParamList, 'PlaceDetails'>;

export const PlaceDetailsScreen: React.FC = () => {
  const route = useRoute<PlaceDetailsRouteProp>();
  const { placeId } = route.params;
  const { selectedPlace: place, loading, error, getPlaceDetails } = usePlaces();

  React.useEffect(() => {
    getPlaceDetails(placeId);
  }, [placeId, getPlaceDetails]);

  if (loading) {
    return <Loading size="large" text="Loading place details..." />;
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Typography variant="body1" color={COLORS.status.error}>
          {error}
        </Typography>
      </View>
    );
  }

  if (!place) {
    return (
      <View style={styles.container}>
        <Typography variant="body1">Place not found</Typography>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} bounces={false}>
      {place.photos?.[0] && (
        <View style={styles.imageContainer}>
          <Card
            image={{ uri: place.photos[0] }}
            imageAspectRatio={16 / 9}
            style={styles.imageCard}
          />
        </View>
      )}

      <View style={styles.content}>
        <Typography variant="h4" style={styles.title}>
          {place.name}
        </Typography>

        <Typography
          variant="body2"
          color={COLORS.text.secondary}
          style={styles.category}
        >
          {place.category.join(' • ')}
        </Typography>

        <Typography variant="body1" style={styles.description}>
          {place.description}
        </Typography>

        <View style={styles.actions}>
          <Button
            variant="primary"
            onPress={() => {}}
            style={styles.actionButton}
          >
            Save Place
          </Button>
          <Button
            variant="outline"
            onPress={() => {}}
            style={styles.actionButton}
          >
            Share
          </Button>
        </View>

        <Typography variant="subtitle1" style={styles.sectionTitle}>
          Reviews
        </Typography>

        {place.reviews.length > 0 ? (
          place.reviews.map((review) => (
            <Card
              key={review.id}
              title={`Rating: ${review.rating}/5`}
              subtitle={review.content}
              style={styles.reviewCard}
            />
          ))
        ) : (
          <Typography variant="body2" color={COLORS.text.secondary}>
            No reviews yet
          </Typography>
        )}

        <Button
          variant="primary"
          onPress={() => {}}
          style={styles.writeReviewButton}
        >
          Write a Review
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  imageContainer: {
    width: '100%',
    height: 250,
  },
  imageCard: {
    borderRadius: 0,
  },
  content: {
    padding: SPACING.lg,
  },
  title: {
    marginBottom: SPACING.xs,
  },
  category: {
    marginBottom: SPACING.md,
  },
  description: {
    marginBottom: SPACING.xl,
  },
  actions: {
    flexDirection: 'row',
    marginBottom: SPACING.xl,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
  },
  reviewCard: {
    marginBottom: SPACING.md,
  },
  writeReviewButton: {
    marginTop: SPACING.md,
  },
});
