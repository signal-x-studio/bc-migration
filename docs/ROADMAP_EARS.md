# WooCommerce → BigCommerce Migration Product Roadmap

## EARS Requirements Specification

This roadmap uses the **Easy Approach to Requirements Syntax (EARS)** methodology to specify requirements with reduced ambiguity.

### EARS Pattern Reference

| Pattern | Keyword | Use Case |
|---------|---------|----------|
| Ubiquitous | (none) | Always active, fundamental behavior |
| Event-driven | **When** | Response to specific trigger |
| State-driven | **While** | Active during specific condition |
| Optional | **Where** | Feature-dependent behavior |
| Unwanted | **If...then** | Error handling, edge cases |
| Complex | **While...when** | Combined conditions |

---

# EPIC 1: Assessment Engine

**Goal:** Automated analysis of WooCommerce stores to produce migration readiness reports.

**Business Value:** Instant qualification of migration candidates. Reduces manual discovery from days to minutes.

**Dependencies:** None (standalone tool)

---

## Feature 1.1: Store Connection

### Requirements

**REQ-1.1.1** (Event-driven)
> **When** the operator provides WooCommerce store credentials (URL, consumer key, consumer secret), the Assessment Engine shall validate API connectivity within 10 seconds.

**REQ-1.1.2** (Unwanted)
> **If** the WooCommerce REST API returns a 401 Unauthorized error, **then** the Assessment Engine shall display "Invalid API credentials - verify consumer key and secret have read permissions."

**REQ-1.1.3** (Unwanted)
> **If** the WooCommerce REST API is unreachable after 30 seconds, **then** the Assessment Engine shall display "Store unreachable - verify URL and that REST API is enabled."

**REQ-1.1.4** (Event-driven)
> **When** API connectivity is validated, the Assessment Engine shall retrieve and display the WooCommerce version number.

**REQ-1.1.5** (Unwanted)
> **If** the WooCommerce version is below 5.0, **then** the Assessment Engine shall display a warning "WooCommerce version {version} detected - migration may require version upgrade first."

### Acceptance Criteria
- [ ] Can connect to WC REST API v3
- [ ] Validates credentials before proceeding
- [ ] Displays clear error messages for common failures
- [ ] Stores connection for reuse during assessment

---

## Feature 1.2: Scale Metrics Collection

### Requirements

**REQ-1.2.1** (Event-driven)
> **When** store connection is established, the Assessment Engine shall count total products by querying `/products` endpoint with `per_page=1` and reading the `X-WP-Total` header.

**REQ-1.2.2** (Event-driven)
> **When** store connection is established, the Assessment Engine shall count product variations by querying products with `type=variable` and summing variation counts.

**REQ-1.2.3** (Event-driven)
> **When** store connection is established, the Assessment Engine shall count total customers via `/customers` endpoint header.

**REQ-1.2.4** (Event-driven)
> **When** store connection is established, the Assessment Engine shall count total orders via `/orders` endpoint header.

**REQ-1.2.5** (Event-driven)
> **When** store connection is established, the Assessment Engine shall count product categories via `/products/categories` endpoint header.

**REQ-1.2.6** (Ubiquitous)
> The Assessment Engine shall complete all scale metrics collection within 60 seconds for stores with fewer than 100,000 products.

### Acceptance Criteria
- [ ] Retrieves counts without fetching full records
- [ ] Handles pagination headers correctly
- [ ] Reports progress during collection
- [ ] Produces accurate counts (validated against WC admin)

---

## Feature 1.3: Complexity Analysis

### Requirements

**REQ-1.3.1** (Event-driven)
> **When** scale metrics are collected, the Assessment Engine shall retrieve a sample of 100 products to analyze metadata density.

**REQ-1.3.2** (Event-driven)
> **When** product sample is retrieved, the Assessment Engine shall calculate average meta fields per product.

**REQ-1.3.3** (State-driven)
> **While** analyzing product sample, the Assessment Engine shall identify products with more than 100 variations and flag as "high complexity."

**REQ-1.3.4** (Event-driven)
> **When** product sample is retrieved, the Assessment Engine shall identify unique product types (simple, variable, grouped, external, subscription, bundle).

**REQ-1.3.5** (Event-driven)
> **When** the Assessment Engine detects product type "subscription", it shall flag "WooCommerce Subscriptions detected - manual migration required."

**REQ-1.3.6** (Event-driven)
> **When** the Assessment Engine detects product type "bundle", it shall flag "WooCommerce Bundles detected - BC bundle mapping required."

**REQ-1.3.7** (Event-driven)
> **When** complexity analysis completes, the Assessment Engine shall calculate a complexity score from 0-100 based on: product count (20%), variation density (20%), meta density (20%), plugin integrations (20%), URL customization (20%).

