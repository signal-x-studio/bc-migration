import { describe, it, expect, vi } from 'vitest';
import { chunk, processBatches, processWithConcurrency } from '../../lib/batch.js';

describe('batch utilities', () => {
  describe('chunk', () => {
    it('should split array into chunks of specified size', () => {
      const items = [1, 2, 3, 4, 5, 6, 7];
      const result = chunk(items, 3);

      expect(result).toEqual([[1, 2, 3], [4, 5, 6], [7]]);
    });

    it('should return single chunk if array is smaller than size', () => {
      const items = [1, 2];
      const result = chunk(items, 5);

      expect(result).toEqual([[1, 2]]);
    });

    it('should return empty array for empty input', () => {
      const result = chunk([], 3);

      expect(result).toEqual([]);
    });

    it('should throw error for invalid chunk size', () => {
      expect(() => chunk([1, 2, 3], 0)).toThrow('Chunk size must be greater than 0');
      expect(() => chunk([1, 2, 3], -1)).toThrow('Chunk size must be greater than 0');
    });
  });

  describe('processBatches', () => {
    it('should process all items in batches', async () => {
      const items = [1, 2, 3, 4, 5];
      const processor = vi.fn(async (batch: number[]) => batch.map(n => n * 2));

      const result = await processBatches(items, 2, processor);

      expect(result.totalProcessed).toBe(5);
      expect(result.succeeded).toEqual([2, 4, 6, 8, 10]);
      expect(result.failed).toEqual([]);
      expect(processor).toHaveBeenCalledTimes(3); // [1,2], [3,4], [5]
    });

    it('should continue processing on error when continueOnError is true', async () => {
      const items = [1, 2, 3, 4];
      const processor = vi.fn(async (batch: number[]) => {
        if (batch.includes(2)) {
          throw new Error('Batch failed');
        }
        return batch.map(n => n * 2);
      });

      const result = await processBatches(items, 2, processor, { continueOnError: true });

      expect(result.succeeded).toEqual([6, 8]); // Only second batch succeeded
      expect(result.failed.length).toBe(2); // First batch items failed
    });

    it('should stop processing on error when continueOnError is false', async () => {
      const items = [1, 2, 3, 4];
      const processor = vi.fn(async (batch: number[]) => {
        if (batch.includes(1)) {
          throw new Error('Batch failed');
        }
        return batch.map(n => n * 2);
      });

      await expect(
        processBatches(items, 2, processor, { continueOnError: false })
      ).rejects.toThrow('Batch failed');

      expect(processor).toHaveBeenCalledTimes(1);
    });

    it('should call onBatchComplete callback', async () => {
      const items = [1, 2, 3];
      const onBatchComplete = vi.fn();
      const processor = async (batch: number[]) => batch;

      await processBatches(items, 2, processor, { onBatchComplete });

      expect(onBatchComplete).toHaveBeenCalledTimes(2);
      expect(onBatchComplete).toHaveBeenCalledWith(0, 2, [1, 2]);
      expect(onBatchComplete).toHaveBeenCalledWith(1, 2, [3]);
    });
  });

  describe('processWithConcurrency', () => {
    it('should process items with concurrency limit', async () => {
      const items = [1, 2, 3, 4, 5];
      const processor = vi.fn(async (n: number) => n * 2);

      const result = await processWithConcurrency(items, 2, processor);

      expect(result.totalProcessed).toBe(5);
      expect(result.succeeded.sort((a, b) => a - b)).toEqual([2, 4, 6, 8, 10]);
      expect(result.failed).toEqual([]);
    });

    it('should handle individual item failures', async () => {
      const items = [1, 2, 3];
      const processor = vi.fn(async (n: number) => {
        if (n === 2) throw new Error('Item failed');
        return n * 2;
      });

      const result = await processWithConcurrency(items, 3, processor, { continueOnError: true });

      expect(result.succeeded).toContain(2);
      expect(result.succeeded).toContain(6);
      expect(result.failed.length).toBe(1);
      expect(result.failed[0].item).toBe(2);
    });
  });
});
