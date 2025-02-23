import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING } from '../../config/theme';
import { Typography, Loading } from '../../components/atoms';
import { List, ListItem, SearchBar } from '../../components/molecules';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../hooks/useAuth';
import { useDebounce } from '../../hooks/useDebounce';
import { User } from '../../types';
import type { MessagesStackParamList } from './navigation/MessagesNavigator';

type NewChatScreenNavigationProp = NativeStackNavigationProp<MessagesStackParamList, 'NewChat'>;

export const NewChatScreen: React.FC = () => {
  const navigation = useNavigation<NewChatScreenNavigationProp>();
  const { user } = useAuth();
  const { getChatRoom } = useChat(user?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  const debouncedSearch = useDebounce(async (query: string) => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      // TODO: Implement user search API call
      const response = await fetch(`/api/users/search?q=${query}`);
      const data = await response.json();
      setUsers(data.users.filter((u: User) => u.id !== user?.id));
    } catch (err) {
      setError('Failed to search users');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, 300);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    debouncedSearch(query);
  }, [debouncedSearch]);

  const handleUserPress = async (selectedUser: User) => {
    try {
      setLoading(true);
      await getChatRoom(selectedUser.id);
      navigation.navigate('ChatRoom', {
        roomId: selectedUser.id, // This will be replaced with actual room ID
        title: selectedUser.displayName,
      });
    } catch (err) {
      setError('Failed to start chat');
      console.error('Chat creation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderUser = ({ item: user }: { item: User }) => (
    <ListItem
      title={user.displayName}
      subtitle={user.username}
      avatar={user.photoURL ? { uri: user.photoURL } : undefined}
      onPress={() => handleUserPress(user)}
    />
  );

  return (
    <View style={styles.container}>
      <SearchBar
        value={searchQuery}
        onSearch={handleSearch}
        placeholder="Search users..."
        style={styles.searchBar}
      />

      <List<User>
        data={users}
        renderItem={renderUser}
        loading={loading}
        error={error || undefined}
        emptyText={
          searchQuery
            ? 'No users found'
            : 'Search for users to start a conversation'
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  searchBar: {
    margin: SPACING.md,
  },
}); 