### Acceptance Criteria
- [ ] Samples representative products (across categories)
- [ ] Identifies all WC product types
- [ ] Flags known problematic extensions
- [ ] Produces reproducible complexity scores

---

## Feature 1.4: Plugin Detection

### Requirements

**REQ-1.4.1** (Event-driven)
> **When** store connection is established, the Assessment Engine shall query the WordPress REST API `/wp/v2/plugins` endpoint to list active plugins.

**REQ-1.4.2** (Unwanted)
> **If** the plugins endpoint returns 403 Forbidden, **then** the Assessment Engine shall note "Plugin list unavailable - requires administrator API credentials."

**REQ-1.4.3** (Event-driven)
> **When** plugin list is retrieved, the Assessment Engine shall categorize plugins into: payment gateways, shipping methods, tax services, subscriptions/memberships, SEO, and other.

**REQ-1.4.4** (Event-driven)
> **When** the Assessment Engine detects a payment gateway plugin, it shall check if BigCommerce supports an equivalent and note compatibility status.

**REQ-1.4.5** (Event-driven)
> **When** the Assessment Engine detects Yoast SEO or RankMath, it shall flag "SEO metadata migration available via plugin-specific export."

### Plugin Compatibility Matrix

| WC Plugin | BC Equivalent | Migration Path |
|-----------|---------------|----------------|
| Stripe for WooCommerce | BC Stripe | Reconfigure |
| PayPal for WooCommerce | BC PayPal | Reconfigure |
| Square for WooCommerce | BC Square | Reconfigure |
| WC Subscriptions | BC Subscriptions (limited) | Manual/Partial |
| WC Memberships | No direct equivalent | Custom solution |
| ShipStation | BC ShipStation | Reconfigure |
| TaxJar | BC TaxJar | Reconfigure |
| Yoast SEO | N/A (stays in WP) | Export meta |

### Acceptance Criteria
- [ ] Identifies payment, shipping, tax plugins
- [ ] Maps to BC equivalents where available
- [ ] Flags plugins requiring manual migration
- [ ] Works with limited API permissions (graceful degradation)

---

## Feature 1.5: SEO & URL Analysis

### Requirements

**REQ-1.5.1** (Event-driven)
> **When** store connection is established, the Assessment Engine shall retrieve the WordPress permalink structure from `/wp/v2/settings` or by inferring from product URLs.

**REQ-1.5.2** (Event-driven)
> **When** permalink structure is identified, the Assessment Engine shall classify as: standard (`/product/slug/`), custom, or numeric.

**REQ-1.5.3** (State-driven)
> **While** permalink structure is "custom", the Assessment Engine shall flag "Custom URL structure detected - redirect mapping required."

**REQ-1.5.4** (Event-driven)
> **When** Yoast SEO is detected, the Assessment Engine shall note "Yoast metadata (titles, descriptions, canonical URLs) exportable for migration."

**REQ-1.5.5** (Event-driven)
> **When** URL analysis completes, the Assessment Engine shall generate a sample URL mapping showing 10 example WC URLs and their proposed BC equivalents.

### Acceptance Criteria
- [ ] Correctly identifies permalink structure
- [ ] Estimates redirect mapping effort
- [ ] Samples actual product URLs
- [ ] Provides BC URL recommendations

---

## Feature 1.6: Readiness Report Generation

### Requirements

**REQ-1.6.1** (Event-driven)
> **When** all analysis phases complete, the Assessment Engine shall generate a structured JSON report containing: scale metrics, complexity score, plugin analysis, URL analysis, blockers, and recommendations.

**REQ-1.6.2** (Event-driven)
> **When** report is generated, the Assessment Engine shall produce a human-readable summary in Markdown format.

**REQ-1.6.3** (Ubiquitous)
> The Assessment Engine shall categorize overall readiness as: GREEN (proceed), YELLOW (proceed with caveats), or RED (blockers present).

**REQ-1.6.4** (State-driven)
> **While** readiness is RED, the Assessment Engine shall list all blocking issues that must be resolved before migration.

**REQ-1.6.5** (Event-driven)
> **When** report is generated, the Assessment Engine shall estimate migration duration based on: product count, complexity score, and identified blockers.

**REQ-1.6.6** (Ubiquitous)
> The Assessment Engine shall include a "Migration Checklist" section with pre-migration tasks based on detected configuration.

### Report Schema

```json
{
  "store": {
    "url": "string",
    "wc_version": "string",
    "wp_version": "string",
    "assessed_at": "ISO8601"
  },
  "scale": {
    "products": "number",
    "variations": "number",
    "categories": "number",
    "customers": "number",
    "orders": "number"
  },
  "complexity": {
    "score": "0-100",
    "factors": {
      "product_count": "low|medium|high",
      "variation_density": "low|medium|high",
      "meta_density": "low|medium|high",
      "plugin_integrations": "low|medium|high",
      "url_customization": "low|medium|high"
    }
  },
  "plugins": {
    "payment": ["array"],
    "shipping": ["array"],
    "tax": ["array"],
    "other": ["array"]
  },
  "blockers": ["array of strings"],
  "warnings": ["array of strings"],
  "readiness": "GREEN|YELLOW|RED",
  "estimated_duration": {
    "migration": "string",
    "validation": "string",
    "total": "string"
  }
}
```

