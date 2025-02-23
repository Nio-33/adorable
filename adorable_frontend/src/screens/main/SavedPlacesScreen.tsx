import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bookmark } from 'lucide-react-native';
import { RootStackParamList } from '../../types/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { placeInteractionService, SavedPlace } from '../../services/PlaceInteractionService';
import { ErrorView } from '../../components/common/ErrorView';
import { Icon } from '../../components/common/Icon';

type SavedPlacesNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const SavedPlacesScreen: React.FC = () => {
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigation = useNavigation<SavedPlacesNavigationProp>();
  const { user } = useAuth();

  const loadSavedPlaces = async () => {
    if (!user) return;
    try {
      setError(null);
      const places = await placeInteractionService.getSavedPlaces(user.uid);
      setSavedPlaces(places.sort((a, b) => b.savedAt.getTime() - a.savedAt.getTime()));
    } catch (err) {
      setError('Failed to load saved places');
      console.error('Error loading saved places:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSavedPlaces();
    setRefreshing(false);
  };

  const handlePlacePress = (placeId: string) => {
    navigation.navigate('PlaceDetails', { placeId });
  };

  useEffect(() => {
    loadSavedPlaces();
  }, [user]);

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return <ErrorView message={error} onRetry={loadSavedPlaces} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={savedPlaces}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.placeCard}
            onPress={() => handlePlacePress(item.placeId)}
          >
            <View style={styles.placeInfo}>
              <Text style={styles.placeName}>{item.placeName}</Text>
              <Text style={styles.placeAddress}>{item.placeAddress}</Text>
              <Text style={styles.savedDate}>
                Saved on {item.savedAt.toLocaleDateString()}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.placeId}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon icon={Bookmark} size={48} color="#666" />
            <Text style={styles.emptyText}>No saved places yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  placeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  placeAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  savedDate: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
}); 