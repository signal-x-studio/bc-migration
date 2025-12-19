import { describe, it, expect } from 'vitest';
import {
  MigrationError,
  RateLimitError,
  ApiError,
  ValidationError,
  DuplicateError,
  isMigrationError,
  isRetriableError,
  wrapError,
} from '../../lib/errors.js';

describe('error classes', () => {
  describe('MigrationError', () => {
    it('should create error with all properties', () => {
      const error = new MigrationError('Test error', 'TEST_CODE', true, { foo: 'bar' });

      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.retriable).toBe(true);
      expect(error.context).toEqual({ foo: 'bar' });
      expect(error.timestamp).toBeDefined();
    });

    it('should serialize to JSON correctly', () => {
      const error = new MigrationError('Test', 'CODE', false);
      const json = error.toJSON();

      expect(json.name).toBe('MigrationError');
      expect(json.code).toBe('CODE');
      expect(json.message).toBe('Test');
      expect(json.retriable).toBe(false);
    });
  });

  describe('RateLimitError', () => {
    it('should be retriable by default', () => {
      const error = new RateLimitError('Rate limited', 5000);

      expect(error.retriable).toBe(true);
      expect(error.retryAfterMs).toBe(5000);
      expect(error.code).toBe('RATE_LIMIT_EXCEEDED');
    });
  });

  describe('ValidationError', () => {
    it('should not be retriable', () => {
      const error = new ValidationError('Invalid data', 'sku', 'bad-sku');

      expect(error.retriable).toBe(false);
      expect(error.field).toBe('sku');
      expect(error.value).toBe('bad-sku');
    });
  });

  describe('DuplicateError', () => {
    it('should store identifier and existing ID', () => {
      const error = new DuplicateError('SKU exists', 'ABC123', 456);

      expect(error.identifier).toBe('ABC123');
      expect(error.existingId).toBe(456);
      expect(error.retriable).toBe(false);
    });
  });

  describe('isMigrationError', () => {
    it('should return true for MigrationError instances', () => {
      expect(isMigrationError(new MigrationError('test', 'CODE', false))).toBe(true);
      expect(isMigrationError(new RateLimitError('test'))).toBe(true);
      expect(isMigrationError(new ValidationError('test'))).toBe(true);
    });

    it('should return false for non-MigrationError', () => {
      expect(isMigrationError(new Error('test'))).toBe(false);
      expect(isMigrationError('string')).toBe(false);
      expect(isMigrationError(null)).toBe(false);
    });
  });

  describe('isRetriableError', () => {
    it('should return true for retriable errors', () => {
      expect(isRetriableError(new RateLimitError('test'))).toBe(true);
      expect(isRetriableError(new MigrationError('test', 'CODE', true))).toBe(true);
    });

    it('should return false for non-retriable errors', () => {
      expect(isRetriableError(new ValidationError('test'))).toBe(false);
      expect(isRetriableError(new Error('test'))).toBe(false);
    });
  });

  describe('wrapError', () => {
    it('should return MigrationError unchanged', () => {
      const original = new ValidationError('test');
      const wrapped = wrapError(original);

      expect(wrapped).toBe(original);
    });

    it('should wrap regular Error as MigrationError', () => {
      const original = new Error('regular error');
      const wrapped = wrapError(original);

      expect(wrapped).toBeInstanceOf(MigrationError);
      expect(wrapped.message).toBe('regular error');
      expect(wrapped.code).toBe('UNKNOWN_ERROR');
    });

    it('should wrap string as MigrationError', () => {
      const wrapped = wrapError('string error');

      expect(wrapped).toBeInstanceOf(MigrationError);
      expect(wrapped.message).toBe('string error');
    });
  });
});
