# BC Migration

WooCommerce to BigCommerce migration CLI tool for the BC + WPEngine partnership.

## Features

- **Store Assessment**: Analyze WooCommerce stores for migration readiness
- **Data Migration**: Migrate categories, products (with variants), customers, and orders
- **Validation**: Verify migration completeness with detailed reports
- **Rate Limiting**: Built-in BigCommerce API rate limiting (150 req/30s)
- **Idempotent**: Safe to re-run migrations without creating duplicates
- **Structured Logging**: Pino-based logging with file and console output

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env
# Edit .env with your credentials

# Test connections
npm run validate-target  # Test BC connection
npm run assess           # Run WC assessment

# Run migration
npm run migrate

# Verify results
npm run validate
```

## Installation

### Prerequisites

- Node.js 18+
- npm 9+
- WooCommerce REST API credentials (Consumer Key/Secret)
- BigCommerce API credentials (Store Hash/Access Token)

### Setup

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd bc-migration
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` with your credentials:
   ```env
   # WooCommerce
   WC_URL=https://your-store.com
   WC_CONSUMER_KEY=ck_xxxxx
   WC_CONSUMER_SECRET=cs_xxxxx

   # BigCommerce
   BC_STORE_HASH=your-store-hash
   BC_ACCESS_TOKEN=your-api-token
   ```

## Commands

### Assessment

Analyze a WooCommerce store for migration suitability:

```bash
npm run assess

# Or with explicit credentials
npx tsx src/cli.ts assess --url https://store.com --key ck_xxx --secret cs_xxx
```

Output: Generates readiness reports in `./reports/` directory.

### Validate Target

Verify BigCommerce API credentials and store accessibility:

```bash
npm run validate-target

# Or with explicit credentials
npx tsx src/cli.ts validate-target --hash abc123 --token your-token
```

### Migration

Migrate data from WooCommerce to BigCommerce:

```bash
# Migrate all data types
npm run migrate

# Migrate specific data type
npx tsx src/cli.ts migrate --type=products
npx tsx src/cli.ts migrate --type=categories
npx tsx src/cli.ts migrate --type=customers
npx tsx src/cli.ts migrate --type=orders

# Delta migration (only items modified since last run)
npx tsx src/cli.ts migrate --delta
```

**Migration Order**: Categories -> Products -> Customers -> Orders

### Validation

Verify migration results and data integrity:

```bash
npm run validate

# With custom sample size
npx tsx src/cli.ts validate --sample 20
```

Validates:
- Product counts (WC vs BC)
- Category counts
- Customer counts
- Sample price accuracy
- Image accessibility

### Dashboard

Launch the local assessment dashboard:

```bash
npm run dashboard
# Opens at http://localhost:3000
```

## Project Structure

```
bc-migration/
├── src/
│   ├── cli.ts                    # CLI entry point
│   ├── assessment/               # Store assessment engine
│   │   ├── orchestrator.ts       # Assessment coordinator
│   │   ├── wc-client.ts          # WooCommerce API client
│   │   └── collectors/           # Data collectors
│   ├── bigcommerce/
│   │   └── bc-client.ts          # BC API client (rate-limited)
│   ├── migration/
│   │   ├── category-migrator.ts  # Category migration
│   │   ├── product-migrator.ts   # Product migration (with variants)
│   │   ├── customer-migrator.ts  # Customer migration
│   │   ├── order-migrator.ts     # Order migration
│   │   ├── state-tracker.ts      # Delta sync state
│   │   └── transformers/         # Data transformers
│   ├── validation/
│   │   ├── data-validator.ts     # Post-migration validation
│   │   └── report.ts             # Report generator
│   ├── lib/                      # Shared utilities
│   │   ├── rate-limiter.ts       # Bottleneck rate limiting
│   │   ├── retry.ts              # Exponential backoff
│   │   ├── logger.ts             # Pino structured logging
│   │   ├── batch.ts              # Batch processing
│   │   └── errors.ts             # Custom error classes
│   ├── types/                    # TypeScript interfaces
│   │   ├── wc.ts                 # WooCommerce types
│   │   └── bc.ts                 # BigCommerce types
│   ├── schemas/                  # Zod validation schemas
│   │   ├── wc.ts                 # WC response schemas
│   │   └── bc.ts                 # BC payload schemas
│   └── dashboard/                # Next.js assessment UI
├── docs/                         # Architecture & specs
├── reports/                      # Generated reports
├── logs/                         # Migration logs
└── package.json
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `WC_URL` | Yes | WooCommerce store URL |
| `WC_CONSUMER_KEY` | Yes | WC REST API consumer key |
| `WC_CONSUMER_SECRET` | Yes | WC REST API consumer secret |
| `BC_STORE_HASH` | Yes | BigCommerce store hash |
| `BC_ACCESS_TOKEN` | Yes | BigCommerce API access token |

## API Limits

| Platform | Limit | Implementation |
|----------|-------|----------------|
| BigCommerce | 150 requests / 30 seconds | Bottleneck rate limiter |
| BigCommerce | 10 items per batch | Chunked batch operations |
| BigCommerce | 600 variants per product | Warning + truncation |
| WooCommerce | No hard limit | Paginated requests |

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## Troubleshooting

### Connection Errors

**WooCommerce 401 Unauthorized**
- Verify `WC_CONSUMER_KEY` and `WC_CONSUMER_SECRET`
- Ensure REST API is enabled in WooCommerce settings
- Check if the API keys have read permissions

**BigCommerce 401/403**
- Verify `BC_STORE_HASH` and `BC_ACCESS_TOKEN`
- Ensure token has required scopes (Products, Customers, Orders)

### Rate Limiting

If you see rate limit errors:
- The tool automatically handles rate limiting with exponential backoff
- Check `logs/migration-*.log` for detailed request timing
- Consider reducing batch sizes for very large migrations

### Missing Products/Categories

- Run `npm run validate` to check for discrepancies
- Check logs for transformation warnings
- Products without SKUs get auto-generated SKUs (`wc-{id}`)
- Categories with duplicate names are skipped (idempotent)

### Variant Issues

- BC has a 600 variant limit per product
- Products exceeding this limit will show a warning
- Variations without parent attributes are skipped

## Documentation

- [Documentation Home](docs/README.md) - Complete documentation index
- [Getting Started](docs/getting-started/) - Quick start guides by persona
- [Migration Architecture](docs/platform/architecture/MIGRATION_ARCHITECTURE.md) - Technical design and data models
- [Roadmap (EARS)](docs/resources/strategy/ROADMAP_EARS.md) - Requirements specification
- [Handoff Guide](docs/resources/strategy/HANDOFF.md) - Project context and quick start

**Documentation Site:** Access the full documentation site at `/docs` when running the dashboard.

## License

Proprietary - BigCommerce
