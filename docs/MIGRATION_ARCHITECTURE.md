# WooCommerce → BigCommerce Migration Architecture

## Overview

This document defines the technical architecture for a low-friction, highly-automated migration path from WooCommerce to BigCommerce while preserving WordPress.

**Goal:** Make migration dramatically easier than BigCommerce's current reputation suggests.

---

## Phase 1: Assessment Engine

### What It Does
Analyzes a WooCommerce store and produces a migration readiness report with effort estimates.

### Data Points to Collect

| Category | Data Point | Method | Complexity Signal |
|----------|-----------|--------|-------------------|
| **Scale** | Product count | WC REST API `/products?per_page=1` (check headers) | >10K = high |
| **Scale** | Variant count | WC REST API `/products?type=variable` | >50K SKUs = high |
| **Scale** | Order count | WC REST API `/orders?per_page=1` | Historical only |
| **Scale** | Customer count | WC REST API `/customers?per_page=1` | Password reset required |
| **Complexity** | Product types | WC REST API | grouped/external = medium |
| **Complexity** | Custom attributes | WC REST API `/products/attributes` | >20 = high |
| **Complexity** | Active plugins | WP REST API `/plugins` | Payment/shipping integrations |
| **Complexity** | Meta fields per product | Sample query | >50 avg = high |
| **SEO** | URL structure | Permalink settings | Custom = redirect mapping |
| **SEO** | Yoast/RankMath data | Plugin-specific meta | SEO preservation |
| **Content** | Pages/Posts | WP REST API | Stays in WordPress |
| **Integrations** | Payment gateways | WC settings | Reconfiguration needed |
| **Integrations** | Shipping methods | WC settings | Reconfiguration needed |
| **Integrations** | Tax settings | WC settings | May need TaxJar/Avalara |

### Readiness Score Output

```
MIGRATION READINESS ASSESSMENT
==============================
Store: example-store.com
Assessed: 2024-12-17

SCALE METRICS
├── Products: 2,847 (simple: 2,100, variable: 747)
├── Total SKUs: 8,234
├── Categories: 45
├── Customers: 12,500
└── Historical Orders: 45,000

COMPLEXITY SCORE: MEDIUM (62/100)
├── Custom attributes: 12 (low)
├── Product meta density: 23 avg (medium)
├── Plugin integrations: 8 (medium)
└── URL customization: Standard permalinks (low)

ESTIMATED EFFORT
├── Data migration: 4-6 hours (automated)
├── Integration setup: 2-4 hours (manual)
├── URL redirect mapping: 1-2 hours (semi-automated)
├── UAT/Validation: 4-8 hours (manual)
└── TOTAL: 11-20 hours

BLOCKERS IDENTIFIED
├── [WARN] Plugin "WooCommerce Subscriptions" - requires manual migration
├── [WARN] 3 products have >100 variations - BC limit is 600, OK
└── [INFO] Customer passwords will require reset on first login

RECOMMENDATION: PROCEED - Standard migration path
```

---

## Phase 2: Data Model Mapping

### Products

| WooCommerce Field | BigCommerce Field | Transform | Notes |
|-------------------|-------------------|-----------|-------|
| `id` | - | Generate new | BC assigns IDs |
| `name` | `name` | Direct | Max 250 chars in BC |
| `slug` | `custom_url.url` | Transform | Add leading `/` |
| `type` | `type` | Map | simple→physical, variable→physical |
| `status` | `is_visible` | Map | publish→true |
| `description` | `description` | Direct | HTML preserved |
| `short_description` | - | Append to description | BC has no short desc |
| `sku` | `sku` | Direct | |
| `price` | `price` | Direct | |
| `regular_price` | `price` | Direct | |
| `sale_price` | `sale_price` | Direct | |
| `manage_stock` | `inventory_tracking` | Map | true→'product' |
| `stock_quantity` | `inventory_level` | Direct | |
| `weight` | `weight` | Convert | WC uses store units |
| `dimensions.length` | `depth` | Convert | WC uses store units |
| `dimensions.width` | `width` | Convert | |
| `dimensions.height` | `height` | Convert | |
| `categories[].id` | `categories[]` | Map IDs | Pre-migrate categories |
| `images[].src` | `images[].image_url` | Direct | BC fetches from URL |
| `attributes[]` | `options[]` | Transform | See variants section |
| `meta_data[]` | `custom_fields[]` | Selective | Filter relevant meta |

