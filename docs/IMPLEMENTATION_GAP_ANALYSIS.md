# Implementation Gap Analysis

**Comparison:** Current bc-migration implementation vs. DATA_MAPPING_AND_MIGRATION_READINESS.md requirements

**Date:** December 2025

---

## Executive Summary

The current implementation provides a solid foundation for WooCommerce → BigCommerce migration, covering approximately **40-50%** of the comprehensive requirements. The assessment engine is functional, and core product/customer migration works. However, significant gaps exist in edge case handling, data validation, and BigCommerce platform limit awareness.

### Coverage Summary

| Category | Current Coverage | Priority |
|----------|-----------------|----------|
| **Assessment Engine** | 70% | High |
| **Product Migration** | 60% | High |
| **Variant Handling** | 55% | High |
| **Customer Migration** | 65% | Medium |
| **Category Migration** | 50% | Medium |
| **Order Migration** | 30% | Low |
| **Validation Framework** | 45% | High |
| **Edge Case Handling** | 25% | Critical |
| **BigCommerce Limits** | 40% | Critical |

---

## 1. Assessment Engine

### ✅ Currently Implemented

| Feature | File | Status |
|---------|------|--------|
| Scale metrics (product/order/customer counts) | `collectors/scale.ts` | Complete |
| Complexity scoring | `collectors/complexity.ts` | Basic |
| Plugin detection & mapping | `plugin-mapper.ts` | Partial |
| SEO analysis | `collectors/seo.ts` | Basic |
| Custom logic detection | `collectors/custom-logic.ts` | Basic |
| Markdown report generation | `report.ts` | Complete |

### ❌ Missing from Requirements

| Gap | Priority | Effort | Notes |
|-----|----------|--------|-------|
| **Variant count per product** | Critical | Medium | Need to flag products with >600 variants |
| **Product type distribution** | High | Low | Currently tracks types but doesn't flag problematic ones (grouped, external, composite) |
| **Custom field/meta analysis** | High | Medium | Track average meta count but not field-level analysis |
| **WooCommerce plugin inventory** | High | Medium | Detect subscriptions, bookings, memberships, etc. |
| **SKU uniqueness validation** | Critical | Low | WC allows duplicates, BC doesn't |
| **Category depth analysis** | Medium | Low | BC limit is 5 levels |
| **Customer group/role mapping** | Medium | Low | Map WC roles to BC customer groups |
| **Integration inventory** | High | Medium | Payment gateways, shipping, tax services |
| **HPOS detection** | High | Low | WC 8.0+ uses different order tables |
| **Multisite detection** | Medium | Low | Different table prefixes |
| **Redirect count estimation** | High | Low | BC limit is 10,000 |
| **Image URL accessibility check** | Medium | Medium | Pre-validate images are reachable |
| **Effort/cost estimation** | High | High | ML-based or rule-based sizing |

### Current Assessment Output vs. Required Output

**Current:**
```typescript
interface AssessmentResult {
  storeUrl: string;
  wcVersion: string;
  metrics: {
    scale: { productCount, variationCount, orderCount, customerCount, categoryCount };
    complexity: { score, hasCustomMeta, averageMetaFields, productTypeDistribution, readinessCategory };
    logic: { detectedHooks, hasShortcodes, requiresManualReview, logicDensity };
    pluginMappings: { plugin, recommendation, type, notes }[];
    seo: { permalinkStructure, isStandard, hasYoast, hasRankMath, urlSample, redirectEstimate };
  };
  timestamp: string;
}
```

