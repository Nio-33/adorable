import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation';
import { ArrowLeft, UserX } from 'lucide-react-native';

type BlockedUsersScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

type BlockedUser = {
  id: number;
  name: string;
  username: string;
  blockedDate: string;
  avatar: string;
};

const BlockedUsersScreen = () => {
  const navigation = useNavigation<BlockedUsersScreenNavigationProp>();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([
    {
      id: 1,
      name: 'Sarah Johnson',
      username: '@sarahj',
      blockedDate: '2024-01-15',
      avatar: 'https://api.adorable.io/avatars/40/sarah.png',
    },
    {
      id: 2,
      name: 'Michael Chen',
      username: '@mchen',
      blockedDate: '2024-01-20',
      avatar: 'https://api.adorable.io/avatars/40/michael.png',
    },
    {
      id: 3,
      name: 'David Wilson',
      username: '@dwilson',
      blockedDate: '2024-01-25',
      avatar: 'https://api.adorable.io/avatars/40/david.png',
    },
  ]);

  const handleUnblock = (userId: number) => {
    setBlockedUsers(prev => prev.filter(user => user.id !== userId));
  };

  const handleUnblockAll = () => {
    setBlockedUsers([]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft color="white" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Blocked Users</Text>
      </View>

      <ScrollView style={styles.content}>
        {blockedUsers.length > 0 ? (
          <View style={styles.card}>
            {blockedUsers.map((user, index) => (
              <View
                key={user.id}
                style={[
                  styles.userItem,
                  index !== blockedUsers.length - 1 && styles.userItemBorder,
                ]}
              >
                <View style={styles.userInfo}>
                  <Image
                    source={{ uri: user.avatar }}
                    style={styles.avatar}
                  />
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userHandle}>{user.username}</Text>
                    <Text style={styles.blockedDate}>
                      Blocked on {new Date(user.blockedDate).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => handleUnblock(user.id)}
                  style={styles.unblockButton}
                >
                  <Text style={styles.unblockButtonText}>Unblock</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconContainer}>
              <UserX size={32} color="#a5b4fc" />
            </View>
            <Text style={styles.emptyTitle}>No Blocked Users</Text>
            <Text style={styles.emptyDescription}>You haven't blocked any users yet.</Text>
          </View>
        )}

        {blockedUsers.length > 0 && (
          <TouchableOpacity
            onPress={handleUnblockAll}
            style={styles.unblockAllButton}
          >
            <Text style={styles.unblockAllButtonText}>Unblock All Users</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.footerText}>
          Blocked users cannot view your profile or send you messages.
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1b4b', // indigo-950
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#312e81', // indigo-900
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#312e81', // indigo-900
    borderRadius: 12,
    overflow: 'hidden',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  userItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#4338ca', // indigo-800
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4338ca', // indigo-800
  },
  userDetails: {
    marginLeft: 12,
  },
  userName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  userHandle: {
    color: '#a5b4fc', // indigo-300
    fontSize: 14,
  },
  blockedDate: {
    color: '#818cf8', // indigo-400
    fontSize: 12,
  },
  unblockButton: {
    backgroundColor: '#4338ca', // indigo-800
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  unblockButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyCard: {
    backgroundColor: '#312e81', // indigo-900
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#4338ca', // indigo-800
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 8,
  },
  emptyDescription: {
    color: '#a5b4fc', // indigo-300
    fontSize: 16,
    textAlign: 'center',
  },
  unblockAllButton: {
    backgroundColor: '#dc2626', // red-600
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  unblockAllButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  footerText: {
    color: '#a5b4fc', // indigo-300
    fontSize: 14,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
});

export default BlockedUsersScreen;