### Acceptance Criteria
- [ ] Generates valid JSON report
- [ ] Produces readable Markdown summary
- [ ] Estimates match actual migration times (±25%)
- [ ] Checklist is actionable and complete

---

# EPIC 2: Data Migration Pipeline

**Goal:** Automated extraction from WooCommerce and loading into BigCommerce.

**Business Value:** Reduces manual data entry from weeks to hours. Ensures data integrity.

**Dependencies:** EPIC 1 (Assessment Engine provides migration parameters)

---

## Feature 2.1: Category Migration

### Requirements

**REQ-2.1.1** (Event-driven)
> **When** migration is initiated, the Data Migration Pipeline shall extract all product categories from WooCommerce via `/products/categories` endpoint with pagination.

**REQ-2.1.2** (Ubiquitous)
> The Data Migration Pipeline shall preserve category hierarchy (parent-child relationships) during migration.

**REQ-2.1.3** (Event-driven)
> **When** categories are extracted, the Data Migration Pipeline shall transform WC category structure to BC category format, including: name, description, parent_id, image_url, custom_url.

**REQ-2.1.4** (Event-driven)
> **When** categories are transformed, the Data Migration Pipeline shall create categories in BigCommerce via batch POST to `/catalog/categories`, processing parent categories before children.

**REQ-2.1.5** (Event-driven)
> **When** BC category creation succeeds, the Data Migration Pipeline shall store the WC-to-BC category ID mapping for product migration.

**REQ-2.1.6** (Unwanted)
> **If** category creation fails, **then** the Data Migration Pipeline shall log the error, skip the category, and continue with remaining categories.

**REQ-2.1.7** (Unwanted)
> **If** a category name exceeds BC's 50-character limit, **then** the Data Migration Pipeline shall truncate the name and log a warning.

### Acceptance Criteria
- [ ] Migrates all categories including nested hierarchies
- [ ] Preserves parent-child relationships
- [ ] Handles category images
- [ ] Creates ID mapping for product references

---

## Feature 2.2: Product Migration

### Requirements

**REQ-2.2.1** (Event-driven)
> **When** category migration completes, the Data Migration Pipeline shall extract products from WooCommerce in batches of 100 via `/products` endpoint.

**REQ-2.2.2** (Ubiquitous)
> The Data Migration Pipeline shall transform WC product fields to BC product fields according to the defined mapping (see MIGRATION_ARCHITECTURE.md Phase 2).

**REQ-2.2.3** (Event-driven)
> **When** transforming a simple product, the Data Migration Pipeline shall set BC `type` to "physical" and `inventory_tracking` based on WC `manage_stock`.

**REQ-2.2.4** (Event-driven)
> **When** transforming a variable product, the Data Migration Pipeline shall create BC options from WC attributes and create variants for each WC variation.

**REQ-2.2.5** (Event-driven)
> **When** products are transformed, the Data Migration Pipeline shall create products in BigCommerce via batch POST to `/catalog/products`, maximum 10 products per request.

**REQ-2.2.6** (State-driven)
> **While** migrating products, the Data Migration Pipeline shall respect BC API rate limits (150 requests per 30 seconds) by implementing exponential backoff.

**REQ-2.2.7** (Event-driven)
> **When** BC product creation succeeds, the Data Migration Pipeline shall store the WC-to-BC product ID mapping.

**REQ-2.2.8** (Unwanted)
> **If** product creation fails due to duplicate SKU, **then** the Data Migration Pipeline shall append a suffix to the SKU and retry once.

**REQ-2.2.9** (Unwanted)
> **If** product creation fails for other reasons, **then** the Data Migration Pipeline shall log the error with full request/response and continue with remaining products.

**REQ-2.2.10** (Event-driven)
> **When** product migration completes, the Data Migration Pipeline shall report: total attempted, successful, failed, and skipped counts.

### Field Mapping (Implemented)

```typescript
interface WCProduct {
  id: number;
  name: string;
  slug: string;
  type: 'simple' | 'variable' | 'grouped' | 'external';
  status: 'publish' | 'draft' | 'pending' | 'private';
  description: string;
  short_description: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  manage_stock: boolean;
  stock_quantity: number | null;
  weight: string;
  dimensions: { length: string; width: string; height: string };
  categories: { id: number; name: string; slug: string }[];
  images: { id: number; src: string; alt: string }[];
  attributes: WCAttribute[];
  variations: number[];
  meta_data: { key: string; value: any }[];
}

interface BCProduct {
  name: string;
  type: 'physical' | 'digital';
  sku: string;
  description: string;
  price: number;
  sale_price?: number;
  weight: number;
  width?: number;
  height?: number;
  depth?: number;
  categories: number[];
  is_visible: boolean;
  inventory_tracking: 'none' | 'product' | 'variant';
  inventory_level?: number;
  images: { image_url: string; is_thumbnail: boolean }[];
  custom_url: { url: string; is_customized: boolean };
  variants?: BCVariant[];
  options?: BCOption[];
  custom_fields?: { name: string; value: string }[];
}
```