### Variants (Variable Products)

| WooCommerce | BigCommerce | Notes |
|-------------|-------------|-------|
| `variations[]` | `variants[]` | Nested under product |
| `variation.attributes[]` | `variant.option_values[]` | Map attribute→option |
| `variation.sku` | `variant.sku` | Direct |
| `variation.price` | `variant.price` | Direct |
| `variation.stock_quantity` | `variant.inventory_level` | Direct |
| `variation.image` | - | BC variants inherit product images |

**Key Difference:** WooCommerce attributes are global or per-product. BigCommerce options are always per-product. Migration must:
1. Create product-level options from WC attributes
2. Map variation attribute values to option values

### Categories

| WooCommerce | BigCommerce | Notes |
|-------------|-------------|-------|
| `id` | - | Generate new |
| `name` | `name` | Direct |
| `slug` | `custom_url.url` | Transform |
| `parent` | `parent_id` | Map to new IDs |
| `description` | `description` | Direct |
| `image.src` | `image_url` | Direct |

### Customers

| WooCommerce | BigCommerce | Notes |
|-------------|-------------|-------|
| `id` | - | Generate new |
| `email` | `email` | Direct |
| `first_name` | `first_name` | Direct |
| `last_name` | `last_name` | Direct |
| `billing` | `addresses[]` | Transform to address object |
| `shipping` | `addresses[]` | Transform to address object |
| `meta_data` | `form_fields` / `attributes` | Selective |
| `password` | - | **CANNOT MIGRATE** - requires reset |

### Orders (Historical)

**Decision Point:** Do we migrate order history?

| Option | Pros | Cons |
|--------|------|------|
| **Don't migrate** | Simple, fast | Merchants lose history in BC admin |
| **Read-only import** | History visible | BC order import is limited |
| **Keep in WP** | Full history preserved | Split admin experience |

**Recommendation:** Keep historical orders in WordPress. Only new orders flow through BigCommerce. Provide a "unified order view" widget if needed.

---

## Phase 3: Integration Architecture

### Option A: Headless (Recommended for Mid-Market)

