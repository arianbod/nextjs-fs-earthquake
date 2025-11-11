/**
 * In-Memory Rate Limit Cache
 * Fast in-memory caching for rate limit counters
 * Falls back to database for persistence
 */

/**
 * Simple in-memory cache with TTL
 */
class RateLimitCache {
  constructor() {
    this.cache = new Map();
    this.cleanupInterval = null;

    // Start cleanup interval (every 5 minutes)
    this.startCleanup();
  }

  /**
   * Generates cache key for rate limit
   * @param {string} appId - Application ID
   * @param {Date} windowStart - Window start time
   * @param {string} windowType - 'hour' or 'day'
   * @returns {string} - Cache key
   */
  generateKey(appId, windowStart, windowType) {
    const timestamp = windowStart.toISOString();
    return `${appId}:${windowType}:${timestamp}`;
  }

  /**
   * Gets rate limit count from cache
   * @returns {Object|null} - { count: number, expiresAt: Date } or null
   */
  get(appId, windowStart, windowType) {
    const key = this.generateKey(appId, windowStart, windowType);
    const cached = this.cache.get(key);

    if (!cached) {
      return null;
    }

    // Check if expired
    if (cached.expiresAt < new Date()) {
      this.cache.delete(key);
      return null;
    }

    return cached;
  }

  /**
   * Sets rate limit count in cache
   */
  set(appId, windowStart, windowType, count, expiresAt) {
    const key = this.generateKey(appId, windowStart, windowType);
    this.cache.set(key, {
      count,
      expiresAt: expiresAt instanceof Date ? expiresAt : new Date(expiresAt)
    });
  }

  /**
   * Increments rate limit counter
   * @returns {number} - New count
   */
  increment(appId, windowStart, windowType, expiresAt) {
    const cached = this.get(appId, windowStart, windowType);

    if (!cached) {
      this.set(appId, windowStart, windowType, 1, expiresAt);
      return 1;
    }

    const newCount = cached.count + 1;
    this.set(appId, windowStart, windowType, newCount, cached.expiresAt);
    return newCount;
  }

  /**
   * Clears expired entries from cache
   */
  cleanup() {
    const now = new Date();
    let cleaned = 0;

    for (const [key, value] of this.cache.entries()) {
      if (value.expiresAt < now) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`Cleaned ${cleaned} expired rate limit entries from cache`);
    }
  }

  /**
   * Starts automatic cleanup interval
   */
  startCleanup() {
    if (this.cleanupInterval) {
      return;
    }

    // Run cleanup every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Stops automatic cleanup
   */
  stopCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Clears entire cache
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Gets cache stats
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Singleton instance
let cacheInstance = null;

/**
 * Gets the rate limit cache instance
 */
export function getRateLimitCache() {
  if (!cacheInstance) {
    cacheInstance = new RateLimitCache();
  }
  return cacheInstance;
}

/**
 * Clears the cache instance
 */
export function clearRateLimitCache() {
  if (cacheInstance) {
    cacheInstance.clear();
  }
}

/**
 * Stops cache cleanup interval
 */
export function stopRateLimitCache() {
  if (cacheInstance) {
    cacheInstance.stopCleanup();
  }
}

export default getRateLimitCache;
