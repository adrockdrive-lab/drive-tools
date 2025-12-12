'use client';

// 클라이언트 사이드 캐싱 유틸리티

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of items
}

export class ClientCache {
  private cache = new Map<string, CacheItem<any>>();
  private readonly defaultTtl: number;
  private readonly maxSize: number;

  constructor({ ttl = 5 * 60 * 1000, maxSize = 100 }: CacheOptions = {}) {
    this.defaultTtl = ttl;
    this.maxSize = maxSize;
  }

  set<T>(key: string, data: T, ttl?: number): void {
    // 최대 크기 초과시 오래된 항목 제거
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTtl,
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // TTL 체크
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // 만료된 항목들을 정리
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // 캐시 상태 정보
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// 전역 캐시 인스턴스들
export const userCache = new ClientCache({ ttl: 10 * 60 * 1000 }); // 10분
export const missionCache = new ClientCache({ ttl: 5 * 60 * 1000 }); // 5분
export const statisticsCache = new ClientCache({ ttl: 2 * 60 * 1000 }); // 2분
export const fileCache = new ClientCache({ ttl: 15 * 60 * 1000 }); // 15분

// 캐시된 API 호출 래퍼
export function withCache<T>(
  cache: ClientCache,
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> {
  const cached = cache.get<T>(key);
  
  if (cached !== null) {
    return Promise.resolve(cached);
  }

  return fetcher().then(data => {
    cache.set(key, data, ttl);
    return data;
  });
}

// React Hook for cached data
import { useState, useEffect } from 'react';

export function useCachedData<T>(
  cache: ClientCache,
  key: string,
  fetcher: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const cached = cache.get<T>(key);
    
    if (cached !== null) {
      setData(cached);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetcher()
      .then(result => {
        cache.set(key, result);
        setData(result);
        setError(null);
      })
      .catch(err => {
        setError(err);
        setData(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, dependencies);

  return { data, loading, error };
}

// LocalStorage 기반 지속성 캐시
export class PersistentCache {
  private prefix: string;
  private ttl: number;

  constructor(prefix: string = 'cache_', ttl: number = 24 * 60 * 60 * 1000) {
    this.prefix = prefix;
    this.ttl = ttl;
  }

  set<T>(key: string, data: T, ttl?: number): void {
    if (typeof window === 'undefined') return;

    const item = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.ttl,
    };

    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(item));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }

  get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;

    try {
      const item = localStorage.getItem(this.prefix + key);
      if (!item) return null;

      const parsed = JSON.parse(item);
      
      // TTL 체크
      if (Date.now() - parsed.timestamp > parsed.ttl) {
        localStorage.removeItem(this.prefix + key);
        return null;
      }

      return parsed.data;
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
      return null;
    }
  }

  delete(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.prefix + key);
  }

  clear(): void {
    if (typeof window === 'undefined') return;
    
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
  }
}

// 사용자 설정용 지속성 캐시
export const userSettingsCache = new PersistentCache('user_settings_', 7 * 24 * 60 * 60 * 1000); // 7일

// SWR 스타일 캐시 무효화
export class CacheInvalidator {
  private static listeners = new Map<string, Set<() => void>>();

  static subscribe(key: string, callback: () => void) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(callback);

    return () => {
      this.listeners.get(key)?.delete(callback);
    };
  }

  static invalidate(key: string) {
    // 캐시에서 삭제
    userCache.delete(key);
    missionCache.delete(key);
    statisticsCache.delete(key);
    fileCache.delete(key);

    // 리스너들에게 알림
    this.listeners.get(key)?.forEach(callback => callback());
  }

  static invalidatePattern(pattern: string) {
    const regex = new RegExp(pattern);
    
    [userCache, missionCache, statisticsCache, fileCache].forEach(cache => {
      const stats = cache.getStats();
      stats.keys.forEach(key => {
        if (regex.test(key)) {
          cache.delete(key);
        }
      });
    });

    // 패턴에 맞는 리스너들에게 알림
    this.listeners.forEach((callbacks, key) => {
      if (regex.test(key)) {
        callbacks.forEach(callback => callback());
      }
    });
  }
}

// 자동 캐시 정리 (5분마다)
if (typeof window !== 'undefined') {
  setInterval(() => {
    userCache.cleanup();
    missionCache.cleanup();
    statisticsCache.cleanup();
    fileCache.cleanup();
  }, 5 * 60 * 1000);
}