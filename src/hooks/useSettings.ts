import { useState, useEffect, useCallback } from 'react';
import { SettingsService } from '../services/SettingsService';

export interface Settings {
  privacy: {
    locationSharing: boolean;
    profileVisibility: boolean;
    activitySharing: boolean;
    onlineStatus: boolean;
  };
  notifications: {
    pushEnabled: boolean;
    emailEnabled: boolean;
    messageNotifications: boolean;
    activityNotifications: boolean;
  };
  language: string;
  theme: 'light' | 'dark' | 'system';
}

interface UseSettingsReturn {
  settings: Settings;
  loading: boolean;
  error: Error | null;
  updatePrivacy: (updates: Partial<Settings['privacy']>) => Promise<void>;
  updateNotifications: (updates: Partial<Settings['notifications']>) => Promise<void>;
  updateLanguage: (language: string) => Promise<void>;
  updateTheme: (theme: Settings['theme']) => Promise<void>;
  resetSettings: () => Promise<void>;
}

const defaultSettings: Settings = {
  privacy: {
    locationSharing: false,
    profileVisibility: true,
    activitySharing: true,
    onlineStatus: true,
  },
  notifications: {
    pushEnabled: true,
    emailEnabled: true,
    messageNotifications: true,
    activityNotifications: true,
  },
  language: 'en',
  theme: 'system',
};

export const useSettings = (): UseSettingsReturn => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const savedSettings = await SettingsService.loadSettings();
      setSettings(savedSettings || defaultSettings);
      setError(null);
    } catch (err) {
      console.error('Error loading settings:', err);
      setError(err instanceof Error ? err : new Error('Failed to load settings'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updatePrivacy = async (updates: Partial<Settings['privacy']>) => {
    try {
      const updatedSettings = {
        ...settings,
        privacy: {
          ...settings.privacy,
          ...updates,
        },
      };
      await SettingsService.saveSettings(updatedSettings);
      setSettings(updatedSettings);
      setError(null);
    } catch (err) {
      console.error('Error updating privacy settings:', err);
      setError(err instanceof Error ? err : new Error('Failed to update privacy settings'));
      throw err;
    }
  };

  const updateNotifications = async (updates: Partial<Settings['notifications']>) => {
    try {
      const updatedSettings = {
        ...settings,
        notifications: {
          ...settings.notifications,
          ...updates,
        },
      };
      await SettingsService.saveSettings(updatedSettings);
      setSettings(updatedSettings);
      setError(null);
    } catch (err) {
      console.error('Error updating notification settings:', err);
      setError(err instanceof Error ? err : new Error('Failed to update notification settings'));
      throw err;
    }
  };

  const updateLanguage = async (language: string) => {
    try {
      const updatedSettings = {
        ...settings,
        language,
      };
      await SettingsService.saveSettings(updatedSettings);
      setSettings(updatedSettings);
      setError(null);
    } catch (err) {
      console.error('Error updating language:', err);
      setError(err instanceof Error ? err : new Error('Failed to update language'));
      throw err;
    }
  };

  const updateTheme = async (theme: Settings['theme']) => {
    try {
      const updatedSettings = {
        ...settings,
        theme,
      };
      await SettingsService.saveSettings(updatedSettings);
      setSettings(updatedSettings);
      setError(null);
    } catch (err) {
      console.error('Error updating theme:', err);
      setError(err instanceof Error ? err : new Error('Failed to update theme'));
      throw err;
    }
  };

  const resetSettings = async () => {
    try {
      await SettingsService.saveSettings(defaultSettings);
      setSettings(defaultSettings);
      setError(null);
    } catch (err) {
      console.error('Error resetting settings:', err);
      setError(err instanceof Error ? err : new Error('Failed to reset settings'));
      throw err;
    }
  };

  return {
    settings,
    loading,
    error,
    updatePrivacy,
    updateNotifications,
    updateLanguage,
    updateTheme,
    resetSettings,
  };
}; 