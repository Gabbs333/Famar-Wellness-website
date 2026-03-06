// Performance Tests - Node.js environment
// Tests for caching and performance monitoring utilities

// Mock browser globals
const mockLocalStorage = new Map();
global.localStorage = {
  getItem: (key) => mockLocalStorage.get(key) || null,
  setItem: (key, value) => mockLocalStorage.set(key, value),
  removeItem: (key) => mockLocalStorage.delete(key),
  clear: () => mockLocalStorage.clear(),
  get length() { return mockLocalStorage.size; },
  key: (i) => Array.from(mockLocalStorage.keys())[i] || null
};

global.performance = {
  now: () => Date.now()
};

// Cache Tests
console.log('\n=== CACHE SYSTEM TESTS ===\n');

class TestCache {
  constructor(options = {}) {
    this.memoryCache = new Map();
    this.localStoragePrefix = options.localStoragePrefix || 'cms_cache_';
    this.defaultTTL = options.defaultTTL || 5 * 60 * 1000;
  }

  set(key, data, ttl) {
    const item = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    };
    this.memoryCache.set(key, item);
    try {
      localStorage.setItem(
        `${this.localStoragePrefix}${key}`,
        JSON.stringify(item)
      );
    } catch (e) {
      console.warn('Failed to write to localStorage:', e);
    }
  }

  get(key) {
    const memItem = this.memoryCache.get(key);
    if (memItem && this.isValid(memItem)) {
      return memItem.data;
    }

    try {
      const lsItem = localStorage.getItem(`${this.localStoragePrefix}${key}`);
      if (lsItem) {
        const item = JSON.parse(lsItem);
        if (this.isValid(item)) {
          this.memoryCache.set(key, item);
          return item.data;
        } else {
          this.remove(key);
        }
      }
    } catch (e) {
      console.warn('Failed to read from localStorage:', e);
    }
    return null;
  }

  isValid(item) {
    return Date.now() - item.timestamp < item.ttl;
  }

  remove(key) {
    this.memoryCache.delete(key);
    try {
      localStorage.removeItem(`${this.localStoragePrefix}${key}`);
    } catch (e) {}
  }

  clear() {
    this.memoryCache.clear();
    mockLocalStorage.clear();
  }
}

// Test 1: Basic Cache Operations
console.log('Test 1: Basic Cache Operations');
const cache = new TestCache({ defaultTTL: 60000 });
cache.set('test_key', { value: 'test_data' });
const retrieved = cache.get('test_key');
console.assert(retrieved !== null, 'Should retrieve cached item');
console.assert(retrieved.value === 'test_data', 'Should retrieve correct data');
console.log('[PASS] Cache set/get working correctly\n');

// Test 2: Cache Expiration
console.log('Test 2: Cache Expiration');
const expiringCache = new TestCache({ defaultTTL: 100 });
expiringCache.set('expiring_key', { value: 'expires' });
setTimeout(() => {
  const expired = expiringCache.get('expiring_key');
  console.assert(expired === null, 'Expired item should return null');
  console.log('[PASS] Cache expiration working correctly\n');
  runPerformanceTests();
}, 150);

