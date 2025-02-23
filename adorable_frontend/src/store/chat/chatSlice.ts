import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserProfile } from '../user/userSlice';
import { Location, Place } from '../place/placeSlice';

export type MessageType = 'text' | 'image' | 'location' | 'place';

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  type: MessageType;
  content: string;
  metadata?: {
    location?: Location;
    place?: Place;
    imageUrl?: string;
    imageWidth?: number;
    imageHeight?: number;
  };
  createdAt: string;
  readBy: string[];
}

export interface Chat {
  id: string;
  participants: UserProfile[];
  lastMessage: Message | null;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatState {
  chats: Chat[];
  selectedChat: Chat | null;
  messages: Record<string, Message[]>;
  isLoading: boolean;
  error: string | null;
  typingUsers: Record<string, string[]>;
}

const initialState: ChatState = {
  chats: [],
  selectedChat: null,
  messages: {},
  isLoading: false,
  error: null,
  typingUsers: {},
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setChats: (state, action: PayloadAction<Chat[]>) => {
      state.chats = action.payload;
    },
    addChat: (state, action: PayloadAction<Chat>) => {
      state.chats.push(action.payload);
    },
    updateChat: (state, action: PayloadAction<Chat>) => {
      const index = state.chats.findIndex(chat => chat.id === action.payload.id);
      if (index !== -1) {
        state.chats[index] = action.payload;
        if (state.selectedChat?.id === action.payload.id) {
          state.selectedChat = action.payload;
        }
      }
    },
    setSelectedChat: (state, action: PayloadAction<Chat | null>) => {
      state.selectedChat = action.payload;
    },
    setMessages: (state, action: PayloadAction<{ chatId: string; messages: Message[] }>) => {
      state.messages[action.payload.chatId] = action.payload.messages;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      const { chatId } = action.payload;
      if (!state.messages[chatId]) {
        state.messages[chatId] = [];
      }
      state.messages[chatId].push(action.payload);

      // Update last message and unread count in chat
      const chatIndex = state.chats.findIndex(chat => chat.id === chatId);
      if (chatIndex !== -1) {
        state.chats[chatIndex].lastMessage = action.payload;
        if (state.chats[chatIndex].participants.some(p => !action.payload.readBy.includes(p.id))) {
          state.chats[chatIndex].unreadCount += 1;
        }
      }
    },
    markMessagesAsRead: (state, action: PayloadAction<{ chatId: string; userId: string }>) => {
      const { chatId, userId } = action.payload;
      if (state.messages[chatId]) {
        state.messages[chatId].forEach(message => {
          if (!message.readBy.includes(userId)) {
            message.readBy.push(userId);
          }
        });
      }

      const chatIndex = state.chats.findIndex(chat => chat.id === chatId);
      if (chatIndex !== -1) {
        state.chats[chatIndex].unreadCount = 0;
      }
    },
    setTypingUsers: (state, action: PayloadAction<{ chatId: string; users: string[] }>) => {
      state.typingUsers[action.payload.chatId] = action.payload.users;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

export const {
  setChats,
  addChat,
  updateChat,
  setSelectedChat,
  setMessages,
  addMessage,
  markMessagesAsRead,
  setTypingUsers,
  setLoading,
  setError,
} = chatSlice.actions;

export const chatReducer = chatSlice.reducer;
