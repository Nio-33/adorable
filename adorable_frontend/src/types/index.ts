// User related types
export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Authentication types
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
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

// Chat related types
export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'image' | 'location';
  timestamp: Date;
  read: boolean;
}

export interface ChatRoom {
  id: string;
  participants: string[];
  lastMessage?: Message;
  updatedAt: Date;
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