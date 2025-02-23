import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Settings } from '../hooks/useSettings';

const SETTINGS_STORAGE_KEY = '@adorable/settings';

export class SettingsService {
  static async loadSettings(): Promise<Settings | null> {
    try {
      const settingsJson = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      return settingsJson ? JSON.parse(settingsJson) : null;
    } catch (error) {
      console.error('Error loading settings:', error);
      throw new Error('Failed to load settings from storage');
    }
  }

  static async saveSettings(settings: Settings): Promise<void> {
    try {
      const settingsJson = JSON.stringify(settings);
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, settingsJson);
    } catch (error) {
      console.error('Error saving settings:', error);
      throw new Error('Failed to save settings to storage');
    }
  }

  static async clearSettings(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SETTINGS_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing settings:', error);
      throw new Error('Failed to clear settings from storage');
    }
  }
} 