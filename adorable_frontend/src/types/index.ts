// User related types
export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  photoURL?: string;
  avatarUrl?: string;
  bio?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  createdAt: Date;
  updatedAt: Date;
  lastActive?: Date;
  isOnline: boolean;
  isTyping?: Record<string, boolean>; // chatRoomId -> isTyping
}

// Authentication types
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

// Chat related types
export interface MessageReaction {
  userId: string;
  type: '👍' | '❤️' | '😂' | '😮' | '😢' | '😡';
  createdAt: Date;
}

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'error';

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'image' | 'location';
  timestamp: Date;
  status: MessageStatus;
  reactions?: Record<string, MessageReaction>; // messageId -> reaction
  replyTo?: string; // ID of the message being replied to
  metadata?: {
    location?: {
      latitude: number;
      longitude: number;
    };
    imageUrl?: string;
    imageWidth?: number;
    imageHeight?: number;
  };
  editedAt?: Date;
  deletedAt?: Date;
}

export interface ChatRoom {
  id: string;
  participants: User[];
  lastMessage?: Message;
  updatedAt: Date;
  unreadCount?: Record<string, number>;
  typingUsers?: string[]; // Array of user IDs currently typing
  pinnedMessages?: string[]; // Array of pinned message IDs
}

// Place related types
export interface Place {
  id: string;
  name: string;
  description?: string;
  category: string;
  location: {
    latitude: number;
    longitude: number;
  };
  address: string;
  rating?: number;
  photos?: string[];
  reviews?: Review[];
  createdAt: string;
  updatedAt: string;
}

// Review type
export interface Review {
  id: string;
  placeId: string;
  userId: string;
  rating: number;
  comment?: string;
  photos?: string[];
  createdAt: string;
  updatedAt: string;
}

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Chat: { roomId: string };
  Profile: { userId: string };
  Place: { placeId: string };
  Settings: undefined;
};

// API Response types
export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}
