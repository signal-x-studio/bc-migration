# BC-Migration - Development Guide

## Before You Start

**Always check [docs/PROGRESS.md](docs/PROGRESS.md) first.** It contains:
- Current implementation status for all features
- What's done, what's partial, what's not started
- Active sprint tasks and blockers

This prevents duplicate work and ensures you're building on the right foundation.

---

## Mission

**"Keep WordPress. Upgrade Commerce."**

WooCommerce to BigCommerce migration suite for the BC + WPEngine partnership. Enables merchants to retain their WordPress frontend while migrating commerce operations to BigCommerce.

---

## Quick Verification

```bash
# CLI verification
npm test                    # Run all tests (87 passing)
npx tsc --noEmit            # Type check

# Test commands (requires .env credentials)
npm run assess              # Analyze WooCommerce store
npm run validate-target     # Test BigCommerce connection
npm run migrate             # Run migration
npm run validate            # Verify results

# Dashboard verification
cd src/dashboard && npm run dev  # Start dashboard at localhost:3000
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js 18+ (ESM modules) |
| Language | TypeScript 5.7.2 (strict mode) |
| CLI | Commander 12.x |
| HTTP | Axios 1.x (wrapped with rate limiter) |
| Rate Limiting | Bottleneck 2.x (150 req/30s for BC) |
| Retry | p-retry 6.x (exponential backoff) |
| Validation | Zod 3.x |
| Logging | Pino 9.x (structured logging) |
| Testing | Vitest 2.x (87 tests) |
| Dashboard | Next.js 16, React 19, Tailwind CSS 4 |

---

## Project Structure

```
bc-migration/
├── src/
│   ├── cli.ts                    # Entry point - Commander commands
│   ├── assessment/               # WC store analysis engine
│   │   ├── orchestrator.ts       # Assessment coordinator
│   │   ├── wc-client.ts          # WooCommerce API client
│   │   ├── plugin-mapper.ts      # Plugin compatibility mapping
│   │   └── collectors/           # Data collectors (scale, complexity, etc.)
│   ├── bigcommerce/
│   │   └── bc-client.ts          # BC API client (rate-limited, retry)
│   ├── migration/
│   │   ├── category-migrator.ts  # Category migration (hierarchy preserved)
│   │   ├── product-migrator.ts   # Product migration (simple + variable)
│   │   ├── customer-migrator.ts  # Customer migration (dedupe by email)
│   │   ├── order-migrator.ts     # Order migration (read-only import)
│   │   ├── state-tracker.ts      # Delta sync state management
│   │   └── transformers/
│   │       ├── product.ts        # WC Product → BC Product
│   │       └── variant.ts        # WC Variation → BC Variant
│   ├── validation/
│   │   ├── data-validator.ts     # Post-migration verification
│   │   └── report.ts             # Report generation
│   ├── lib/                      # Shared utilities
│   │   ├── rate-limiter.ts       # Bottleneck wrapper for BC API
│   │   ├── retry.ts              # p-retry with exponential backoff
│   │   ├── logger.ts             # Pino structured logging
│   │   ├── batch.ts              # Batch processing utilities
│   │   └── errors.ts             # Custom error classes
│   ├── types/                    # TypeScript interfaces
│   │   ├── wc.ts                 # WooCommerce types
│   │   ├── bc.ts                 # BigCommerce types
│   │   └── migration.ts          # Migration state types
│   ├── schemas/                  # Zod validation schemas
│   │   ├── wc.ts                 # WC response validation
│   │   └── bc.ts                 # BC payload validation
│   └── dashboard/                # Next.js assessment UI
├── docs/                         # Documentation
├── reports/                      # Generated assessment/migration reports
├── logs/                         # Runtime migration logs
└── src/__tests__/                # Test suite
```

---

## Code Patterns (MUST FOLLOW)

### ESM Imports
```typescript
// Use .js extension for local imports
import { BCClient } from '../bigcommerce/bc-client.js';
import { wrapError } from '../lib/errors.js';
```

### Dependency Injection
```typescript
// Inject clients for testability
class ProductMigrator {
  constructor(
    private wcClient: WCClient,
    private bcClient: BCClient,
    private logger: Logger
  ) {}
}
```

### Rate-Limited API Calls
```typescript
// Always use the rate-limited client
import { bcRateLimiter, withRateLimit } from '../lib/rate-limiter.js';

// Client methods are already wrapped
const products = await bcClient.getProducts({ limit: 100 });
```

### Error Handling
```typescript
import { wrapError, ApiError, isRetriableError } from '../lib/errors.js';

try {
  await bcClient.createProduct(payload);
} catch (error) {
  const wrapped = wrapError(error, { sku: payload.sku });
  logger.error({ err: wrapped }, 'Product creation failed');

  if (isRetriableError(wrapped)) {
    // Will be retried by withRetry wrapper
  }
  throw wrapped;
}
```

### Batch Processing
```typescript
import { processBatches, chunk } from '../lib/batch.js';

const result = await processBatches(items, 10, async (batch) => {
  return bcClient.createProductsBatch(batch);
}, { continueOnError: true });

