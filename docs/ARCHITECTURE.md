# BC-Migration Architecture

## System Overview

BC-Migration is a CLI tool that migrates WooCommerce stores to BigCommerce while preserving the WordPress frontend. The system consists of three main capabilities: **Assessment**, **Migration**, and **Validation**.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              bc-migrate CLI                                  │
│                           (Commander.js Entry Point)                         │
├─────────────────────┬─────────────────────┬─────────────────────────────────┤
│       assess        │       migrate       │           validate              │
│     ───────────     │      ─────────      │          ──────────             │
│  - Scale metrics    │  - Categories       │  - Count verification           │
│  - Complexity       │  - Products         │  - Price sampling               │
│  - Plugin mapping   │  - Customers        │  - Image accessibility          │
│  - Custom logic     │  - Orders           │  - Report generation            │
└──────────┬──────────┴──────────┬──────────┴───────────────┬─────────────────┘
           │                     │                          │
           ▼                     ▼                          ▼
┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────────────┐
│     WC Client       │ │     BC Client       │ │   Validation Engine         │
│   (REST API v3)     │ │   (V2/V3 APIs)      │ │                             │
├─────────────────────┤ ├─────────────────────┤ │  DataValidator              │
│ - OAuth 1.0a auth   │ │ - Bearer token auth │ │  └─ Compare WC vs BC        │
│ - Pagination        │ │ - Rate limiter      │ │  └─ Sample verification     │
│ - Response parsing  │ │ - Retry logic       │ │  └─ Image URL checks        │
│                     │ │ - Batch operations  │ │                             │
└─────────────────────┘ └─────────────────────┘ └─────────────────────────────┘
           │                     │
           ▼                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Shared Utilities (src/lib/)                        │
├─────────────────────┬─────────────────────┬─────────────────────────────────┤
│    rate-limiter.ts  │      retry.ts       │           logger.ts             │
│    ──────────────   │     ─────────       │          ──────────             │
│  Bottleneck wrapper │  p-retry wrapper    │  Pino structured logging        │
│  150 req / 30 sec   │  Exponential back   │  File + console output          │
├─────────────────────┼─────────────────────┼─────────────────────────────────┤
│      batch.ts       │     errors.ts       │                                 │
│     ─────────       │    ──────────       │                                 │
│  Chunk processing   │  Custom error       │                                 │
│  Partial failure    │  classes with       │                                 │
│  handling           │  context            │                                 │
└─────────────────────┴─────────────────────┴─────────────────────────────────┘
```

---

## Data Flow

### Assessment Flow

```
┌─────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌──────────────┐
│  CLI Input  │────▶│  Orchestrator   │────▶│   Collectors    │────▶│   Reports    │
│             │     │                 │     │                 │     │              │
│ --url       │     │ Coordinates     │     │ - ScaleCollector│     │ JSON + MD    │
│ --key       │     │ collector runs  │     │ - Complexity    │     │ in reports/  │
│ --secret    │     │                 │     │ - PluginMapper  │     │              │
└─────────────┘     └─────────────────┘     │ - CustomLogic   │     └──────────────┘
                                            └─────────────────┘
```

1. CLI parses credentials from args or `.env`
2. Orchestrator initializes WC client and runs collectors
3. Each collector queries specific WC API endpoints
4. Results aggregated and written to `reports/assessment-*.json|md`

### Migration Flow

```
┌─────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌──────────────┐
│  CLI Input  │────▶│  State Tracker  │────▶│   Migrators     │────▶│   BC API     │
│             │     │                 │     │                 │     │              │
│ --type      │     │ Tracks progress │     │ - Category      │     │ Create/      │
│ --delta     │     │ Supports resume │     │ - Product       │     │ Update       │
└─────────────┘     └─────────────────┘     │ - Customer      │     │ resources    │
                                            │ - Order         │     │              │
                                            └────────┬────────┘     └──────────────┘
                                                     │
                                            ┌────────▼────────┐
                                            │  Transformers   │
                                            │                 │
                                            │ WC format  ──▶  │
                                            │ BC format       │
                                            └─────────────────┘
```

1. Validate BC connection with `validate-target`
2. Load or create migration state
3. Fetch items from WC (paginated)
4. Transform to BC format via transformer functions
5. Batch create/update in BC (rate-limited)
6. Track success/failure per item
7. Update state for delta sync support

### Migration Dependencies

```
┌──────────────┐
│  Categories  │──────────────────────┐
└──────────────┘                      │
                                      ▼
┌──────────────┐              ┌──────────────┐
│  Customers   │──────────────│   Products   │
└──────────────┘              └──────────────┘
       │                              │
       │                              │
       ▼                              ▼
┌─────────────────────────────────────────────┐
│                   Orders                     │
│  (References both customers and products)    │
└─────────────────────────────────────────────┘
```

**Migration Order:**
1. Categories (required for product category assignments)
2. Products (requires categories)
3. Customers (independent, can parallel with products)
4. Orders (requires products + customers)

---

## Key Components

### Rate Limiter (`src/lib/rate-limiter.ts`)

Uses [Bottleneck](https://github.com/SGrondin/bottleneck) to enforce BigCommerce API limits.

```
Configuration:
├── maxConcurrent: 10 (parallel requests)
├── minTime: 100ms (between requests)
├── reservoir: 140 (request pool, with headroom from 150 limit)
└── reservoirRefreshInterval: 30000ms (refill every 30s)
```

**Usage:**
```typescript
import { withRateLimit } from '../lib/rate-limiter.js';