**Required (from DATA_MAPPING doc):**
```typescript
interface AssessmentResult {
  // ... existing fields ...

  // NEW: Blocker detection
  blockers: {
    productsOver600Variants: number[];
    duplicateSkus: { sku: string; productIds: number[] }[];
    unsupportedProductTypes: { type: string; count: number; productIds: number[] }[];
    categoryDepthExceeded: { categoryId: number; depth: number }[];
    redirectLimitExceeded: boolean;
  };

  // NEW: Sensitive data flags
  sensitiveData: {
    hasActiveSubscriptions: boolean;
    hasPaymentTokens: boolean;
    customersWithSavedPayment: number;
  };

  // NEW: Integration inventory
  integrations: {
    paymentGateways: string[];
    shippingProviders: string[];
    taxService: string | null;
    erpPim: string | null;
    emailMarketing: string | null;
  };

  // NEW: Effort estimation
  estimation: {
    complexityScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    estimatedHours: { min: number; max: number };
    recommendedApproach: 'automated' | 'assisted' | 'manual';
  };
}
```

---

## 2. Product Migration

### ✅ Currently Implemented

| Feature | File | Status |
|---------|------|--------|
| Simple product transformation | `transformers/product.ts` | Complete |
| Variable product transformation | `transformers/product.ts` | Complete |
| Image URL mapping | `transformers/product.ts` | Complete |
| Category ID mapping | `transformers/product.ts` | Complete |
| SKU generation for missing SKUs | `transformers/product.ts` | Complete |
| Price/weight/dimension mapping | `transformers/product.ts` | Complete |
| Visibility/featured flags | `transformers/product.ts` | Complete |
| Tags → search_keywords | `transformers/product.ts` | Complete |

### ❌ Missing from Requirements

| Gap | Priority | Effort | Notes |
|-----|----------|--------|-------|
| **Grouped product handling** | High | Medium | Need to flatten or use related products |
| **External/affiliate product handling** | Medium | Low | Store URL in custom field |
| **Virtual/downloadable distinction** | Low | Low | Currently maps virtual → digital |
| **Custom URL preservation (SEO)** | Critical | Low | Map WC slug to BC custom_url |
| **Short description handling** | Low | Low | Currently appends to description |
| **Purchase note migration** | Low | Low | No BC equivalent - skip or custom field |
| **SKU uniqueness enforcement** | Critical | Medium | Check + dedupe before migration |
| **SKU conflict detection** | Critical | Medium | Warn when WC has duplicate SKUs |
| **Unit conversion (weight/dimensions)** | High | Medium | WC/BC may use different units |
| **Tax class mapping** | High | Medium | Map WC tax classes to BC tax_class_id |
| **Backorder → pre-order mapping** | Medium | Medium | Different concepts |
| **Low stock threshold mapping** | Low | Low | Direct mapping exists |
| **Upsell/cross-sell migration** | Medium | High | Need ID mapping after products created |
| **Bulk pricing rules** | Medium | Medium | If WC has bulk pricing plugin |
| **Product meta → custom fields** | High | Medium | Selective migration of postmeta |
| **Product meta → metafields** | High | Medium | For non-display data |

### Current Field Mapping vs. Required

**Currently Mapped:**
- name ✅
- sku ✅ (with fallback generation)
- description ✅ (combined with short_description)
- price, retail_price, sale_price ✅
- weight, width, height, depth ✅
- categories ✅
- inventory_level, inventory_tracking ✅
- is_visible, is_featured ✅
- images ✅
- search_keywords (from tags) ✅
- availability ✅
- meta_description ✅

**Missing Mappings:**
- custom_url (for SEO) ❌
- tax_class_id ❌
- sort_order (from menu_order) ❌
- condition ❌
- order_quantity_minimum/maximum (from sold_individually) ❌
- warranty ❌
- bin_picking_number ❌
- upc, mpn, gtin ❌
- related_products ❌
- custom_fields (from meta_data) ❌

---

## 3. Variant Handling

### ✅ Currently Implemented