logger.info({
  succeeded: result.succeeded.length,
  failed: result.failed.length
}, 'Batch complete');
```

### Structured Logging
```typescript
import { createChildLogger, logApiCall } from '../lib/logger.js';

const logger = createChildLogger({ component: 'ProductMigrator' });
logger.info({ sku: 'ABC123', bcId: 456 }, 'Product created');

// Log API calls
logApiCall('POST', '/v3/catalog/products', 200, 150);
```

---

## Anti-Patterns (NEVER DO)

### Direct Axios Calls
```typescript
// WRONG - bypasses rate limiting
import axios from 'axios';
const response = await axios.get('https://api.bigcommerce.com/...');

// CORRECT - use BCClient
const products = await bcClient.getProducts();
```

### Console.log in Production
```typescript
// WRONG
console.log('Processing product:', sku);

// CORRECT
logger.info({ sku }, 'Processing product');
```

### Unbounded Loops
```typescript
// WRONG - no pagination
const allProducts = await wcClient.getAll();

// CORRECT - paginated with progress
let page = 1;
let hasMore = true;
while (hasMore) {
  const { data, totalPages } = await wcClient.getProducts({ page, per_page: 100 });
  // Process data...
  hasMore = page < totalPages;
  page++;
}
```

### Any Types
```typescript
// WRONG
function process(data: any) { ... }

// CORRECT
import { WCProduct } from '../types/wc.js';
function process(data: WCProduct) { ... }
```

### Hardcoded Credentials
```typescript
// WRONG
const token = 'abc123';

// CORRECT
const token = process.env.BC_ACCESS_TOKEN;
if (!token) throw new ConfigurationError('BC_ACCESS_TOKEN required');
```

---

## API Limits

| Platform | Limit | Implementation |
|----------|-------|----------------|
| BigCommerce | 150 req/30s (140 configured) | Bottleneck rate limiter with headroom |
| BigCommerce | 10 items per batch | Chunked batch operations |
| BigCommerce | 600 variants per product | Warning + truncation |
| WooCommerce | No hard limit | Paginated requests |

---

## File Ownership Zones

### Zone A: CLI Core (Coordinate Carefully)
```
src/cli.ts
src/lib/*.ts
```
Changes here affect the entire system. Coordinate with team.

### Zone B: Migration Engines (Parallelizable)
```
src/migration/category-migrator.ts
src/migration/product-migrator.ts
src/migration/customer-migrator.ts
src/migration/order-migrator.ts
src/migration/transformers/*.ts
```
Independent migrators can be worked on in parallel.

### Zone C: Assessment (Parallelizable)
```
src/assessment/collectors/*.ts
```
Each collector is independent.

### Zone D: Dashboard (Separate)
```
src/dashboard/
```
Next.js app with separate tsconfig. UI changes don't affect CLI.

### Zone E: Tests (Always Safe)
```
src/__tests__/
```
Can always add tests without coordination.

---

## Testing

### Run Tests
```bash
npm test           # Run all tests
npm run test:watch # Watch mode
npm run test:coverage # Coverage report
```

### Test Patterns
```typescript
import { describe, it, expect, vi } from 'vitest';

// Mock clients
const mockBCClient = {
  createProduct: vi.fn().mockResolvedValue({ data: { id: 123 } }),
};

// Use fixtures
import { wcProductFixture } from '../fixtures/wc-products.js';

describe('ProductMigrator', () => {
  it('should migrate simple product', async () => {
    const migrator = new ProductMigrator(mockWCClient, mockBCClient, logger);
    const result = await migrator.migrateProduct(wcProductFixture);
    expect(result.bcId).toBe(123);
  });
});
```

---

## Migration Order

Always migrate in this order due to dependencies:

1. **Categories** - No dependencies
2. **Products** - Requires categories (for category assignments)
3. **Customers** - No dependencies (can run parallel with products)
4. **Orders** - Requires products and customers

---

## Error Classes

| Class | Use Case |
|-------|----------|
| `MigrationError` | Base class for all migration errors |
| `ApiError` | API call failures (wraps axios errors) |
| `ValidationError` | Schema validation failures |
| `RateLimitError` | 429 responses (retriable) |
| `ConnectionError` | Network failures (retriable) |
| `ConfigurationError` | Missing env vars or invalid config |
| `DuplicateError` | Resource already exists (skip) |

---

## Documentation

### Start Here
- [docs/PROGRESS.md](docs/PROGRESS.md) - Implementation status (check first)
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - System design
- [docs/PATTERNS.md](docs/PATTERNS.md) - Code patterns with examples

### Development
- [docs/DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md) - Setup and workflow
- [docs/CODE_REVIEW.md](docs/CODE_REVIEW.md) - Review guidelines
- [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) - Common issues

### Reference
- [docs/api-reference/](docs/api-reference/) - TypeDoc API docs

---

## Quick Reference

| Need | Command/File |
|------|--------------|
| Run tests | `npm test` |
| Type check | `npx tsc --noEmit` |
| Assess WC store | `npm run assess` |
| Run migration | `npm run migrate` |
| Check progress | `docs/PROGRESS.md` |
| See patterns | `docs/PATTERNS.md` |
| Debug issues | `logs/migration-*.log` |
