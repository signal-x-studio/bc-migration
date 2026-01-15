# Developer Guide

This guide helps you get started with BC-Migration development.

---

## Prerequisites

- **Node.js 18+** (check with `node --version`)
- **npm 9+** (check with `npm --version`)
- **Git** (for version control)

### Optional (for full testing)
- WooCommerce store with REST API access
- BigCommerce store with API token

---

## Initial Setup

### 1. Clone the Repository

```bash
git clone <repo-url>
cd bc-migration
```

### 2. Install Dependencies

```bash
# Root CLI dependencies
npm install

# Dashboard dependencies (if working on UI)
cd src/dashboard && npm install && cd ../..
```

### 3. Configure Environment

```bash
# Copy template
cp .env.example .env

# Edit with your credentials
# .env file:
WC_URL=https://your-woocommerce-store.com
WC_CONSUMER_KEY=ck_your_consumer_key
WC_CONSUMER_SECRET=cs_your_consumer_secret
BC_STORE_HASH=your_store_hash
BC_ACCESS_TOKEN=your_api_token
```

### 4. Verify Setup

```bash
# Run tests (should pass without credentials)
npm test

# Type check
npx tsc --noEmit

# Test WC connection (requires credentials)
npm run assess -- --url $WC_URL --key $WC_KEY --secret $WC_SECRET

# Test BC connection (requires credentials)
npm run validate-target
```

---

## Development Workflow

### CLI Development

The main CLI entry point is `src/cli.ts`. Use `tsx` for development:

```bash
# Run any command during development
npx tsx src/cli.ts <command> [options]

# Examples:
npx tsx src/cli.ts assess --help
npx tsx src/cli.ts migrate --type=products --dry-run
npx tsx src/cli.ts validate --sample 10
```

### Dashboard Development

```bash
cd src/dashboard
npm run dev
# Opens at http://localhost:3000
```

### Running Tests

```bash
# Run all tests
npm test

# Watch mode (re-runs on changes)
npm run test:watch

# Coverage report
npm run test:coverage
```

### Building

```bash
# Build CLI (TypeScript → JavaScript)
npm run build

# Output goes to dist/

# Build dashboard
cd src/dashboard && npm run build
```

---

## Project Conventions

### File Naming

- **TypeScript files**: `kebab-case.ts` (e.g., `product-migrator.ts`)
- **Test files**: `*.test.ts` alongside source or in `__tests__/`
- **Types**: `types/*.ts` with clear names (`wc.ts`, `bc.ts`)

### Import Conventions

```typescript
// Use .js extension for local imports (ESM)
import { BCClient } from '../bigcommerce/bc-client.js';

// External packages - no extension
import { z } from 'zod';
```

### Code Organization

```
src/
├── cli.ts                    # Entry point only - delegates to modules
├── assessment/               # WC store analysis
│   ├── orchestrator.ts       # Coordinates collectors
│   ├── wc-client.ts          # WooCommerce API wrapper
│   └── collectors/           # Individual data collectors
├── migration/                # Migration engines
│   ├── *-migrator.ts         # One per entity type
│   └── transformers/         # Pure transformation functions
├── validation/               # Post-migration verification
├── lib/                      # Shared utilities (stateless)
├── types/                    # TypeScript interfaces
└── schemas/                  # Zod validation schemas
```

---

## Adding New Features

### Adding a New Migrator

1. **Create the migrator class:**

```typescript
// src/migration/new-migrator.ts
import { BCClient } from '../bigcommerce/bc-client.js';
import { WCClient } from '../assessment/wc-client.js';
import { Logger } from '../lib/logger.js';
import { MigrationResult } from '../types/migration.js';

export class NewMigrator {
  constructor(
    private wcClient: WCClient,
    private bcClient: BCClient,
    private logger: Logger
  ) {}

  async migrate(): Promise<MigrationResult> {
    // Implementation
  }
}
```

2. **Add transformer (if needed):**

```typescript
// src/migration/transformers/new-type.ts
import { WCNewType } from '../../types/wc.js';
import { BCNewType } from '../../types/bc.js';

export function transformNewType(wcItem: WCNewType): BCNewType {
  // Pure transformation
}
```

