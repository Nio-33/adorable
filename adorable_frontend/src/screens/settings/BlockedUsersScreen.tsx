import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, UserX } from 'lucide-react-native';
import { SettingsStackParamList } from '../../types/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { peopleService } from '../../services/PeopleService';
import { ChatUser } from '../../types/ChatUser';
import { Icon } from '../../components/common/Icon';
import { ChatAvatar } from '../../components/chat/ChatAvatar';

type BlockedUsersNavigationProp = NativeStackNavigationProp<SettingsStackParamList>;

interface BlockedUserItemProps {
  user: ChatUser;
  onUnblock: () => void;
}

const BlockedUserItem: React.FC<BlockedUserItemProps> = ({ user, onUnblock }) => (
  <View style={styles.userItem}>
    <ChatAvatar
      photoURL={user.photoURL}
      displayName={user.displayName}
      size={40}
    />
    <View style={styles.userInfo}>
      <Text style={styles.userName}>{user.displayName}</Text>
      <Text style={styles.userEmail}>{user.email}</Text>
    </View>
    <TouchableOpacity
      style={styles.unblockButton}
      onPress={onUnblock}
    >
      <Text style={styles.unblockText}>Unblock</Text>
    </TouchableOpacity>
  </View>
);

export const BlockedUsersScreen: React.FC = () => {
  const navigation = useNavigation<BlockedUsersNavigationProp>();
  const { user } = useAuth();
  const [blockedUsers, setBlockedUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBlockedUsers = async () => {
    if (!user) return;
    try {
      setError(null);
      setLoading(true);
      const users = await peopleService.getBlockedUsers(user.uid);
      setBlockedUsers(users);
    } catch (err) {
      setError('Failed to load blocked users');
      console.error('Error loading blocked users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (blockedUser: ChatUser) => {
    if (!user) return;
    
    Alert.alert(
      'Unblock User',
      `Are you sure you want to unblock ${blockedUser.displayName}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Unblock',
          style: 'destructive',
          onPress: async () => {
            try {
              await peopleService.unblockUser(user.uid, blockedUser.id);
              setBlockedUsers(users => users.filter(u => u.id !== blockedUser.id));
            } catch (error) {
              Alert.alert('Error', 'Failed to unblock user');
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    loadBlockedUsers();
  }, [user]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon icon={ArrowLeft} size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.title}>Blocked Users</Text>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" />
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadBlockedUsers}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={blockedUsers}
          renderItem={({ item }) => (
            <BlockedUserItem
              user={item}
              onUnblock={() => handleUnblock(item)}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.content}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon icon={UserX} size={48} color="#666" />
              <Text style={styles.emptyText}>No blocked users</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  content: {
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginBottom: 16,
  },
  retryButton: {
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e1b4b',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  unblockButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
  },
  unblockText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ef4444',
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