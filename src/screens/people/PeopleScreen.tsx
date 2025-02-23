import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING } from '../../config/theme';
import { Typography } from '../../components/atoms';
import { List, ListItem, SearchBar, UserCard } from '../../components/molecules';
import { useLocation } from '../../hooks/useLocation';
import { useAuth } from '../../hooks/useAuth';
import { User } from '../../types';
import type { PeopleStackParamList } from './navigation/PeopleNavigator';

type PeopleScreenNavigationProp = NativeStackNavigationProp<PeopleStackParamList, 'PeopleMain'>;
type TabType = 'nearby' | 'friends';

export const PeopleScreen: React.FC = () => {
  const navigation = useNavigation<PeopleScreenNavigationProp>();
  const { user } = useAuth();
  const { location } = useLocation(user?.id);
  const [activeTab, setActiveTab] = useState<TabType>('nearby');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      // TODO: Implement user fetching based on activeTab and searchQuery
      const response = await fetch(`/api/users/${activeTab}?q=${searchQuery}`);
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchQuery]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  };

  const handleUserPress = (userId: string) => {
    navigation.navigate('UserProfile', { userId });
  };

  const handleConnect = async (userId: string) => {
    // TODO: Implement connection logic
    console.log('Connect with user:', userId);
  };

  const renderUser = ({ item: user }: { item: User }) => (
    <UserCard
      user={user}
      onPress={() => handleUserPress(user.id)}
      onConnect={() => handleConnect(user.id)}
      isConnected={false} // TODO: Implement connection status check
      distance={location ? calculateDistance(
        location.latitude,
        location.longitude,
        user.location?.latitude || 0,
        user.location?.longitude || 0
      ) : undefined}
      compact
    />
  );

  const renderTab = (tab: TabType, label: string) => (
    <Pressable
      style={[styles.tab, activeTab === tab && styles.activeTab]}
      onPress={() => setActiveTab(tab)}
    >
      <Typography
        variant="button"
        color={activeTab === tab ? COLORS.primary.main : COLORS.text.secondary}
      >
        {label}
      </Typography>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.tabs}>
          {renderTab('nearby', 'Nearby')}
          {renderTab('friends', 'Friends')}
        </View>
        <SearchBar
          value={searchQuery}
          onSearch={setSearchQuery}
          placeholder={`Search ${activeTab === 'nearby' ? 'nearby people' : 'friends'}...`}
          style={styles.searchBar}
        />
      </View>

      <List
        data={users}
        renderItem={renderUser}
        loading={loading}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        emptyText={
          activeTab === 'nearby'
            ? 'No people nearby'
            : 'No friends yet'
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyState}>
              <Typography variant="body1" color={COLORS.text.secondary}>
                {activeTab === 'nearby'
                  ? 'No one nearby matches your search'
                  : 'Connect with people to see them here'}
              </Typography>
            </View>
          )
        }
      />
    </View>
  );
};

const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
    Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: COLORS.primary.main,
  },
  searchBar: {
    marginTop: SPACING.sm,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
}); 