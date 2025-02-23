import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Star } from 'lucide-react-native';
import { MapStackParamList } from '../../types/navigation';
import { placeInteractionService } from '../../services/PlaceInteractionService';
import { useAuth } from '../../contexts/AuthContext';
import { Icon } from '../../components/common/Icon';

type AddReviewScreenNavigationProp = NativeStackNavigationProp<MapStackParamList, 'AddReview'>;
type AddReviewScreenRouteProp = RouteProp<MapStackParamList, 'AddReview'>;

const AddReviewScreen: React.FC = () => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigation = useNavigation<AddReviewScreenNavigationProp>();
  const route = useRoute<AddReviewScreenRouteProp>();
  const { user } = useAuth();
  const { placeId } = route.params;

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to submit a review');
      return;
    }

    if (rating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }

    if (!review.trim()) {
      Alert.alert('Error', 'Please write a review');
      return;
    }

    try {
      setSubmitting(true);
      await placeInteractionService.addReview(
        user.uid,
        user.displayName || 'Anonymous',
        placeId,
        rating,
        review.trim()
      );
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            style={styles.starButton}
          >
            <Icon
              icon={Star}
              size={32}
              color={star <= rating ? '#FFD700' : '#D1D5DB'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Write a Review</Text>

        <View style={styles.ratingSection}>
          <Text style={styles.label}>Rating</Text>
          {renderStars()}
        </View>

        <View style={styles.reviewSection}>
          <Text style={styles.label}>Review</Text>
          <TextInput
            style={styles.reviewInput}
            multiline
            numberOfLines={6}
            placeholder="Share your experience..."
            value={review}
            onChangeText={setReview}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Review</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e1b4b',
    marginBottom: 24,
  },
  ratingSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e1b4b',
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  starButton: {
    padding: 8,
  },
  reviewSection: {
    marginBottom: 24,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1e1b4b',
    backgroundColor: '#F9FAFB',
    minHeight: 120,
  },
  submitButton: {
    backgroundColor: '#1e1b4b',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddReviewScreen;