| Feature | File | Status |
|---------|------|--------|
| WC attributes → BC options | `transformers/variant.ts` | Complete |
| WC variations → BC variants | `transformers/variant.ts` | Complete |
| 600 variant limit warning | `transformers/variant.ts` | Complete |
| Option type inference (color→swatch, size→rectangles) | `transformers/variant.ts` | Complete |
| SKU generation for variants | `transformers/variant.ts` | Complete |
| Variant-level inventory | `transformers/variant.ts` | Complete |
| Variant-level pricing | `transformers/variant.ts` | Complete |
| Variant-level dimensions | `transformers/variant.ts` | Complete |
| Variant image URL | `transformers/variant.ts` | Complete |

### ❌ Missing from Requirements

| Gap | Priority | Effort | Notes |
|-----|----------|--------|-------|
| **Products >600 variants: split strategy** | Critical | High | Need to split into multiple products |
| **Global vs local attribute distinction** | Medium | Medium | WC has both; BC is always product-level |
| **Display-only attributes** | Medium | Medium | Should become custom_fields, not options |
| **"Any" variations handling** | High | Medium | WC allows "any X" - need to generate combinations |
| **Variation image rule creation** | Medium | High | BC variants don't have dedicated images |
| **Modifier vs Option decision** | High | Medium | Not all attributes should create variants |

### 600 Variant Limit Handling

**Current:** Truncates to first 600 with warning
```typescript
if (wcVariations.length > BC_VARIANT_LIMIT) {
  warnings.push(`Only the first ${BC_VARIANT_LIMIT} will be migrated.`);
}
const variationsToProcess = wcVariations.slice(0, BC_VARIANT_LIMIT);
```

**Required:** Product splitting strategy
```typescript
// Pseudocode for required implementation
if (wcVariations.length > BC_VARIANT_LIMIT) {
  const splitProducts = splitProductByVariations(wcProduct, wcVariations, BC_VARIANT_LIMIT);
  // Returns multiple products: "Product Name - Part 1", "Product Name - Part 2", etc.
  // Or splits by primary option: "Product Name (Red)", "Product Name (Blue)", etc.
}
```

---

## 4. Customer Migration

### ✅ Currently Implemented

| Feature | File | Status |
|---------|------|--------|
| Basic customer creation | `customer-migrator.ts` | Complete |
| Billing address mapping | `customer-migrator.ts` | Complete |
| Shipping address mapping | `customer-migrator.ts` | Complete |
| force_password_reset flag | `customer-migrator.ts` | ✅ Critical |
| Email-based deduplication | `customer-migrator.ts` | Complete |
| Progress bar & logging | `customer-migrator.ts` | Complete |

### ❌ Missing from Requirements

| Gap | Priority | Effort | Notes |
|-----|----------|--------|-------|
| **Customer group mapping** | High | Medium | WC roles → BC customer groups |
| **Email validation** | Medium | Low | Skip invalid emails with warning |
| **Phone number formatting** | Low | Low | Normalize formats |
| **State/province code normalization** | High | Medium | BC requires specific codes |
| **Country code normalization** | High | Low | Ensure ISO 2-letter codes |
| **Customer meta → form_fields** | Medium | Medium | Custom customer data |
| **Guest orders → customer creation** | Low | Medium | Optional: create from order data |
| **Password reset email trigger** | High | Low | Proactive vs. on-demand |
| **Duplicate email handling** | High | Medium | WC can have duplicates in edge cases |
| **Company field mapping** | Low | Low | Direct mapping exists |

### Address Mapping Issues

**Current Implementation:**
```typescript
addresses.push({
  state_or_province: wcCustomer.billing.state, // ⚠️ May not match BC state codes
  country_code: wcCustomer.billing.country,    // ⚠️ Should validate ISO format
});
```

**Required:**
```typescript
addresses.push({
  state_or_province: normalizeStateCode(wcCustomer.billing.state, wcCustomer.billing.country),
  country_code: normalizeCountryCode(wcCustomer.billing.country),
});
```

---

## 5. Category Migration

### ✅ Currently Implemented

