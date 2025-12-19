# WooCommerce Migration Solution: Review Package

**Purpose:** Technical review document for WPEngine and Commerce.com stakeholders to vet the proposed migration approach.

**Date:** December 2025
**Review Requested From:**
- WPEngine: Product/Engineering representative
- Commerce.com: Jordan Sim, Feedonomics technical lead, Makeswift technical lead
- BigCommerce: API/Platform team (if available)

---

## How to Use This Document

This document is designed for **technical reviewers who have 30-60 minutes** to assess the proposed solution. It:

1. Summarizes the approach (5 min read)
2. Lists assumptions that need validation (your expertise needed)
3. Identifies technical risks with proposed mitigations (your feedback needed)
4. Presents decision points requiring input (your decision needed)
5. References detailed specs for those who want to go deeper

**Your feedback is requested on:**
- ✅ Validating or correcting assumptions
- ⚠️ Identifying risks I've missed
- 🔴 Blocking issues that would change the approach
- ❓ Questions that expose gaps in my understanding

---

## 1. Executive Summary

### The Problem

WooCommerce merchants want to upgrade to BigCommerce but face two barriers:
1. **Migration complexity** - Data migration is manual, error-prone, and expensive
2. **WordPress lock-in** - They don't want to abandon their WordPress content, SEO equity, and editorial workflows

### The Solution

A **migration toolkit + WordPress integration** that lets merchants:
- Keep WordPress (content, blog, theme, SEO)
- Move commerce operations to BigCommerce
- Migrate data automatically (products, categories, customers)
- Minimize downtime and data loss

### Key Value Proposition

**"Keep WordPress. Upgrade Commerce."**

```
BEFORE                              AFTER
┌─────────────────────┐            ┌─────────────────────┐
│     WordPress       │            │     WordPress       │
│  ┌───────────────┐  │            │  ┌───────────────┐  │
│  │  WooCommerce  │  │            │  │  BC Bridge    │  │
│  │  (all-in-one) │  │  ───────►  │  │  (frontend)   │  │
│  └───────────────┘  │            │  └───────┬───────┘  │
│                     │            │          │ API      │
│  Content, Blog,     │            │          ▼          │
│  Theme (unchanged)  │            │  ┌───────────────┐  │
└─────────────────────┘            │  │  BigCommerce  │  │
                                   │  │  (commerce)   │  │
                                   │  └───────────────┘  │
                                   │                     │
                                   │  Content, Blog,     │
                                   │  Theme (unchanged)  │
                                   └─────────────────────┘
```

---

## 2. Solution Components

### Component Overview

| Component | What It Does | Current State | Owner |
|-----------|--------------|---------------|-------|
| **Assessment Engine** | Analyzes WC store, produces migration readiness report | 70% complete | Nino |
| **Data Migration Pipeline** | Extracts from WC, transforms, loads into BC | 50% complete | Nino |
| **BC Bridge Plugin** | WordPress plugin rendering BC data | 0% (spec complete) | TBD (WPEngine?) |
| **Validation Framework** | Verifies migration success | 45% complete | Nino |
| **Operational Tooling** | Cutover checklist, rollback, monitoring | 0% (spec complete) | TBD |

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MIGRATION PHASE                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐     ┌──────────────────┐     ┌──────────────┐            │
│  │ WooCommerce  │     │  Assessment      │     │  Migration   │            │
│  │   Store      │────▶│  Engine          │────▶│  Pipeline    │            │
│  └──────────────┘     └──────────────────┘     └──────┬───────┘            │
│         │                     │                       │                     │
│         │              Readiness Report         Transform + Load            │
│         │                     │                       │                     │
│         │                     ▼                       ▼                     │
│         │             ┌──────────────┐        ┌──────────────┐             │
│         │             │   Decision   │        │  BigCommerce │             │
│         │             │  GO/NO-GO    │        │    Store     │             │
│         │             └──────────────┘        └──────────────┘             │
│         │                                            │                     │
│         │    ┌───────────────────────────────────────┘                     │
│         │    │                                                              │
│         ▼    ▼                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                       VALIDATION FRAMEWORK                            │  │
│  │  - Product count match    - Price accuracy    - Image availability   │  │
│  │  - Category hierarchy     - Customer data     - Functional tests     │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           RUNTIME PHASE                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│         VISITOR                                                              │
│            │                                                                 │
│            ▼                                                                 │
│  ┌──────────────────┐                                                       │
│  │    WordPress     │                                                       │
│  │  ┌────────────┐  │         ┌────────────────────────────────────────┐   │
│  │  │ BC Bridge  │──┼────────▶│            BigCommerce                  │   │
│  │  │  Plugin    │  │  API    │  ┌──────────┐  ┌────────┐  ┌────────┐  │   │
│  │  └────────────┘  │         │  │ Catalog  │  │ Orders │  │  Cart  │  │   │
│  │                  │         │  └──────────┘  └────────┘  └────────┘  │   │
│  │  ┌────────────┐  │         │                                        │   │
│  │  │ WooCommerce│  │         │  ┌──────────┐  ┌────────────────────┐  │   │
│  │  │(deactivated│  │         │  │ Checkout │  │     Payments       │  │   │
│  │  │ historical)│  │         │  │ (hosted) │  │     Shipping       │  │   │
│  │  └────────────┘  │         │  └──────────┘  └────────────────────┘  │   │
│  │                  │         └────────────────────────────────────────┘   │
│  │  Content, Blog   │                                                       │
│  │  Theme (active)  │                                                       │
│  └──────────────────┘                                                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Assumptions Requiring Validation

