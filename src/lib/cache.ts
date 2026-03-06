// Cache Utility - Client-side caching system
// Provides in-memory and localStorage caching with TTL support

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class Cache {
  private memoryCache: Map<string, CacheItem<any>>;
  private localStoragePrefix: string;
  private defaultTTL: number;

  constructor(options: { localStoragePrefix?: string; defaultTTL?: number } = {}) {
    this.memoryCache = new Map();
    this.localStoragePrefix = options.localStoragePrefix || 'cms_cache_';
    this.defaultTTL = options.defaultTTL || 5 * 60 * 1000; // 5 minutes default

    // Clean up expired items periodically
    if (typeof window !== 'undefined') {
      setInterval(() => this.cleanup(), 60000); // Every minute
    }
  }

  // Set item in cache
  set<T>(key: string, data: T, ttl?: number): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    };

    // Store in memory
    this.memoryCache.set(key, item);

    // Store in localStorage for persistence
    try {
      localStorage.setItem(
        `${this.localStoragePrefix}${key}`,
        JSON.stringify(item)
      );
    } catch (e) {
      console.warn('Failed to write to localStorage:', e);
    }
  }

  // Get item from cache
  get<T>(key: string): T | null {
    // Check memory first
    const memItem = this.memoryCache.get(key);
    if (memItem && this.isValid(memItem)) {
      return memItem.data as T;
    }

    // Check localStorage
    try {
      const lsItem = localStorage.getItem(`${this.localStoragePrefix}${key}`);
      if (lsItem) {
        const item = JSON.parse(lsItem) as CacheItem<T>;
        if (this.isValid(item)) {
          // Restore to memory
          this.memoryCache.set(key, item);
          return item.data;
        } else {
          // Remove expired
          this.remove(key);
        }
      }
    } catch (e) {
      console.warn('Failed to read from localStorage:', e);
    }

    return null;
  }

  // Check if cache item is still valid
  private isValid<T>(item: CacheItem<T>): boolean {
    return Date.now() - item.timestamp < item.ttl;
  }

  // Remove item from cache
  remove(key: string): void {
    this.memoryCache.delete(key);
    try {
      localStorage.removeItem(`${this.localStoragePrefix}${key}`);
    } catch (e) {
      // Ignore
    }
  }

  // Clear all cache
  clear(): void {
    this.memoryCache.clear();
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.localStoragePrefix)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (e) {
      // Ignore
    }
  }

  // Clean up expired items
  private cleanup(): void {
    const now = Date.now();
    
    // Clean memory cache
    for (const [key, item] of this.memoryCache.entries()) {
      if (now - item.timestamp >= item.ttl) {
        this.memoryCache.delete(key);
      }
    }

    // Clean localStorage
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.localStoragePrefix)) {
          const itemStr = localStorage.getItem(key);
          if (itemStr) {
            const item = JSON.parse(itemStr) as CacheItem<any>;
            if (now - item.timestamp >= item.ttl) {
              keysToRemove.push(key);
            }
          }
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (e) {
      // Ignore
    }
  }

  // Invalidate cache by pattern
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    
    // Memory
    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        this.memoryCache.delete(key);
      }
    }

    // LocalStorage
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.localStoragePrefix) && regex.test(key)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (e) {
      // Ignore
    }
  }

  // Get cache statistics
  getStats(): { memorySize: number; hits: number; misses: number } {
    return {
      memorySize: this.memoryCache.size,
      hits: 0,
      misses: 0
    };
  }
}

// Create singleton instance
export const cache = new Cache({
  localStoragePrefix: 'famar_cms_',
  defaultTTL: 5 * 60 * 1000 // 5 minutes
});

// Cache keys
export const CACHE_KEYS = {
  POSTS: 'posts_list',
  POSTS_PAGE: (page: number) => `posts_page_${page}`,
  POST_DETAIL: (id: number) => `post_${id}`,
  CATEGORIES: 'categories_list',
  TAGS: 'tags_list',
  MEDIA_LIST: 'media_list',
  MEDIA_USAGE: (id: string) => `media_usage_${id}`,
  PAGES: 'pages_list',
  PAGE_DETAIL: (id: string) => `page_${id}`,
  STATS: 'dashboard_stats'
};

export default cache;