// Wrap any async function
const limitedFetch = withRateLimit(async () => {
  return axios.get('/products');
});
```

### Transformers (`src/migration/transformers/`)

Pure functions that convert WooCommerce data structures to BigCommerce format.

**Product Transformer:**
```
WC Product                    BC Product
───────────                   ──────────
name              ──────▶     name
sku               ──────▶     sku
regular_price     ──────▶     price
description       ──────▶     description
images[].src      ──────▶     images[].image_url
categories[].id   ──────▶     categories[] (mapped IDs)
attributes[]      ──────▶     modifiers[] (for variable)
```

**Variant Transformer:**
```
WC Variation                  BC Variant
────────────                  ──────────
id                ──────▶     (internal tracking)
sku               ──────▶     sku
regular_price     ──────▶     price
attributes[]      ──────▶     option_values[]
```

### Error Classes (`src/lib/errors.ts`)

```
MigrationError (base)
├── ApiError          - Wraps axios errors with context
├── ValidationError   - Schema validation failures
├── RateLimitError    - 429 responses (retriable)
├── ConnectionError   - Network failures (retriable)
├── ConfigurationError - Missing env vars
└── DuplicateError    - Resource exists (skip)
```

**Error Context:**
```typescript
// Errors carry context for debugging
throw new ApiError('Product creation failed', {
  sku: 'ABC123',
  endpoint: '/v3/catalog/products',
  statusCode: 400,
  response: responseData
});
```

### Validation Schemas (`src/schemas/`)

[Zod](https://zod.dev/) schemas for runtime validation.

**WC Response Validation:**
```typescript
// Validate API responses before processing
const validated = WCProductSchema.parse(apiResponse);

// Soft validation (returns null on failure)
const result = validateWCResponseSoft(response, WCProductSchema);
```

**BC Payload Validation:**
```typescript
// Validate before sending to BC API
const errors = getBCValidationErrors(payload);
if (errors.length > 0) {
  throw new ValidationError('Invalid payload', { errors });
}
```

---

## Dashboard Architecture

The dashboard (`src/dashboard/`) is a Next.js 16 application that provides a UI for assessment and migration operations.

```
src/dashboard/
├── app/
│   ├── page.tsx              # Landing / assessment display
│   ├── layout.tsx            # Root layout with navigation
│   ├── docs/                 # Documentation viewer
│   │   └── [...slug]/        # Dynamic doc pages
│   ├── migrate/              # Migration wizard
│   ├── api/                  # API routes
│   │   ├── assess/           # Trigger assessment
│   │   ├── migrate/          # Trigger migration
│   │   └── validate/         # Trigger validation
│   └── settings/             # Configuration
├── components/
│   ├── HelpPanel.tsx         # Contextual help
│   └── docs/                 # Documentation components
└── lib/
    └── docs/                 # Documentation utilities
```

**Key Patterns:**
- Server Components for static content (docs)
- Client Components for interactive forms
- API routes delegate to CLI commands
- Tailwind CSS 4 with CSS custom properties for theming

---

## State Management

### Migration State (`src/migration/state-tracker.ts`)

Tracks migration progress for resumable operations.

```json
{
  "lastRun": "2024-01-15T10:30:00Z",
  "phases": {
    "categories": {
      "completed": true,
      "lastItemId": 456,
      "idMappings": { "123": "456" }
    },
    "products": {
      "completed": false,
      "lastItemId": 789,
      "idMappings": { "100": "200" }
    }
  }
}
```

**Delta Sync:**
- Tracks `modified_after` timestamp
- Only fetches items changed since last run
- Maintains ID mappings (WC ID → BC ID)

---

## Logging Architecture

### Pino Configuration

```typescript
// Log levels: trace, debug, info, warn, error, fatal
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    targets: [
      { target: 'pino-pretty', level: 'info' },  // Console
      { target: 'pino/file', options: { destination: logFile } }  // File
    ]
  }
});
```

**Structured Context:**
```typescript
// All logs include contextual properties
logger.info({
  component: 'ProductMigrator',
  sku: 'ABC123',
  wcId: 100,
  bcId: 200,
  duration: 150
}, 'Product migrated');
```

**Log Files:**
```
logs/
├── migration-2024-01-15T10-30-00.log
├── migration-2024-01-15T14-00-00.log
└── ...
```

---

## Batch Processing

### Chunking Strategy

```typescript
// BigCommerce batch limit: 10 items
const chunks = chunk(products, 10);

for (const batch of chunks) {
  const result = await bcClient.createProductsBatch(batch);
  // Handle partial failures
  result.data.forEach((item, i) => {
    if (item.errors) {
      failed.push({ item: batch[i], errors: item.errors });
    } else {
      succeeded.push(item);
    }
  });
}
```

### Partial Failure Handling

```typescript
const result = await processBatches(items, 10, processor, {
  continueOnError: true  // Don't stop on individual failures
});

// Result contains both succeeded and failed
console.log(`Succeeded: ${result.succeeded.length}`);
console.log(`Failed: ${result.failed.length}`);
// Failed items written to reports/failed-products-*.json
```

---

## Technology Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Module System | ESM | Modern Node.js, better tree-shaking |
| CLI Framework | Commander | Mature, well-documented, TypeScript support |
| Rate Limiting | Bottleneck | Flexible, supports reservoirs, proven at scale |
| Retry Logic | p-retry | Simple API, exponential backoff built-in |
| Validation | Zod | Runtime + static types, great error messages |
| Logging | Pino | Fast, structured, extensible transports |
| Testing | Vitest | Fast, compatible with Jest patterns |
| Dashboard | Next.js | SSR for docs, API routes for CLI integration |

---

## Related Documentation

- [CLAUDE.md](../CLAUDE.md) - Quick reference for development
- [PATTERNS.md](./PATTERNS.md) - Code patterns with examples
- [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) - Setup and workflow
- [api-reference/](./api-reference/) - TypeDoc API documentation