### A. BigCommerce Platform Assumptions

| ID | Assumption | Risk if Wrong | Validation Needed |
|----|------------|---------------|-------------------|
| **A1** | BC API supports batch product creation (10/request) | Medium - slower migration | Confirm batch limits |
| **A2** | BC variant limit is 600 per product | High - some WC products exceed this | Confirm limit, any workarounds |
| **A3** | BC can fetch product images from external URLs | Medium - would need image upload | Confirm image handling |
| **A4** | BC Storefront API supports guest cart creation | High - breaks cart flow | Confirm cart API capabilities |
| **A5** | BC webhooks can notify WordPress of product changes | Medium - cache invalidation breaks | Confirm webhook capabilities |
| **A6** | BC allows custom_url to preserve SEO slugs | High - SEO disaster | Confirm custom URL support |

**❓ Questions for BC team:**
1. Is there a bulk import API beyond the batch endpoints?
2. Are there plans to increase the 600 variant limit?
3. What are the current API rate limits by plan tier?
4. Can orders be imported as "historical/completed" without triggering fulfillment workflows?

---

### B. WooCommerce Assumptions

| ID | Assumption | Risk if Wrong | Validation Needed |
|----|------------|---------------|-------------------|
| **B1** | WC REST API provides all product data we need | Medium - direct DB queries | Confirm API completeness |
| **B2** | WC allows duplicate SKUs (BC doesn't) | High - migration failures | Confirm and handle |
| **B3** | Customer passwords are bcrypt hashed, non-exportable | Low - expected | Confirm reset strategy |
| **B4** | HPOS (new order tables in WC 8.0+) is detectable | Medium - wrong order queries | Test detection |
| **B5** | WC plugins store data in predictable meta fields | High - plugin-specific handling | Survey common plugins |

**❓ Questions for WPEngine team:**
1. What percentage of WPEngine WC sites use HPOS?
2. What are the most common WC plugins on WPEngine sites?
3. Do you have aggregate data on average product/variant counts?
4. Any known issues with WC REST API on WPEngine infrastructure?

---

### C. WordPress Integration Assumptions

| ID | Assumption | Risk if Wrong | Validation Needed |
|----|------------|---------------|-------------------|
| **C1** | WP rewrite rules can intercept `/shop`, `/product/*` after WC deactivation | High - routing breaks | Test on WPEngine |
| **C2** | WP transients provide adequate caching (object cache preferred) | Medium - performance | Confirm WPEngine caching layer |
| **C3** | WC can be deactivated without breaking WordPress | Low - known to work | Confirm no edge cases |
| **C4** | Existing WC themes can be adapted to BC Bridge | Medium - theme work | Assess popular themes |

**❓ Questions for WPEngine team:**
1. Does WPEngine provide object caching that WP transients can use?
2. Are there WPEngine-specific hooks we should be aware of?
3. What's the upgrade path for sites on older PHP versions?

---

### D. Feedonomics Integration Assumptions

| ID | Assumption | Risk if Wrong | Validation Needed |
|----|------------|---------------|-------------------|
| **D1** | Feedonomics can serve as ETL for WC → BC migration | Medium - rebuild ETL | Confirm capabilities |
| **D2** | Feedonomics has WC connector | Low - likely exists | Confirm |
| **D3** | Feedonomics transformation rules can handle WC schema | Medium - custom rules | Assess complexity |

**❓ Questions for Feedonomics team:**
1. Have you done WC → BC migrations before?
2. What's the typical throughput for product data processing?
3. Can Feedonomics handle ongoing delta sync post-migration?

---

### E. Makeswift Integration Assumptions

| ID | Assumption | Risk if Wrong | Validation Needed |
|----|------------|---------------|-------------------|
| **E1** | Makeswift can render product pages from BC data | Medium - visual editor limits | Confirm BC integration depth |
| **E2** | Makeswift works without Catalyst | High - architecture change | Confirm standalone capability |
| **E3** | Makeswift integrates with WordPress headless | Medium - additional work | Confirm or scope |

**❓ Questions for Makeswift team:**
1. What's the current state of Makeswift + BC integration (non-Catalyst)?
2. Can Makeswift components fetch from BC GraphQL directly?
3. Is there a WordPress integration path?

---

## 4. Technical Risks & Mitigations

### Critical Risks

| Risk | Probability | Impact | Mitigation | Status |
|------|-------------|--------|------------|--------|
| **Products with >600 variants can't migrate** | Medium | High | Product splitting strategy OR negotiate BC limit increase | ⚠️ Needs design |
| **Duplicate SKUs in WC cause BC failures** | High | Medium | Pre-migration validation + auto-deduplication | ⚠️ Needs implementation |
| **SEO rankings drop post-migration** | Medium | High | Preserve URLs via custom_url, comprehensive redirect mapping | ✅ Approach defined |
| **Customer password reset friction** | High | Medium | Social login option, magic link fallback, clear communication | ✅ Approach defined |
| **Cart persistence across WP ↔ BC** | Medium | High | BC Storefront Cart API with cookie-based cart ID | ⚠️ Needs validation |

### High Risks

| Risk | Probability | Impact | Mitigation | Status |
|------|-------------|--------|------------|--------|
| **WC plugin data not accessible via API** | Medium | Medium | Direct DB queries as fallback, plugin-specific handlers | ⚠️ Needs inventory |
| **BC API rate limits slow large migrations** | High | Medium | Batching, backoff, off-hours execution | ✅ Implemented |
| **Category hierarchy depth exceeds BC limit (5)** | Low | High | Flatten deep hierarchies with warnings | ⚠️ Needs implementation |
| **Image URLs inaccessible after migration** | Medium | Medium | Pre-validate image URLs, parallel upload option | ⚠️ Needs implementation |

### Medium Risks

| Risk | Probability | Impact | Mitigation | Status |
|------|-------------|--------|------------|--------|
| **Order history access splits admin experience** | High | Low | Historical order widget in WP admin | ⚠️ Needs design |
| **Theme incompatibility with BC Bridge** | Medium | Medium | Template override system, popular theme testing | ⚠️ Needs testing |
| **Subscription migration complexity** | High (if subscriptions exist) | High | Manual migration path, customer communication | ⚠️ Documented, no automation |

---

## 5. Decision Points Requiring Input

### Decision 1: Order History Migration

**Question:** Should we migrate historical orders to BigCommerce?

| Option | Pros | Cons | Recommendation |
|--------|------|------|----------------|
| **A: Don't migrate** | Simple, fast, no data loss risk | Split admin (WP for old, BC for new) | ✅ Recommended |
| **B: Import as read-only** | Unified view in BC | BC import limitations, risk of data issues | Consider for Phase 2 |
| **C: Unified dashboard** | Best UX | Custom development required | Future enhancement |

**My recommendation:** Option A for MVP. Most merchants accept split admin for historical data.

**❓ Need input from:** Commerce.com Product, WPEngine customers

---

### Decision 2: BC Bridge Plugin Ownership

**Question:** Who builds and maintains the WordPress plugin?

| Option | Pros | Cons |
|--------|------|------|
| **A: WPEngine builds** | WordPress expertise, WPEngine integration | Resource allocation, roadmap alignment |
| **B: Commerce.com builds** | Control, integration with migration tool | WordPress expertise gap |
| **C: Partner/agency builds** | External resource | Coordination overhead, IP ownership |
| **D: Open source community** | Ecosystem, contributions | Quality control, support burden |

**❓ Need input from:** WPEngine leadership, Commerce.com leadership

---

### Decision 3: Products Exceeding 600 Variants

**Question:** How do we handle WC products with more than 600 variants?

| Option | Pros | Cons |
|--------|------|------|
| **A: Split into multiple BC products** | Works within limits | Customer UX change, complexity |
| **B: Use BC modifiers instead of variants** | Avoids limit | Different purchasing UX |
| **C: Block migration, require manual restructure** | Clear, simple | Poor merchant experience |
| **D: Negotiate BC limit increase** | Best UX | May not be possible |

**My recommendation:** Option A (split) with clear customer communication. Option C as fallback.

**❓ Need input from:** BC Platform team (is limit increase possible?)

---

### Decision 4: Checkout Experience

**Question:** Where does checkout happen?

| Option | Pros | Cons |
|--------|------|------|
| **A: Redirect to BC hosted checkout** | Simplest, PCI handled | UX transition, domain change visible |
| **B: BC Embedded Checkout in WP** | Seamless UX | More integration work, iframe limitations |
| **C: Custom checkout via BC API** | Full control | Highest complexity, PCI scope |

**My recommendation:** Option A for MVP. Option B as future enhancement.

**❓ Need input from:** Commerce.com Product, WPEngine (any checkout partnerships?)

---

### Decision 5: Feedonomics Role

**Question:** Should Feedonomics be the ETL layer for migrations?

| Option | Pros | Cons |
|--------|------|------|
| **A: Yes, use Feedonomics** | Existing asset, proven at scale | Adds dependency, may be overkill for migration |
| **B: No, build custom ETL** | Tailored to migration, simpler | Duplicate capability |
| **C: Hybrid** | Feedonomics for ongoing sync, custom for initial migration | Complexity |

**My recommendation:** Need to understand Feedonomics capabilities first. Likely Option C.

**❓ Need input from:** Feedonomics team

---

## 6. Current Implementation Status

### What's Built

| Component | Status | Code Location |
|-----------|--------|---------------|
| WooCommerce API client | ✅ Complete | `src/assessment/wc-client.ts` |
| BigCommerce API client | ✅ Complete | `src/bigcommerce/bc-client.ts` |
| Scale metrics collector | ✅ Complete | `src/assessment/collectors/scale.ts` |
| Complexity analyzer | ⚠️ Basic | `src/assessment/collectors/complexity.ts` |
| Plugin mapper | ⚠️ Partial (6 plugins) | `src/assessment/plugin-mapper.ts` |
| SEO analyzer | ⚠️ Basic | `src/assessment/collectors/seo.ts` |
| Assessment report generator | ✅ Complete | `src/assessment/report.ts` |
| Product transformer | ✅ Complete | `src/migration/transformers/product.ts` |
| Variant transformer | ✅ Complete (600 limit warning) | `src/migration/transformers/variant.ts` |
| Category migrator | ⚠️ Basic | `src/migration/category-migrator.ts` |
| Customer migrator | ✅ Complete (w/ password reset flag) | `src/migration/customer-migrator.ts` |
| Data validator | ⚠️ Partial | `src/validation/data-validator.ts` |
| Rate limiter | ✅ Complete | `src/lib/rate-limiter.ts` |
| Types (WC + BC) | ✅ Complete | `src/types/wc.ts`, `src/types/bc.ts` |

### What's Missing (Critical)

| Gap | Impact | Effort | Priority |
|-----|--------|--------|----------|
| Blocker detection (>600 variants, duplicate SKUs) | Migrations will fail | Medium | P0 |
| ID mapping persistence (WC ID → BC ID) | Category→Product dependency breaks | Medium | P0 |
| Custom URL preservation | SEO disaster | Low | P0 |
| SKU uniqueness validation/deduplication | Migrations will fail | Medium | P0 |

### What's Missing (High Priority)

| Gap | Impact | Effort | Priority |
|-----|--------|--------|----------|
| Product split strategy for >600 variants | Can't migrate some products | High | P1 |
| Category hierarchy ordering | Parent categories must exist first | Medium | P1 |
| State/country code normalization | Customer addresses may fail | Medium | P1 |
| Unit conversion (weight/dimensions) | Incorrect product data | Medium | P1 |
| Dry-run mode | Can't validate without side effects | Medium | P1 |

See `docs/IMPLEMENTATION_GAP_ANALYSIS.md` for complete gap analysis.

---

## 7. Proposed Timeline

### Phase 0: Validation (Current)

**Goal:** Get this approach vetted before heavy investment

| Week | Activities |
|------|------------|
| Week 0 | Circulate this review package |
| Week 1 | Collect feedback, schedule review sessions |
| Week 2 | Incorporate feedback, finalize approach |

### Phase 1: Critical Gaps (Weeks 3-4)

**Goal:** Fix blockers that would cause migration failures

- Blocker detection in assessment
- SKU validation/deduplication
- ID mapping persistence
- Custom URL preservation

### Phase 2: First Pilot (Weeks 5-6)

**Goal:** Migrate first real customer, hands-on learning

- End-to-end migration of Pilot Customer #1
- Document friction points
- Refine tooling based on reality

### Phase 3: Assessment Engine v1 (Weeks 7-8)

**Goal:** Assessment engine ready for sales/pre-sales use

- Full blocker detection
- Effort estimation
- Polished report output

### Phase 4: Parallel Pilots (Weeks 9-12)

**Goal:** Prove repeatability

- Pilots #2 and #3
- Agency enablement
- BC Bridge plugin MVP (if ownership decided)

---

## 8. Supporting Documentation

For reviewers who want more detail:

| Document | What It Covers | Read Time |
|----------|---------------|-----------|
| `docs/MIGRATION_ARCHITECTURE.md` | Full technical architecture, data mappings, BC Bridge design | 30 min |
| `docs/ROADMAP_EARS.md` | Detailed requirements in EARS format | 45 min |
| `docs/DATA_MAPPING_AND_MIGRATION_READINESS.md` | Exhaustive field mappings, edge cases, BC limits | 60 min |
| `docs/IMPLEMENTATION_GAP_ANALYSIS.md` | Current vs. required implementation | 20 min |
| `docs/VP_PRODUCT_ARCHITECTURE_90_DAY_PLAN.md` | Broader role plan beyond migration | 15 min |
| `docs/strategy-kit/INDEX.md` | Business context, WPEngine partnership | 10 min |

---

## 9. Feedback Request

### What I Need From You

**By [DATE]**, please provide feedback on:

#### For Everyone

1. **Assumption validation:** Are my assumptions correct? Flag any that are wrong.
2. **Missing risks:** What risks have I missed?
3. **Blocking issues:** Is there anything that fundamentally changes this approach?

#### For WPEngine

4. What resources (if any) can WPEngine contribute to BC Bridge plugin?
5. Do you have customer data that could inform pilot selection?
6. What WPEngine-specific technical considerations should we account for?

#### For Commerce.com / BigCommerce

7. Can we get confirmation on BC API capabilities (assumptions A1-A6)?
8. Is there appetite to negotiate variant limit increases for this use case?
9. Who should be the ongoing technical contact for BC platform questions?

#### For Feedonomics

10. Can Feedonomics serve as the ETL layer? What's the effort?
11. What WC data can Feedonomics already ingest?

#### For Makeswift

12. What's the non-Catalyst integration story?
13. Is WordPress integration on the roadmap?

---

## 10. Next Steps

1. **Review period:** [DATE] to [DATE]
2. **Feedback due:** [DATE]
3. **Review meeting:** [DATE] - walk through feedback, make decisions
4. **Revised plan:** [DATE] - incorporate feedback
5. **Phase 1 kickoff:** [DATE]

---

## Appendix: Glossary

| Term | Definition |
|------|------------|
| **BC** | BigCommerce |
| **WC** | WooCommerce |
| **BC Bridge** | Proposed WordPress plugin that renders BC data |
| **HPOS** | High-Performance Order Storage (WC 8.0+ feature) |
| **Variant** | A purchasable combination of product options (e.g., "Blue, Large") |
| **Option** | A product attribute that creates variants (e.g., "Color", "Size") |
| **Modifier** | A product customization that doesn't create variants |
| **Custom URL** | BC feature to set SEO-friendly URL paths |
| **Storefront API** | BC's client-side API for cart/checkout operations |
| **EARS** | Easy Approach to Requirements Syntax |

---

*Document Version: 1.0*
*Last Updated: December 2025*
*Status: Ready for Review*
