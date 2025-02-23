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
import { CheckCircle } from 'lucide-react-native';
import { RootStackParamList } from '../../types/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { placeInteractionService, CheckIn } from '../../services/PlaceInteractionService';
import { mapService } from '../../services/MapService';
import { PlaceDetails } from '../../types/map';
import { ErrorView } from '../../components/common/ErrorView';
import { Icon } from '../../components/common/Icon';

type CheckInsNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface CheckInWithDetails extends CheckIn {
  place: PlaceDetails | null;
}

export const CheckInsScreen: React.FC = () => {
  const [checkIns, setCheckIns] = useState<CheckInWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigation = useNavigation<CheckInsNavigationProp>();
  const { user } = useAuth();

  const loadCheckIns = async () => {
    if (!user) {return;}
    try {
      setError(null);
      const checkInHistory = await placeInteractionService.getCheckIns(user.uid);

      // Get place details for each check-in
      const checkInsWithDetails = await Promise.all(
        checkInHistory.map(async (checkIn) => {
          try {
            const placeDetails = await mapService.getPlaceDetails(checkIn.placeId, 'google');
            return { ...checkIn, place: placeDetails };
          } catch (error) {
            console.error(`Error fetching details for place ${checkIn.placeId}:`, error);
            return { ...checkIn, place: null };
          }
        })
      );

      setCheckIns(
        checkInsWithDetails.sort((a, b) => b.checkedInAt.getTime() - a.checkedInAt.getTime())
      );
    } catch (err) {
      setError('Failed to load check-in history');
      console.error('Error loading check-ins:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCheckIns();
    setRefreshing(false);
  };

  const handlePlacePress = (placeId: string) => {
    navigation.navigate('PlaceDetails', { placeId });
  };

  useEffect(() => {
    loadCheckIns();
  }, [user]);

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return <ErrorView message={error} onRetry={loadCheckIns} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={checkIns}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.checkInCard}
            onPress={() => handlePlacePress(item.placeId)}
          >
            <View style={styles.checkInInfo}>
              <Text style={styles.placeName}>
                {item.place?.name || 'Unknown Place'}
              </Text>
              <Text style={styles.placeAddress}>
                {item.place?.address || 'Address not available'}
              </Text>
              <Text style={styles.checkInDate}>
                Checked in on {item.checkedInAt.toLocaleString()}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => `${item.placeId}-${item.checkedInAt.getTime()}`}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon icon={CheckCircle} size={48} color="#666" />
            <Text style={styles.emptyText}>No check-ins yet</Text>
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
  checkInCard: {
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
  checkInInfo: {
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
  checkInDate: {
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