| Feature | File | Status |
|---------|------|--------|
| Category extraction | `wc-client.ts` | Partial |
| Basic category transformer | - | Not found |
| Category migrator | `category-migrator.ts` | Exists |

### ❌ Missing from Requirements

| Gap | Priority | Effort | Notes |
|-----|----------|--------|-------|
| **Hierarchy-aware migration order** | Critical | Medium | Parents must exist before children |
| **Category depth validation** | High | Low | BC limit is 5 levels |
| **ID mapping persistence** | Critical | Medium | WC ID → BC ID for product assignment |
| **Custom URL preservation** | High | Low | SEO - map slug to custom_url |
| **Category image migration** | Medium | Low | Direct URL mapping |
| **Display type mapping** | Low | Low | Approximate to default_product_sort |
| **Menu order → sort_order** | Low | Low | Direct mapping |

### Required Migration Sequence

```typescript
// Current: Unknown order
// Required: Topological sort by parent_id

async migrateCategories() {
  const allCategories = await this.fetchAllCategories();
  const sorted = topologicalSort(allCategories, 'parent_id');

  const idMap = new Map<number, number>(); // WC ID → BC ID

  for (const category of sorted) {
    const bcParentId = category.parent === 0
      ? 0
      : idMap.get(category.parent)!;

    const bcCategory = await this.bcClient.createCategory({
      ...transformCategory(category),
      parent_id: bcParentId,
    });

    idMap.set(category.id, bcCategory.id);
  }

  return idMap; // Required for product migration
}
```

---

## 6. Order Migration

### ✅ Currently Implemented

| Feature | File | Status |
|---------|------|--------|
| Order fetcher | `wc-client.ts` | Complete |
| Basic order migrator | `order-migrator.ts` | Exists |
| Order types defined | `types/wc.ts`, `types/bc.ts` | Complete |

### ❌ Missing from Requirements

| Gap | Priority | Effort | Notes |
|-----|----------|--------|-------|
| **Order status mapping** | High | Low | WC status → BC status_id |
| **Line item transformation** | High | Medium | Product IDs need mapping |
| **Shipping line flattening** | Medium | Medium | WC array → BC single values |
| **Fee line handling** | Low | Low | May lose data |
| **Coupon discount aggregation** | Medium | Low | |
| **Tax aggregation** | Medium | Low | |
| **Partial refund handling** | Medium | Medium | Complex line item math |
| **Multi-currency handling** | High | Medium | Convert to base currency |
| **Payment method preservation** | Low | Low | String copy |
| **Transaction ID preservation** | Low | Low | For reference |
| **Date preservation** | Medium | Low | date_created, date_modified |

**Note:** Per DATA_MAPPING doc recommendation, historical orders may stay in WordPress with split admin being acceptable.

---

## 7. Validation Framework

### ✅ Currently Implemented

| Feature | File | Status |
|---------|------|--------|
| Product count comparison | `data-validator.ts` | Complete |
| Category count comparison | `data-validator.ts` | Complete |
| Customer count comparison | `data-validator.ts` | Complete |
| Sample price validation | `data-validator.ts` | Complete |
| Sample image accessibility | `data-validator.ts` | Complete |
| Validation report structure | `validation/report.ts` | Complete |

### ❌ Missing from Requirements

| Gap | Priority | Effort | Notes |
|-----|----------|--------|-------|
| **Variant count validation** | High | Medium | Per-product and total |
| **SKU uniqueness validation** | Critical | Low | Ensure no duplicates in BC |
| **Category hierarchy validation** | High | Medium | Tree structure comparison |
| **Inventory level validation** | High | Medium | Sample comparison |
| **Custom field presence check** | Medium | Medium | Verify meta migrated |
| **URL/redirect validation** | High | Medium | Check for 404s |
| **Order count validation** | Low | Low | If orders migrated |
| **Full data integrity report** | High | Medium | Per DATA_MAPPING spec |

### Required Validation Report Structure

