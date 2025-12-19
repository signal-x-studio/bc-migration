/**
 * Rate Limiter for BigCommerce API
 *
 * BC API Limits: 150 requests per 30 seconds (sliding window)
 * Uses Bottleneck for rate limiting with automatic queuing
 */

import Bottleneck from 'bottleneck';
import { logger } from './logger.js';

// BC API: 150 requests per 30 seconds
// We use slightly conservative limits to avoid hitting the wall
const BC_REQUESTS_PER_WINDOW = 140; // Leave some headroom
const BC_WINDOW_MS = 30000; // 30 seconds

/**
 * Configured rate limiter for BigCommerce API calls
 */
export const bcRateLimiter = new Bottleneck({
  reservoir: BC_REQUESTS_PER_WINDOW,
  reservoirRefreshAmount: BC_REQUESTS_PER_WINDOW,
  reservoirRefreshInterval: BC_WINDOW_MS,
  maxConcurrent: 10, // Max concurrent requests
  minTime: 100, // Minimum time between requests (ms)
});

// Log when rate limit is being approached
bcRateLimiter.on('depleted', () => {
  logger.warn('Rate limit reservoir depleted, requests will be queued');
});

bcRateLimiter.on('error', (error) => {
  logger.error({ error }, 'Rate limiter error');
});

/**
 * Update reservoir based on API response headers
 * Call this after each BC API request to sync with actual limits
 */
export function updateRateLimitFromHeaders(headers: Record<string, string>): void {
  const requestsLeft = parseInt(headers['x-rate-limit-requests-left'] || '0', 10);
  const timeResetMs = parseInt(headers['x-rate-limit-time-reset-ms'] || '0', 10);

  if (requestsLeft > 0 && requestsLeft < 20) {
    logger.warn({ requestsLeft, timeResetMs }, 'Approaching rate limit');
  }

  // If we're very low, we could dynamically adjust the limiter
  // For now, just log the warning
}

/**
 * Wrap an async function with rate limiting
 */
export function withRateLimit<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  priority: number = 5
): T {
  return ((...args: Parameters<T>) => {
    return bcRateLimiter.schedule({ priority }, () => fn(...args));
  }) as T;
}

/**
 * Get current rate limiter stats for monitoring
 */
export function getRateLimiterStats(): {
  running: number;
  queued: number;
} {
  const counts = bcRateLimiter.counts();
  return {
    running: counts.RUNNING,
    queued: counts.QUEUED,
  };
}

/**
 * Wait for all queued requests to complete
 */
export async function drainRateLimiter(): Promise<void> {
  await bcRateLimiter.stop({ dropWaitingJobs: false });
}
