export interface ChatUser {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
  isOnline?: boolean;
  lastSeen?: number;
  bio?: string;
  interests?: string[];
  location?: {
    latitude: number;
    longitude: number;
  };
}