```
┌─────────────────────────────────────────────────────────┐
│                     CUSTOMER                             │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  WORDPRESS (WPEngine)                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │   Content   │  │   Blog      │  │   Pages         │  │
│  │   (stays)   │  │   (stays)   │  │   (stays)       │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │            STOREFRONT PLUGIN (NEW)                  │ │
│  │  - Renders product pages from BC data               │ │
│  │  - Cart/checkout redirects to BC                    │ │
│  │  - Customer auth via BC                             │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────┬───────────────────────────────┘
                          │ REST/GraphQL
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   BIGCOMMERCE                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │  Catalog    │  │   Orders    │  │   Customers     │  │
│  │  (source)   │  │   (new)     │  │   (migrated)    │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │  Checkout   │  │  Payments   │  │   Shipping      │  │
│  │  (hosted)   │  │  (BC)       │  │   (BC)          │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**WordPress Plugin Responsibilities:**
- Fetch product data from BC API (cached)
- Render product listing pages
- Render product detail pages
- Handle add-to-cart (BC Storefront API)
- Redirect to BC hosted checkout
- Sync customer session

### Option B: Checkout-Only (Simplest)

WordPress handles everything except checkout. Minimal BC footprint.

```
WordPress (Product Pages) → Add to Cart → BC Checkout → BC Order
```

**Pros:** Simplest migration, minimal BC integration
**Cons:** Cart experience may feel disjointed

### Option C: Full BC Storefront (Not Recommended)

Replace WordPress entirely with BC Stencil theme.

**Why Not:** Defeats the "Keep WordPress" value prop.

---

## WordPress Integration Layer

WooCommerce is a WordPress plugin, not a separate system. All commerce data lives in WordPress's database. Understanding this architecture is critical to the migration strategy.

### WordPress Database Architecture

```
WORDPRESS DATABASE (wp_*)
│
├── wp_posts
│   ├── post_type = 'post'              ← Blog posts (STAYS)
│   ├── post_type = 'page'              ← Pages (STAYS)
│   ├── post_type = 'attachment'        ← Media/images (STAYS)
│   ├── post_type = 'product'           ← WC Products (MIGRATES → BC)
│   ├── post_type = 'product_variation' ← WC Variants (MIGRATES → BC)
│   ├── post_type = 'shop_order'        ← WC Orders (STAYS as historical)
│   └── post_type = 'shop_coupon'       ← WC Coupons (RECREATE in BC)
│
├── wp_postmeta
│   ├── _price, _regular_price, _sale_price
│   ├── _sku, _stock, _stock_status
│   ├── _weight, _length, _width, _height
│   ├── _product_attributes (serialized)
│   └── [plugin-specific meta]          ← Yoast, RankMath, etc.
│
├── wp_users
│   └── WordPress users + WooCommerce customers = SAME TABLE
│       └── user role = 'customer' for WC customers
│
├── wp_usermeta
│   ├── billing_* (address, phone, email)
│   ├── shipping_* (address fields)
│   ├── _order_count, _money_spent
│   └── [WC-specific customer meta]
│
├── wp_terms / wp_term_taxonomy / wp_term_relationships
│   ├── taxonomy = 'product_cat'        ← Product categories (MIGRATES)
│   ├── taxonomy = 'product_tag'        ← Product tags (MIGRATES)
│   └── taxonomy = 'pa_*'               ← Product attributes (MIGRATES)
│
├── wp_woocommerce_sessions              ← Cart sessions (IGNORE)
├── wp_woocommerce_api_keys              ← API keys (IGNORE)
├── wp_woocommerce_log                   ← Logs (IGNORE)
│
└── wp_wc_* tables (HPOS - WooCommerce 8.0+)
    ├── wp_wc_orders                     ← New order storage
    ├── wp_wc_order_items
    ├── wp_wc_order_addresses
    └── wp_wc_order_operational_data
```

### Component Fate Matrix

| Component | Before Migration | After Migration | Action |
|-----------|-----------------|-----------------|--------|
| **WordPress Core** | Running | Running | None |
| **Theme** | Renders WC templates | Renders BC data | Install BC Bridge |
| **WooCommerce Plugin** | Active | Deactivated | Deactivate, don't uninstall |
| **WC Extensions** | Active | Deactivated | Case-by-case |
| **Product Data** | Active in `wp_posts` | Orphaned/archived | Leave dormant |
| **Order Data** | Active | Historical reference | Keep for lookups |
| **Customer Data** | In `wp_users` | Synced to BC | Dual existence |
| **Blog/Pages** | Working | Working | None |
| **Media Library** | Product images | Still serves images | BC fetches URLs |
| **SEO Plugins** | Managing product SEO | Content SEO only | Reconfigure |
| **Menus/Navigation** | Links to /shop, /product/* | Same URLs, new handler | Update if needed |

### BC Bridge Plugin Architecture

The "BC Bridge" plugin replaces WooCommerce's frontend while preserving WordPress.

```
wp-content/plugins/bc-bridge/
├── bc-bridge.php                 ← Main plugin file
├── includes/
│   ├── class-bc-api.php          ← BigCommerce API wrapper
│   ├── class-bc-product.php      ← Product data model
│   ├── class-bc-cart.php         ← Cart management
│   ├── class-bc-customer.php     ← Customer sync
│   └── class-bc-cache.php        ← Response caching
├── templates/
│   ├── archive-product.php       ← Product listing (replaces WC)
│   ├── single-product.php        ← Product detail (replaces WC)
│   ├── cart.php                  ← Mini-cart / cart page
│   └── shortcodes/               ← [bc_products], [bc_cart], etc.
├── assets/
│   ├── js/add-to-cart.js         ← AJAX add-to-cart
│   └── css/storefront.css        ← Base styling
└── admin/
    ├── settings.php              ← BC API credentials
    └── sync-status.php           ← Migration/sync dashboard
