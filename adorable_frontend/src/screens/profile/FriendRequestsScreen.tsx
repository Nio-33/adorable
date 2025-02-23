import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, X } from 'lucide-react-native';
import { RootStackParamList } from '../../types/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { FriendRequest, peopleService } from '../../services/PeopleService';
import { ErrorView } from '../../components/common/ErrorView';
import { Icon } from '../../components/common/Icon';
import { ChatAvatar } from '../../components/chat/ChatAvatar';

type FriendRequestsNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface RequestItemProps {
  request: FriendRequest;
  onAccept: () => void;
  onDecline: () => void;
  onPress: () => void;
}

const RequestItem: React.FC<RequestItemProps> = ({
  request,
  onAccept,
  onDecline,
  onPress,
}) => (
  <View style={styles.requestItem}>
    <TouchableOpacity style={styles.userInfo} onPress={onPress}>
      <ChatAvatar
        photoURL={request.fromUser.photoURL}
        displayName={request.fromUser.displayName}
        size={50}
        showOnlineStatus
        isOnline={request.fromUser.isOnline}
      />
      <View style={styles.requestInfo}>
        <Text style={styles.userName}>{request.fromUser.displayName}</Text>
        {request.message && (
          <Text style={styles.message} numberOfLines={2}>
            {request.message}
          </Text>
        )}
        <Text style={styles.timestamp}>
          {new Date(request.timestamp).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
    <View style={styles.actions}>
      <TouchableOpacity
        style={[styles.actionButton, styles.acceptButton]}
        onPress={onAccept}
      >
        <Icon icon={Check} size={20} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionButton, styles.declineButton]}
        onPress={onDecline}
      >
        <Icon icon={X} size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  </View>
);

export const FriendRequestsScreen: React.FC = () => {
  const navigation = useNavigation<FriendRequestsNavigationProp>();
  const { user } = useAuth();

  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [responding, setResponding] = useState<string | null>(null);

  const loadRequests = async () => {
    if (!user) return;
    try {
      setError(null);
      const loadedRequests = await peopleService.getFriendRequests(user.uid);
      setRequests(loadedRequests.sort((a, b) => b.timestamp - a.timestamp));
    } catch (err) {
      setError('Failed to load friend requests');
      console.error('Error loading friend requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (request: FriendRequest) => {
    if (!user || responding) return;
    try {
      setResponding(request.id);
      await peopleService.respondToFriendRequest(request.id, user.uid, true);
      setRequests(prev => prev.filter(r => r.id !== request.id));
      Alert.alert('Success', 'Friend request accepted!');
    } catch (err) {
      console.error('Error accepting friend request:', err);
      Alert.alert('Error', 'Failed to accept friend request');
    } finally {
      setResponding(null);
    }
  };

  const handleDecline = async (request: FriendRequest) => {
    if (!user || responding) return;
    try {
      setResponding(request.id);
      await peopleService.respondToFriendRequest(request.id, user.uid, false);
      setRequests(prev => prev.filter(r => r.id !== request.id));
    } catch (err) {
      console.error('Error declining friend request:', err);
      Alert.alert('Error', 'Failed to decline friend request');
    } finally {
      setResponding(null);
    }
  };

  const handleUserPress = (userId: string) => {
    navigation.navigate('UserProfile', { userId });
  };

  useEffect(() => {
    loadRequests();
  }, [user]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return <ErrorView message={error} onRetry={loadRequests} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={requests}
        renderItem={({ item }) => (
          <RequestItem
            request={item}
            onAccept={() => handleAccept(item)}
            onDecline={() => handleDecline(item)}
            onPress={() => handleUserPress(item.fromUser.id)}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No friend requests</Text>
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
  requestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
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
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  requestInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 16,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  declineButton: {
    backgroundColor: '#FF3B30',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
}); 