### Acceptance Criteria
- [ ] Migrates simple products correctly
- [ ] Migrates variable products with all variants
- [ ] Preserves pricing (regular, sale)
- [ ] Preserves inventory levels
- [ ] Migrates images (BC fetches from WP URLs)
- [ ] Handles rate limiting gracefully
- [ ] Produces detailed migration log

---

## Feature 2.3: Customer Migration

### Requirements

**REQ-2.3.1** (Event-driven)
> **When** product migration completes, the Data Migration Pipeline shall extract customers from WooCommerce via `/customers` endpoint with pagination.

**REQ-2.3.2** (Ubiquitous)
> The Data Migration Pipeline shall NOT migrate customer passwords (they are hashed and non-transferable).

**REQ-2.3.3** (Event-driven)
> **When** transforming customers, the Data Migration Pipeline shall map WC billing and shipping addresses to BC address format.

**REQ-2.3.4** (Event-driven)
> **When** customers are transformed, the Data Migration Pipeline shall create customers in BigCommerce via batch POST to `/customers`, maximum 10 per request.

**REQ-2.3.5** (Unwanted)
> **If** customer creation fails due to duplicate email, **then** the Data Migration Pipeline shall log a warning and skip (customer already exists in BC).

**REQ-2.3.6** (Event-driven)
> **When** customer migration completes, the Data Migration Pipeline shall store the WC-to-BC customer ID mapping.

**REQ-2.3.7** (Event-driven)
> **When** customer migration completes, the Data Migration Pipeline shall generate a list of customer emails requiring password reset notification.

### Acceptance Criteria
- [ ] Migrates customer profile data
- [ ] Migrates billing and shipping addresses
- [ ] Handles duplicate emails gracefully
- [ ] Produces password reset list
- [ ] Creates ID mapping for order references (if applicable)

---

## Feature 2.4: Migration State Management

### Requirements

**REQ-2.4.1** (Ubiquitous)
> The Data Migration Pipeline shall persist migration state to enable resume after interruption.

**REQ-2.4.2** (Event-driven)
> **When** migration is interrupted (process crash, network failure), the Data Migration Pipeline shall resume from the last successfully migrated item upon restart.

**REQ-2.4.3** (Ubiquitous)
> The Data Migration Pipeline shall maintain ID mapping tables (WC ID → BC ID) for: categories, products, customers.

**REQ-2.4.4** (Event-driven)
> **When** migration completes, the Data Migration Pipeline shall export ID mappings to JSON for reference.

**REQ-2.4.5** (State-driven)
> **While** migration is in progress, the Data Migration Pipeline shall display real-time progress: current phase, items processed, estimated time remaining.

### State Schema

```json
{
  "migration_id": "uuid",
  "started_at": "ISO8601",
  "status": "in_progress|completed|failed|paused",
  "phases": {
    "categories": {
      "status": "pending|in_progress|completed|failed",
      "total": "number",
      "processed": "number",
      "failed": "number",
      "last_processed_id": "number"
    },
    "products": { ... },
    "customers": { ... }
  },
  "mappings": {
    "categories": { "wc_id": "bc_id" },
    "products": { "wc_id": "bc_id" },
    "customers": { "wc_id": "bc_id" }
  },
  "errors": [
    {
      "phase": "string",
      "item_id": "number",
      "error": "string",
      "timestamp": "ISO8601"
    }
  ]
}
```

### Acceptance Criteria
- [ ] Survives process restart
- [ ] Resumes without duplicating data
- [ ] Exports usable ID mappings
- [ ] Provides accurate progress reporting

---

## Feature 2.5: Delta Sync

### Requirements

**REQ-2.5.1** (Event-driven)
> **When** operator requests delta sync, the Data Migration Pipeline shall identify products modified in WooCommerce since the last migration run.

**REQ-2.5.2** (Event-driven)
> **When** modified products are identified, the Data Migration Pipeline shall update corresponding BC products via PUT requests.

**REQ-2.5.3** (Event-driven)
> **When** new products are identified (created after last migration), the Data Migration Pipeline shall create them in BC.

**REQ-2.5.4** (Event-driven)
> **When** delta sync completes, the Data Migration Pipeline shall report: updated count, created count, unchanged count.

