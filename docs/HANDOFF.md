# BC Migration - Session Handoff

## Quick Start

```bash
# Open in Cursor
cursor /Users/nino/Workspace/dev/products/bc-migration

# Open in Windsurf
windsurf /Users/nino/Workspace/dev/products/bc-migration

# Install dependencies first
cd /Users/nino/Workspace/dev/products/bc-migration && npm install
```

---

## Context for New Agent

You are building a **WooCommerce → BigCommerce migration product** for BigCommerce. This is a real initiative with WPEngine partnership, not a hypothetical exercise.

### The Business Context

- **BigCommerce + WPEngine partnership** is real (already in talks with their CEO/CFO)
- **8,000 mid-market WooCommerce stores** at WPEngine are migration targets
- **3 customers + 3 agencies** already lined up as pilot testers
- **Goal:** Make migration dramatically easier than BigCommerce's current reputation suggests
- **Key constraint:** WordPress must stay intact - only the commerce engine changes

### The Technical Approach

```
BEFORE                              AFTER
WordPress + WooCommerce    →    WordPress + BC Bridge Plugin
     (all-in-one)                    ↓
                               BigCommerce API
                               (products, orders, checkout)
```

**NOT a replatform** - it's "swap the commerce engine while keeping WordPress."

---

## Key Documents

| Document | Purpose |
|----------|---------|
| `docs/MIGRATION_ARCHITECTURE.md` | Technical architecture, data models, integration patterns |
| `docs/ROADMAP_EARS.md` | EPICs, features, EARS requirements (90+ specs) |
| `docs/HANDOFF.md` | This file |
| `docs/strategy-kit/` | Strategic assessment for BC leadership (business context) |
| `README.md` | Project setup, commands |

### Strategy Kit (Business Context)

The `docs/strategy-kit/` folder contains the strategic assessment materials that justify this initiative:

- `INDEX.html` → Entry point (open in browser)
- `STRATEGIC_ASSESSMENT.html` → 7-part decision document
- `appendices/` → Market research, partnership analysis, red team
- `execution/` → Product strategy, tech architecture, roadmap

**View it:** `open docs/strategy-kit/INDEX.html`

---

## What to Build First

**EPIC 1: Assessment Engine** - Standalone tool, immediate value, feeds everything else.

### Assessment Engine MVP Scope

```
INPUT:  WooCommerce store credentials (URL, consumer key, consumer secret)
OUTPUT: JSON/Markdown readiness report with:
        - Scale metrics (products, variants, customers, orders)
        - Complexity score (0-100)
        - Plugin compatibility analysis
        - Blockers and warnings
        - Estimated migration duration
```

### Key APIs

**WooCommerce REST API v3:**
- `GET /wp-json/wc/v3/products` - Products (check `X-WP-Total` header for count)
- `GET /wp-json/wc/v3/products/categories` - Categories
- `GET /wp-json/wc/v3/customers` - Customers
- `GET /wp-json/wc/v3/orders` - Orders
- `GET /wp-json/wp/v2/plugins` - Active plugins (requires admin perms)

**BigCommerce REST API:**
- `POST /catalog/products` - Create products (batch up to 10)
- `POST /catalog/categories` - Create categories
- `POST /customers` - Create customers (batch up to 10)
- Rate limit: 150 requests / 30 seconds

### Available Resources

- BigCommerce API docs: https://developer.bigcommerce.com/docs/api
- BigCommerce sandbox environment (credentials in .env)
- WooCommerce REST API docs: https://woocommerce.github.io/woocommerce-rest-api-docs/

---

## Project Structure

```
bc-migration/
├── src/
│   ├── cli.ts                 # CLI entry point
│   ├── assessment/
│   │   ├── index.ts           # Assessment orchestrator
│   │   ├── wc-client.ts       # WooCommerce API client
│   │   ├── collectors/
│   │   │   ├── scale.ts       # Product/customer counts
│   │   │   ├── complexity.ts  # Meta density, plugin analysis
│   │   │   └── seo.ts         # URL structure analysis
│   │   └── report.ts          # Report generation
│   ├── migration/
│   │   ├── index.ts           # Migration orchestrator
│   │   ├── bc-client.ts       # BigCommerce API client
│   │   ├── transformers/
│   │   │   ├── category.ts    # WC → BC category transform
│   │   │   ├── product.ts     # WC → BC product transform
│   │   │   └── customer.ts    # WC → BC customer transform
│   │   └── state.ts           # Migration state persistence
│   └── validation/
│       └── index.ts           # Validation orchestrator
├── docs/
│   ├── MIGRATION_ARCHITECTURE.md
│   ├── ROADMAP_EARS.md
│   └── HANDOFF.md
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

---

## Commands

```bash
# Development
npm run dev              # Run CLI with tsx
npm run assess           # Run assessment
npm run migrate          # Run migration
npm run validate         # Run validation

# Production
npm run build            # Compile TypeScript
node dist/cli.js assess  # Run compiled CLI
```

---

## Environment Setup

```bash
# 1. Copy environment template
cp .env.example .env

# 2. Edit .env with your credentials
# WC_URL, WC_CONSUMER_KEY, WC_CONSUMER_SECRET
# BC_STORE_HASH, BC_ACCESS_TOKEN

# 3. Install dependencies
npm install

# 4. Test WC connection
npm run assess
```

---

## Prompt for New Agent

Copy this into Cursor/Windsurf:

```
Read the docs folder (HANDOFF.md, MIGRATION_ARCHITECTURE.md, ROADMAP_EARS.md) to understand the project context.

This is a WooCommerce → BigCommerce migration product. Build EPIC 1: Assessment Engine.

Start by creating:
1. src/cli.ts - CLI entry point using Commander
2. src/assessment/wc-client.ts - WooCommerce API client
3. src/assessment/collectors/scale.ts - Collect product/customer counts
4. src/assessment/report.ts - Generate readiness report

Use the EARS requirements in ROADMAP_EARS.md as your specification.
```

---

## Open Questions

1. **Test WC store** - Do you have a WooCommerce store to test against?
2. **BC sandbox** - Store hash and access token ready?
3. **WordPress plugin** - Separate repo for BC Bridge plugin? (EPIC 3)

---

## Team

- **Nino** - Technical lead
- **Jordan Sim** - VP Product, Small Business/Mid-market (BigCommerce)
- **Ziggy** - WPEngine engineer (Krakow)

---

*Project: /Users/nino/Workspace/dev/products/bc-migration*
*Last updated: December 2025*
