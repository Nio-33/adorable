import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Search, Users, UserPlus, Bell } from 'lucide-react-native';
import { RootStackParamList } from '../../types/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from '../../hooks/useLocation';
import { UserProfile, FriendRequest, peopleService } from '../../services/PeopleService';
import { ErrorView } from '../../components/common/ErrorView';
import { Icon } from '../../components/common/Icon';
import { ChatAvatar } from '../../components/chat/ChatAvatar';

type PeopleNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface UserItemProps {
  user: UserProfile;
  onPress: () => void;
  showMutualFriends?: boolean;
}

const UserItem: React.FC<UserItemProps> = ({ user, onPress, showMutualFriends }) => (
  <TouchableOpacity style={styles.userItem} onPress={onPress}>
    <ChatAvatar
      photoURL={user.photoURL}
      displayName={user.displayName}
      size={50}
      showOnlineStatus
      isOnline={user.isOnline}
    />
    <View style={styles.userInfo}>
      <Text style={styles.userName}>{user.displayName}</Text>
      {user.bio && (
        <Text style={styles.userBio} numberOfLines={1}>
          {user.bio}
        </Text>
      )}
      {showMutualFriends && user.mutualFriendCount !== undefined && (
        <Text style={styles.mutualFriends}>
          {user.mutualFriendCount} mutual friends
        </Text>
      )}
    </View>
  </TouchableOpacity>
);

export const PeopleScreen: React.FC = () => {
  const navigation = useNavigation<PeopleNavigationProp>();
  const { user } = useAuth();
  const { location } = useLocation();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [nearbyUsers, setNearbyUsers] = useState<UserProfile[]>([]);
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    if (!user || !location) return;
    try {
      setError(null);
      const [loadedNearbyUsers, loadedFriends, loadedRequests] = await Promise.all([
        peopleService.getNearbyUsers(location),
        peopleService.getFriends(user.uid),
        peopleService.getFriendRequests(user.uid),
      ]);

      // Filter out current user and friends from nearby users
      const friendIds = new Set(loadedFriends.map(f => f.id));
      const filteredNearbyUsers = loadedNearbyUsers.filter(
        u => u.id !== user.uid && !friendIds.has(u.id)
      );

      // Add mutual friend count
      const usersWithMutualCount = await Promise.all(
        filteredNearbyUsers.map(async u => ({
          ...u,
          mutualFriendCount: (await peopleService.getMutualFriends(user.uid, u.id)).length,
        }))
      );

      setNearbyUsers(usersWithMutualCount);
      setFriends(loadedFriends);
      setFriendRequests(loadedRequests);
    } catch (err) {
      setError('Failed to load people');
      console.error('Error loading people:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      setLoading(true);
      const results = await peopleService.searchUsers(searchQuery.trim());
      setNearbyUsers(results.filter(u => u.id !== user?.uid));
    } catch (err) {
      console.error('Error searching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUserPress = (selectedUser: UserProfile) => {
    navigation.navigate('UserProfile', { userId: selectedUser.id });
  };

  useEffect(() => {
    loadData();
  }, [user, location]);

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return <ErrorView message={error} onRetry={loadData} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Icon icon={Search} size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            placeholder="Search people..."
            returnKeyType="search"
          />
        </View>
        {friendRequests.length > 0 && (
          <TouchableOpacity
            style={styles.requestsButton}
            onPress={() => navigation.navigate('FriendRequests')}
          >
            <Icon icon={Bell} size={24} color="#007AFF" />
            <View style={styles.requestsBadge}>
              <Text style={styles.requestsCount}>{friendRequests.length}</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={[
          { title: 'Friends', icon: Users, data: friends },
          { title: 'People Nearby', icon: UserPlus, data: nearbyUsers },
        ]}
        renderItem={({ item }) => (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon icon={item.icon} size={24} color="#1a1a1a" />
              <Text style={styles.sectionTitle}>{item.title}</Text>
            </View>
            <FlatList
              data={item.data}
              renderItem={({ item: user }) => (
                <UserItem
                  user={user}
                  onPress={() => handleUserPress(user)}
                  showMutualFriends={item.title === 'People Nearby'}
                />
              )}
              keyExtractor={user => user.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.userList}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  {item.title === 'Friends'
                    ? 'No friends yet'
                    : 'No people nearby'}
                </Text>
              }
            />
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        keyExtractor={item => item.title}
        contentContainerStyle={styles.content}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  requestsButton: {
    position: 'relative',
    padding: 8,
  },
  requestsBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  requestsCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    paddingBottom: 20,
  },
  section: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginLeft: 8,
  },
  userList: {
    paddingHorizontal: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
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
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  userBio: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  mutualFriends: {
    fontSize: 12,
    color: '#007AFF',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
}); 