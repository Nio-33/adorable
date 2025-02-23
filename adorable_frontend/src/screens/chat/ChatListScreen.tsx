import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageSquare } from 'lucide-react-native';
import { ChatRoom, ChatUser, chatService } from '../../services/ChatService';
import { useAuth } from '../../contexts/AuthContext';
import { ErrorView } from '../../components/common/ErrorView';
import { RootStackParamList } from '../../types/navigation';
import { Icon } from '../../components/common/Icon';
import { ChatAvatar } from '../../components/chat/ChatAvatar';

type ChatNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ChatListScreen: React.FC = () => {
  const navigation = useNavigation<ChatNavigationProp>();
  const { user } = useAuth();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState<{ [userId: string]: boolean }>({});

  const loadChatRooms = async () => {
    if (!user) {return;}
    try {
      setError(null);
      const rooms = await chatService.getChatRooms(user.uid);
      setChatRooms(rooms.sort((a, b) => b.lastActivity - a.lastActivity));
    } catch (err) {
      setError('Failed to load chat rooms');
      console.error('Error loading chat rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadChatRooms();
    setRefreshing(false);
  };

  const handleChatRoomPress = (chatRoom: ChatRoom) => {
    navigation.navigate('ChatRoom', { roomId: chatRoom.id });
  };

  useEffect(() => {
    loadChatRooms();
  }, [loadChatRooms]);

  useEffect(() => {
    if (!user) {return;}

    const unsubscribers = new Map<string, () => void>();

    chatRooms.forEach(room => {
      room.participants
        .filter(p => p.id !== user.uid)
        .forEach(participant => {
          if (!unsubscribers.has(participant.id)) {
            const unsubscribe = chatService.subscribeToOnlineStatus(
              participant.id,
              (status) => {
                setOnlineStatus(prev => ({
                  ...prev,
                  [participant.id]: status.isOnline,
                }));
              }
            );
            unsubscribers.set(participant.id, unsubscribe);
          }
        });
    });

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [chatRooms, user]);

  useEffect(() => {
    if (!user) {return;}
    chatService.startOnlineStatusTracking(user.uid);
    return () => chatService.stopOnlineStatusTracking();
  }, [user]);

  const getOtherParticipants = (chatRoom: ChatRoom): ChatUser[] => {
    return chatRoom.participants.filter(p => p.id !== user?.uid);
  };

  const getDisplayName = (participants: ChatUser[]): string => {
    return participants.map(p => p.displayName).join(', ');
  };

  const renderChatRoom = ({ item: chatRoom }: { item: ChatRoom }) => {
    const otherParticipants = getOtherParticipants(chatRoom);
    const unreadCount = chatRoom.unreadCount[user?.uid || ''] || 0;
    const isOnline = otherParticipants[0] ? onlineStatus[otherParticipants[0].id] : false;

    return (
      <TouchableOpacity
        style={styles.chatRoomItem}
        onPress={() => handleChatRoomPress(chatRoom)}
      >
        <View style={styles.chatRoomContent}>
          <ChatAvatar
            photoURL={otherParticipants[0]?.photoURL}
            displayName={otherParticipants[0]?.displayName || 'Unknown'}
            size={50}
            showOnlineStatus
            isOnline={isOnline}
          />
          <View style={styles.chatRoomInfo}>
            <Text style={styles.participantName}>
              {getDisplayName(otherParticipants)}
            </Text>
            <Text style={styles.lastMessage} numberOfLines={1}>
              {chatRoom.lastMessage?.content || 'No messages yet'}
            </Text>
          </View>
          <View style={styles.chatRoomMeta}>
            {chatRoom.lastMessage && (
              <Text style={styles.timestamp}>
                {new Date(chatRoom.lastMessage.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            )}
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>{unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return <ErrorView message={error} onRetry={loadChatRooms} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={chatRooms}
        renderItem={renderChatRoom}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon icon={MessageSquare} size={48} color="#666" />
            <Text style={styles.emptyText}>No chat rooms yet</Text>
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
  chatRoomItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  chatRoomContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatRoomInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 16,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
  chatRoomMeta: {
    alignItems: 'flex-end',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  unreadBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
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
