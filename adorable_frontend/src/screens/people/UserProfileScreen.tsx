import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING } from '../../config/theme';
import { Typography, Button, Avatar } from '../../components/atoms';
import { List, ListItem } from '../../components/molecules';
import { useAuth } from '../../hooks/useAuth';
import { User } from '../../types';
import type { PeopleStackParamList } from './navigation/PeopleNavigator';

type UserProfileRouteProp = RouteProp<PeopleStackParamList, 'UserProfile'>;
type UserProfileNavigationProp = NativeStackNavigationProp<PeopleStackParamList, 'UserProfile'>;

export const UserProfileScreen: React.FC = () => {
  const route = useRoute<UserProfileRouteProp>();
  const navigation = useNavigation<UserProfileNavigationProp>();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, [route.params.userId]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      // TODO: Implement API call to fetch user profile
      const response = await fetch(`/api/users/${route.params.userId}`);
      const data = await response.json();
      setUser(data.user);
      // TODO: Check connection status
      setIsConnected(false);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!user || !currentUser) {return;}

    try {
      setLoading(true);
      // TODO: Implement connection logic
      const response = await fetch('/api/connections', {
        method: 'POST',
        body: JSON.stringify({
          userId: currentUser.id,
          targetUserId: user.id,
        }),
      });

      if (response.ok) {
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Error connecting with user:', error);
      Alert.alert('Error', 'Failed to connect with user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = () => {
    if (!user) {return;}

    Alert.alert(
      'Block User',
      `Are you sure you want to block ${user.displayName}?`,
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
              // TODO: Implement block user logic
              await fetch(`/api/users/${user.id}/block`, { method: 'POST' });
              navigation.goBack();
            } catch (error) {
              console.error('Error blocking user:', error);
              Alert.alert('Error', 'Failed to block user. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleReport = () => {
    if (!user) {return;}

    Alert.alert(
      'Report User',
      'Please select a reason for reporting this user:',
      [
        {
          text: 'Inappropriate Content',
          onPress: () => submitReport('inappropriate_content'),
        },
        {
          text: 'Harassment',
          onPress: () => submitReport('harassment'),
        },
        {
          text: 'Spam',
          onPress: () => submitReport('spam'),
        },
        {
          text: 'Other',
          onPress: () => submitReport('other'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const submitReport = async (reason: string) => {
    if (!user) {return;}

    try {
      // TODO: Implement report user logic
      await fetch(`/api/users/${user.id}/report`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
      Alert.alert('Thank You', 'Your report has been submitted.');
    } catch (error) {
      console.error('Error reporting user:', error);
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    }
  };

  if (loading || !user) {
    return (
      <View style={styles.loadingContainer}>
        <Typography>Loading...</Typography>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar
          uri={user.photoURL || user.avatarUrl}
          fallback={user.displayName[0]}
          size="xlarge"
          style={styles.avatar}
        />
        <Typography variant="h4" style={styles.name}>
          {user.displayName}
        </Typography>
        <Typography
          variant="body2"
          color={COLORS.text.secondary}
          style={styles.username}
        >
          @{user.username}
        </Typography>
        {user.bio && (
          <Typography
            variant="body1"
            color={COLORS.text.secondary}
            style={styles.bio}
          >
            {user.bio}
          </Typography>
        )}
      </View>

      <View style={styles.actions}>
        <Button
          variant={isConnected ? 'outline' : 'primary'}
          onPress={handleConnect}
          style={styles.actionButton}
        >
          {isConnected ? 'Connected' : 'Connect'}
        </Button>
        <View style={styles.secondaryActions}>
          <Button
            variant="outline"
            onPress={handleBlock}
            style={StyleSheet.compose(styles.actionButton, styles.destructiveButton)}
          >
            Block
          </Button>
          <Button
            variant="outline"
            onPress={handleReport}
            style={StyleSheet.compose(styles.actionButton, styles.destructiveButton)}
          >
            Report
          </Button>
        </View>
      </View>

      {/* TODO: Add sections for:
        - Mutual friends
        - Shared interests
        - Recent activity
        - Photos
      */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    padding: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  avatar: {
    marginBottom: SPACING.md,
  },
  name: {
    textAlign: 'center',
  },
  username: {
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  bio: {
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  actions: {
    padding: SPACING.md,
    gap: SPACING.md,
  },
  actionButton: {
    minWidth: 120,
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  destructiveButton: {
    borderColor: COLORS.error,
  },
} as const);
