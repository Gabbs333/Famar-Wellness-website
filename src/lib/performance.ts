// Performance Monitoring Utility
// Tracks and logs performance metrics for the CMS

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

interface PerformanceStats {
  count: number;
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric[]>;
  private currentMetrics: Map<string, PerformanceMetric>;

  constructor() {
    this.metrics = new Map();
    this.currentMetrics = new Map();

    // Initialize Web Vitals monitoring
    if (typeof window !== 'undefined') {
      this.initWebVitals();
    }
  }

  // Start tracking a performance metric
  start(name: string, metadata?: Record<string, any>): void {
    this.currentMetrics.set(name, {
      name,
      startTime: performance.now(),
      metadata
    });
  }

  // End tracking a performance metric
  end(name: string): number | null {
    const metric = this.currentMetrics.get(name);
    if (!metric) {
      console.warn(`No start metric found for: ${name}`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - metric.startTime;

    const completedMetric: PerformanceMetric = {
      ...metric,
      endTime,
      duration
    };

    // Store in metrics history
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(completedMetric);

    // Keep only last 100 metrics per name
    const metrics = this.metrics.get(name)!;
    if (metrics.length > 100) {
      metrics.shift();
    }

    this.currentMetrics.delete(name);

    // Log in development
    if (import.meta.env.DEV) {
      console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  // Get statistics for a metric
  getStats(name: string): PerformanceStats | null {
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

  // Get all statistics
  getAllStats(): Record<string, PerformanceStats> {
    const stats: Record<string, PerformanceStats> = {};
    
    for (const name of this.metrics.keys()) {
      const stat = this.getStats(name);
      if (stat) {
        stats[name] = stat;
      }
    }

    return stats;
  }

  // Clear all metrics
  clear(): void {
    this.metrics.clear();
    this.currentMetrics.clear();
  }

  // Initialize Web Vitals monitoring
  private initWebVitals(): void {
    // Largest Contentful Paint (LCP)
    this.observeMetric('LCP', (entry) => {
      if (import.meta.env.DEV) {
        console.log('[Web Vitals] LCP:', entry.value, 'ms');
      }
    });

    // First Input Delay (FID)
    this.observeMetric('FID', (entry) => {
      if (import.meta.env.DEV) {
        console.log('[Web Vitals] FID:', entry.value, 'ms');
      }
    });

    // Cumulative Layout Shift (CLS)
    this.observeMetric('CLS', (entry) => {
      if (import.meta.env.DEV) {
        console.log('[Web Vitals] CLS:', entry.value);
      }
    });
  }

  // Observe a specific metric
  private observeMetric(name: string, callback: (entry: any) => void): void {
    if (typeof window === 'undefined') return;

    // @ts-ignore - web-vitals types may not be available
    if (window.webVitals?.getCLS || window.webVitals?.getFID || window.webVitals?.getLCP) {
      // Use web-vitals library if available
      return;
    }

    // Fallback: use PerformanceObserver
    try {
      const performanceEntryTypes: Record<string, string> = {
        LCP: 'largest-contentful-paint',
        FID: 'first-input',
        CLS: 'layout-shift'
      };

      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          callback(entry);
        }
      });

      observer.observe({ type: performanceEntryTypes[name as keyof typeof performanceEntryTypes], buffered: true });
    } catch (e) {
      // Not supported
    }
  }

  // Log page load performance
  logPageLoad(): void {
    if (typeof window === 'undefined') return;

    const timing = performance.timing;
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    if (navigation) {
      const metrics = {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.startTime,
        firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0,
        domInteractive: navigation.domInteractive - navigation.startTime
      };

      if (import.meta.env.DEV) {
        console.log('[Page Load]', metrics);
      }
    }
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Helper functions
export const measure = async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
  performanceMonitor.start(name);
  try {
    const result = await fn();
    return result;
  } finally {
    performanceMonitor.end(name);
  }
};

export const measureSync = <T>(name: string, fn: () => T): T => {
  performanceMonitor.start(name);
  try {
    return fn();
  } finally {
    performanceMonitor.end(name);
  }
};

export default performanceMonitor;