```

**Route Handling:**

```php
// BC Bridge intercepts WooCommerce routes
add_action('template_redirect', function() {
    if (is_woocommerce()) {
        // WC would handle this, but it's deactivated
        // BC Bridge takes over
    }
});

// Register same URL patterns WooCommerce used
add_rewrite_rule('^shop/?$', 'index.php?bc_shop=1', 'top');
add_rewrite_rule('^product/([^/]+)/?$', 'index.php?bc_product=$matches[1]', 'top');
add_rewrite_rule('^product-category/([^/]+)/?$', 'index.php?bc_category=$matches[1]', 'top');
```

**Data Flow:**

```
┌────────────────────────────────────────────────────────────────┐
│                        VISITOR REQUEST                          │
│                     GET /product/blue-widget                    │
└────────────────────────────┬───────────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────────┐
│                      WORDPRESS ROUTER                           │
│            Matches rewrite rule → bc_product=blue-widget        │
└────────────────────────────┬───────────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────────┐
│                      BC BRIDGE PLUGIN                           │
│  1. Check cache for product data                                │
│  2. If miss: fetch from BC API by custom_url                    │
│  3. Transform to WordPress-friendly format                      │
│  4. Load template: templates/single-product.php                 │
└────────────────────────────┬───────────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────────┐
│                      THEME TEMPLATE                             │
│  - Uses BC Bridge template tags                                 │
│  - Renders product with theme styling                           │
│  - Add-to-cart posts to BC Storefront API                       │
└────────────────────────────────────────────────────────────────┘
```

### User/Customer Sync Strategy

WordPress users and WooCommerce customers share `wp_users`. Post-migration, we need dual identity.

**Sync Approaches:**

| Approach | Trigger | BC Customer Created | Complexity |
|----------|---------|---------------------|------------|
| **Lazy sync** | First purchase on BC | Yes, at checkout | Low |
| **Eager sync** | Migration time | All customers migrated | Medium |
| **Hybrid** | Migration + ongoing | Bulk + incremental | Medium |

**Recommended: Lazy Sync**

```
EXISTING WP USER (hasn't purchased on BC yet)
├── wp_users.ID = 1234
├── wp_usermeta.billing_email = "john@example.com"
└── BC customer = NULL

USER MAKES FIRST BC PURCHASE
├── BC Bridge checks: does BC customer exist for this email?
├── No → Create BC customer via API
├── Store mapping: wp_usermeta.bc_customer_id = 98765
└── Future purchases use BC customer ID

SUBSEQUENT VISITS
├── WP session exists → check bc_customer_id
├── Fetch BC customer data (cart, addresses)
└── Render personalized experience
```

**Identity Mapping Table:**

```sql
-- Optional: explicit mapping table for complex scenarios
CREATE TABLE wp_bc_customer_map (
    wp_user_id BIGINT PRIMARY KEY,
    bc_customer_id INT,
    synced_at DATETIME,
    sync_status ENUM('pending', 'synced', 'error')
);
```

### WooCommerce Deactivation Procedure

**Critical:** Deactivate, don't uninstall. WC data must remain accessible.

```
PRE-DEACTIVATION CHECKLIST
├── [ ] All products migrated to BC and verified
├── [ ] BC Bridge plugin installed and tested
├── [ ] URL redirects configured (if any)
├── [ ] Customer communication sent (password reset)
├── [ ] Payment gateway configured in BC
├── [ ] Shipping methods configured in BC
├── [ ] Tax settings configured in BC
└── [ ] Staging environment tested end-to-end

DEACTIVATION STEPS
1. Enable maintenance mode (optional)
2. Deactivate WooCommerce extensions (subscriptions, memberships, etc.)
3. Deactivate WooCommerce core plugin
4. Activate BC Bridge plugin
5. Clear all caches (object cache, page cache, CDN)
6. Test critical flows:
   - Homepage loads
   - /shop loads (from BC)
   - Product pages load (from BC)
   - Add to cart works
   - Checkout completes
7. Disable maintenance mode
8. Monitor error logs for 24-48 hours

POST-DEACTIVATION
├── WooCommerce plugin files: KEEP (don't delete)
├── WC database tables: KEEP (historical data)
├── WC options in wp_options: KEEP (reference)
└── WC scheduled actions: Will stop running (OK)
```

### Historical Data Access

Even with WooCommerce deactivated, historical data remains queryable.

**Order Lookup (for customer service):**

```php
// Direct database query - WC doesn't need to be active
global $wpdb;

$orders = $wpdb->get_results($wpdb->prepare("
    SELECT p.ID, p.post_date, pm.meta_value as total
    FROM {$wpdb->posts} p
    JOIN {$wpdb->postmeta} pm ON p.ID = pm.post_id AND pm.meta_key = '_order_total'
    WHERE p.post_type = 'shop_order'
    AND p.post_author = %d
    ORDER BY p.post_date DESC
", $user_id));
```

**Admin Widget for Historical Orders:**

```php
// Add dashboard widget showing legacy order lookup
add_action('wp_dashboard_setup', function() {
    wp_add_dashboard_widget(
        'bc_legacy_orders',
        'Historical Orders (Pre-Migration)',
        'render_legacy_orders_widget'
    );
});
```

### Theme Integration Patterns

**Option A: Template Override (Recommended)**

BC Bridge provides templates that themes can override:

```
theme/
├── bc-bridge/
│   ├── archive-product.php    ← Override listing
│   ├── single-product.php     ← Override detail
│   └── content-product.php    ← Override product card
```

**Option B: Shortcode-Based**

For themes that don't want template changes:

```php
// In any page/template
[bc_products category="shirts" limit="12" columns="4"]

[bc_product_detail sku="BLUE-WIDGET-001"]

[bc_cart]

[bc_checkout_button text="Proceed to Checkout"]
```

**Option C: Block-Based (Gutenberg)**

For modern block themes:

```php
// Register BC blocks
register_block_type('bc-bridge/product-grid', [...]);
register_block_type('bc-bridge/product-detail', [...]);
register_block_type('bc-bridge/cart', [...]);
```

### Caching Strategy

BC API calls must be cached aggressively to maintain performance.

| Data Type | Cache TTL | Invalidation |
|-----------|-----------|--------------|
| Product catalog | 1 hour | Webhook on product update |
| Single product | 1 hour | Webhook on product update |
| Categories | 24 hours | Webhook on category update |
| Cart | No cache | Real-time |
| Customer | Session-based | On login/logout |
| Inventory | 5 minutes | Webhook on stock change |

**Implementation:**

```php
// Transient-based caching
function bc_get_product($slug) {
    $cache_key = 'bc_product_' . md5($slug);
    $product = get_transient($cache_key);

    if ($product === false) {
        $product = BC_API::get_product_by_slug($slug);
        set_transient($cache_key, $product, HOUR_IN_SECONDS);
    }

    return $product;
}

// Webhook handler for cache invalidation
add_action('rest_api_init', function() {
    register_rest_route('bc-bridge/v1', '/webhook', [
        'methods' => 'POST',
        'callback' => 'bc_handle_webhook',
    ]);
});

function bc_handle_webhook($request) {
    $payload = $request->get_json_params();

    if ($payload['scope'] === 'store/product/updated') {
        $product_id = $payload['data']['id'];
        // Invalidate all caches for this product
        delete_transient('bc_product_' . $product_id);
        // Also invalidate listing caches
        bc_invalidate_listing_caches();
    }
}
```

### Migration-Time Decisions

| Decision | Options | Recommendation |
|----------|---------|----------------|
| **Keep WC installed?** | Yes / No | Yes (deactivated) |
| **Migrate order history?** | BC / WP / Both | Keep in WP |
| **Customer passwords** | Reset all / Social login / Magic link | Reset + magic link option |
| **SEO redirects** | htaccess / plugin / CDN | CDN (Cloudflare) |
| **Cart persistence** | BC cart / WP session | BC cart (guest-friendly) |
| **Checkout location** | BC hosted / Embedded / Custom | BC hosted |

---

## Phase 4: Migration Pipeline

### Step-by-Step Process

```
1. ASSESSMENT (Automated)
   └── Run assessment engine
   └── Generate readiness report
   └── Merchant reviews/approves

2. PREPARATION (Semi-Automated)
   └── Create BC store (sandbox first)
   └── Configure BC settings (currency, tax, shipping zones)
   └── Set up payment gateway in BC

3. DATA MIGRATION (Automated)
   ├── Categories (must be first - products reference them)
   ├── Products (batched, 10 at a time via BC API)
   ├── Variants (nested in product creation)
   ├── Images (BC fetches from URLs)
   ├── Customers (batched, passwords excluded)
   └── [Optional] Historical orders

4. INTEGRATION SETUP (Manual)
   └── Install WordPress plugin
   └── Configure BC API credentials
   └── Test product rendering
   └── Test cart flow
   └── Test checkout

5. URL REDIRECT MAPPING (Semi-Automated)
   └── Generate WC URL → BC URL map
   └── Create .htaccess / redirect rules
   └── Verify SEO-critical pages

6. VALIDATION (Manual + Automated)
   ├── Product count match
   ├── Variant count match
   ├── Price spot-checks
   ├── Image rendering
   ├── Cart flow test
   ├── Checkout test (sandbox)
   └── Customer login test

7. CUTOVER (Coordinated)
   └── Final delta sync (products changed since migration)
   └── DNS/redirect activation
   └── Go-live
   └── Monitor for 24-48 hours
```

---

## Phase 5: Validation Framework

### Automated Checks

| Check | Method | Pass Criteria |
|-------|--------|---------------|
| Product count | Compare API counts | WC = BC |
| SKU uniqueness | BC API validation | No duplicates |
| Category hierarchy | Tree comparison | Structure matches |
| Image availability | HTTP HEAD checks | All 200 OK |
| Price accuracy | Sample comparison | 100% match on sample |
| Variant completeness | Count per product | WC variants = BC variants |

### Manual Checks

| Check | Owner | Sign-off |
|-------|-------|----------|
| Homepage renders correctly | Merchant | Y/N |
| Product pages render correctly | Merchant | Y/N |
| Add to cart works | QA | Y/N |
| Checkout completes (sandbox) | QA | Y/N |
| Customer can log in | QA | Y/N |
| Order appears in BC admin | QA | Y/N |
| Order notification emails sent | QA | Y/N |

---

## Technical Decisions Needed

### 1. What's the WordPress integration pattern?
- [ ] Custom plugin (build from scratch)
- [ ] Extend existing BC for WP plugin (if still maintained)
- [ ] Headless with Next.js/Vercel in front of WP

### 2. Do we migrate order history?
- [ ] No - keep in WP, accept split admin
- [ ] Yes - import as read-only in BC
- [ ] Hybrid - unified view via custom dashboard

### 3. How do we handle customer passwords?
- [ ] Force reset on first login (standard)
- [ ] Social login as alternative (reduce friction)
- [ ] Magic link option (email-based auth)

### 4. What's the cart/checkout experience?
- [ ] Redirect to BC hosted checkout (simplest)
- [ ] Embedded BC checkout in WP (medium complexity)
- [ ] Fully custom checkout via BC API (highest complexity)

### 5. How do we handle SEO redirects?
- [ ] WordPress .htaccess rules
- [ ] Cloudflare/CDN-level redirects
- [ ] Plugin-based redirect manager

---

## API Rate Limits & Batching

### BigCommerce Limits
- **Standard:** 150 requests/30 seconds (sliding window)
- **Enterprise:** Higher limits negotiable
- **Batch endpoints:** Up to 10 items per request

### Migration Batching Strategy

```python
# Pseudocode for batched product migration
BATCH_SIZE = 10
RATE_LIMIT_DELAY = 0.5  # seconds between batches

products = fetch_all_wc_products()
for batch in chunk(products, BATCH_SIZE):
    bc_products = transform_batch(batch)
    response = bc_api.products.create_batch(bc_products)
    log_results(response)
    sleep(RATE_LIMIT_DELAY)
```

### Estimated Migration Times

| Store Size | Products | Est. Time | Notes |
|------------|----------|-----------|-------|
| Small | <500 | 15-30 min | Single batch run |
| Medium | 500-5K | 1-2 hours | Rate limit aware |
| Large | 5K-50K | 4-8 hours | May need overnight |
| Enterprise | 50K+ | 12-24 hours | Parallel processing |

---

## Open Questions for BigCommerce Team

1. **Is there a bulk import API** beyond the batch endpoints? (CSV upload, etc.)
2. **What's the variant limit per product?** (Docs say 600)
3. **Can we import orders as "completed/historical"** without triggering fulfillment?
4. **Is there a sandbox environment** with production-like API behavior?
5. **What's the customer password situation?** (Confirm no migration path)
6. **Are there webhook limits** for real-time sync scenarios?

---

## Next Steps

1. **Spike: Assessment Engine** - Build the readiness assessment tool
2. **Spike: Product Migration** - Migrate 100 products from test WC store to BC sandbox
3. **Spike: WordPress Plugin** - POC for product rendering from BC API
4. **Decision: Integration Pattern** - Choose headless vs checkout-redirect
5. **Decision: Order History** - Determine migration strategy

---

## Summary: The "Keep WordPress" Migration

```
BEFORE                              AFTER
┌─────────────────────┐            ┌─────────────────────┐
│     WORDPRESS       │            │     WORDPRESS       │
│  ┌───────────────┐  │            │  ┌───────────────┐  │
│  │  WooCommerce  │  │            │  │  BC Bridge    │  │
│  │  (active)     │  │   ───►     │  │  (active)     │  │
│  │               │  │            │  │               │  │
│  │  Products     │  │            │  │  Products ────┼──┼──► BC API
│  │  Orders       │  │            │  │  Orders ──────┼──┼──► BC API
│  │  Customers    │  │            │  │  Customers ───┼──┼──► BC API
│  │  Checkout     │  │            │  │  Checkout ────┼──┼──► BC Hosted
│  └───────────────┘  │            │  └───────────────┘  │
│                     │            │  ┌───────────────┐  │
│  Blog, Pages,       │            │  │  WooCommerce  │  │
│  Media, Theme       │            │  │  (deactivated)│  │
│  (unchanged)        │            │  │  Historical   │  │
│                     │            │  │  data only    │  │
└─────────────────────┘            │  └───────────────┘  │
                                   │                     │
                                   │  Blog, Pages,       │
                                   │  Media, Theme       │
                                   │  (unchanged)        │
                                   └─────────────────────┘
```

**What migrates:** Products, categories, customers (no passwords)
**What stays:** WordPress, theme, blog, pages, media, historical orders
**What changes:** Commerce operations route through BigCommerce
**What the merchant sees:** Same WordPress admin + new BC admin for commerce

---

*Document Version: 0.2*
*Last Updated: December 2025*
*Status: Draft - Technical Discovery*
*Added: WordPress Integration Layer, BC Bridge Plugin architecture*
