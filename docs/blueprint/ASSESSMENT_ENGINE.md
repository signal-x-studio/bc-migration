# Assessment Engine Blueprint

## Intent
The Assessment Engine is a standalone CLI tool designed to qualify a WooCommerce store for BigCommerce migration. It provides a "readiness score" to determine if a store is a "Green/Yellow/Red" fit for the automated migration path.

## Architecture Pattern: Collector-Orchestrator
We use a decoupled pattern to ensure scalability and ease of testing.

### 1. Collectors (`src/assessment/collectors/`)
- **ScaleCollector**: Interrogates WC API headers (`X-WP-Total`) to get counts for products, orders, and customers without downloading large payloads.
- **ComplexityCollector**: Samples a small percentage of products to analyze meta-field density and specialized product types (variable, grouped, etc.).

### 2. Orchestrator (`src/assessment/orchestrator.ts`)
- Coordinates the execution of all collectors.
- Aggregates results into a single `AssessmentResult` object.
- Handles connection testing and version verification.

### 3. Report Generator (`src/assessment/report.ts`)
- Transforms the `AssessmentResult` into human-readable Markdown and machine-readable JSON.
- Intent: Provide a "sales-ready" artifact for WPEngine referrals.

## AI Integration (Future)
The engine is architected to include AI-driven collectors that can scan `functions.php` or `plugins/` directories to identify custom business logic that might block the migration.