```typescript
// From DATA_MAPPING doc
interface DataIntegrityReport {
  migrationDate: string;
  source: string;
  target: string;

  entityCounts: {
    categories: { wc: number; bc: number; match: boolean };
    products: { wc: number; bc: number; match: boolean };
    variants: { wc: number; bc: number; match: boolean };
    customers: { wc: number; bc: number; match: boolean };
    reviews: { wc: number; bc: number; match: boolean };
  };

  sampleValidation: {
    prices: { sampled: number; matched: number };
    inventory: { sampled: number; matched: number };
    categories: { sampled: number; matched: number };
    images: { sampled: number; accessible: number };
  };

  issues: {
    type: string;
    severity: 'error' | 'warning';
    details: string;
    affectedItems?: number[];
  }[];

  recommendation: 'proceed' | 'review' | 'rollback';
}
```

---

## 8. BigCommerce Platform Limits

### ✅ Currently Handled

| Limit | Value | Implementation |
|-------|-------|----------------|
| Variants per product | 600 | Truncates with warning |

### ❌ Missing Limit Handling

| Limit | Value | Current | Required |
|-------|-------|---------|----------|
| Product name length | 250 chars | Not checked | Truncate with warning |
| SKU length | 250 chars | Not checked | Validate/truncate |
| Custom fields per product | 250 | Not checked | Limit meta migration |
| Metafields per product | 250 | Not checked | Limit meta migration |
| Images per product | 250 | Not checked | Truncate with warning |
| Category nesting depth | 5 levels | Not checked | Flatten or error |
| Categories per store | 16,000 | Not checked | Warn if exceeded |
| Customer addresses | 100 per customer | Not checked | Truncate |
| URL redirects | 10,000 | Not checked | Warn if exceeded |
| API rate limits | Plan-dependent | Partial (rate-limiter.ts exists) | Enhance |

### Required Limit Checking

```typescript
// Add to assessment and migration
const BC_LIMITS = {
  PRODUCT_NAME_LENGTH: 250,
  SKU_LENGTH: 250,
  CUSTOM_FIELDS_PER_PRODUCT: 250,
  METAFIELDS_PER_PRODUCT: 250,
  IMAGES_PER_PRODUCT: 250,
  VARIANTS_PER_PRODUCT: 600,
  OPTION_VALUES_PER_OPTION: 250,
  CATEGORY_DEPTH: 5,
  CATEGORIES_PER_STORE: 16000,
  CUSTOMER_ADDRESSES: 100,
  URL_REDIRECTS: 10000,
};

function validateAgainstLimits(data: MigrationData): LimitViolation[] {
  const violations: LimitViolation[] = [];

  // Check each product
  for (const product of data.products) {
    if (product.name.length > BC_LIMITS.PRODUCT_NAME_LENGTH) {
      violations.push({ type: 'PRODUCT_NAME_LENGTH', productId: product.id });
    }
    // ... etc
  }

  return violations;
}
```

---

## 9. Edge Cases & Gotchas

### ✅ Currently Handled

| Edge Case | Status |
|-----------|--------|
| Empty SKU | Generates from product ID |
| Missing product name | Errors with validation |
| No categories mapped | Warns |
| Customer without email | Skips with warning |
| Existing customer (by email) | Skips (idempotent) |

### ❌ Missing Edge Case Handling

| Edge Case | Priority | Notes |
|-----------|----------|-------|
| **Duplicate SKUs in WC** | Critical | Must dedupe or suffix |
| **Unicode in slugs** | High | Transliterate for BC |
| **HTML in titles** | Medium | Strip tags |
| **Zero-price products** | Medium | Set is_price_hidden |
| **Future publish dates** | Low | Map to is_visible: false |
| **Password-protected products** | Low | No BC equivalent |
| **Orphan products (no category)** | Medium | Assign default |
| **Variations without parent** | Medium | Skip or clean |
| **Out-of-stock visibility** | Medium | Filter based on WC setting |
| **Serialized PHP in meta** | High | Must unserialize |
| **Large meta values** | Medium | Truncate or use metafields |
| **Invalid email formats** | Medium | Skip with warning |
| **Multiple billing addresses** | Low | BC can store multiple |