**REQ-2.5.5** (Ubiquitous)
> The Data Migration Pipeline shall use WC product `date_modified` field to identify changes.

### Acceptance Criteria
- [ ] Identifies products modified since last run
- [ ] Updates existing BC products correctly
- [ ] Creates new products
- [ ] Does not re-migrate unchanged products
- [ ] Completes faster than full migration

---

# EPIC 3: BC Bridge WordPress Plugin

**Goal:** WordPress plugin that renders BigCommerce product data while keeping WordPress intact.

**Business Value:** Enables "keep WordPress" value proposition. Minimal merchant disruption.

**Dependencies:** EPIC 2 (requires migrated data in BC)

---

## Feature 3.1: Plugin Setup & Configuration

### Requirements

**REQ-3.1.1** (Event-driven)
> **When** the BC Bridge plugin is activated, it shall display a setup wizard prompting for BigCommerce API credentials (store hash, access token).

**REQ-3.1.2** (Event-driven)
> **When** API credentials are entered, the BC Bridge plugin shall validate connectivity by fetching the store information endpoint.

**REQ-3.1.3** (Unwanted)
> **If** API validation fails, **then** the BC Bridge plugin shall display the specific error and prevent setup completion.

**REQ-3.1.4** (Event-driven)
> **When** API validation succeeds, the BC Bridge plugin shall store credentials securely in WordPress options (encrypted).

**REQ-3.1.5** (Event-driven)
> **When** setup completes, the BC Bridge plugin shall register custom rewrite rules for `/shop`, `/product/*`, and `/product-category/*` routes.

**REQ-3.1.6** (Event-driven)
> **When** rewrite rules are registered, the BC Bridge plugin shall flush WordPress rewrite rules.

### Acceptance Criteria
- [ ] Setup wizard is user-friendly
- [ ] Validates credentials before saving
- [ ] Stores credentials securely
- [ ] Registers routes without conflicts
- [ ] Works with common permalink structures

---

## Feature 3.2: Product Listing (Archive)

### Requirements

**REQ-3.2.1** (Event-driven)
> **When** a visitor requests `/shop`, the BC Bridge plugin shall fetch the product catalog from BC API and render the archive template.

**REQ-3.2.2** (State-driven)
> **While** rendering product archive, the BC Bridge plugin shall use cached product data if cache is valid (TTL: 1 hour).

**REQ-3.2.3** (Unwanted)
> **If** BC API is unreachable, **then** the BC Bridge plugin shall display a user-friendly error message and log the failure.

**REQ-3.2.4** (Event-driven)
> **When** visitor requests `/shop?category=shirts`, the BC Bridge plugin shall filter products by the specified category.

**REQ-3.2.5** (Event-driven)
> **When** visitor requests `/shop?page=2`, the BC Bridge plugin shall display the second page of products (12 products per page default).

**REQ-3.2.6** (Event-driven)
> **When** visitor requests `/product-category/shirts/`, the BC Bridge plugin shall display products in that category.

**REQ-3.2.7** (Ubiquitous)
> The BC Bridge plugin shall provide template tags (`bc_product_title()`, `bc_product_price()`, `bc_product_image()`, etc.) for theme customization.

### Acceptance Criteria
- [ ] Displays product grid/list
- [ ] Supports pagination
- [ ] Supports category filtering
- [ ] Uses caching effectively
- [ ] Themes can customize appearance

---

## Feature 3.3: Product Detail (Single)

### Requirements

**REQ-3.3.1** (Event-driven)
> **When** a visitor requests `/product/{slug}`, the BC Bridge plugin shall fetch the product by custom_url from BC API and render the single product template.

**REQ-3.3.2** (Event-driven)
> **When** product data is fetched, the BC Bridge plugin shall display: name, price, description, images, variants (if applicable), stock status.

**REQ-3.3.3** (State-driven)
> **While** product has variants, the BC Bridge plugin shall render variant selectors (dropdowns, swatches) based on BC options.

**REQ-3.3.4** (Event-driven)
> **When** visitor selects a variant, the BC Bridge plugin shall update displayed price and stock status via JavaScript.

**REQ-3.3.5** (Unwanted)
> **If** requested product slug does not exist in BC, **then** the BC Bridge plugin shall return a 404 response and display the theme's 404 template.

**REQ-3.3.6** (Event-driven)
> **When** product has related products in BC, the BC Bridge plugin shall display a "Related Products" section.

### Acceptance Criteria
- [ ] Displays complete product information
- [ ] Variant selection updates price/stock
- [ ] Image gallery works (thumbnails, zoom)
- [ ] 404 handling matches theme
- [ ] SEO meta tags are populated

---

## Feature 3.4: Cart Management

### Requirements

**REQ-3.4.1** (Event-driven)
> **When** visitor clicks "Add to Cart", the BC Bridge plugin shall create or update a BC cart via the Storefront Cart API.

