import { useState, useCallback } from 'react';

export interface PaginationState {
  page: number;
  limit: number;
  hasMore: boolean;
  loading: boolean;
  error: string | null;
}

export interface UsePaginationOptions {
  initialLimit?: number;
  loadingDelay?: number;
}

export function usePagination({ 
  initialLimit = 20, 
  loadingDelay = 500 
}: UsePaginationOptions = {}) {
  const [state, setState] = useState<PaginationState>({
    page: 1,
    limit: initialLimit,
    hasMore: true,
    loading: false,
    error: null,
  });

  const resetPagination = useCallback(() => {
    setState(prev => ({
      ...prev,
      page: 1,
      hasMore: true,
      error: null,
    }));
  }, []);

  const updateState = useCallback((updates: Partial<PaginationState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    ...state,
    resetPagination,
    updateState,
  };
}

export interface CacheConfig {
  maxAge: number;
  key: string;
}

class CacheManager {
  private static instance: CacheManager;
  private cache: Map<string, { data: any; timestamp: number }>;

  private constructor() {
    this.cache = new Map();
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  set(key: string, data: any, maxAge: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now() + maxAge,
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.timestamp) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }
}

export const cacheManager = CacheManager.getInstance();

export function withCache<T>(
  fetcher: () => Promise<T>,
  config: CacheConfig
): Promise<T> {
  const cached = cacheManager.get(config.key);
  if (cached) return Promise.resolve(cached);

  return fetcher().then(data => {
    cacheManager.set(config.key, data, config.maxAge);
    return data;
  });
}

export interface ListOptimizationOptions<T> {
  keyExtractor: (item: T) => string;
  getItemLayout?: (data: T[] | null, index: number) => {
    length: number;
    offset: number;
    index: number;
  };
  initialNumToRender?: number;
  maxToRenderPerBatch?: number;
  windowSize?: number;
}

export function getListOptimizationProps<T>({
  keyExtractor,
  getItemLayout,
  initialNumToRender = 10,
  maxToRenderPerBatch = 10,
  windowSize = 5,
}: ListOptimizationOptions<T>) {
  return {
    removeClippedSubviews: true,
    maxToRenderPerBatch,
    updateCellsBatchingPeriod: 50,
    initialNumToRender,
    windowSize,
    keyExtractor,
    getItemLayout,
  };
} 