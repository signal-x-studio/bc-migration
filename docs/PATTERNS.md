# Code Patterns

This document defines canonical patterns for the BC-Migration codebase. All new code should follow these patterns.

---

## Table of Contents

- [API Client Patterns](#api-client-patterns)
- [Error Handling](#error-handling)
- [Batch Processing](#batch-processing)
- [Logging](#logging)
- [Testing](#testing)
- [TypeScript](#typescript)
- [Dashboard CSS](#dashboard-css)

---

## API Client Patterns

### Rate-Limited Client Usage

Always use the provided clients which have rate limiting built-in.

```typescript
// ✅ CORRECT: Use BCClient with built-in rate limiting
import { BCClient } from '../bigcommerce/bc-client.js';

const client = new BCClient({
  storeHash: process.env.BC_STORE_HASH!,
  accessToken: process.env.BC_ACCESS_TOKEN!
});

const products = await client.getProducts({ limit: 100 });
```

```typescript
// ❌ WRONG: Direct axios calls bypass rate limiting
import axios from 'axios';

const response = await axios.get('https://api.bigcommerce.com/stores/xxx/v3/catalog/products');
// This will eventually hit rate limits and fail
```

### Pagination Pattern

Always paginate large result sets.

```typescript
// ✅ CORRECT: Paginated fetching with progress tracking
async function fetchAllProducts(client: WCClient, logger: Logger): Promise<WCProduct[]> {
  const allProducts: WCProduct[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const { data, headers } = await client.getProducts({
      page,
      per_page: 100
    });

    allProducts.push(...data);

    const totalPages = parseInt(headers['x-wp-totalpages'] || '1');
    hasMore = page < totalPages;
    page++;

    logger.debug({ page, totalPages, fetched: allProducts.length }, 'Fetched page');
  }

  return allProducts;
}
```

```typescript
// ❌ WRONG: Fetching all at once
const allProducts = await client.getAllProducts(); // May timeout or OOM
```

---

## Error Handling

### Wrapping Errors with Context

Always wrap errors to preserve context for debugging.

```typescript
// ✅ CORRECT: Wrap errors with context
import { wrapError, ApiError, isRetriableError } from '../lib/errors.js';

try {
  const result = await bcClient.createProduct(payload);
  return result;
} catch (error) {
  const wrapped = wrapError(error, {
    sku: payload.sku,
    operation: 'createProduct',
    payload: JSON.stringify(payload).slice(0, 500) // Truncate for logs
  });

  logger.error({ err: wrapped }, 'Product creation failed');

  if (isRetriableError(wrapped)) {
    throw wrapped; // Will be retried by withRetry wrapper
  }

  // Non-retriable: record failure and continue
  return { success: false, error: wrapped };
}
```

```typescript
// ❌ WRONG: Swallowing or re-throwing without context
try {
  await bcClient.createProduct(payload);
} catch (error) {
  console.log('Failed'); // No context, no logging
  throw error; // Lost original context
}
```

### Typed Error Classes

Use the appropriate error class for each scenario.

```typescript
import {
  MigrationError,
  ApiError,
  ValidationError,
  RateLimitError,
  ConfigurationError,
  DuplicateError
} from '../lib/errors.js';

// Configuration issues
if (!process.env.BC_STORE_HASH) {
  throw new ConfigurationError('BC_STORE_HASH environment variable is required');
}

// Validation failures
const errors = getBCValidationErrors(payload);
if (errors.length > 0) {
  throw new ValidationError('Invalid product payload', { errors, sku: payload.sku });
}

// Duplicate detection
if (await client.productExistsBySku(sku)) {
  throw new DuplicateError('Product already exists', { sku });
}
```

### Retriable vs Non-Retriable

```typescript
import { isRetriableError } from '../lib/errors.js';

// Retriable errors (automatic retry with backoff):
// - RateLimitError (429)
// - ConnectionError (network issues)
// - 5xx server errors

// Non-retriable errors (fail fast):
// - ValidationError (bad data)
// - ConfigurationError (missing config)
// - DuplicateError (resource exists)
// - 4xx client errors (except 429)

if (isRetriableError(error)) {
  // Will be automatically retried by withRetry wrapper
  throw error;
} else {
  // Log and skip to next item
  logger.warn({ err: error, sku }, 'Non-retriable error, skipping');
  failedItems.push({ item, error });
}
```

---

## Batch Processing

### Using processBatches

```typescript
// ✅ CORRECT: Use processBatches for bulk operations
import { processBatches, chunk } from '../lib/batch.js';

const result = await processBatches(
  products,
  10, // BC batch size limit
  async (batch) => {
    return bcClient.createProductsBatch(batch);
  },
  {
    continueOnError: true, // Don't stop on individual failures
    onProgress: (completed, total) => {
      logger.info({ completed, total }, 'Migration progress');
    }
  }
);

// Handle results
logger.info({
  succeeded: result.succeeded.length,
  failed: result.failed.length
}, 'Batch processing complete');

// Write failed items for review
if (result.failed.length > 0) {
  await writeFailedItems('products', result.failed);
}
```

```typescript
// ❌ WRONG: Sequential processing without batching
for (const product of products) {
  await bcClient.createProduct(product); // Too slow, no parallelism
}
```

### Partial Failure Handling

```typescript
// ✅ CORRECT: Handle partial batch failures
const batchResult = await bcClient.createProductsBatch(batch);

batchResult.data.forEach((response, index) => {
  const originalItem = batch[index];

  if (response.errors) {
    // Individual item failed
    failedItems.push({
      item: originalItem,
      errors: response.errors
    });
    logger.warn({
      sku: originalItem.sku,
      errors: response.errors
    }, 'Item failed in batch');
  } else {
    // Item succeeded
    succeededItems.push({
      wcId: originalItem.wcId,
      bcId: response.id,
      sku: originalItem.sku
    });
  }
});
```

---

## Logging

### Structured Logging Pattern

Always use structured logging with contextual properties.

```typescript
// ✅ CORRECT: Structured logging with context
import { createChildLogger } from '../lib/logger.js';

// Create child logger with component context
const logger = createChildLogger({ component: 'ProductMigrator' });

// Log with structured data
logger.info({
  sku: 'ABC123',
  wcId: 100,
  bcId: 200,
  duration: 150
}, 'Product migrated successfully');

// Error logging with full context
logger.error({
  err: error,
  sku: 'ABC123',
  operation: 'createProduct'
}, 'Product migration failed');
```

```typescript
// ❌ WRONG: Unstructured logging
console.log('Processing product ABC123'); // No context
console.log('Error:', error.message); // Lost stack trace
```

### Log Levels

```typescript
// Use appropriate log levels
logger.trace({ data }, 'Detailed trace');     // Very verbose debugging
logger.debug({ step: 1 }, 'Debug info');       // Development debugging
logger.info({ count: 100 }, 'Progress update'); // Normal operation
logger.warn({ sku }, 'Skipping invalid item'); // Warning, non-fatal
logger.error({ err }, 'Operation failed');     // Error, requires attention
logger.fatal({ err }, 'Unrecoverable error');  // Fatal, process should exit
```

### Logging API Calls

```typescript
// ✅ CORRECT: Log API calls with timing
import { logApiCall } from '../lib/logger.js';

const startTime = Date.now();
try {
  const result = await bcClient.createProduct(payload);
  logApiCall('POST', '/v3/catalog/products', 200, Date.now() - startTime);
  return result;
} catch (error) {
  logApiCall('POST', '/v3/catalog/products', error.response?.status, Date.now() - startTime, error);
  throw error;
}
```

---

## Testing

### Mocking Clients

```typescript
// ✅ CORRECT: Mock clients for unit tests
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProductMigrator } from '../migration/product-migrator.js';

describe('ProductMigrator', () => {
  let mockWCClient: MockWCClient;
  let mockBCClient: MockBCClient;
  let mockLogger: MockLogger;

  beforeEach(() => {
    mockWCClient = {
      getProducts: vi.fn(),
      getProduct: vi.fn()
    };

    mockBCClient = {
      createProduct: vi.fn(),
      createProductsBatch: vi.fn(),
      productExistsBySku: vi.fn()
    };

    mockLogger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      child: vi.fn().mockReturnThis()
    };
  });

  it('should migrate simple product', async () => {
    // Arrange
    mockWCClient.getProducts.mockResolvedValue({
      data: [wcProductFixture],
      headers: { 'x-wp-totalpages': '1' }
    });
    mockBCClient.productExistsBySku.mockResolvedValue(false);
    mockBCClient.createProduct.mockResolvedValue({ data: { id: 123 } });

    // Act
    const migrator = new ProductMigrator(mockWCClient, mockBCClient, mockLogger);
    const result = await migrator.migrate();

    // Assert
    expect(result.succeeded.length).toBe(1);
    expect(mockBCClient.createProduct).toHaveBeenCalledWith(
      expect.objectContaining({ sku: wcProductFixture.sku })
    );
  });
});
```

### Using Fixtures

```typescript
// ✅ CORRECT: Use fixtures for consistent test data
// src/__tests__/fixtures/wc-products.ts
export const wcSimpleProductFixture: WCProduct = {
  id: 100,
  name: 'Test Product',
  sku: 'TEST-001',
  type: 'simple',
  regular_price: '29.99',
  description: 'A test product',
  images: [{ id: 1, src: 'https://example.com/image.jpg' }],
  categories: [{ id: 10, name: 'Test Category' }]
};

export const wcVariableProductFixture: WCProduct = {
  id: 200,
  name: 'Variable Product',
  sku: 'VAR-001',
  type: 'variable',
  attributes: [
    { id: 1, name: 'Size', options: ['S', 'M', 'L'] }
  ],
  variations: [201, 202, 203]
};

// In tests
import { wcSimpleProductFixture } from './fixtures/wc-products.js';
```

### Testing Transformers

```typescript
// ✅ CORRECT: Test transformers as pure functions
import { describe, it, expect } from 'vitest';
import { transformProduct } from '../migration/transformers/product.js';

describe('transformProduct', () => {
  it('should transform simple product', () => {
    const wcProduct = wcSimpleProductFixture;
    const categoryMap = { 10: 20 }; // WC ID -> BC ID

    const bcProduct = transformProduct(wcProduct, categoryMap);

    expect(bcProduct).toEqual({
      name: 'Test Product',
      sku: 'TEST-001',
      type: 'physical',
      price: 29.99,
      description: 'A test product',
      images: [{ image_url: 'https://example.com/image.jpg' }],
      categories: [20]
    });
  });

  it('should handle missing SKU', () => {
    const wcProduct = { ...wcSimpleProductFixture, sku: '' };

    const bcProduct = transformProduct(wcProduct, {});

    expect(bcProduct.sku).toBe('wc-100'); // Auto-generated
  });
});
```

---

## TypeScript

### Interface Definitions

```typescript
// ✅ CORRECT: Define clear interfaces in types/
// src/types/migration.ts
export interface MigrationResult {
  succeeded: SucceededItem[];
  failed: FailedItem[];
  duration: number;
  timestamp: string;
}

export interface SucceededItem {
  wcId: number;
  bcId: number;
  sku: string;
}

export interface FailedItem {
  item: unknown;
  error: MigrationError;
}

export interface MigrationOptions {
  type?: 'categories' | 'products' | 'customers' | 'orders';
  delta?: boolean;
  dryRun?: boolean;
}
```

### No Any Types

```typescript
// ✅ CORRECT: Use proper types
function transformProduct(
  wcProduct: WCProduct,
  categoryMap: Record<number, number>
): BCProduct {
  // ...
}

// ❌ WRONG: Using any
function transformProduct(wcProduct: any, categoryMap: any): any {
  // ...
}
```

### Type Guards

```typescript
// ✅ CORRECT: Use type guards for runtime checks
import { WCProduct, WCVariableProduct } from '../types/wc.js';

function isVariableProduct(product: WCProduct): product is WCVariableProduct {
  return product.type === 'variable' && Array.isArray(product.variations);
}

// Usage
if (isVariableProduct(product)) {
  // TypeScript knows product has variations[]
  for (const variationId of product.variations) {
    // ...
  }
}
```

---

## Dashboard CSS

### Semantic Tokens

The dashboard uses CSS custom properties for theming. Always use semantic tokens.

```css
/* ✅ CORRECT: Use semantic tokens */
.card {
  background: var(--docs-surface);
  color: var(--docs-text-primary);
  border: 1px solid var(--docs-border);
  border-radius: var(--radius-lg);
}

.card-secondary {
  color: var(--docs-text-secondary);
}

.card:hover {
  background: var(--docs-surface-elevated);
}
```

```css
/* ❌ WRONG: Raw color values */
.card {
  background: #ffffff;
  color: #1a1a1a;
  border: 1px solid #e5e5e5;
}

/* ❌ WRONG: Dark mode overrides in components */
@media (prefers-color-scheme: dark) {
  .card {
    background: #171717;
    color: #f5f5f5;
  }
}
```

### Tailwind Classes

```tsx
// ✅ CORRECT: Use semantic Tailwind classes
<div className="bg-docs-surface text-docs-text-primary border border-docs-border rounded-lg p-4">
  <h2 className="text-docs-text-primary font-semibold">Title</h2>
  <p className="text-docs-text-secondary mt-2">Description</p>
</div>
```

```tsx
// ❌ WRONG: Hardcoded colors
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
  {/* Scattered dark mode handling */}
</div>
```

### Status Colors

Status colors can be used directly since they're designed for both modes.

```tsx
// ✅ CORRECT: Status colors for feedback
<span className="text-green-600 dark:text-green-400">Success</span>
<span className="text-yellow-600 dark:text-yellow-400">Warning</span>
<span className="text-red-600 dark:text-red-400">Error</span>
```

---

## Related Documentation

- [CLAUDE.md](../CLAUDE.md) - Quick reference
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
- [CODE_REVIEW.md](./CODE_REVIEW.md) - Review guidelines