3. **Add CLI command:**

```typescript
// In src/cli.ts
program
  .command('migrate-new')
  .description('Migrate new type')
  .action(async () => {
    const migrator = new NewMigrator(wcClient, bcClient, logger);
    await migrator.migrate();
  });
```

4. **Add tests:**

```typescript
// src/__tests__/migration/new-migrator.test.ts
import { describe, it, expect } from 'vitest';
import { NewMigrator } from '../../migration/new-migrator.js';

describe('NewMigrator', () => {
  // Tests
});
```

5. **Update documentation:**
- Add to [ARCHITECTURE.md](./ARCHITECTURE.md) data flow diagram
- Add patterns to [PATTERNS.md](./PATTERNS.md) if novel

### Adding a New Collector

1. **Create collector in `src/assessment/collectors/`:**

```typescript
// src/assessment/collectors/new-collector.ts
import { WCClient } from '../wc-client.js';
import { Logger } from '../../lib/logger.js';

export interface NewMetrics {
  // Define metrics
}

export class NewCollector {
  constructor(
    private client: WCClient,
    private logger: Logger
  ) {}

  async collect(): Promise<NewMetrics> {
    // Implementation
  }
}
```

2. **Register in orchestrator:**

```typescript
// In src/assessment/orchestrator.ts
import { NewCollector } from './collectors/new-collector.js';

// Add to collector list
const newCollector = new NewCollector(this.client, this.logger);
const newMetrics = await newCollector.collect();
```

---

## Debugging

### Log Levels

Set `LOG_LEVEL` environment variable:

```bash
LOG_LEVEL=debug npm run assess
LOG_LEVEL=trace npm run migrate  # Very verbose
```

### Log Files

Migration logs are written to `logs/`:

```bash
# View latest log
cat logs/migration-*.log | tail -100

# Search for errors
grep -i error logs/migration-*.log
```

### Common Debug Scenarios

**API Response Issues:**
```typescript
// Add temporary debug logging
logger.debug({ response: JSON.stringify(response.data) }, 'API response');
```

**Rate Limiting:**
```typescript
import { getRateLimiterStats } from '../lib/rate-limiter.js';

// Check current state
const stats = getRateLimiterStats();
logger.info({ stats }, 'Rate limiter status');
```

**Transformation Issues:**
```typescript
// Log before/after transformation
logger.debug({ wcProduct }, 'Before transform');
const bcProduct = transformProduct(wcProduct, categoryMap);
logger.debug({ bcProduct }, 'After transform');
```

---

## Testing Strategies

### Unit Tests

Test individual functions/classes in isolation:

```typescript
// Mock all dependencies
const mockClient = { getProducts: vi.fn() };
const migrator = new ProductMigrator(mockClient, mockBCClient, mockLogger);
```

### Integration Tests

Test component interactions (use sparingly):

```typescript
// Use real implementations with test data
const result = await processBatches(testItems, 10, async (batch) => {
  // Real batch processor
});
```

### Manual Testing

```bash
# Quick assessment test
npm run assess -- --url https://test-store.com --key ck_test --secret cs_test

# Dry-run migration (no writes)
npm run migrate -- --dry-run

# Validate with sampling
npm run validate -- --sample 5
```

---

## Pull Request Process

1. **Branch from main:**
   ```bash
   git checkout main && git pull
   git checkout -b feature/my-feature
   ```

2. **Make changes and test:**
   ```bash
   npm test
   npx tsc --noEmit
   ```

3. **Commit with clear message:**
   ```bash
   git add .
   git commit -m "feat: add new collector for X"
   ```

4. **Push and create PR:**
   ```bash
   git push -u origin feature/my-feature
   # Create PR via GitHub
   ```

5. **Address review feedback**

See [CODE_REVIEW.md](./CODE_REVIEW.md) for review guidelines.

---

## Related Documentation

- [CLAUDE.md](../CLAUDE.md) - Quick reference
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
- [PATTERNS.md](./PATTERNS.md) - Code patterns
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues
