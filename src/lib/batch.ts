/**
 * Batch processing utilities
 *
 * BigCommerce API supports batch operations (up to 10 items per request)
 * These utilities help efficiently process large datasets
 */

import { logger } from './logger.js';

/**
 * Split an array into chunks of specified size
 */
export function chunk<T>(array: T[], size: number): T[][] {
  if (size <= 0) {
    throw new Error('Chunk size must be greater than 0');
  }

  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Result of processing a single batch
 */
export interface BatchResult<T> {
  succeeded: T[];
  failed: { item: T; error: Error }[];
}

/**
 * Combined results from processing all batches
 */
export interface BatchProcessingResult<T, R> {
  totalProcessed: number;
  succeeded: R[];
  failed: { item: T; error: Error }[];
  duration: number;
}

/**
 * Process items in batches with a processor function
 *
 * @param items - Array of items to process
 * @param batchSize - Number of items per batch (default 10 for BC)
 * @param processor - Function that processes a batch and returns results
 * @param options - Additional options
 */
export async function processBatches<T, R>(
  items: T[],
  batchSize: number,
  processor: (batch: T[]) => Promise<R[]>,
  options: {
    /** Called after each batch completes */
    onBatchComplete?: (batchIndex: number, totalBatches: number, results: R[]) => void;
    /** Called when a batch fails */
    onBatchError?: (batchIndex: number, error: Error, batch: T[]) => void;
    /** Continue processing if a batch fails */
    continueOnError?: boolean;
    /** Context for logging */
    context?: string;
  } = {}
): Promise<BatchProcessingResult<T, R>> {
  const {
    onBatchComplete,
    onBatchError,
    continueOnError = true,
    context = 'batch',
  } = options;

  const batches = chunk(items, batchSize);
  const startTime = Date.now();

  const succeeded: R[] = [];
  const failed: { item: T; error: Error }[] = [];

  logger.info(
    { context, totalItems: items.length, batchCount: batches.length, batchSize },
    `Starting batch processing: ${items.length} items in ${batches.length} batches`
  );

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];

    try {
      const results = await processor(batch);
      succeeded.push(...results);

      if (onBatchComplete) {
        onBatchComplete(i, batches.length, results);
      }

      logger.debug(
        { context, batchIndex: i, batchSize: batch.length, resultsCount: results.length },
        `Batch ${i + 1}/${batches.length} completed`
      );
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      // Mark all items in batch as failed
      batch.forEach(item => {
        failed.push({ item, error: err });
      });

      if (onBatchError) {
        onBatchError(i, err, batch);
      }

      logger.error(
        { context, batchIndex: i, error: err.message },
        `Batch ${i + 1}/${batches.length} failed`
      );

      if (!continueOnError) {
        throw err;
      }
    }
  }

  const duration = Date.now() - startTime;

  logger.info(
    {
      context,
      totalProcessed: items.length,
      succeeded: succeeded.length,
      failed: failed.length,
      duration,
    },
    `Batch processing completed: ${succeeded.length} succeeded, ${failed.length} failed`
  );

  return {
    totalProcessed: items.length,
    succeeded,
    failed,
    duration,
  };
}

/**
 * Process items individually with concurrency control
 * Use this when batch API isn't available but you still want parallel processing
 */
export async function processWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  processor: (item: T) => Promise<R>,
  options: {
    onItemComplete?: (index: number, total: number, result: R) => void;
    onItemError?: (index: number, error: Error, item: T) => void;
    continueOnError?: boolean;
    context?: string;
  } = {}
): Promise<BatchProcessingResult<T, R>> {
  const {
    onItemComplete,
    onItemError,
    continueOnError = true,
    context = 'concurrent',
  } = options;

  const startTime = Date.now();
  const succeeded: R[] = [];
  const failed: { item: T; error: Error }[] = [];

  // Process items in concurrent batches
  const batches = chunk(items, concurrency);

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    const baseIndex = batchIndex * concurrency;

    const results = await Promise.allSettled(
      batch.map((item, i) => processor(item).then(result => ({ index: baseIndex + i, result })))
    );

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const itemIndex = baseIndex + i;
      const item = batch[i];

      if (result.status === 'fulfilled') {
        succeeded.push(result.value.result);
        if (onItemComplete) {
          onItemComplete(itemIndex, items.length, result.value.result);
        }
      } else {
        const error = result.reason instanceof Error ? result.reason : new Error(String(result.reason));
        failed.push({ item, error });

        if (onItemError) {
          onItemError(itemIndex, error, item);
        }

        if (!continueOnError) {
          throw error;
        }
      }
    }
  }

  const duration = Date.now() - startTime;

  return {
    totalProcessed: items.length,
    succeeded,
    failed,
    duration,
  };
}