---

## 10. Missing Infrastructure

### ❌ Not Yet Implemented

| Component | Priority | Notes |
|-----------|----------|-------|
| **ID Mapping Persistence** | Critical | WC ID → BC ID for all entities |
| **Migration State Machine** | High | Track progress, enable resume |
| **Rollback Support** | Medium | Delete created BC data |
| **Delta Sync** | High | Migrate changes since last run |
| **Webhook Setup** | Medium | For cache invalidation |
| **Channel Creation** | High | For headless storefronts |
| **URL Redirect Generator** | High | WC URLs → BC URLs |
| **Customer Password Reset Trigger** | Medium | Email campaign integration |
| **Migration Dry Run Mode** | High | Validate without creating |
| **Error Recovery/Retry** | Medium | Handle transient failures |

### ID Mapping Schema

```typescript
// Required for cross-entity references
interface IDMapping {
  entityType: 'category' | 'product' | 'variant' | 'customer' | 'order';
  wcId: number;
  bcId: number;
  wcSku?: string;  // For products/variants
  createdAt: string;
  status: 'created' | 'updated' | 'failed';
}

// Persistence options:
// 1. SQLite file (current migration state)
// 2. JSON file (simple, portable)
// 3. Supabase (if dashboard integration needed)
```

---

## Priority Roadmap

### Phase 1: Critical Gaps (Week 1-2)

1. **Blocker Detection in Assessment**
   - Products with >600 variants
   - Duplicate SKUs
   - Category depth >5
   - Unsupported product types

2. **SKU Uniqueness Enforcement**
   - Pre-migration validation
   - Auto-deduplication strategy

3. **ID Mapping Persistence**
   - Required for category → product dependency
   - Required for upsell/cross-sell migration

4. **Custom URL Preservation**
   - Critical for SEO

### Phase 2: High Priority (Week 3-4)

1. **Product Split Strategy**
   - Handle >600 variant products

2. **Category Hierarchy Migration**
   - Topological sort
   - Depth validation

3. **State/Country Code Normalization**
   - Customer address validity

4. **Unit Conversion**
   - Weight/dimension units

5. **Effort Estimation**
   - Assessment output

### Phase 3: Medium Priority (Week 5-6)

1. **Custom Field/Metafield Migration**
   - Selective meta_data handling

2. **Customer Group Mapping**
   - WC roles → BC groups

3. **Migration Dry Run Mode**
   - Validate without side effects

4. **Full Validation Report**
   - Per DATA_MAPPING spec

### Phase 4: Lower Priority (Week 7+)

1. **Order Migration** (if needed)
2. **Upsell/Cross-sell Migration**
3. **Delta Sync**
4. **Webhook Setup**
5. **Rollback Support**

---

## Recommendations

### Immediate Actions

1. **Add blocker detection to assessment** - Don't let migrations start if there are >600 variant products without a splitting strategy

2. **Implement ID mapping persistence** - This is blocking proper category → product migration

3. **Add custom_url to product transformer** - SEO-critical and easy win

4. **Add SKU validation/deduplication** - WC allows duplicates, BC doesn't - this will cause failures

### Architecture Suggestions

1. **Extract limit constants** to a shared config
2. **Add a pre-flight check** before migration starts
3. **Implement migration phases** with clear dependencies
4. **Add dry-run mode** to all migrators

### Testing Priorities

1. Create test fixtures for edge cases (>600 variants, duplicate SKUs, deep categories)
2. Add integration tests against BC sandbox
3. Test with real WooCommerce exports of varying complexity

---

*Document Version: 1.0*
*Last Updated: December 2025*
