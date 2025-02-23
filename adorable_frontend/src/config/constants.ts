export const APP_CONFIG = {
  APP_NAME: 'Adorable',
  VERSION: '1.0.0',
};

export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000',
  TIMEOUT: 10000, // 10 seconds
};

export const FIREBASE_CONFIG = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const MAPBOX_CONFIG = {
  accessToken: process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN,
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: '@adorable_auth_token',
  USER_DATA: '@adorable_user_data',
  SETTINGS: '@adorable_settings',
};

export const DEFAULT_LOCATION = {
  latitude: 37.7749,
  longitude: -122.4194,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export const PLACE_CATEGORIES = [
  'Restaurant',
  'Cafe',
  'Park',
  'Museum',
  'Shopping',
  'Entertainment',
  'Sports',
  'Other',
] as const;

export const NOTIFICATION_TYPES = {
  CHAT: 'CHAT',
  LIKE: 'LIKE',
  COMMENT: 'COMMENT',
  FOLLOW: 'FOLLOW',
  SYSTEM: 'SYSTEM',
} as const;

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  AUTH_ERROR: 'Authentication failed. Please try again.',
  PERMISSION_DENIED: 'Permission denied. Please check your settings.',
  LOCATION_ERROR: 'Unable to get location. Please enable location services.',
  GENERAL_ERROR: 'Something went wrong. Please try again later.',
}; 