# Data Mapping & Migration Readiness Guide

**Purpose:** Comprehensive reference for WooCommerce → BigCommerce data migration, covering entity mapping, edge cases, constraints, and BigCommerce store setup requirements.

**Version:** 1.0
**Date:** December 2025

---

## Table of Contents

1. [Entity Inventory](#1-entity-inventory)
2. [Data Mapping by Entity](#2-data-mapping-by-entity)
3. [Structural Mismatches](#3-structural-mismatches)
4. [Sensitive & Encrypted Data](#4-sensitive--encrypted-data)
5. [Custom Data & Extensions](#5-custom-data--extensions)
6. [BigCommerce Platform Limits](#6-bigcommerce-platform-limits)
7. [BigCommerce Store Setup Requirements](#7-bigcommerce-store-setup-requirements)
8. [Migration Execution Sequence](#8-migration-execution-sequence)
9. [Validation Framework](#9-validation-framework)
10. [Edge Cases & Gotchas](#10-edge-cases--gotchas)

---

## 1. Entity Inventory

### What Migrates

| Entity | WooCommerce Location | BigCommerce Destination | Migration Type |
|--------|---------------------|------------------------|----------------|
| **Products** | `wp_posts` (type=product) + `wp_postmeta` | Products API | Automated |
| **Product Variants** | `wp_posts` (type=product_variation) | Product Variants API | Automated |
| **Categories** | `wp_terms` (taxonomy=product_cat) | Categories API | Automated |
| **Product Tags** | `wp_terms` (taxonomy=product_tag) | *No direct equivalent* | Transform to custom field or skip |
| **Product Attributes** | `wp_terms` (taxonomy=pa_*) + `wp_woocommerce_attribute_taxonomies` | Product Options | Transform required |
| **Brands** | Plugin-dependent or absent | Brands API | If exists |
| **Customers** | `wp_users` + `wp_usermeta` | Customers API | Automated (no passwords) |
| **Customer Addresses** | `wp_usermeta` (billing_*, shipping_*) | Customer Addresses API | Transform |
| **Product Images** | `wp_posts` (type=attachment) | Product Images API | URL reference |
| **Product Reviews** | `wp_comments` (type=review) | Product Reviews API | Automated |
| **Coupons** | `wp_posts` (type=shop_coupon) | Promotions API | Manual recreation |

### What Stays in WordPress

| Entity | Reason | Post-Migration Access |
|--------|--------|----------------------|
| **Orders (Historical)** | BC order import limited; split admin acceptable | Direct DB query or admin widget |
| **Order Line Items** | Tied to orders | Same as orders |
| **Refunds** | Tied to orders | Same as orders |
| **Blog Posts** | Not commerce | Unchanged |
| **Pages** | Not commerce | Unchanged |
| **Media Library** | BC fetches by URL | Unchanged (serves images) |
| **Menus/Navigation** | WordPress feature | Update links if needed |
| **SEO Meta** | Yoast/RankMath | Reconfigure for content-only |

### What Cannot Migrate

| Entity | Reason | Mitigation |
|--------|--------|------------|
| **Customer Passwords** | Hashed, non-exportable | Force password reset |
| **Payment Tokens** | PCI compliance, gateway-specific | Customers re-enter payment |
| **Active Subscriptions** | Different subscription models | Manual migration + customer communication |
| **Cart Sessions** | Ephemeral | Lost (acceptable) |
| **Wishlists** | Plugin-specific | Plugin-dependent |

---

## 2. Data Mapping by Entity

### 2.1 Products

#### Simple Products

| WooCommerce Field | BigCommerce Field | Transform | Notes |
|-------------------|-------------------|-----------|-------|
| `id` | — | Skip | BC assigns new IDs |
| `name` | `name` | Direct | Max 250 chars |
| `slug` | `custom_url.url` | Prepend `/` | For SEO preservation |
| `status` (publish/draft/pending) | `is_visible` | Map | publish → true |
| `catalog_visibility` | `is_visible` + `is_featured` | Map | |
| `description` | `description` | Direct | HTML preserved |
| `short_description` | `description` | Append | BC has no short_description |
| `sku` | `sku` | Direct | Must be unique in BC |
| `price` | `price` | Direct | |
| `regular_price` | `price` | Direct | |
| `sale_price` | `sale_price` | Direct | |
| `date_on_sale_from` | `preorder_release_date` | Approximate | Not exact match |
| `date_on_sale_to` | — | Skip | Use BC promotions |
| `manage_stock` | `inventory_tracking` | Map | true → 'product' |
| `stock_quantity` | `inventory_level` | Direct | |
| `stock_status` | Derived | — | Based on inventory_level |
| `backorders` | `is_preorder_only` | Approximate | Different models |
| `low_stock_amount` | `inventory_warning_level` | Direct | |
| `sold_individually` | `order_quantity_maximum` | Map | true → 1 |
| `weight` | `weight` | Convert units | Check store settings |
| `dimensions.length` | `depth` | Convert units | WC length → BC depth |
| `dimensions.width` | `width` | Convert units | |
| `dimensions.height` | `height` | Convert units | |
| `tax_status` | `tax_class_id` | Map | Requires tax class setup |
| `tax_class` | `tax_class_id` | Map | |
| `categories[]` | `categories[]` | Map IDs | Categories must exist first |
| `images[]` | `images[]` | Transform | BC fetches from URL |
| `images[0]` | `images[0]` (is_thumbnail: true) | Mark primary | |
| `attributes[]` | — | Skip for simple | Only for variable products |
| `meta_data[]` | `custom_fields[]` | Selective | Filter relevant meta |
| `menu_order` | `sort_order` | Direct | |
| `purchase_note` | — | Skip | No equivalent |
| `external_url` | — | Skip | External products not supported same way |
| `button_text` | — | Skip | |

#### Variable Products

| WooCommerce Concept | BigCommerce Concept | Key Differences |
|---------------------|---------------------|-----------------|
| Variable Product | Product with Variants | Same parent structure |
| Product Attribute (global) | — | BC options are always product-level |
| Product Attribute (local) | Product Option | Must create per-product |
| Attribute Term | Option Value | |
| Variation | Variant | |
| Variation Attributes | Variant Option Values | |

**Transform Logic:**

```
WooCommerce Variable Product
├── Attributes: [Color (Red, Blue), Size (S, M, L)]
└── Variations:
    ├── Red + S → SKU-001
    ├── Red + M → SKU-002
    └── Blue + L → SKU-003

        ↓ TRANSFORM ↓

BigCommerce Product
├── Options:
│   ├── Color (option_values: [Red, Blue])
│   └── Size (option_values: [S, M, L])
└── Variants:
    ├── option_values: [Red, S] → SKU-001
    ├── option_values: [Red, M] → SKU-002
    └── option_values: [Blue, L] → SKU-003
```

#### Variant Field Mapping

| WooCommerce Variation Field | BigCommerce Variant Field | Notes |
|----------------------------|---------------------------|-------|
| `id` | — | BC assigns |
| `sku` | `sku` | Must be unique globally |
| `price` | `price` | Overrides product price |
| `regular_price` | `price` | |
| `sale_price` | `sale_price` | |
| `stock_quantity` | `inventory_level` | Per-variant inventory |
| `manage_stock` | Inherited or per-variant | |
| `stock_status` | Derived | |
| `weight` | `weight` | Can override product |
| `dimensions` | `depth`, `width`, `height` | Can override |
| `image` | — | BC variants don't have dedicated images* |
| `attributes[]` | `option_values[]` | Map to option value IDs |

*Note: BigCommerce variants inherit product images. To show different images per variant, use variant-specific image rules or the image option pattern.

### 2.2 Categories

| WooCommerce Field | BigCommerce Field | Notes |
|-------------------|-------------------|-------|
| `id` | — | BC assigns |
| `name` | `name` | Direct |
| `slug` | `custom_url.url` | Prepend `/` |
| `parent` | `parent_id` | Must map to new BC IDs |
| `description` | `description` | Direct |
| `display` | `default_product_sort` | Approximate |
| `image.src` | `image_url` | Direct |
| `menu_order` | `sort_order` | Direct |

**Hierarchy Handling:**

```
MIGRATION ORDER (Critical)

1. Root categories (parent = 0)
2. Level 1 children
3. Level 2 children
... continue until all migrated

MUST maintain ID mapping:
{
  wc_category_id: bc_category_id,
  15: 42,
  16: 43,
  ...
}
```

### 2.3 Customers

| WooCommerce Field | BigCommerce Field | Notes |
|-------------------|-------------------|-------|
| `id` | — | BC assigns |
| `email` | `email` | Primary identifier |
| `first_name` | `first_name` | |
| `last_name` | `last_name` | |
| `username` | — | Not used in BC |
| `password` | — | **CANNOT MIGRATE** |
| `role` | `customer_group_id` | Map if using groups |
| `billing.first_name` | `addresses[].first_name` | |
| `billing.last_name` | `addresses[].last_name` | |
| `billing.company` | `addresses[].company` | |
| `billing.address_1` | `addresses[].address1` | |
| `billing.address_2` | `addresses[].address2` | |
| `billing.city` | `addresses[].city` | |
| `billing.state` | `addresses[].state_or_province` | Must match BC state codes |
| `billing.postcode` | `addresses[].postal_code` | |
| `billing.country` | `addresses[].country_code` | ISO 2-letter code |
| `billing.email` | `addresses[].email` | Can differ from account email |
| `billing.phone` | `addresses[].phone` | |
| `shipping.*` | `addresses[]` | Second address entry |
| `meta_data` | `form_fields[]` | Selective |
| `date_created` | `date_created` | Direct |
| `date_modified` | `date_modified` | Direct |

**Address Handling:**

```
WooCommerce: Single billing + single shipping address stored
BigCommerce: Array of addresses, flagged as billing/shipping defaults

Transform:
{
  "addresses": [
    {
      "address_type": "billing",
      ...billing fields...
    },
    {
      "address_type": "shipping",
      ...shipping fields...
    }
  ]
}
```

### 2.4 Orders (If Migrating Historical)

| WooCommerce Field | BigCommerce Field | Notes |
|-------------------|-------------------|-------|
| `id` | `id` | Can preserve with import |
| `order_number` | `id` or `external_id` | |
| `status` | `status_id` | Map to BC statuses |
| `date_created` | `date_created` | Direct |
| `total` | `total_inc_tax` | |
| `billing` | `billing_address` | Same as customer |
| `shipping` | `shipping_addresses[]` | Array in BC |
| `line_items[]` | `products[]` | Transform |
| `shipping_lines[]` | `shipping_cost_*` | Flatten |
| `fee_lines[]` | — | May lose |
| `coupon_lines[]` | `coupon_discount` | |
| `tax_lines[]` | `total_tax` | Aggregate |
| `payment_method` | `payment_method` | String |
| `customer_note` | `customer_message` | |

**Order Status Mapping:**

| WooCommerce Status | BigCommerce Status | status_id |
|--------------------|-------------------|-----------|
| `pending` | Pending | 1 |
| `processing` | Awaiting Fulfillment | 11 |
| `on-hold` | On Hold | 0 |
| `completed` | Completed | 10 |
| `cancelled` | Cancelled | 5 |
| `refunded` | Refunded | 4 |
| `failed` | Declined | 6 |

### 2.5 Product Reviews

| WooCommerce Field | BigCommerce Field | Notes |
|-------------------|-------------------|-------|
| `id` | — | BC assigns |
| `product_id` | `product_id` | Map to new BC product ID |
| `reviewer` | `name` | |
| `reviewer_email` | `email` | |
| `review` | `text` | |
| `rating` | `rating` | 1-5 scale (same) |
| `date_created` | `date_reviewed` | |
| `status` (approved/hold) | `status` | Map |

### 2.6 Coupons / Promotions

WooCommerce coupons map loosely to BigCommerce promotions, but the models differ significantly.

| WooCommerce Coupon Type | BigCommerce Equivalent | Notes |
|------------------------|----------------------|-------|
| Percentage discount | Promotion (% off) | Similar |
| Fixed cart discount | Promotion ($ off order) | Similar |
| Fixed product discount | Promotion ($ off product) | Similar |
| Free shipping | Promotion (free shipping) | Similar |
| Buy X Get Y | Promotion with conditions | More complex setup |

**Recommendation:** Manual recreation of coupons in BigCommerce. Automated migration is error-prone due to different rule engines.

---

## 3. Structural Mismatches

### 3.1 Product Type Differences

| WooCommerce Type | BigCommerce Equivalent | Migration Approach |
|------------------|----------------------|-------------------|
| `simple` | `physical` | Direct |
| `variable` | `physical` + variants | Transform |
| `grouped` | — | Flatten or use related products |
| `external/affiliate` | — | Store URL in custom field |
| `virtual` | `digital` | Map |
| `downloadable` | `digital` with files | Transform |
| `subscription` (plugin) | Third-party app (PayWhirl, etc.) | Manual migration |
| `bundle` (plugin) | Third-party app or custom | Manual migration |
| `composite` (plugin) | — | Significant rework |
| `booking` (plugin) | Third-party app | Manual migration |

### 3.2 Attribute System Differences

**WooCommerce:**
- Global attributes (shared across products)
- Local/custom attributes (per-product)
- Attributes can be used for variations OR for display-only
- Stored in `wp_terms` and `wp_woocommerce_attribute_taxonomies`

**BigCommerce:**
- Options (for variants - creates purchasable combinations)
- Modifiers (for customization - doesn't create variants)
- Custom fields (for display-only information)
- Always product-level (no global sharing)

**Migration Decision Tree:**

```
WooCommerce Attribute
│
├── Used for variations?
│   ├── YES → Create as BigCommerce Option
│   │         (This will generate variants)
│   │
│   └── NO → Display only?
│       ├── YES → Create as Custom Field
│       │
│       └── Affects price/SKU?
│           ├── YES → Create as Modifier
│           └── NO → Create as Custom Field
```

### 3.3 Inventory Model Differences

| Aspect | WooCommerce | BigCommerce |
|--------|-------------|-------------|
| Stock management | Per product OR per variation | Per product OR per variant |
| Low stock threshold | Global + per-product override | Per product |
| Backorders | Allow / Allow but notify / Don't allow | Pre-order only (different concept) |
| Stock status | In stock / Out of stock / On backorder | Derived from inventory_level |
| Multi-location | Plugin required | Native support |

### 3.4 Tax System Differences

| Aspect | WooCommerce | BigCommerce |
|--------|-------------|-------------|
| Tax calculation | Built-in or plugin (TaxJar) | Built-in or integration |
| Tax classes | Custom definable | Predefined + custom |
| Tax-inclusive pricing | Supported | Supported |
| Tax exemption | Customer-level | Customer-level |

**Recommendation:** Re-configure taxes in BigCommerce rather than migrate. Tax rules are jurisdiction-dependent and often need updating anyway.

### 3.5 Shipping System Differences

Both platforms support similar shipping methods, but configuration doesn't transfer:

| Feature | WooCommerce | BigCommerce |
|---------|-------------|-------------|
| Flat rate | Yes | Yes |
| Free shipping | Yes | Yes |
| Table rate | Plugin | Built-in |
| Real-time rates | Plugin per carrier | Built-in + plugins |
| Shipping zones | Yes | Yes |
| Shipping classes | Yes | Yes (different impl) |

**Recommendation:** Manual reconfiguration of shipping in BigCommerce.

---

## 4. Sensitive & Encrypted Data

### 4.1 Customer Passwords

**Problem:** WooCommerce stores password hashes (bcrypt/phpass). Cannot be decrypted or migrated.

**Solutions:**

| Option | User Experience | Implementation |
|--------|----------------|----------------|
| **Force reset** | First login requires password reset | Send reset emails before/during migration |
| **Social login** | Skip password entirely | Implement OAuth (Google, Facebook) |
| **Magic link** | Email-based authentication | Custom implementation or plugin |
| **Hybrid** | Offer all options | Reset + social + magic link |

**Recommended Approach:**

1. Pre-migration: Send email announcing migration + password reset
2. Migration: Import customers without passwords
3. Post-migration: Force password reset on first BC login attempt
4. Optional: Offer social login as frictionless alternative

### 4.2 Payment Data

**What WooCommerce stores:**
- Payment method metadata (not card numbers)
- Subscription tokens (for recurring payments)
- Gateway-specific tokens (Stripe customer IDs, etc.)

**What can migrate:**

| Data | Migratability | Notes |
|------|--------------|-------|
| Credit card numbers | **NO** (never stored) | PCI compliance |
| Payment gateway tokens | **RARELY** | Gateway-specific, often tied to merchant account |
| Stripe customer IDs | **MAYBE** | If same Stripe account, can reference |
| PayPal billing agreements | **NO** | Must re-establish |
| Subscription payment tokens | **NO** | Customers must re-enter payment |

**Implication:** Customers with saved payment methods will need to re-enter them on BigCommerce.

### 4.3 Subscription Data

If using WooCommerce Subscriptions:

| Data Point | Migratability | Approach |
|------------|--------------|----------|
| Subscription status | Manual | Recreate in BC subscription app |
| Next payment date | Manual | Set up in new system |
| Recurring amount | Manual | Configure in new subscription |
| Payment method | **NO** | Customer re-enters |
| Subscription history | Reference only | Keep in WP for records |

**Subscription Migration Strategy:**

1. Export active subscriptions from WooCommerce
2. Set up subscription app in BigCommerce (PayWhirl, Bold, Recharge)
3. Create subscription products in BigCommerce
4. **Contact customers** to re-subscribe with new payment method
5. Honor existing subscription terms (price, frequency)
6. Cancel WooCommerce subscriptions after BC subscriptions confirmed

### 4.4 Order Payment Details

Historical orders contain:
- Transaction IDs (can migrate as reference)
- Payment method titles (can migrate)
- Payment gateway responses (typically not migrated)

**Recommendation:** If migrating orders, include `transaction_id` and `payment_method` as metadata for reference.

---

## 5. Custom Data & Extensions

### 5.1 WooCommerce Meta Data (postmeta)

WooCommerce and plugins store extensive data in `wp_postmeta`:

**Standard WooCommerce product meta:**
```
_price, _regular_price, _sale_price
_sku, _stock, _stock_status
_weight, _length, _width, _height
_tax_status, _tax_class
_manage_stock, _backorders
_sold_individually, _virtual, _downloadable
_product_attributes (serialized)
_product_image_gallery (comma-separated IDs)
```

**Common plugin meta (examples):**
```
// Yoast SEO
_yoast_wpseo_title, _yoast_wpseo_metadesc, _yoast_wpseo_focuskw

// RankMath
rank_math_title, rank_math_description, rank_math_focus_keyword

// WooCommerce Subscriptions
_subscription_price, _subscription_period, _subscription_period_interval

// WooCommerce Bookings
_wc_booking_duration, _wc_booking_duration_unit

// Custom fields (ACF, etc.)
custom_field_name, another_custom_field
```

### 5.2 Mapping Custom Meta to BigCommerce

**BigCommerce Custom Fields:**
- Max 250 custom fields per product
- Field name: 1-250 characters
- Field value: 1-250 characters (for storefront display)

**BigCommerce Metafields:**
- Max 250 per product (per client ID)
- Key: 1-64 characters
- Value: 1-65,535 characters
- Can have storefront permissions (read/write)

**Decision Matrix:**

| WooCommerce Meta Type | BigCommerce Target | Notes |
|----------------------|-------------------|-------|
| Display-only product info | Custom Field | Shows on storefront |
| Internal/admin data | Metafield | Not shown by default |
| SEO data | Custom Field or skip | BC has own SEO fields |
| Plugin-specific | Case-by-case | May not have equivalent |
| Serialized/complex | Metafield (JSON string) | Will need parsing |

### 5.3 Custom Post Types & Taxonomies

WooCommerce plugins often register custom post types:

| Plugin | Custom Post Types | Migration Approach |
|--------|------------------|-------------------|
| WooCommerce Subscriptions | `shop_subscription` | Manual to BC subscription app |
| WooCommerce Bookings | `wc_booking` | Manual to BC booking app |
| WooCommerce Memberships | `wc_user_membership`, `wc_membership_plan` | Manual or skip |
| YITH Wishlist | `yith-wcwl-list` | Plugin-dependent in BC |
| WooCommerce Points & Rewards | User meta | Manual or third-party BC app |

**Recommendation:** Identify active plugins during assessment. Each requires individual migration analysis.

### 5.4 Custom Taxonomies

Beyond standard `product_cat` and `product_tag`:

| Custom Taxonomy | Typical Use | BigCommerce Equivalent |
|-----------------|-------------|----------------------|
| `pa_*` (product attributes) | Variations, filtering | Options or Custom Fields |
| `product_brand` (plugin) | Brand filtering | Brands (native) |
| `product_collection` (custom) | Grouping | Categories or Custom Fields |

### 5.5 User Meta Extensions

Customer data beyond standard fields:

| Common User Meta | Migration Target |
|-----------------|-----------------|
| `points_balance` (points plugin) | BC app or custom field |
| `membership_level` | BC customer group |
| `wholesale_price_level` | BC customer group + price lists |
| `vat_number` | BC customer form field |
| `company_name` | BC customer company field |

---

## 6. BigCommerce Platform Limits

### 6.1 Product Limits

| Limit | Value | Notes |
|-------|-------|-------|
| Products per store | Plan-dependent (typically unlimited) | Check plan |
| Product name length | 250 characters | |
| SKU length | 250 characters | |
| Description length | Unlimited (HTML) | |
| Custom fields per product | 250 | |
| Metafields per product | 250 (per client ID) | |
| Images per product | 250 | |
| Videos per product | 5 | |
| Options per product | 250 | |
| Option values per option | 250 | |
| **Variants per product** | **600** | Key constraint |
| Related products | 50 | |

### 6.2 Variant Constraints

The 600-variant limit is often the biggest structural constraint:

```
Example:
Color (10 values) × Size (5 values) × Style (3 values) = 150 variants ✓
Color (20 values) × Size (10 values) × Style (5 values) = 1000 variants ✗

WooCommerce has no hard limit on variations, so some stores exceed 600.
```

**Migration Strategy for Over-Limit Products:**

1. Split into multiple products ("Blue Widget Collection", "Red Widget Collection")
2. Use modifiers instead of options (if not all combinations are valid)
3. Reduce option value count (consolidate similar options)
4. Contact BigCommerce about limit increases (enterprise)

### 6.3 Category Limits

| Limit | Value |
|-------|-------|
| Categories per store | 16,000 |
| Category nesting depth | 5 levels |
| Products per category | Unlimited |
| Category name length | 50 characters |

### 6.4 Customer Limits

| Limit | Value |
|-------|-------|
| Customers per store | Unlimited |
| Customer groups | 1,000 |
| Addresses per customer | 100 |
| Customer attributes | 50 per store |

### 6.5 API Rate Limits

| Plan | Limit |
|------|-------|
| Standard | 150 requests per 30 seconds |
| Plus | 150 requests per 30 seconds |
| Pro | 450 requests per 30 seconds |
| Enterprise | Negotiable |

**Migration Implication:**

```
Standard plan migration of 10,000 products:
- Batch size: 10 products per request
- Requests needed: 1,000
- At 150 req/30s: ~3.5 minutes minimum
- With buffer: ~10-15 minutes

Add variants, images, etc., and time increases significantly.
```

### 6.6 Other Limits

| Entity | Limit |
|--------|-------|
| Brands | 30,000 |
| Redirects (URL) | 10,000 |
| Orders | Unlimited |
| Max order quantity per item | 1,000,000 |
| Webhooks | 100 |
| Scripts (Script Manager) | 25 |

---

## 7. BigCommerce Store Setup Requirements

### 7.1 Pre-Migration Setup Checklist

Before any data migration, the BigCommerce store must be configured:

#### Account & Plan
- [ ] BigCommerce account created
- [ ] Appropriate plan selected (affects API limits)
- [ ] Sandbox/dev store for testing (if available)

#### Store Settings
- [ ] Store name configured
- [ ] Store address/location set
- [ ] Default currency set (must match WooCommerce or transform)
- [ ] Weight unit set (must match or transform)
- [ ] Dimension unit set (must match or transform)
- [ ] Timezone set

#### Tax Configuration
- [ ] Tax calculation method chosen (manual, automatic, or integration)
- [ ] Tax classes created (if needed)
- [ ] Tax zones/rules configured
- [ ] Tax-inclusive pricing setting (if applicable)

#### Shipping Configuration
- [ ] Shipping origin address set
- [ ] Shipping zones created
- [ ] Shipping methods configured per zone
- [ ] Free shipping thresholds (if applicable)
- [ ] Real-time carrier rates configured (if using)

#### Payment Configuration
- [ ] Payment gateway(s) connected
- [ ] Test transactions verified
- [ ] Multi-currency (if applicable)
- [ ] Payment method display order

#### Email Configuration
- [ ] Email sender address verified
- [ ] Transactional emails configured (order confirmation, shipping, etc.)
- [ ] Email templates customized (optional)

### 7.2 Migration-Sequence Dependencies

```
SETUP ORDER (Critical - Dependencies)

1. Store Settings (currency, units, timezone)
   └── Required for: Everything

2. Tax Configuration
   └── Required for: Products (tax class assignment)

3. Customer Groups (if using)
   └── Required for: Customers (group assignment)

4. Brands (if using)
   └── Required for: Products (brand assignment)

5. Categories (full hierarchy)
   └── Required for: Products (category assignment)
   └── Must migrate parent categories before children

6. Product Options (global option sets, if using)
   └── Required for: Products with shared options

7. Products (including variants)
   └── Depends on: Categories, Brands, Options
   └── Required for: Customer import (if linking purchases)

8. Customers
   └── Depends on: Customer Groups
   └── Can run parallel to products

9. Product Reviews
   └── Depends on: Products, Customers

10. Redirects (URL)
    └── Depends on: Products, Categories (need new URLs)

11. Promotions/Coupons
    └── Depends on: Products, Categories, Customer Groups
```

### 7.3 Integration Setup

For the headless WordPress integration:

#### BigCommerce Side
- [ ] API account created (V3 API)
- [ ] API token generated with appropriate scopes:
  - [ ] Products (read)
  - [ ] Customers (read/write)
  - [ ] Orders (read/write)
  - [ ] Carts (read/write)
  - [ ] Checkouts (read/write)
  - [ ] Content (read)
- [ ] Storefront API token generated (for client-side operations)
- [ ] Webhook endpoints configured (for cache invalidation)
- [ ] Channel created (for headless storefront)

#### WordPress Side
- [ ] BC Bridge plugin installed
- [ ] API credentials configured
- [ ] Cache layer configured
- [ ] Webhook receiver endpoint set up

### 7.4 Domain & SSL

| Task | Details |
|------|---------|
| Domain configuration | Point to BigCommerce or keep on WordPress |
| SSL certificate | BigCommerce provides for BC-hosted checkouts |
| Checkout domain | Can use custom or BC subdomain |

**For Headless Setup:**
- WordPress domain remains primary
- BigCommerce checkout can use subdomain (checkout.example.com)
- SSL must cover both

---

## 8. Migration Execution Sequence

### 8.1 Phase Overview

```
PHASE 1: PREPARATION (Manual/Semi-Automated)
├── BigCommerce store setup
├── API access configured
├── Test environment validated
└── Customer communication drafted

PHASE 2: DATA MIGRATION (Automated)
├── Categories (hierarchy-aware)
├── Brands (if applicable)
├── Products (batched)
├── Variants (with products)
├── Product images (URL reference)
├── Product reviews (optional)
└── Customers (batched)

PHASE 3: INTEGRATION SETUP (Manual)
├── WordPress plugin installation
├── API credential configuration
├── Template/theme integration
├── Cart/checkout flow testing
└── Customer auth testing

PHASE 4: VALIDATION (Automated + Manual)
├── Data integrity checks
├── Functional testing
├── Performance testing
└── UAT sign-off

PHASE 5: CUTOVER (Coordinated)
├── Final delta sync
├── DNS/redirect updates
├── Go-live
└── Monitoring
```

### 8.2 Detailed Migration Steps

#### Categories Migration

```
1. Extract categories from WooCommerce
   GET /wp-json/wc/v3/products/categories?per_page=100

2. Build hierarchy tree
   Sort by parent_id, process roots first

3. Create in BigCommerce
   POST /stores/{store_hash}/v3/catalog/categories

4. Maintain ID mapping
   Store: { wc_id: bc_id }

5. Verify hierarchy
   Compare tree structures
```

#### Products Migration

```
1. Extract products from WooCommerce
   GET /wp-json/wc/v3/products?per_page=100&page=N
   Include: variations for variable products

2. Transform to BigCommerce format
   - Map fields per mapping table
   - Convert units if needed
   - Map category IDs using stored mapping
   - Build options from attributes (for variable)
   - Build variants from variations

3. Create in BigCommerce (batched)
   POST /stores/{store_hash}/v3/catalog/products
   Batch size: 10 products per request

4. Handle images
   BC fetches from URLs automatically
   Ensure WP media URLs are accessible

5. Log results
   Store: { wc_id: bc_id } for each product
   Track failures for retry
```

#### Customers Migration

```
1. Extract customers from WooCommerce
   GET /wp-json/wc/v3/customers?per_page=100&page=N

2. Transform to BigCommerce format
   - Map standard fields
   - Build addresses array
   - Map customer group if applicable
   - EXCLUDE password

3. Create in BigCommerce (batched)
   POST /stores/{store_hash}/v3/customers

4. Log results
   Store: { wc_id: bc_id, email: email }

5. Trigger password reset
   Either via BC API or email campaign
```

### 8.3 Rollback Strategy

If migration fails or issues are discovered:

```
ROLLBACK LEVELS

Level 1: Data Correction
├── Issue: Wrong data migrated
├── Action: Update via BC API
└── Impact: Minimal

Level 2: Re-Migration
├── Issue: Significant data problems
├── Action: Delete BC data, re-run migration
└── Impact: Time delay

Level 3: Full Rollback
├── Issue: Fundamental problems
├── Action: Reactivate WooCommerce
└── Impact: Back to original state

ROLLBACK CHECKLIST
├── [ ] WooCommerce plugin still installed (deactivated)
├── [ ] WooCommerce data intact in database
├── [ ] BC Bridge plugin can be deactivated
├── [ ] Redirects can be reversed
└── [ ] Customer communication plan ready
```

---

## 9. Validation Framework

### 9.1 Automated Validation Checks

| Check | Method | Pass Criteria |
|-------|--------|---------------|
| **Product count** | Compare API totals | WC count = BC count |
| **Variant count** | Sum across products | WC variants = BC variants |
| **SKU uniqueness** | BC API validation | No duplicate errors |
| **Category count** | Compare API totals | WC count = BC count |
| **Category hierarchy** | Tree structure diff | Structure matches |
| **Customer count** | Compare API totals | WC count = BC count |
| **Image availability** | HTTP HEAD on image URLs | All return 200 |
| **Price accuracy** | Sample comparison (10%) | 100% match |
| **Inventory accuracy** | Sample comparison (10%) | 100% match |

### 9.2 Manual Validation Checklist

#### Pre-Launch

- [ ] Homepage loads correctly
- [ ] Category pages display products
- [ ] Product detail pages render
- [ ] Product images display
- [ ] Product variants selectable
- [ ] Prices display correctly
- [ ] Add to cart works
- [ ] Cart shows correct items
- [ ] Checkout flow completes (sandbox)
- [ ] Order confirmation displays
- [ ] Order appears in BC admin
- [ ] Customer can create account
- [ ] Customer can log in
- [ ] Customer can view order history
- [ ] Email notifications send

#### Post-Launch (24-48 hours)

- [ ] No 500 errors in logs
- [ ] No payment failures
- [ ] No missing orders
- [ ] Customer complaints minimal
- [ ] SEO rankings stable
- [ ] Site speed acceptable

### 9.3 Data Integrity Report

Generate post-migration report:

```
DATA INTEGRITY REPORT
=====================
Migration Date: 2024-12-17
Source: example-woocommerce.com
Target: example.mybigcommerce.com

ENTITY COUNTS
├── Categories: 45 WC → 45 BC ✓
├── Products: 2,847 WC → 2,847 BC ✓
├── Variants: 8,234 WC → 8,234 BC ✓
├── Customers: 12,500 WC → 12,500 BC ✓
└── Reviews: 1,234 WC → 1,234 BC ✓

SAMPLE VALIDATION (10% random)
├── Prices: 285/285 matched ✓
├── Inventory: 285/285 matched ✓
├── Categories: 285/285 matched ✓
└── Images: 280/285 accessible (5 404s) ⚠️

ISSUES DETECTED
├── 5 product images returning 404
│   └── Products: [123, 456, 789, 012, 345]
├── 3 products exceeded BC variant limit
│   └── Products: [567] (split into 2)
└── 12 customers with invalid email format skipped

RECOMMENDATION: Proceed with launch
└── Fix image 404s post-launch
└── Contact skipped customers manually
```

---

## 10. Edge Cases & Gotchas

### 10.1 Data Edge Cases

| Edge Case | Problem | Solution |
|-----------|---------|----------|
| **SKU conflicts** | WC allows duplicate SKUs, BC doesn't | Append suffix or dedupe before migration |
| **Empty SKUs** | WC allows blank SKU, BC requires | Generate SKU from product ID |
| **Unicode in slugs** | WC allows, BC may not | Transliterate or encode |
| **HTML in titles** | WC allows, BC strips | Clean before migration |
| **Zero-price products** | Valid in WC, may flag in BC | Set `is_price_hidden` |
| **Negative prices** | Invalid in both | Clean data |
| **Future publish dates** | WC scheduled posts | Map to `is_visible: false` |
| **Password-protected products** | WC feature | No equivalent; use customer groups |
| **Products in multiple categories** | Supported in both | Works directly |
| **Orphan products** (no category) | Valid in WC | Assign default category in BC |
| **Over 600 variants** | Valid in WC | Split product or reduce options |
| **Variations without parent** | Data integrity issue | Skip or clean |
| **Out-of-stock hidden** | WC setting | Implement via BC filter |

### 10.2 User/Customer Edge Cases

| Edge Case | Problem | Solution |
|-----------|---------|----------|
| **Duplicate emails** | WC allows in some configs | Merge or skip duplicates |
| **Invalid emails** | WC validation looser | Skip with notification |
| **Admin users as customers** | WP conflates users | Filter by role |
| **Guest orders** | No customer record | Skip or create on-demand |
| **Multiple addresses** | WC stores one billing + one shipping | BC can store more; use defaults |
| **Customer notes** | Stored in order meta | May not have customer-level equivalent |

### 10.3 Order Edge Cases (If Migrating)

| Edge Case | Problem | Solution |
|-----------|---------|----------|
| **Partial refunds** | Complex line item math | Import total after refund |
| **Multi-currency orders** | WC plugin-dependent | Convert to base currency |
| **Subscription orders** | Linked to subscription | Skip or import as standalone |
| **Orders with deleted products** | Product ID doesn't exist | Import as is (historical) |
| **Pending orders** | May still need fulfillment | Consider leaving in WC |
| **Incomplete checkout** | Not really orders | Skip |

### 10.4 Technical Gotchas

| Gotcha | Description | Mitigation |
|--------|-------------|------------|
| **Serialized PHP in meta** | WC stores some data serialized | Must unserialize before use |
| **HPOS vs Legacy** | WooCommerce 8.0+ uses new order tables | Check which system is active |
| **Object cache** | WC uses WordPress object cache | May need to bypass for direct queries |
| **Multisite** | WP Multisite has different table names | Prefix tables correctly |
| **Large meta values** | Some meta exceeds BC limits | Truncate or use metafields |
| **Rate limiting** | BC API throttling | Implement backoff and batching |
| **Webhook delivery** | BC → WP webhook failures | Ensure endpoint is accessible |
| **Image CDN** | WC images may be on CDN | Ensure URLs are direct and accessible |
| **Lazy-loaded images** | Frontend lazy loading | Use source URLs, not data-src |

### 10.5 SEO Gotchas

| Gotcha | Description | Mitigation |
|--------|-------------|------------|
| **URL structure change** | Different permalink patterns | 301 redirects (up to BC's 10K limit) |
| **Lost canonical tags** | WC handles canonicals | Configure BC or implement custom |
| **Schema markup** | WC plugin-dependent | Implement BC schema |
| **Meta descriptions** | Yoast/RankMath data | Map to BC meta or custom fields |
| **Sitemap generation** | WC/Yoast generates | Configure BC sitemap |
| **robots.txt** | WordPress-level | Update if needed |

### 10.6 Integration Gotchas

| Gotcha | Description | Mitigation |
|--------|-------------|------------|
| **Payment gateway tokens** | Not portable between platforms | Customers re-enter payment |
| **Shipping carrier accounts** | May need re-verification | Re-configure in BC |
| **Tax service accounts** | May be tied to WC integration | Re-configure (TaxJar, Avalara) |
| **ERP/PIM sync** | May target WC specifically | Update integration target |
| **Email marketing** | Audience lists may need update | Re-sync from BC |
| **Analytics tracking** | Different data layer | Update GA/tracking setup |

---

## Appendix A: Quick Reference - Minimum Viable Migration

For a rapid migration with reduced scope:

### Must Migrate
- [ ] Products (with variants)
- [ ] Categories
- [ ] Product images
- [ ] Customers (emails for password reset)

### Should Migrate
- [ ] Product reviews
- [ ] Brands (if used)
- [ ] Customer addresses

### Can Skip (Phase 1)
- [ ] Historical orders (keep in WP)
- [ ] Coupons (recreate manually)
- [ ] Subscriptions (manual migration)
- [ ] Custom meta (unless critical)

### Cannot Migrate
- [ ] Customer passwords
- [ ] Payment tokens
- [ ] Active subscription billing

---

## Appendix B: Assessment Checklist

Use this during the assessment phase:

### Store Profile
- [ ] Product count (simple, variable, other)
- [ ] Total SKU/variant count
- [ ] Category count and depth
- [ ] Customer count
- [ ] Average order volume (monthly)
- [ ] Historical order count

### Complexity Indicators
- [ ] Custom post types in use
- [ ] Number of active plugins
- [ ] WooCommerce extensions (list)
- [ ] Custom attributes count
- [ ] Meta fields per product (average)
- [ ] Products with >100 variants
- [ ] Products with >600 variants (blockers)

### Integration Inventory
- [ ] Payment gateways in use
- [ ] Shipping methods/carriers
- [ ] Tax service (native/plugin)
- [ ] ERP/PIM integration
- [ ] Email marketing integration
- [ ] Other third-party integrations

### Technical Environment
- [ ] WordPress version
- [ ] WooCommerce version
- [ ] PHP version
- [ ] HPOS enabled?
- [ ] Multisite?
- [ ] Custom theme with WC templates?

---

*Document Version: 1.0*
*Last Updated: December 2025*
