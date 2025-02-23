import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING } from '../../config/theme';
import { Typography, Button, Loading } from '../../components/atoms';
import { List, ListItem, SearchBar } from '../../components/molecules';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../hooks/useAuth';
import { ChatRoom } from '../../types';
import type { MessagesStackParamList } from './navigation/MessagesNavigator';

type MessagesScreenNavigationProp = NativeStackNavigationProp<MessagesStackParamList, 'MessagesList'>;

export const MessagesScreen: React.FC = () => {
  const navigation = useNavigation<MessagesScreenNavigationProp>();
  const { user } = useAuth();
  const {
    chatRooms,
    loading,
    error,
    refreshing,
    searchQuery,
    setSearchQuery,
    fetchChatRooms,
    refreshChatRooms,
  } = useChat(user?.id || '');

  useEffect(() => {
    fetchChatRooms();
  }, [fetchChatRooms]);

  const handleChatPress = (chatRoom: ChatRoom) => {
    const otherUser = chatRoom.participants.find(p => p.id !== user?.id);
    navigation.navigate('ChatRoom', {
      roomId: chatRoom.id,
      title: otherUser?.displayName || 'Chat',
    });
  };

  const handleNewChat = () => {
    navigation.navigate('NewChat');
  };

  const renderChatRoom = ({ item: chatRoom }: { item: ChatRoom }) => {
    const otherUser = chatRoom.participants.find(p => p.id !== user?.id);
    if (!otherUser) return null;

    return (
      <ListItem
        title={otherUser.displayName}
        subtitle={chatRoom.lastMessage?.content}
        avatar={{ uri: otherUser.photoURL }}
        onPress={() => handleChatPress(chatRoom)}
        rightContent={
          chatRoom.lastMessage && (
            <View>
              <Typography
                variant="caption"
                color={COLORS.text.secondary}
                style={styles.timestamp}
              >
                {new Date(chatRoom.lastMessage.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Typography>
              {!chatRoom.lastMessage.read && chatRoom.lastMessage.senderId !== user?.id && (
                <View style={styles.unreadBadge}>
                  <Typography variant="caption" color={COLORS.text.inverse}>
                    1
                  </Typography>
                </View>
              )}
            </View>
          )
        }
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SearchBar
          value={searchQuery}
          onSearch={setSearchQuery}
          placeholder="Search messages..."
          style={styles.searchBar}
        />
        <Button
          variant="primary"
          size="small"
          onPress={handleNewChat}
          style={styles.newChatButton}
        >
          New Chat
        </Button>
      </View>

      <List<ChatRoom>
        data={chatRooms}
        renderItem={renderChatRoom}
        loading={loading}
        refreshing={refreshing}
        onRefresh={refreshChatRooms}
        error={error}
        emptyText="No messages yet"
        ListEmptyComponent={
          !loading && !error && (
            <View style={styles.emptyState}>
              <Typography
                variant="body1"
                color={COLORS.text.secondary}
                style={styles.emptyStateText}
              >
                Start a conversation with someone!
              </Typography>
              <Button variant="primary" onPress={handleNewChat}>
                Start New Chat
              </Button>
            </View>
          )
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  searchBar: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  newChatButton: {
    minWidth: 100,
  },
  timestamp: {
    marginBottom: SPACING.xs,
  },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  emptyStateText: {
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
}); 