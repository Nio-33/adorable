import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface NotificationSettings {
  pushEnabled: boolean;
  emailEnabled: boolean;
  messageNotifs: boolean;
  friendRequestNotifs: boolean;
  checkInNotifs: boolean;
  nearbyNotifs: boolean;
  reviewNotifs: boolean;
}

export interface PrivacySettings {
  locationSharing: boolean;
  profileVisibility: 'public' | 'friends' | 'private';
  activitySharing: boolean;
  onlineStatus: boolean;
}

export interface ThemeSettings {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  fontSize: 'small' | 'medium' | 'large';
}

export interface LanguageSettings {
  language: string;
  region: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
}

export interface SettingsState {
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  theme: ThemeSettings;
  language: LanguageSettings;
  isLoading: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  notifications: {
    pushEnabled: true,
    emailEnabled: true,
    messageNotifs: true,
    friendRequestNotifs: true,
    checkInNotifs: true,
    nearbyNotifs: true,
    reviewNotifs: true,
  },
  privacy: {
    locationSharing: true,
    profileVisibility: 'public',
    activitySharing: true,
    onlineStatus: true,
  },
  theme: {
    mode: 'system',
    primaryColor: '#007AFF',
    fontSize: 'medium',
  },
  language: {
    language: 'en',
    region: 'US',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
  },
  isLoading: false,
  error: null,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setNotificationSettings: (state, action: PayloadAction<Partial<NotificationSettings>>) => {
      state.notifications = { ...state.notifications, ...action.payload };
    },
    setPrivacySettings: (state, action: PayloadAction<Partial<PrivacySettings>>) => {
      state.privacy = { ...state.privacy, ...action.payload };
    },
    setThemeSettings: (state, action: PayloadAction<Partial<ThemeSettings>>) => {
      state.theme = { ...state.theme, ...action.payload };
    },
    setLanguageSettings: (state, action: PayloadAction<Partial<LanguageSettings>>) => {
      state.language = { ...state.language, ...action.payload };
    },
    resetSettings: (state) => {
      state.notifications = initialState.notifications;
      state.privacy = initialState.privacy;
      state.theme = initialState.theme;
      state.language = initialState.language;
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
  setNotificationSettings,
  setPrivacySettings,
  setThemeSettings,
  setLanguageSettings,
  resetSettings,
  setLoading,
  setError,
} = settingsSlice.actions;

export const settingsReducer = settingsSlice.reducer;