**REQ-3.4.2** (Event-driven)
> **When** cart is created, the BC Bridge plugin shall store the BC cart ID in a browser cookie.

**REQ-3.4.3** (Event-driven)
> **When** visitor views the cart page, the BC Bridge plugin shall fetch cart contents from BC API and display line items.

**REQ-3.4.4** (Event-driven)
> **When** visitor updates quantity, the BC Bridge plugin shall update the BC cart and refresh the display.

**REQ-3.4.5** (Event-driven)
> **When** visitor removes an item, the BC Bridge plugin shall remove from BC cart and refresh the display.

**REQ-3.4.6** (Ubiquitous)
> The BC Bridge plugin shall display a mini-cart widget showing item count and total.

**REQ-3.4.7** (State-driven)
> **While** cart is empty, the BC Bridge plugin shall display "Your cart is empty" with a link to continue shopping.

### Acceptance Criteria
- [ ] Add to cart works for simple products
- [ ] Add to cart works for variants
- [ ] Cart persists across page views
- [ ] Quantity updates work
- [ ] Item removal works
- [ ] Mini-cart reflects current state

---

## Feature 3.5: Checkout Redirect

### Requirements

**REQ-3.5.1** (Event-driven)
> **When** visitor clicks "Proceed to Checkout", the BC Bridge plugin shall generate a BC checkout URL and redirect the visitor.

**REQ-3.5.2** (Event-driven)
> **When** generating checkout URL, the BC Bridge plugin shall use the BC Storefront API checkout endpoint with the current cart ID.

**REQ-3.5.3** (State-driven)
> **While** visitor is logged into WordPress, the BC Bridge plugin shall pass customer email to BC checkout for pre-population.

**REQ-3.5.4** (Event-driven)
> **When** BC checkout completes, the visitor shall be redirected back to WordPress (configurable thank-you page).

**REQ-3.5.5** (Optional)
> **Where** embedded checkout is enabled, the BC Bridge plugin shall embed the BC checkout within a WordPress page using the Embedded Checkout SDK.

### Acceptance Criteria
- [ ] Checkout redirect works
- [ ] Cart transfers to BC checkout
- [ ] Return URL is configurable
- [ ] Works for guest and logged-in users

---

## Feature 3.6: Customer Sync

### Requirements

**REQ-3.6.1** (Event-driven)
> **When** a WordPress user logs in, the BC Bridge plugin shall check if a BC customer exists with matching email.

**REQ-3.6.2** (Unwanted)
> **If** no BC customer exists, **then** the BC Bridge plugin shall create one using the WP user's profile data.

**REQ-3.6.3** (Event-driven)
> **When** BC customer is found or created, the BC Bridge plugin shall store the BC customer ID in WordPress user meta (`bc_customer_id`).

**REQ-3.6.4** (State-driven)
> **While** WordPress user has a linked BC customer, the BC Bridge plugin shall use the BC customer ID for cart and checkout operations.

**REQ-3.6.5** (Event-driven)
> **When** WordPress user updates their profile, the BC Bridge plugin shall optionally sync changes to BC customer record.

### Acceptance Criteria
- [ ] Login triggers customer lookup/creation
- [ ] Customer ID is persisted in WP
- [ ] Cart is associated with customer
- [ ] Checkout pre-populates customer info

---

## Feature 3.7: Cache & Webhooks

### Requirements

**REQ-3.7.1** (Ubiquitous)
> The BC Bridge plugin shall cache BC API responses using WordPress transients.

**REQ-3.7.2** (Ubiquitous)
> The BC Bridge plugin shall use the following cache TTLs: product catalog (1 hour), single product (1 hour), categories (24 hours), inventory (5 minutes).

**REQ-3.7.3** (Event-driven)
> **When** the BC Bridge plugin receives a webhook POST to `/wp-json/bc-bridge/v1/webhook`, it shall validate the webhook signature.

**REQ-3.7.4** (Event-driven)
> **When** a valid `store/product/updated` webhook is received, the BC Bridge plugin shall invalidate the cache for that product.

**REQ-3.7.5** (Event-driven)
> **When** a valid `store/product/inventory/updated` webhook is received, the BC Bridge plugin shall invalidate inventory cache for that product.

**REQ-3.7.6** (Event-driven)
> **When** a valid `store/category/*` webhook is received, the BC Bridge plugin shall invalidate all category caches.

**REQ-3.7.7** (Unwanted)
> **If** webhook signature validation fails, **then** the BC Bridge plugin shall return 401 and log the attempt.

### Acceptance Criteria
- [ ] Caching reduces API calls significantly
- [ ] Webhooks trigger cache invalidation
- [ ] Invalid webhooks are rejected
- [ ] Cache can be manually cleared from admin

---

# EPIC 4: Validation Framework

**Goal:** Automated and manual verification that migration was successful.

