import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { Platform } from 'react-native';

export interface ErrorConfig {
  retry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  offlineQueue?: boolean;
}

export class AppError extends Error {
  code: string;
  retry?: boolean;

  constructor(message: string, code: string, retry: boolean = true) {
    super(message);
    this.code = code;
    this.retry = retry;
    this.name = 'AppError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network error occurred') {
    super(message, 'NETWORK_ERROR', true);
    this.name = 'NetworkError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication error occurred') {
    super(message, 'AUTH_ERROR', false);
    this.name = 'AuthenticationError';
  }
}

class OfflineQueue {
  private static instance: OfflineQueue;
  private queue: Array<{ action: () => Promise<any>; timestamp: number }>;

  private constructor() {
    this.queue = [];
  }

  static getInstance(): OfflineQueue {
    if (!OfflineQueue.instance) {
      OfflineQueue.instance = new OfflineQueue();
    }
    return OfflineQueue.instance;
  }

  add(action: () => Promise<any>): void {
    this.queue.push({
      action,
      timestamp: Date.now(),
    });
  }

  async processQueue(): Promise<void> {
    const currentQueue = [...this.queue];
    this.queue = [];

    for (const item of currentQueue) {
      try {
        await item.action();
      } catch (error) {
        console.error('Error processing queued action:', error);
        if (Date.now() - item.timestamp < 24 * 60 * 60 * 1000) { // 24 hours
          this.queue.push(item);
        }
      }
    }
  }
}

export const offlineQueue = OfflineQueue.getInstance();

export async function withErrorHandling<T>(
  action: () => Promise<T>,
  config: ErrorConfig = {}
): Promise<T> {
  const {
    retry = true,
    maxRetries = 3,
    retryDelay = 1000,
    offlineQueue: useOfflineQueue = true,
  } = config;

  let attempts = 0;

  const executeWithRetry = async (): Promise<T> => {
    try {
      const networkState = await NetInfo.fetch();

      if (!networkState.isConnected) {
        if (useOfflineQueue) {
          offlineQueue.add(() => action());
          throw new NetworkError('No internet connection. Action queued for later.');
        }
        throw new NetworkError('No internet connection');
      }

      return await action();
    } catch (error) {
      attempts++;

      if (error instanceof AppError && !error.retry) {
        throw error;
      }

      if (retry && attempts < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempts));
        return executeWithRetry();
      }

      throw error;
    }
  };

  return executeWithRetry();
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

// Network connectivity monitoring
let isConnected = true;

NetInfo.addEventListener((state: NetInfoState) => {
  const wasConnected = isConnected;
  isConnected = !!state.isConnected;

  if (!wasConnected && isConnected) {
    offlineQueue.processQueue().catch(console.error);
  }
});

// Platform-specific error handlers
export const platformSpecificHandler = Platform.select({
  ios: (error: Error) => {
    // iOS specific error handling
    console.error('iOS Error:', error);
  },
  android: (error: Error) => {
    // Android specific error handling
    console.error('Android Error:', error);
  },
  default: (error: Error) => {
    console.error('Error:', error);
  },
});
