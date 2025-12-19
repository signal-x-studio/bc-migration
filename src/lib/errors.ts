/**
 * Custom error classes for migration operations
 *
 * Provides structured error handling with:
 * - Error categorization
 * - Retriability information
 * - Context preservation
 */

import type { AxiosError } from 'axios';

/**
 * Base class for all migration errors
 */
export class MigrationError extends Error {
  public readonly code: string;
  public readonly retriable: boolean;
  public readonly context?: Record<string, unknown>;
  public readonly timestamp: string;

  constructor(
    message: string,
    code: string,
    retriable: boolean = false,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'MigrationError';
    this.code = code;
    this.retriable = retriable;
    this.context = context;
    this.timestamp = new Date().toISOString();

    // Maintain proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      retriable: this.retriable,
      context: this.context,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }
}

/**
 * Rate limit exceeded error
 */
export class RateLimitError extends MigrationError {
  public readonly retryAfterMs?: number;

  constructor(message: string, retryAfterMs?: number, context?: Record<string, unknown>) {
    super(message, 'RATE_LIMIT_EXCEEDED', true, context);
    this.name = 'RateLimitError';
    this.retryAfterMs = retryAfterMs;
  }
}

/**
 * API error wrapping axios errors
 */
export class ApiError extends MigrationError {
  public readonly status?: number;
  public readonly url?: string;
  public readonly method?: string;
  public readonly responseData?: unknown;

  constructor(
    message: string,
    axiosError: AxiosError,
    context?: Record<string, unknown>
  ) {
    const status = axiosError.response?.status;
    const retriable = isRetriableStatus(status);

    super(message, `API_ERROR_${status || 'UNKNOWN'}`, retriable, context);
    this.name = 'ApiError';
    this.status = status;
    this.url = axiosError.config?.url;
    this.method = axiosError.config?.method?.toUpperCase();
    this.responseData = axiosError.response?.data;
  }

  static fromAxiosError(error: AxiosError, context?: Record<string, unknown>): ApiError {
    const status = error.response?.status;
    let message = error.message;

    // Extract more specific error message from response
    const data = error.response?.data as Record<string, unknown> | undefined;
    if (data) {
      if (typeof data.title === 'string') {
        message = data.title;
      } else if (typeof data.message === 'string') {
        message = data.message;
      } else if (Array.isArray(data.errors)) {
        message = data.errors.map((e: any) => e.message || e).join('; ');
      }
    }

    if (status === 429) {
      const retryAfter = parseInt(
        error.response?.headers?.['x-rate-limit-time-reset-ms'] ||
        error.response?.headers?.['retry-after'] ||
        '0',
        10
      );
      return new RateLimitError(message, retryAfter, context);
    }

    return new ApiError(message, error, context);
  }
}

/**
 * Validation error for data transformation issues
 */
export class ValidationError extends MigrationError {
  public readonly field?: string;
  public readonly value?: unknown;

  constructor(
    message: string,
    field?: string,
    value?: unknown,
    context?: Record<string, unknown>
  ) {
    super(message, 'VALIDATION_ERROR', false, context);
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;
  }
}

/**
 * Duplicate item error
 */
export class DuplicateError extends MigrationError {
  public readonly identifier: string;
  public readonly existingId?: number;

  constructor(
    message: string,
    identifier: string,
    existingId?: number,
    context?: Record<string, unknown>
  ) {
    super(message, 'DUPLICATE_ITEM', false, context);
    this.name = 'DuplicateError';
    this.identifier = identifier;
    this.existingId = existingId;
  }
}

/**
 * Configuration error
 */
export class ConfigurationError extends MigrationError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'CONFIGURATION_ERROR', false, context);
    this.name = 'ConfigurationError';
  }
}

/**
 * Connection error
 */
export class ConnectionError extends MigrationError {
  public readonly endpoint?: string;

  constructor(message: string, endpoint?: string, context?: Record<string, unknown>) {
    super(message, 'CONNECTION_ERROR', true, context);
    this.name = 'ConnectionError';
    this.endpoint = endpoint;
  }
}

/**
 * Check if an HTTP status code is retriable
 */
function isRetriableStatus(status?: number): boolean {
  if (!status) return true; // Network errors are retriable
  if (status === 429) return true; // Rate limited
  if (status >= 500 && status < 600) return true; // Server errors
  return false;
}

/**
 * Type guard to check if an error is a MigrationError
 */
export function isMigrationError(error: unknown): error is MigrationError {
  return error instanceof MigrationError;
}

/**
 * Type guard to check if an error is retriable
 */
export function isRetriableError(error: unknown): boolean {
  if (error instanceof MigrationError) {
    return error.retriable;
  }
  return false;
}

/**
 * Wrap any error as a MigrationError
 */
export function wrapError(error: unknown, context?: Record<string, unknown>): MigrationError {
  if (error instanceof MigrationError) {
    return error;
  }

  if (isAxiosError(error)) {
    return ApiError.fromAxiosError(error, context);
  }

  const message = error instanceof Error ? error.message : String(error);
  return new MigrationError(message, 'UNKNOWN_ERROR', false, context);
}

/**
 * Type guard for axios errors
 */
function isAxiosError(error: unknown): error is AxiosError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    (error as any).isAxiosError === true
  );
}