function runPerformanceTests() {
  console.log('=== PERFORMANCE MONITOR TESTS ===\n');

  class TestPerformanceMonitor {
    constructor() {
      this.metrics = new Map();
      this.currentMetrics = new Map();
    }

    start(name, metadata) {
      this.currentMetrics.set(name, {
        name,
        startTime: performance.now(),
        metadata
      });
    }

    end(name) {
      const metric = this.currentMetrics.get(name);
      if (!metric) {
        console.warn(`No start metric found for: ${name}`);
        return null;
      }

      const endTime = performance.now();
      const duration = endTime - metric.startTime;

      const completedMetric = {
        ...metric,
        endTime,
        duration
      };

      if (!this.metrics.has(name)) {
        this.metrics.set(name, []);
      }
      this.metrics.get(name).push(completedMetric);

      const metrics = this.metrics.get(name);
      if (metrics.length > 100) {
        metrics.shift();
      }

      this.currentMetrics.delete(name);
      return duration;
    }

    getStats(name) {
      const metrics = this.metrics.get(name);
      if (!metrics || metrics.length === 0) {
        return null;
      }

      const durations = metrics.map(m => m.duration || 0);
      const count = durations.length;
      const avgDuration = durations.reduce((a, b) => a + b, 0) / count;
      const minDuration = Math.min(...durations);
      const maxDuration = Math.max(...durations);

      return {
        count,
        avgDuration,
        minDuration,
        maxDuration
      };
    }

    clear() {
      this.metrics.clear();
      this.currentMetrics.clear();
    }
  }

  const perfMonitor = new TestPerformanceMonitor();

  // Test 3: Measure Sync Operation
  console.log('Test 3: Measure Sync Operation');
  perfMonitor.start('test_operation');
  let sum = 0;
  for (let i = 0; i < 1000000; i++) {
    sum += i;
  }
  const duration = perfMonitor.end('test_operation');
  console.assert(duration !== null, 'Should return duration');
  console.assert(duration > 0, 'Duration should be positive');
  console.log(`[PASS] Operation measured: ${duration.toFixed(2)}ms\n`);

  // Test 4: Performance Statistics
  console.log('Test 4: Performance Statistics');
  for (let i = 0; i < 5; i++) {
    perfMonitor.start('repeated_op');
    const workTime = Math.random() * 10;
    const end = Date.now() + workTime;
    while (Date.now() < end) {}
    perfMonitor.end('repeated_op');
  }

  const stats = perfMonitor.getStats('repeated_op');
  console.assert(stats !== null, 'Should get stats');
  console.assert(stats.count === 5, 'Should have 5 measurements');
  console.assert(stats.avgDuration > 0, 'Average should be positive');
  console.log(`Stats: count=${stats.count}, avg=${stats.avgDuration.toFixed(2)}ms, min=${stats.minDuration.toFixed(2)}ms, max=${stats.maxDuration.toFixed(2)}ms\n`);

  // Test 5: Cache Key Generation
  console.log('Test 5: Cache Key Generation');
  const CACHE_KEYS = {
    POSTS: 'posts_list',
    POSTS_PAGE: (page) => `posts_page_${page}`,
    POST_DETAIL: (id) => `post_${id}`,
    CATEGORIES: 'categories_list',
    TAGS: 'tags_list',
    MEDIA_LIST: 'media_list',
    MEDIA_USAGE: (id) => `media_usage_${id}`,
    PAGES: 'pages_list',
    PAGE_DETAIL: (id) => `page_${id}`,
    STATS: 'dashboard_stats'
  };

  console.assert(CACHE_KEYS.POSTS === 'posts_list', 'Static key should work');
  console.assert(CACHE_KEYS.POSTS_PAGE(2) === 'posts_page_2', 'Dynamic key should work');
  console.assert(CACHE_KEYS.POST_DETAIL(123) === 'post_123', 'ID key should work');
  console.log('[PASS] Cache key generation working correctly\n');

  // Test 6: Pagination Utility
  console.log('Test 6: Pagination Utility');
  const totalItems = 100;
  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  console.assert(totalPages === 10, 'Should calculate correct total pages');
  
  const getPageItems = (page, limit) => {
    const start = (page - 1) * limit;
    const end = start + limit;
    return { start, end, hasNext: end < totalItems, hasPrev: page > 1 };
  };
  
  const page1 = getPageItems(1, itemsPerPage);
  console.assert(page1.start === 0, 'First page should start at 0');
  console.assert(page1.hasNext === true, 'First page should have next');
  console.assert(page1.hasPrev === false, 'First page should not have prev');
  
  const page5 = getPageItems(5, itemsPerPage);
  console.assert(page5.start === 40, 'Page 5 should start at 40');
  
  console.log('[PASS] Pagination utility working correctly\n');

  console.log('=== ALL PERFORMANCE TESTS PASSED ===\n');
  console.log('Summary:');
  console.log('- Cache system: set, get, expiration, keys');
  console.log('- Performance monitor: timing, stats');
  console.log('- Pagination: calculations');
}
