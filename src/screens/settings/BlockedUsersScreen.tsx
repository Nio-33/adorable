import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { UserX } from 'lucide-react-native';
import { COLORS, SPACING } from '../../config/theme';
import { Typography, Button } from '../../components/atoms';
import { List, ListItem } from '../../components/molecules';
import { useAuth } from '../../hooks/useAuth';
import type { User } from '../../types';

interface BlockedUserItemProps {
  user: User;
  onUnblock: () => void;
}

const BlockedUserItem: React.FC<BlockedUserItemProps> = ({ user, onUnblock }) => (
  <ListItem
    title={user.displayName}
    subtitle={user.email}
    avatarUrl={user.photoURL}
    avatarFallback={user.displayName[0]}
    rightContent={
      <Button
        variant="outline"
        onPress={onUnblock}
        style={styles.unblockButton}
      >
        Unblock
      </Button>
    }
  />
);

export const BlockedUsersScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [blockedUsers, setBlockedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBlockedUsers = async () => {
    if (!user) return;
    try {
      setLoading(true);
      // TODO: Implement blocked users fetching
      const response = await fetch(`/api/users/${user.id}/blocked`);
      const data = await response.json();
      setBlockedUsers(data.users);
    } catch (err) {
      console.error('Error loading blocked users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (blockedUser: User) => {
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
              // TODO: Implement unblock user API call
              await fetch(`/api/users/${user.id}/blocked/${blockedUser.id}`, {
                method: 'DELETE',
              });
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
        <Typography variant="h4" style={styles.title}>
          Blocked Users
        </Typography>
        <Typography
          variant="body2"
          color={COLORS.text.secondary}
          style={styles.subtitle}
        >
          Users you've blocked cannot see your profile or send you messages
        </Typography>
      </View>

      <List<User>
        data={blockedUsers}
        renderItem={({ item }) => (
          <BlockedUserItem
            user={item}
            onUnblock={() => handleUnblock(item)}
          />
        )}
        keyExtractor={(item) => item.id}
        loading={loading}
        emptyText="You haven't blocked any users yet"
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <UserX size={48} color={COLORS.text.secondary} />
            <Typography
              variant="body1"
              color={COLORS.text.secondary}
              style={styles.emptyText}
            >
              No blocked users
            </Typography>
          </View>
        }
        contentContainerStyle={styles.content}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  title: {
    marginBottom: SPACING.xs,
  },
  subtitle: {
    marginBottom: SPACING.md,
  },
  content: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  unblockButton: {
    borderColor: COLORS.error,
  },
}); 