import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export enum HapticFeedbackType {
  Light = 'light',
  Medium = 'medium',
  Heavy = 'heavy',
  Success = 'success',
  Warning = 'warning',
  Error = 'error',
  Selection = 'selection',
}

class HapticFeedback {
  private static instance: HapticFeedback;
  private isEnabled: boolean = true;

  private constructor() {}

  static getInstance(): HapticFeedback {
    if (!HapticFeedback.instance) {
      HapticFeedback.instance = new HapticFeedback();
    }
    return HapticFeedback.instance;
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  async trigger(type: HapticFeedbackType): Promise<void> {
    if (!this.isEnabled || Platform.OS === 'web') {
      return;
    }

    try {
      switch (type) {
        case HapticFeedbackType.Light:
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case HapticFeedbackType.Medium:
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case HapticFeedbackType.Heavy:
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case HapticFeedbackType.Success:
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case HapticFeedbackType.Warning:
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case HapticFeedbackType.Error:
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        case HapticFeedbackType.Selection:
          await Haptics.selectionAsync();
          break;
      }
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  // Convenience methods for common haptic patterns
  async success(): Promise<void> {
    await this.trigger(HapticFeedbackType.Success);
  }

  async error(): Promise<void> {
    await this.trigger(HapticFeedbackType.Error);
  }

  async warning(): Promise<void> {
    await this.trigger(HapticFeedbackType.Warning);
  }

  async light(): Promise<void> {
    await this.trigger(HapticFeedbackType.Light);
  }

  async medium(): Promise<void> {
    await this.trigger(HapticFeedbackType.Medium);
  }

  async heavy(): Promise<void> {
    await this.trigger(HapticFeedbackType.Heavy);
  }

  async selection(): Promise<void> {
    await this.trigger(HapticFeedbackType.Selection);
  }
}

export const haptics = HapticFeedback.getInstance();

// React hook for haptic feedback
import { useCallback } from 'react';

export function useHapticFeedback() {
  const triggerHaptic = useCallback((type: HapticFeedbackType) => {
    haptics.trigger(type);
  }, []);

  return {
    triggerHaptic,
    success: useCallback(() => haptics.success(), []),
    error: useCallback(() => haptics.error(), []),
    warning: useCallback(() => haptics.warning(), []),
    light: useCallback(() => haptics.light(), []),
    medium: useCallback(() => haptics.medium(), []),
    heavy: useCallback(() => haptics.heavy(), []),
    selection: useCallback(() => haptics.selection(), []),
  };
}
