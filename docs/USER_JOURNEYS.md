# User Journeys

This document maps the primary user flows through the BC-Migration dashboard.

---

## Table of Contents

- [Overview](#overview)
- [Journey 1: Store Assessment](#journey-1-store-assessment)
- [Journey 2: Migration Execution](#journey-2-migration-execution)
- [Journey 3: Validation & Verification](#journey-3-validation--verification)
- [Journey 4: Go-Live Preparation](#journey-4-go-live-preparation)
- [Cross-Journey Decision Tree](#cross-journey-decision-tree)
- [Error Recovery Paths](#error-recovery-paths)
- [Success Metrics](#success-metrics)

---

## Overview

### User Personas

| Persona | Goal | Technical Level |
|---------|------|-----------------|
| **Store Owner** | Migrate store with minimal downtime | Non-technical |
| **Developer** | Automate migration for client stores | Technical |
| **Agency Partner** | Manage multiple client migrations | Mixed |

### Information Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Dashboard Home (/)                         │
│                                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │ Connect  │  │ Assess   │  │ Migrate  │  │ Validate │            │
│  │ WC Store │→ │ Readiness│→ │ Data     │→ │ Results  │→ Go-Live   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘            │
│       │              │              │              │                 │
│       ▼              ▼              ▼              ▼                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │ /setup   │  │ /products│  │ /migrate │  │ /validate│            │
│  │ /help    │  │ /seo     │  │ /export  │  │ /preview │            │
│  └──────────┘  │ /plugins │  └──────────┘  │ /go-live │            │
│                └──────────┘                └──────────┘            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Journey 1: Store Assessment

**Goal:** Understand WooCommerce store complexity and migration readiness.

### Flow Diagram

```
┌─────────────────┐
│  Landing Page   │
│  (Not Connected)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│  Enter WC       │────▶│  Validation     │
│  Credentials    │     │  Error          │
│  - URL          │     │  - Invalid URL  │
│  - Consumer Key │     │  - Wrong keys   │
│  - Secret       │     │  - Network      │
└────────┬────────┘     └────────┬────────┘
         │                       │
         │ Success               │ Retry
         ▼                       │
┌─────────────────┐◀─────────────┘
│  Connected      │
│  Dashboard      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  "Analyze       │
│   Commerce Swap │
│   Readiness"    │
└────────┬────────┘
         │
         ├──────────────────┬──────────────────┐
         ▼                  ▼                  ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  Products       │ │  Categories     │ │  Customers      │
│  Assessment     │ │  Assessment     │ │  Assessment     │
└────────┬────────┘ └────────┬────────┘ └────────┬────────┘
         │                   │                   │
         └───────────────────┼───────────────────┘
                             ▼
                    ┌─────────────────┐
                    │  Readiness      │
                    │  Score (0-100%) │
                    │  + Blockers     │
                    │  + Warnings     │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Path           │
                    │  Recommendation │
                    │  (BC Bridge,    │
                    │   Makeswift,    │
                    │   Stencil,      │
                    │   Headless)     │
                    └─────────────────┘
```

### Touchpoints & Success Metrics

| Step | Page/Component | Success Metric | Target |
|------|----------------|----------------|--------|
| 1. Land | `/` | Page load | < 2s |
| 2. Connect | `ConnectionForm` | Successful connection | 95% |
| 3. Assess | `AssessmentCard` | All areas assessed | 80% |
| 4. Review | `NextActions` | User clicks recommendation | 60% |

### Critical User Decisions

1. **Credential Entry**
   - User needs: Consumer Key + Consumer Secret
   - Guidance provided: "WooCommerce Setup Guide" accordion
   - Fallback: "Don't have WooCommerce?" → Fresh Start path

2. **Assessment Depth**
   - Single area vs. "Assess All" button
   - Progress shown via `BatchProgress` component

3. **Path Selection**
   - Automated recommendation based on product count
   - User can compare all 4 paths at `/paths`

---

## Journey 2: Migration Execution

**Goal:** Transfer data from WooCommerce to BigCommerce.

### Flow Diagram

```
┌─────────────────┐
│  /migrate       │
│  (WC Connected) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│  Enter BC       │────▶│  Connection     │
│  Credentials    │     │  Error          │
│  - Store Hash   │     │  - Invalid hash │
│  - Access Token │     │  - Wrong token  │
└────────┬────────┘     └────────┬────────┘
         │                       │
         │ Success               │ Retry
         ▼                       │
┌─────────────────┐◀─────────────┘
│  Both Stores    │
│  Connected      │
│  ┌───────────┐  │
│  │ WC ────▶ BC │
│  └───────────┘  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Migration      │
│  Wizard         │
└────────┬────────┘
         │
         ├─────────────────────────────────┐
         ▼                                 ▼
┌─────────────────┐               ┌─────────────────┐
│  Step 1:        │               │  Error:         │
│  Select         │               │  - API failure  │
│  Categories     │               │  - Rate limit   │
└────────┬────────┘               │  - Validation   │
         │                         └────────┬────────┘
         ▼                                  │
┌─────────────────┐                         │
│  Step 2:        │◀────────────────────────┘
│  Migrate        │         Retry
│  Products       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Step 3:        │
│  Review         │
│  Results        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Success:       │
│  "X products    │
│   migrated"     │
│                 │
│  [Validate] →   │
└─────────────────┘
```

### Wizard Steps

| Step | Component | User Action | System Action |
|------|-----------|-------------|---------------|
| 1 | `CategorySelector` | Choose categories | Fetch WC categories |
| 2 | `MigrationProgress` | Monitor | Batch create in BC |
| 3 | `MigrationResults` | Review | Show success/failures |

### Error Recovery

| Error | User Message | Recovery Action |
|-------|--------------|-----------------|
| Rate limit (429) | "Rate limit reached, pausing..." | Auto-retry with backoff |
| Network error | "Connection lost" | Retry button |
| Validation error | "Invalid product data" | Show details, skip |
| Duplicate SKU | "Product exists in BC" | Skip or update |

---

## Journey 3: Validation & Verification

**Goal:** Verify migration completeness and data integrity.

### Flow Diagram

```
┌─────────────────┐
│  /validate      │
│                 │
│  Prerequisites: │
│  - WC connected │
│  - BC connected │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│  "Run           │────▶│  Missing        │
│   Validation"   │     │  Connection     │
└────────┬────────┘     │  → /migrate     │
         │              └─────────────────┘
         │ Both connected
         ▼
┌─────────────────┐
│  Fetching       │
│  Counts...      │
│  [Spinner]      │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Comparison Results                      │
│                                          │
│  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │ Products │  │Categories│  │Customers│ │
│  │ WC: 150  │  │ WC: 12   │  │ WC: 500 │ │
│  │ BC: 148  │  │ BC: 12   │  │ BC: 498 │ │
│  │ [Under]  │  │ [Match]  │  │ [Under] │ │
│  └──────────┘  └──────────┘  └────────┘ │
└────────┬────────────────────────────────┘
         │
         ├─────────────────┬─────────────────┐
         ▼                 ▼                 ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  All Matched    │ │  Partial Match  │ │  Mismatch       │
│  ────────────── │ │  ────────────── │ │  ────────────── │
│  → /go-live     │ │  → Review       │ │  → /migrate     │
│                 │ │    discrepancies│ │    (fix issues) │
└─────────────────┘ │  → Re-migrate   │ └─────────────────┘
                    └─────────────────┘
```

### Validation Checks

| Check | Method | Pass Criteria |
|-------|--------|---------------|
| Product count | API comparison | WC count = BC count |
| Category count | API comparison | WC count = BC count |
| Customer count | API comparison | WC count = BC count |
| Price sampling | Random 10% sample | Prices match within 1% |
| Image accessibility | HTTP HEAD requests | All images return 200 |

---

## Journey 4: Go-Live Preparation

**Goal:** Complete pre-launch checklist and switch traffic.

### Flow Diagram

```
┌─────────────────┐
│  /go-live       │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Go-Live Checklist                       │
│                                          │
│  Pre-Migration                           │
│  [✓] WooCommerce assessed               │
│  [✓] BC store configured                │
│                                          │
│  Migration                               │
│  [✓] Products migrated                  │
│  [✓] Categories migrated                │
│  [✓] Customers migrated                 │
│  [ ] Orders migrated (optional)         │
│                                          │
│  Validation                              │
│  [✓] Counts verified                    │
│  [ ] Price sampling passed              │
│  [ ] Images accessible                  │
│                                          │
│  DNS & Redirects                         │
│  [ ] 301 redirects configured           │
│  [ ] DNS pointed to BC                  │
│  [ ] SSL certificate active             │
│                                          │
│  Final Checks                            │
│  [ ] Test checkout completed            │
│  [ ] Payment gateway live               │
│  [ ] Notifications configured           │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────┐
│  Launch!        │
│  [Switch DNS]   │
└─────────────────┘
```

### Checklist States

| State | Visual | Action |
|-------|--------|--------|
| Not started | `[ ]` Gray | Click to start |
| In progress | `[○]` Blue spinner | Wait |
| Passed | `[✓]` Green check | None |
| Failed | `[✗]` Red X | Show fix button |
| Skipped | `[-]` Gray dash | Optional items |

---

## Cross-Journey Decision Tree

```
                    ┌─────────────────┐
                    │  User arrives   │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
       Has WC store?   Fresh start?   Returning?
              │              │              │
              ▼              ▼              ▼
       ┌──────────┐   ┌──────────┐   ┌──────────┐
       │ Connect  │   │ /fresh-  │   │ Resume   │
       │ WC store │   │  start   │   │ from     │
       └────┬─────┘   └──────────┘   │ cache    │
            │                         └────┬─────┘
            ▼                              │
       ┌──────────┐                        │
       │ Run      │◀───────────────────────┘
       │ Assessment│
       └────┬─────┘
            │
   ┌────────┼────────┐
   │        │        │
   ▼        ▼        ▼
< 50     50-500    > 500
products products products
   │        │        │
   ▼        ▼        ▼
┌──────┐ ┌──────┐ ┌──────┐
│Self- │ │Self- │ │Contact│
│service│ │service│ │ Sales │
│migrate│ │+ help │ │ team  │
└──────┘ └──────┘ └──────┘
```

---

## Error Recovery Paths

### Connection Errors

```
┌─────────────────┐
│  Error:         │
│  "Invalid       │
│   credentials"  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Show guidance: │
│  1. Check URL   │
│  2. Verify keys │
│  3. Test in WC  │
│  4. Retry       │
└────────┬────────┘
         │
         ├───────────────┐
         ▼               ▼
┌─────────────────┐ ┌─────────────────┐
│  User fixes     │ │  User needs     │
│  → Retry        │ │  help           │
│  → Success      │ │  → /help page   │
└─────────────────┘ │  → Support link │
                    └─────────────────┘
```

### Migration Errors

| Error Type | Recovery Path |
|------------|---------------|
| Rate limit | Auto-pause, resume after cooldown |
| Network drop | Show retry button, preserve progress |
| Validation fail | Show item details, allow skip |
| Partial failure | Show success/fail counts, allow re-run for failed |

---

## Success Metrics

### Journey Completion Rates

| Journey | Target | Measurement |
|---------|--------|-------------|
| Assessment | 80% | Users who assess ≥1 area after connecting |
| Migration | 60% | Users who complete ≥1 category migration |
| Validation | 70% | Users who run validation after migration |
| Go-Live | 40% | Users who complete all checklist items |

### Time to Value

| Milestone | Target Time |
|-----------|-------------|
| Connect WC | < 2 min |
| First assessment | < 5 min |
| Full assessment | < 10 min |
| First migration batch | < 15 min |
| Complete validation | < 5 min |

### Drop-off Points

| Point | Expected Drop | Intervention |
|-------|---------------|--------------|
| Credential entry | 30% | Clearer setup guide |
| BC connection | 20% | Link to BC docs |
| Migration start | 15% | Progress indicators |
| Validation | 10% | Auto-prompt after migration |

---

## Related Documentation

- [UI_UX_REVIEW.md](./UI_UX_REVIEW.md) - Visual design audit
- [COMPONENTS.md](./COMPONENTS.md) - Component inventory
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues
