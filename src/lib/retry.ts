/**
 * Retry utility with exponential backoff
 *
 * Handles transient failures gracefully:
 * - 429 Too Many Requests (rate limited)
 * - 5xx Server Errors
 * - Network timeouts
 */

import pRetry, { AbortError } from 'p-retry';
import type { AxiosError } from 'axios';
import { logger } from './logger.js';

export interface RetryOptions {
  /** Maximum number of retry attempts */
  retries?: number;
  /** Base delay in milliseconds (doubles each retry) */
  minTimeout?: number;
  /** Maximum delay in milliseconds */
  maxTimeout?: number;
  /** Multiplier for exponential backoff */
  factor?: number;
  /** Whether to add random jitter to delays */
  randomize?: boolean;
  /** Custom function to determine if error is retriable */
  shouldRetry?: (error: unknown) => boolean;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  retries: 3,
  minTimeout: 1000,
  maxTimeout: 30000,
  factor: 2,
  randomize: true,
  shouldRetry: isRetriableError,
};

/**
 * Determine if an error is retriable
 */
export function isRetriableError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const axiosError = error as AxiosError;

  // Network errors (no response)
  if (axiosError.code === 'ECONNRESET' ||
      axiosError.code === 'ETIMEDOUT' ||
      axiosError.code === 'ECONNABORTED') {
    return true;
  }

  const status = axiosError.response?.status;

  if (!status) {
    // No response - likely network error
    return true;
  }

  // Rate limited - always retry
  if (status === 429) {
    return true;
  }

  // Server errors - retry
  if (status >= 500 && status < 600) {
    return true;
  }

  // Client errors (4xx except 429) - don't retry
  // These are usually permanent failures (bad data, auth issues, etc.)
  return false;
}

/**
 * Get retry delay from rate limit headers if available
 */
export function getRetryAfterMs(error: unknown): number | null {
  const axiosError = error as AxiosError;

  // Check Retry-After header (standard)
  const retryAfter = axiosError.response?.headers?.['retry-after'];
  if (retryAfter) {
    const seconds = parseInt(retryAfter, 10);
    if (!isNaN(seconds)) {
      return seconds * 1000;
    }
  }

  // Check BC-specific header
  const resetMs = axiosError.response?.headers?.['x-rate-limit-time-reset-ms'];
  if (resetMs) {
    const ms = parseInt(resetMs, 10);
    if (!isNaN(ms)) {
      return ms;
    }
  }

  return null;
}

/**
 * Execute a function with automatic retry on transient failures
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
  context?: string
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return pRetry(
    async () => {
      try {
        return await fn();
      } catch (error) {
        // Check if we should retry
        if (!opts.shouldRetry(error)) {
          // Wrap in AbortError to prevent retry
          throw new AbortError(error instanceof Error ? error.message : String(error));
        }

        // Log the retry attempt
        const axiosError = error as AxiosError;
        const status = axiosError.response?.status;

        logger.warn(
          {
            context,
            status,
            code: axiosError.code,
            message: axiosError.message,
          },
          'Retriable error encountered, will retry'
        );

        throw error;
      }
    },
    {
      retries: opts.retries,
      minTimeout: opts.minTimeout,
      maxTimeout: opts.maxTimeout,
      factor: opts.factor,
      randomize: opts.randomize,
      onFailedAttempt: (error) => {
        const retryAfterMs = getRetryAfterMs(error);

        logger.info(
          {
            context,
            attempt: error.attemptNumber,
            retriesLeft: error.retriesLeft,
            retryAfterMs,
          },
          `Retry attempt ${error.attemptNumber} of ${opts.retries}`
        );
      },
    }
  );
}

/**
 * Create a retry-wrapped version of an async function
 */
export function createRetryable<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: RetryOptions = {},
  contextFn?: (...args: Parameters<T>) => string
): T {
  return ((...args: Parameters<T>) => {
    const context = contextFn ? contextFn(...args) : fn.name || 'anonymous';
    return withRetry(() => fn(...args), options, context);
  }) as T;
}
