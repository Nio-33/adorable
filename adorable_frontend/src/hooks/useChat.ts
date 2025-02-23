import { useState, useEffect, useCallback } from 'react';
import { firebaseService } from '../services/firebase';
import { Message, ChatRoom } from '../types';

interface ChatState {
  messages: Message[];
  chatRoom: ChatRoom | null;
  chatRooms: ChatRoom[];
  loading: boolean;
  refreshing: boolean;
  hasMore: boolean;
  page: number;
  error: string | undefined;
  searchQuery: string;
}

interface UseChat {
  messages: Message[];
  chatRoom: ChatRoom | null;
  chatRooms: ChatRoom[];
  loading: boolean;
  refreshing: boolean;
  hasMore: boolean;
  error: string | undefined;
  searchQuery: string;
  sendMessage: (content: string, type?: Message['type']) => Promise<void>;
  loadMoreMessages: () => void;
  markAsRead: () => Promise<void>;
  getChatRoom: (participantId: string) => Promise<void>;
  fetchChatRooms: () => void;
  refreshChatRooms: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  sendImage: (uri: string) => Promise<void>;
  sendLocation: (latitude: number, longitude: number) => Promise<void>;
}

const MESSAGES_PER_PAGE = 20;

export function useChat(currentUserId: string, chatRoomId?: string): UseChat {
  const [state, setState] = useState<ChatState>({
    messages: [],
    chatRoom: null,
    chatRooms: [],
    loading: true,
    refreshing: false,
    hasMore: true,
    page: 1,
    error: undefined,
    searchQuery: '',
  });

  const handleError = (error: any) => {
    console.error('Chat error:', error);
    setState(prev => ({
      ...prev,
      error: error.message || 'An error occurred',
      loading: false,
      refreshing: false,
    }));
  };

  // Fetch chat rooms
  const fetchChatRooms = useCallback(() => {
    try {
      setState(prev => ({ ...prev, loading: true, error: undefined }));
      
      const unsubscribe = firebaseService.subscribeToChatRooms(currentUserId, (chatRooms) => {
        setState(prev => ({
          ...prev,
          chatRooms: chatRooms as ChatRoom[],
          loading: false,
          error: undefined,
        }));
      });

      return () => {
        unsubscribe();
      };
    } catch (error) {
      handleError(error);
    }
  }, [currentUserId]);

  // Refresh chat rooms
  const refreshChatRooms = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, refreshing: true, error: undefined }));
      fetchChatRooms();
      setState(prev => ({ ...prev, refreshing: false }));
    } catch (error) {
      handleError(error);
    }
  }, [fetchChatRooms]);

  // Get or create chat room
  const getChatRoom = useCallback(async (participantId: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: undefined }));
      
      // Check if chat room exists
      const existingRoom = state.chatRooms.find(room =>
        room.participants.includes(participantId)
      );

      if (existingRoom) {
        setState(prev => ({
          ...prev,
          chatRoom: existingRoom,
          loading: false,
        }));
        return;
      }

      // Create new chat room
      const newRoom = await firebaseService.createChatRoom({
        participants: [currentUserId, participantId],
        updatedAt: new Date(),
      });

      setState(prev => ({
        ...prev,
        chatRoom: newRoom,
        loading: false,
      }));
    } catch (error) {
      handleError(error);
    }
  }, [currentUserId, state.chatRooms]);

  // Send message
  const sendMessage = useCallback(async (content: string, type: Message['type'] = 'text') => {
    if (!chatRoomId || !content.trim()) return;

    try {
      const message: Omit<Message, 'id'> = {
        senderId: currentUserId,
        receiverId: state.chatRoom?.participants.find(id => id !== currentUserId) || '',
        content,
        type,
        timestamp: new Date(),
        read: false,
      };

      const sentMessage = await firebaseService.sendMessage(chatRoomId, message);

      // Update chat room's last message
      await firebaseService.updateChatRoom(chatRoomId, {
        lastMessage: sentMessage,
        updatedAt: message.timestamp,
      });
    } catch (error) {
      handleError(error);
    }
  }, [currentUserId, chatRoomId, state.chatRoom]);

  // Send image message
  const sendImage = useCallback(async (uri: string) => {
    try {
      // Upload image to Firebase Storage
      const response = await fetch(uri);
      const blob = await response.blob();
      const filename = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const imageUrl = await firebaseService.uploadFile(`/chat_images/${filename}`, blob);

      // Send message with image URL
      await sendMessage(imageUrl, 'image');
    } catch (error) {
      handleError(error);
    }
  }, [sendMessage]);

  // Send location message
  const sendLocation = useCallback(async (latitude: number, longitude: number) => {
    try {
      const locationString = JSON.stringify({ latitude, longitude });
      await sendMessage(locationString, 'location');
    } catch (error) {
      handleError(error);
    }
  }, [sendMessage]);

  // Mark messages as read
  const markAsRead = useCallback(async () => {
    if (!chatRoomId) return;

    try {
      const unreadMessages = state.messages.filter(
        msg => !msg.read && msg.senderId !== currentUserId
      );

      if (unreadMessages.length > 0) {
        await firebaseService.markMessagesAsRead(
          chatRoomId,
          unreadMessages.map(msg => msg.id)
        );
      }
    } catch (error) {
      handleError(error);
    }
  }, [chatRoomId, currentUserId, state.messages]);

  // Set search query
  const setSearchQuery = useCallback((query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
  }, []);

  // Load more messages
  const loadMoreMessages = useCallback(() => {
    if (!chatRoomId || !state.hasMore || state.loading) return;

    try {
      setState(prev => ({ ...prev, loading: true, error: undefined }));
      
      const unsubscribe = firebaseService.subscribeToMessages(chatRoomId, (messages) => {
        setState(prev => ({
          ...prev,
          messages: messages as Message[],
          hasMore: messages.length === MESSAGES_PER_PAGE,
          page: prev.page + 1,
          loading: false,
        }));
      });

      return () => {
        unsubscribe();
      };
    } catch (error) {
      handleError(error);
    }
  }, [chatRoomId, state.hasMore, state.loading]);

  // Subscribe to messages
  useEffect(() => {
    if (!chatRoomId) return;

    const unsubscribe = firebaseService.subscribeToMessages(chatRoomId, (messages) => {
      setState(prev => ({
        ...prev,
        messages: messages as Message[],
        loading: false,
      }));
    });

    return () => {
      unsubscribe();
    };
  }, [chatRoomId]);

  // Subscribe to chat rooms
  useEffect(() => {
    const unsubscribe = firebaseService.subscribeToChatRooms(currentUserId, (chatRooms) => {
      setState(prev => ({
        ...prev,
        chatRooms: chatRooms as ChatRoom[],
        loading: false,
      }));
    });

    return () => {
      unsubscribe();
    };
  }, [currentUserId]);

  return {
    messages: state.messages,
    chatRoom: state.chatRoom,
    chatRooms: state.chatRooms,
    loading: state.loading,
    refreshing: state.refreshing,
    hasMore: state.hasMore,
    error: state.error,
    searchQuery: state.searchQuery,
    sendMessage,
    loadMoreMessages,
    markAsRead,
    getChatRoom,
    fetchChatRooms,
    refreshChatRooms,
    setSearchQuery,
    sendImage,
    sendLocation,
  };
} 