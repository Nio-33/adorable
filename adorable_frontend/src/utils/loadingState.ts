import { useState, useCallback, useRef, useEffect } from 'react';
import { Animated } from 'react-native';

export interface LoadingState {
  isLoading: boolean;
  error: Error | null;
  progress: number;
}

export interface UseLoadingOptions {
  initialState?: boolean;
  withAnimation?: boolean;
  animationDuration?: number;
}

export function useLoading(options: UseLoadingOptions = {}) {
  const {
    initialState = false,
    withAnimation = true,
    animationDuration = 300,
  } = options;

  const [state, setState] = useState<LoadingState>({
    isLoading: initialState,
    error: null,
    progress: 0,
  });

  const animation = useRef(new Animated.Value(0)).current;

  const startLoading = useCallback(() => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    if (withAnimation) {
      Animated.timing(animation, {
        toValue: 1,
        duration: animationDuration,
        useNativeDriver: true,
      }).start();
    }
  }, [animation, animationDuration, withAnimation]);

  const stopLoading = useCallback((error?: Error) => {
    setState(prev => ({ ...prev, isLoading: false, error: error || null }));
    if (withAnimation) {
      Animated.timing(animation, {
        toValue: 0,
        duration: animationDuration,
        useNativeDriver: true,
      }).start();
    }
  }, [animation, animationDuration, withAnimation]);

  const updateProgress = useCallback((progress: number) => {
    setState(prev => ({ ...prev, progress: Math.min(1, Math.max(0, progress)) }));
  }, []);

  const withLoadingState = useCallback(async <T>(
    action: () => Promise<T>,
    options: { showProgress?: boolean } = {}
  ): Promise<T> => {
    const { showProgress = false } = options;
    try {
      startLoading();
      if (showProgress) {
        updateProgress(0);
      }
      const result = await action();
      if (showProgress) {
        updateProgress(1);
      }
      stopLoading();
      return result;
    } catch (error) {
      stopLoading(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }, [startLoading, stopLoading, updateProgress]);

  const opacity = animation;
  const scale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1],
  });

  return {
    ...state,
    startLoading,
    stopLoading,
    updateProgress,
    withLoadingState,
    animation: {
      opacity,
      scale,
      style: {
        opacity,
        transform: [{ scale }],
      },
    },
  };
}

export function useLoadingDebounce(delay: number = 300) {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const [isLoading, setIsLoading] = useState(false);

  const debouncedSetLoading = useCallback((loading: boolean) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (loading) {
      timeoutRef.current = setTimeout(() => {
        setIsLoading(true);
      }, delay);
    } else {
      setIsLoading(false);
    }
  }, [delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isLoading,
    setLoading: debouncedSetLoading,
  };
}

export function useLoadingRetry(maxRetries: number = 3, delay: number = 1000) {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const retry = useCallback(async <T>(action: () => Promise<T>): Promise<T> => {
    try {
      setIsRetrying(true);
      const result = await action();
      setRetryCount(0);
      setIsRetrying(false);
      return result;
    } catch (error) {
      if (retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
        await new Promise(resolve => setTimeout(resolve, delay * (retryCount + 1)));
        return retry(action);
      }
      setIsRetrying(false);
      throw error;
    }
  }, [retryCount, maxRetries, delay]);

  return {
    retry,
    retryCount,
    isRetrying,
    hasRetriesLeft: retryCount < maxRetries,
  };
}