**Business Value:** Confidence in migration quality. Reduces post-migration issues.

**Dependencies:** EPIC 2 (Data Migration), EPIC 3 (BC Bridge)

---

## Feature 4.1: Automated Data Validation

### Requirements

**REQ-4.1.1** (Event-driven)
> **When** migration completes, the Validation Framework shall compare product counts between WC and BC.

**REQ-4.1.2** (Unwanted)
> **If** product counts do not match, **then** the Validation Framework shall list missing products by SKU.

**REQ-4.1.3** (Event-driven)
> **When** validating products, the Validation Framework shall verify SKU uniqueness in BC.

**REQ-4.1.4** (Event-driven)
> **When** validating products, the Validation Framework shall sample 10% of products and compare prices between WC and BC.

**REQ-4.1.5** (Unwanted)
> **If** price mismatch is detected, **then** the Validation Framework shall flag the product and include both prices in the report.

**REQ-4.1.6** (Event-driven)
> **When** validating categories, the Validation Framework shall verify hierarchy matches between WC and BC.

**REQ-4.1.7** (Event-driven)
> **When** validating images, the Validation Framework shall perform HTTP HEAD requests to verify all product images return 200 OK.

**REQ-4.1.8** (Unwanted)
> **If** image URL returns non-200, **then** the Validation Framework shall flag the product with broken image.

### Acceptance Criteria
- [ ] Catches count mismatches
- [ ] Identifies price discrepancies
- [ ] Verifies image availability
- [ ] Produces actionable report

---

## Feature 4.2: Functional Validation

### Requirements

**REQ-4.2.1** (Event-driven)
> **When** operator requests functional validation, the Validation Framework shall execute a headless browser test suite.

**REQ-4.2.2** (Ubiquitous)
> The Validation Framework shall test: homepage loads, shop page loads, product detail loads, add to cart works, checkout redirect works.

**REQ-4.2.3** (Event-driven)
> **When** functional tests complete, the Validation Framework shall report pass/fail status for each test.

**REQ-4.2.4** (Event-driven)
> **When** a functional test fails, the Validation Framework shall capture a screenshot and error message.

**REQ-4.2.5** (Optional)
> **Where** visual regression is enabled, the Validation Framework shall compare screenshots against baseline and flag differences exceeding 5%.

### Test Suite

```typescript
const functionalTests = [
  { name: 'Homepage loads', url: '/', expect: 'status 200' },
  { name: 'Shop page loads', url: '/shop/', expect: 'contains products' },
  { name: 'Product page loads', url: '/product/{sample}/', expect: 'contains price' },
  { name: 'Add to cart', action: 'click .add-to-cart', expect: 'cart updated' },
  { name: 'Cart page', url: '/cart/', expect: 'contains line items' },
  { name: 'Checkout redirect', action: 'click .checkout', expect: 'redirect to BC' },
];
```

### Acceptance Criteria
- [ ] Runs automated browser tests
- [ ] Captures failures with evidence
- [ ] Provides clear pass/fail summary
- [ ] Can be run repeatedly

---

## Feature 4.3: Validation Report

### Requirements

**REQ-4.3.1** (Event-driven)
> **When** all validation phases complete, the Validation Framework shall generate a comprehensive validation report.

**REQ-4.3.2** (Ubiquitous)
> The validation report shall include: data validation results, functional test results, overall status (PASS/FAIL), and recommended actions.

**REQ-4.3.3** (State-driven)
> **While** overall status is FAIL, the validation report shall prominently display blocking issues.

**REQ-4.3.4** (Event-driven)
> **When** report is generated, the Validation Framework shall export to JSON, Markdown, and HTML formats.

### Acceptance Criteria
- [ ] Comprehensive single report
- [ ] Clear pass/fail determination
- [ ] Actionable next steps
- [ ] Multiple export formats

---

# EPIC 5: Operational Tooling

**Goal:** Tools for cutover, monitoring, and ongoing operations.

**Business Value:** Smooth go-live. Rapid issue resolution.

**Dependencies:** EPICs 1-4

---

## Feature 5.1: Cutover Checklist

### Requirements

**REQ-5.1.1** (Ubiquitous)
> The Operational Tooling shall provide an interactive cutover checklist with required and optional steps.

**REQ-5.1.2** (Event-driven)
> **When** a checklist item is completed, the Operational Tooling shall record completion timestamp and operator.

**REQ-5.1.3** (State-driven)
> **While** required items are incomplete, the Operational Tooling shall prevent cutover execution.

**REQ-5.1.4** (Event-driven)
> **When** all required items are complete, the Operational Tooling shall enable the "Execute Cutover" action.

### Checklist Items

