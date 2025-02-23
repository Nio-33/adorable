import { useState, useEffect, useCallback, useRef } from 'react';
import { firebaseService } from '../services/firebase';
import { Message, ChatRoom, MessageReaction, MessageStatus, User } from '../types';

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
  sendMessage: (content: string, type?: Message['type'], replyToId?: string) => Promise<void>;
  editMessage: (messageId: string, newContent: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  addReaction: (messageId: string, reactionType: MessageReaction['type']) => Promise<void>;
  removeReaction: (messageId: string) => Promise<void>;
  setTypingStatus: (isTyping: boolean) => void;
  pinMessage: (messageId: string) => Promise<void>;
  unpinMessage: (messageId: string) => Promise<void>;
  loadMoreMessages: () => void;
  markAsRead: () => Promise<void>;
  getChatRoom: (participantId: string) => Promise<void>;
  fetchChatRooms: () => void;
  refreshChatRooms: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  sendImage: (uri: string) => Promise<void>;
  sendLocation: (latitude: number, longitude: number) => Promise<void>;
}

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

  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const messageSubscriptionRef = useRef<() => void>();
  const roomSubscriptionRef = useRef<() => void>();

  const handleError = (error: any) => {
    console.error('Chat error:', error);
    setState(prev => ({ ...prev, error: error.message, loading: false }));
  };

  const sendMessage = useCallback(async (
    content: string,
    type: Message['type'] = 'text',
    replyToId?: string
  ) => {
    if (!state.chatRoom) {return;}

    try {
      const message: Omit<Message, 'id'> = {
        senderId: currentUserId,
        receiverId: state.chatRoom.participants.find(p => p.id !== currentUserId)?.id || '',
        content,
        type,
        timestamp: new Date(),
        status: 'sending',
        replyTo: replyToId,
      };

      const sentMessage = await firebaseService.sendMessage(state.chatRoom.id, message);
      await firebaseService.updateChatRoom(state.chatRoom.id, {
        lastMessage: sentMessage,
        updatedAt: new Date(),
      });
    } catch (error) {
      handleError(error);
    }
  }, [currentUserId, state.chatRoom]);

  const editMessage = useCallback(async (messageId: string, newContent: string) => {
    if (!state.chatRoom) {return;}

    try {
      const message = state.messages.find(m => m.id === messageId);
      if (!message || message.senderId !== currentUserId) {return;}

      await firebaseService.updateMessages(state.chatRoom.id, {
        [messageId]: {
          ...message,
          content: newContent,
          editedAt: new Date(),
        },
      });
    } catch (error) {
      handleError(error);
    }
  }, [currentUserId, state.chatRoom, state.messages]);

  const deleteMessage = useCallback(async (messageId: string) => {
    if (!state.chatRoom) {return;}

    try {
      const message = state.messages.find(m => m.id === messageId);
      if (!message || message.senderId !== currentUserId) {return;}

      await firebaseService.updateMessages(state.chatRoom.id, {
        [messageId]: {
          ...message,
          deletedAt: new Date(),
        },
      });
    } catch (error) {
      handleError(error);
    }
  }, [currentUserId, state.chatRoom, state.messages]);

  const addReaction = useCallback(async (messageId: string, reactionType: MessageReaction['type']) => {
    if (!state.chatRoom) {return;}

    try {
      const message = state.messages.find(m => m.id === messageId);
      if (!message) {return;}

      const reaction: MessageReaction = {
        userId: currentUserId,
        type: reactionType,
        createdAt: new Date(),
      };

      await firebaseService.updateMessages(state.chatRoom.id, {
        [messageId]: {
          ...message,
          reactions: {
            ...message.reactions,
            [currentUserId]: reaction,
          },
        },
      });
    } catch (error) {
      handleError(error);
    }
  }, [currentUserId, state.chatRoom, state.messages]);

  const removeReaction = useCallback(async (messageId: string) => {
    if (!state.chatRoom) {return;}

    try {
      const message = state.messages.find(m => m.id === messageId);
      if (!message || !message.reactions?.[currentUserId]) {return;}

      const { [currentUserId]: _, ...remainingReactions } = message.reactions;
      await firebaseService.updateMessages(state.chatRoom.id, {
        [messageId]: {
          ...message,
          reactions: remainingReactions,
        },
      });
    } catch (error) {
      handleError(error);
    }
  }, [currentUserId, state.chatRoom, state.messages]);

  const setTypingStatus = useCallback((isTyping: boolean) => {
    if (!state.chatRoom?.id) {return;}

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    const updateTyping = async () => {
      if (!state.chatRoom?.id) {return;}

      try {
        const typingUsers = state.chatRoom.typingUsers || [];
        const updatedTypingUsers = isTyping
          ? [...new Set([...typingUsers, currentUserId])]
          : typingUsers.filter(id => id !== currentUserId);

        await firebaseService.updateChatRoom(state.chatRoom.id, {
          typingUsers: updatedTypingUsers,
        });
      } catch (error) {
        handleError(error);
      }
    };

    updateTyping();

    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        setTypingStatus(false);
      }, 3000);
    }
  }, [currentUserId, state.chatRoom]);

  const pinMessage = useCallback(async (messageId: string) => {
    if (!state.chatRoom) {return;}

    try {
      const pinnedMessages = state.chatRoom.pinnedMessages || [];
      await firebaseService.updateChatRoom(state.chatRoom.id, {
        pinnedMessages: [...new Set([...pinnedMessages, messageId])],
      });
    } catch (error) {
      handleError(error);
    }
  }, [state.chatRoom]);

  const unpinMessage = useCallback(async (messageId: string) => {
    if (!state.chatRoom) {return;}

    try {
      const pinnedMessages = state.chatRoom.pinnedMessages || [];
      await firebaseService.updateChatRoom(state.chatRoom.id, {
        pinnedMessages: pinnedMessages.filter(id => id !== messageId),
      });
    } catch (error) {
      handleError(error);
    }
  }, [state.chatRoom]);

  // Get or create chat room
  const getChatRoom = useCallback(async (participantId: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: undefined }));

      // Check if chat room exists
      const existingRoom = state.chatRooms.find(room =>
        room.participants.some(p => p.id === participantId)
      );

      if (existingRoom) {
        setState(prev => ({
          ...prev,
          chatRoom: existingRoom,
          loading: false,
        }));
        return;
      }

      // Get participant user data
      const participantUser = await firebaseService.getUserById(participantId);
      const currentUser = await firebaseService.getUserById(currentUserId);

      if (!participantUser || !currentUser) {
        throw new Error('User not found');
      }

      // Create new chat room
      const newRoom = await firebaseService.createChatRoom({
        participants: [currentUser, participantUser],
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

  // Load more messages
  const loadMoreMessages = useCallback(() => {
    if (!state.hasMore || !chatRoomId) {return;}

    setState(prev => ({ ...prev, loading: true }));
    // Implement pagination logic here
  }, [chatRoomId, state.hasMore]);

  // Mark messages as read
  const markAsRead = useCallback(async () => {
    if (!state.chatRoom?.id || !state.messages.length) {return;}

    try {
      const unreadMessages = state.messages.filter(
        msg => msg.senderId !== currentUserId && msg.status !== 'read'
      );

      if (unreadMessages.length === 0) {return;}

      const updates = unreadMessages.reduce((acc, msg) => ({
        ...acc,
        [msg.id]: {
          ...msg,
          status: 'read' as MessageStatus,
        },
      }), {});

      await firebaseService.updateMessages(state.chatRoom.id, updates);

      // Update unread count in chat room
      const otherUserId = state.chatRoom.participants.find(p => p.id !== currentUserId)?.id;
      if (otherUserId) {
        await firebaseService.updateChatRoom(state.chatRoom.id, {
          unreadCount: {
            ...state.chatRoom.unreadCount,
            [currentUserId]: 0,
          },
        });
      }
    } catch (error) {
      handleError(error);
    }
  }, [currentUserId, state.chatRoom, state.messages]);

  // Fetch chat rooms
  const fetchChatRooms = useCallback(() => {
    setState(prev => ({ ...prev, loading: true }));

    const unsubscribe = firebaseService.subscribeToChatRooms(
      currentUserId,
      (rooms) => {
        setState(prev => ({
          ...prev,
          chatRooms: rooms,
          loading: false,
        }));
      }
    );

    return unsubscribe;
  }, [currentUserId]);

  // Refresh chat rooms
  const refreshChatRooms = useCallback(async () => {
    setState(prev => ({ ...prev, refreshing: true }));
    fetchChatRooms();
  }, [fetchChatRooms]);

  // Set search query
  const setSearchQuery = useCallback((query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
  }, []);

  // Send image
  const sendImage = useCallback(async (uri: string) => {
    try {
      const imageUrl = await firebaseService.uploadChatImage(uri);
      await sendMessage(imageUrl, 'image');
    } catch (error) {
      handleError(error);
    }
  }, [sendMessage]);

  // Send location
  const sendLocation = useCallback(async (latitude: number, longitude: number) => {
    try {
      const locationMessage = JSON.stringify({ latitude, longitude });
      await sendMessage(locationMessage, 'location');
    } catch (error) {
      handleError(error);
    }
  }, [sendMessage]);

  // Subscribe to messages
  useEffect(() => {
    if (chatRoomId) {
      messageSubscriptionRef.current = firebaseService.subscribeToMessages(
        chatRoomId,
        (messages) => {
          setState(prev => ({ ...prev, messages, loading: false }));
        }
      );
    }

    return () => {
      if (messageSubscriptionRef.current) {
        messageSubscriptionRef.current();
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [chatRoomId]);

  // Initial chat rooms fetch
  useEffect(() => {
    const unsubscribe = fetchChatRooms();
    return () => unsubscribe();
  }, [fetchChatRooms]);

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
    editMessage,
    deleteMessage,
    addReaction,
    removeReaction,
    setTypingStatus,
    pinMessage,
    unpinMessage,
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
