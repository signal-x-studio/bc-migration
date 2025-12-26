/**
 * In-memory cache for WordPress API responses
 * Used to reduce API calls and improve performance
 */

interface CacheEntry<T> {
  data: T;
  expires: number;
}

const DEFAULT_TTL = 10 * 60 * 1000; // 10 minutes
const MAX_ENTRIES = 100; // LRU limit

class WPCache {
  private cache: Map<string, CacheEntry<unknown>>;
  private ttl: number;
  private accessOrder: string[]; // For LRU tracking

  constructor(ttl: number = DEFAULT_TTL) {
    this.cache = new Map();
    this.ttl = ttl;
    this.accessOrder = [];
  }

  /**
   * Generate a cache key from components
   */
  static key(siteUrl: string, type: string, ...parts: (string | number)[]): string {
    const normalizedUrl = siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
    return `${normalizedUrl}:${type}:${parts.join(':')}`;
  }

  /**
   * Get a cached value
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      this.accessOrder = this.accessOrder.filter(k => k !== key);
      return null;
    }

    // Update access order for LRU
    this.updateAccessOrder(key);

    return entry.data as T;
  }

  /**
   * Set a cached value
   */
  set<T>(key: string, data: T, customTtl?: number): void {
    // Evict oldest entries if at capacity
    while (this.cache.size >= MAX_ENTRIES) {
      const oldest = this.accessOrder.shift();
      if (oldest) {
        this.cache.delete(oldest);
      }
    }

    this.cache.set(key, {
      data,
      expires: Date.now() + (customTtl ?? this.ttl),
    });

    this.updateAccessOrder(key);
  }

  /**
   * Check if a key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete a specific key
   */
  delete(key: string): void {
    this.cache.delete(key);
    this.accessOrder = this.accessOrder.filter(k => k !== key);
  }

  /**
   * Clear all cached entries
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
  }

  /**
   * Clear entries for a specific site
   */
  clearSite(siteUrl: string): void {
    const normalizedUrl = siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const keysToDelete: string[] = [];

    for (const key of this.cache.keys()) {
      if (key.startsWith(normalizedUrl)) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.delete(key);
    }
  }

  /**
   * Get cache statistics
   */
  stats(): { size: number; maxSize: number; ttl: number } {
    return {
      size: this.cache.size,
      maxSize: MAX_ENTRIES,
      ttl: this.ttl,
    };
  }

  /**
   * Clean up expired entries
   */
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires) {
        this.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }

  private updateAccessOrder(key: string): void {
    this.accessOrder = this.accessOrder.filter(k => k !== key);
    this.accessOrder.push(key);
  }
}

// Singleton instance for the dashboard
export const wpCache = new WPCache();

// Export class for testing
export { WPCache };
