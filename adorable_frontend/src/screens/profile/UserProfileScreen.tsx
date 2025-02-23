import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserPlus, MessageSquare, Ban } from 'lucide-react-native';
import { RootStackParamList } from '../../types/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { UserProfile, peopleService } from '../../services/PeopleService';
import { ChatUser } from '../../types/ChatUser';
import { chatService } from '../../services/ChatService';
import { ErrorView } from '../../components/common/ErrorView';
import { Icon } from '../../components/common/Icon';
import { ChatAvatar } from '../../components/chat/ChatAvatar';

type UserProfileRouteProp = RouteProp<RootStackParamList, 'UserProfile'>;
type UserProfileNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const UserProfileScreen: React.FC = () => {
  const route = useRoute<UserProfileRouteProp>();
  const navigation = useNavigation<UserProfileNavigationProp>();
  const { user } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [friends, setFriends] = useState<ChatUser[]>([]);
  const [mutualFriends, setMutualFriends] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const loadData = async () => {
    if (!user) {return;}
    try {
      setError(null);
      const [loadedProfile, loadedFriends, loadedMutualFriends] = await Promise.all([
        peopleService.getUserProfile(route.params.userId),
        peopleService.getFriends(user.uid),
        peopleService.getMutualFriends(user.uid, route.params.userId),
      ]);

      setProfile(loadedProfile);
      setFriends(loadedFriends);
      setMutualFriends(loadedMutualFriends);
    } catch (err) {
      setError('Failed to load profile');
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async () => {
    if (!user || !profile || sending) {return;}
    try {
      setSending(true);
      const currentUser: ChatUser = {
        id: user.uid,
        displayName: user.displayName || 'Anonymous',
        email: user.email || '',
        photoURL: user.photoURL || undefined,
      };
      await peopleService.sendFriendRequest(currentUser, profile.id);
      Alert.alert('Success', 'Friend request sent!');
    } catch (err) {
      console.error('Error sending friend request:', err);
      Alert.alert('Error', 'Failed to send friend request');
    } finally {
      setSending(false);
    }
  };

  const handleMessage = async () => {
    if (!user || !profile) {return;}
    try {
      setSending(true);
      const participants: ChatUser[] = [
        {
          id: user.uid,
          displayName: user.displayName || 'Anonymous',
          email: user.email || '',
          photoURL: user.photoURL || undefined,
        },
        {
          id: profile.id,
          displayName: profile.displayName,
          email: '', // We don't have this information
          photoURL: profile.photoURL,
        },
      ];
      const roomId = await chatService.createChatRoom(participants);
      navigation.navigate('ChatRoom', { roomId });
    } catch (err) {
      console.error('Error creating chat room:', err);
      Alert.alert('Error', 'Failed to create chat room');
    } finally {
      setSending(false);
    }
  };

  const handleBlock = () => {
    if (!user || !profile) {return;}
    Alert.alert(
      'Block User',
      `Are you sure you want to block ${profile.displayName}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Block',
          style: 'destructive',
          onPress: async () => {
            try {
              await peopleService.blockUser(user.uid, profile.id);
              navigation.goBack();
            } catch (err) {
              console.error('Error blocking user:', err);
              Alert.alert('Error', 'Failed to block user');
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    loadData();
  }, [user, route.params.userId]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return <ErrorView message={error} onRetry={loadData} />;
  }

  if (!profile) {
    return <ErrorView message="User not found" />;
  }

  const isFriend = friends.some(friend => friend.id === profile.id);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <ChatAvatar
            photoURL={profile.photoURL}
            displayName={profile.displayName}
            size={100}
            showOnlineStatus
            isOnline={profile.isOnline}
          />
          <Text style={styles.displayName}>{profile.displayName}</Text>
          {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile.friendCount}</Text>
              <Text style={styles.statLabel}>Friends</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{mutualFriends.length}</Text>
              <Text style={styles.statLabel}>Mutual Friends</Text>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          {!isFriend && (
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton]}
              onPress={handleAddFriend}
              disabled={sending}
            >
              <Icon icon={UserPlus} size={24} color="#fff" />
              <Text style={styles.actionButtonText}>Add Friend</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={handleMessage}
            disabled={sending}
          >
            <Icon icon={MessageSquare} size={24} color="#007AFF" />
            <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
              Message
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.dangerButton]}
            onPress={handleBlock}
          >
            <Icon icon={Ban} size={24} color="#FF3B30" />
            <Text style={[styles.actionButtonText, styles.dangerButtonText]}>
              Block
            </Text>
          </TouchableOpacity>
        </View>

        {profile.interests && profile.interests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interests</Text>
            <View style={styles.interests}>
              {profile.interests.map((interest, index) => (
                <View key={index} style={styles.interestTag}>
                  <Text style={styles.interestText}>{interest}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {mutualFriends.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mutual Friends</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {mutualFriends.map(friend => (
                <TouchableOpacity
                  key={friend.id}
                  style={styles.friendItem}
                  onPress={() => navigation.push('UserProfile', { userId: friend.id })}
                >
                  <ChatAvatar
                    photoURL={friend.photoURL}
                    displayName={friend.displayName}
                    size={60}
                    showOnlineStatus
                    isOnline={friend.isOnline}
                  />
                  <Text style={styles.friendName} numberOfLines={1}>
                    {friend.displayName}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
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
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  displayName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 12,
    marginBottom: 8,
  },
  bio: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
    marginHorizontal: 20,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 8,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  dangerButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: '#fff',
  },
  secondaryButtonText: {
    color: '#007AFF',
  },
  dangerButtonText: {
    color: '#FF3B30',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  interests: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  interestTag: {
    backgroundColor: '#F2F2F7',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    margin: 4,
  },
  interestText: {
    fontSize: 14,
    color: '#1a1a1a',
  },
  friendItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 80,
  },
  friendName: {
    fontSize: 14,
    color: '#1a1a1a',
    marginTop: 8,
    textAlign: 'center',
  },
});