```markdown
## Pre-Cutover (Required)
- [ ] All products migrated and validated
- [ ] BC Bridge plugin installed and tested
- [ ] Payment gateway configured in BC
- [ ] Shipping methods configured in BC
- [ ] Tax settings configured in BC
- [ ] Customer password reset emails drafted
- [ ] Redirect rules prepared
- [ ] Staging environment tested end-to-end
- [ ] Rollback plan documented

## Pre-Cutover (Recommended)
- [ ] CDN cache purge scheduled
- [ ] Monitoring alerts configured
- [ ] Support team briefed
- [ ] Customer communication scheduled

## Cutover Steps
- [ ] Enable maintenance mode
- [ ] Run final delta sync
- [ ] Deactivate WooCommerce
- [ ] Activate BC Bridge plugin
- [ ] Flush all caches
- [ ] Verify homepage loads
- [ ] Verify shop page loads
- [ ] Verify checkout flow
- [ ] Disable maintenance mode
- [ ] Send password reset emails
- [ ] Monitor for 1 hour

## Post-Cutover
- [ ] Verify first order flows through BC
- [ ] Check error logs
- [ ] Confirm webhooks firing
- [ ] Send go-live confirmation
```

### Acceptance Criteria
- [ ] Interactive checklist in admin
- [ ] Blocks premature cutover
- [ ] Records audit trail
- [ ] Includes rollback steps

---

## Feature 5.2: Rollback Procedure

### Requirements

**REQ-5.2.1** (Event-driven)
> **When** operator triggers rollback, the Operational Tooling shall deactivate BC Bridge plugin and reactivate WooCommerce.

**REQ-5.2.2** (Event-driven)
> **When** rollback is triggered, the Operational Tooling shall flush all caches.

**REQ-5.2.3** (Ubiquitous)
> The Operational Tooling shall preserve BC data (do not delete) during rollback.

**REQ-5.2.4** (Event-driven)
> **When** rollback completes, the Operational Tooling shall verify WooCommerce shop is functional.

**REQ-5.2.5** (Ubiquitous)
> The Operational Tooling shall document that rollback is safe for up to 7 days post-cutover; after that, order data divergence makes rollback complex.

### Acceptance Criteria
- [ ] One-click rollback option
- [ ] Preserves both WC and BC data
- [ ] Restores WC functionality
- [ ] Clear time-limit guidance

---

## Feature 5.3: Monitoring Dashboard

### Requirements

**REQ-5.3.1** (Ubiquitous)
> The Operational Tooling shall provide a monitoring dashboard in WordPress admin showing BC API health.

**REQ-5.3.2** (State-driven)
> **While** BC API is unreachable, the dashboard shall display a red alert status.

**REQ-5.3.3** (Event-driven)
> **When** dashboard loads, it shall display: API response time (last 24h), cache hit rate, webhook events (last 24h), error count (last 24h).

**REQ-5.3.4** (Event-driven)
> **When** error count exceeds threshold (configurable, default 10/hour), the dashboard shall send email notification to admin.

**REQ-5.3.5** (Ubiquitous)
> The dashboard shall display recent orders (from BC) for quick verification.

### Acceptance Criteria
- [ ] Shows real-time API status
- [ ] Displays key metrics
- [ ] Alerts on anomalies
- [ ] Shows recent activity

---

# Roadmap Summary

## Release Plan

| Release | EPICs | Target | Milestone |
|---------|-------|--------|-----------|
| **MVP** | EPIC 1 (Assessment) | Week 2 | Can assess any WC store |
| **Alpha** | EPIC 2 (Migration) | Week 4 | Can migrate data to BC |
| **Beta** | EPIC 3 (BC Bridge) | Week 8 | End-to-end flow works |
| **RC** | EPIC 4 (Validation) | Week 10 | Quality gates in place |
| **GA** | EPIC 5 (Operations) | Week 12 | Production-ready |

## Dependency Graph

```
EPIC 1: Assessment Engine
    │
    ▼
EPIC 2: Data Migration Pipeline
    │
    ├───────────────────┐
    ▼                   ▼
EPIC 3: BC Bridge    EPIC 4: Validation
    │                   │
    └───────┬───────────┘
            ▼
    EPIC 5: Operational Tooling
```

## Team Allocation (3-Person Team)

| Person | Primary Focus | Secondary |
|--------|---------------|-----------|
| **Nino** | EPIC 2, EPIC 3 | Architecture decisions |
| **Ziggy (WPEngine)** | EPIC 3 | WordPress integration |
| **TBD (Strategy)** | EPIC 1, EPIC 5 | Documentation, testing |

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Assessment time | < 5 minutes | Automated |
| Migration time (5K products) | < 2 hours | Automated |
| Data accuracy | > 99.5% | Validation framework |
| Functional test pass rate | 100% | Automated |
| Time to first order post-cutover | < 1 hour | Manual |

---

*Document Version: 1.0*
*Last Updated: December 2025*
*Methodology: EARS (Easy Approach to Requirements Syntax)*
*Reference: https://alistairmavin.com/ears/*
