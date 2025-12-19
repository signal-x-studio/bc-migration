# VP Product Architecture: 90-Day Plan

**Role:** VP Product Architecture, Commerce.com
**Reports to:** Chief Product Officer
**Version:** 1.0
**Date:** December 2025

---

## Executive Summary

This plan outlines a structured approach to establishing the VP Product Architecture role at Commerce.com, leveraging the WooCommerce migration initiative as an entry point while building toward comprehensive platform architecture leadership across BigCommerce, Feedonomics, and Makeswift.

### Strategic Context

- **WPEngine partnership confirmed** - 3 customers + 3 agencies ready for pilots
- **Catalyst pivot** - Simpler architecture required (Catalyst deemed too complex)
- **Initial team** - Ultra-lean: Nino + Jordan Sim + strategy person
- **Phase 0 budget** - $190K, 12-week validation window

### Success Metrics (90 Days)

| Metric | Target |
|--------|--------|
| Pilot migrations completed | 3 |
| Migration NPS | >40 |
| Assessment engine prototype | Functional |
| Post-Catalyst architecture defined | ADR published |
| Stakeholder alignment | CPO/CFO buy-in on Phase 1 |

---

## Phase 1: Foundation (Days 1-30)

### Objective: Validate, Learn, Architect

Establish credibility through rapid context acquisition and deliver the first critical architectural decision.

### Week 1-2: Discovery & Stakeholder Mapping

#### Internal Discovery

| Stakeholder | Focus Areas | Deliverable |
|-------------|-------------|-------------|
| CPO | Product vision, role expectations, decision authority | Alignment doc |
| CFO | WPEngine deal terms, budget constraints, success metrics | Financial framework |
| Jordan Sim | Technical capabilities, current progress, blockers | Collaboration model |
| Feedonomics Engineering | Integration capabilities, data transformation limits | Technical assessment |
| Makeswift Engineering | Visual builder roadmap, BigCommerce integration depth | Integration map |
| BigCommerce Platform Team | API roadmap, Catalyst rationale, alternative paths | Architecture options |

#### External Discovery

| Entity | Focus Areas | Deliverable |
|--------|-------------|-------------|
| 3 Pilot Customers | WooCommerce setup complexity, pain points, expectations | Customer profiles |
| 3 Partner Agencies | Technical capabilities, tooling preferences, concerns | Partner enablement needs |
| WPEngine Contacts | Partnership scope, co-marketing, technical integration | Partnership playbook |

#### Key Questions to Answer

1. Why exactly is Catalyst out? Technical? Political? Resource constraints?
2. What's the actual state of BigCommerce + Feedonomics + Makeswift integration today?
3. What do the pilot customers' WooCommerce stores actually look like?
4. What decision authority does this role have on architecture choices?
5. Who are the hidden stakeholders who can block progress?

### Week 3-4: Architecture Definition

#### Primary Deliverable: Post-Catalyst Reference Architecture ADR

**ADR-002: Simplified Migration Stack Architecture**

Given the Catalyst decision, define the alternative approach:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    COMMERCE.COM MIGRATION STACK                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │  WordPress   │    │  Feedonomics │    │  BigCommerce │          │
│  │  (Content)   │───▶│   (ETL)      │───▶│  (Commerce)  │          │
│  └──────────────┘    └──────────────┘    └──────────────┘          │
│         │                                       │                   │
│         │            ┌──────────────┐          │                   │
│         └───────────▶│  Makeswift   │◀─────────┘                   │
│                      │  (Visual)    │                               │
│                      └──────────────┘                               │
│                             │                                       │
│                      ┌──────────────┐                               │
│                      │   Vercel /   │                               │
│                      │   Hosting    │                               │
│                      └──────────────┘                               │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Architecture Principles:**

1. **WordPress Preservation** - Content, SEO equity, and editorial workflows remain intact
2. **Commerce Decoupling** - WooCommerce replaced with BigCommerce headless APIs
3. **Data Transformation** - Feedonomics handles WooCommerce → BigCommerce mapping
4. **Visual Editing** - Makeswift enables marketer self-service without dev dependency
5. **Hosting Flexibility** - Vercel preferred but not mandated

**Key Technical Decisions:**

| Decision | Rationale |
|----------|-----------|
| Next.js App Router (non-Catalyst) | Simpler than Catalyst, proven patterns |
| GraphQL Storefront API | Performance, flexibility over REST |
| Feedonomics for ETL | Leverage existing acquisition, proven at scale |
| Makeswift integration | Visual editing without custom dev |
| WPGraphQL for WordPress | Standard WordPress headless approach |

#### Secondary Deliverables

1. **Risk Register** - Technical, operational, and partnership risks for pilots
2. **Pilot Customer Assessment** - Migration complexity scores for all 3 customers
3. **Integration Gap Analysis** - Where BigCommerce + Feedonomics + Makeswift integration falls short

### Phase 1 Exit Criteria

- [ ] ADR-002 published and approved by CPO
- [ ] All 3 pilot customers assessed and scoped
- [ ] Risk register with mitigations documented
- [ ] Stakeholder map with decision rights clarified
- [ ] Week 5 kickoff for Pilot #1 scheduled

---

## Phase 2: Prove (Days 31-60)

### Objective: Execute Pilot #1, Build Assessment Engine

Demonstrate the architecture works in production while building tooling for scale.

### Week 5-6: Pilot #1 Hands-On Execution

#### Why Hands-On Matters

This role requires credibility earned through execution, not just strategy. Pilot #1 is where you:
- Feel the actual pain points in the migration flow
- Identify what can be automated vs. requires human judgment
- Build intuition for realistic timelines
- Establish trust with engineering teams

#### Pilot #1 Execution Focus

| Phase | Activities | Owner |
|-------|------------|-------|
| **Assessment** | WooCommerce store audit, plugin inventory, data complexity | VP Product Architecture |
| **Data Migration** | Feedonomics configuration, transformation rules, validation | Jordan Sim + Feedonomics |
| **Storefront Build** | Makeswift setup, component mapping, design system | Agency Partner |
| **Integration** | WordPress ↔ BigCommerce ↔ Makeswift wiring | VP Product Architecture |
| **UAT** | Customer validation, bug fixes, go-live prep | All |

#### Documentation Requirements

For every friction point encountered:

```markdown
## Friction Log Entry

**Date:**
**Phase:**
**Description:**
**Time Lost:**
**Root Cause:**
**Automation Potential:** [None | Partial | Full]
**Priority:** [P0 | P1 | P2]
**Proposed Solution:**
```

### Week 7-8: Assessment Engine MVP

#### Why the Assessment Engine is Critical

The AI Council audit (70.2/100 score) identified assessment automation as the key to scaling. Without it, every migration requires expensive manual discovery.

#### Assessment Engine v0.1 Specification

**Input:** WooCommerce store URL + admin credentials (or export)

**Output:**

```json
{
  "store_id": "uuid",
  "assessment_date": "2024-12-17",
  "complexity_score": 72,
  "risk_level": "medium",
  "estimated_effort_hours": 120,
  "estimated_cost_usd": 8500,

  "catalog": {
    "products": 1247,
    "variants": 3891,
    "categories": 89,
    "attributes": 23,
    "custom_fields": 12,
    "complexity": "medium"
  },

  "plugins": {
    "total": 47,
    "commerce_related": 18,
    "high_risk": ["woocommerce-subscriptions", "custom-checkout-flow"],
    "migratable": 14,
    "requires_rebuild": 4
  },

  "content": {
    "pages": 234,
    "posts": 1892,
    "media_items": 8934,
    "seo_redirects_needed": 156
  },

  "integrations": {
    "payment_gateways": ["stripe", "paypal"],
    "shipping_providers": ["shipstation", "ups"],
    "erp_pim": null,
    "custom_apis": 3
  },

  "recommendations": [
    {
      "category": "catalog",
      "issue": "Custom product attributes exceed BigCommerce limits",
      "solution": "Map to metafields or consolidate",
      "effort": "medium"
    }
  ],

  "migration_path": {
    "recommended": "standard",
    "phases": 3,
    "timeline_weeks": 8
  }
}
```

#### Assessment Engine Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                      ASSESSMENT ENGINE v0.1                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │  WooCommerce │    │   Analyzer   │    │   Scoring    │          │
│  │   Extractor  │───▶│   Pipeline   │───▶│   Engine     │          │
│  └──────────────┘    └──────────────┘    └──────────────┘          │
│         │                   │                   │                   │
│         ▼                   ▼                   ▼                   │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │  - REST API  │    │  - Catalog   │    │  - Complexity│          │
│  │  - DB Export │    │  - Plugins   │    │  - Risk      │          │
│  │  - Site Crawl│    │  - Content   │    │  - Effort    │          │
│  │              │    │  - Integr.   │    │  - Cost      │          │
│  └──────────────┘    └──────────────┘    └──────────────┘          │
│                                                                      │
│                      ┌──────────────┐                               │
│                      │    Report    │                               │
│                      │   Generator  │                               │
│                      └──────────────┘                               │
│                             │                                       │
│              ┌──────────────┴──────────────┐                       │
│              ▼                              ▼                       │
│       ┌──────────────┐              ┌──────────────┐               │
│       │     JSON     │              │   Dashboard  │               │
│       │    Output    │              │     View     │               │
│       └──────────────┘              └──────────────┘               │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

#### Technology Choices

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Extraction | Node.js + WooCommerce REST API | JavaScript ecosystem, API coverage |
| Analysis | TypeScript + Zod schemas | Type safety, validation |
| Scoring | Rule engine + ML (future) | Start simple, add intelligence |
| Storage | Supabase | Speed to market, existing patterns |
| Dashboard | Next.js + React | Consistent with migration stack |

### Phase 2 Exit Criteria

- [ ] Pilot #1 complete or clear path to completion
- [ ] Assessment Engine v0.1 functional prototype
- [ ] Friction log with 20+ documented issues
- [ ] Migration playbook v1 (battle-tested, not theoretical)
- [ ] Go/No-Go recommendation for Phase 1 drafted

---

## Phase 3: Scale (Days 61-90)

### Objective: Prove Repeatability, Propose Phase 1

Execute remaining pilots in parallel while systematizing learnings.

### Week 9-10: Parallel Pilot Execution

#### Pilot Velocity Targets

| Pilot | Customer Profile | Complexity | Target Completion |
|-------|-----------------|------------|-------------------|
| #1 | [Completed in Phase 2] | Medium | Day 45 |
| #2 | [TBD from assessment] | [TBD] | Day 75 |
| #3 | [TBD from assessment] | [TBD] | Day 85 |

#### Agency Enablement Program

**Goal:** Make the 3 partner agencies self-sufficient for standard migrations.

| Week | Focus | Deliverable |
|------|-------|-------------|
| Week 9 | Training on architecture + tools | Training materials |
| Week 10 | Shadowed execution on Pilot #2 or #3 | Certified agency |

**Agency Certification Checklist:**

- [ ] Completed architecture training
- [ ] Shadowed one migration end-to-end
- [ ] Passed assessment engine usage test
- [ ] Demonstrated Makeswift proficiency
- [ ] Understands escalation paths

### Week 11-12: Phase 1 Proposal Development

#### Phase 1 Investment Case Structure

```markdown
# Phase 1 Proposal: WooCommerce Migration Program

## Executive Summary
[1-pager for CPO/CFO]

## What We Learned (Phase 0)
- Pilot outcomes (NPS, timelines, costs)
- Assessment engine validation
- Agency capability gaps
- Technical debt discovered

## Refined Business Case
- Updated TAM/SAM based on pilot learnings
- Realistic capture rate (adjusted from 5%)
- Revised ROI model with actuals

## Phase 1 Scope
- Target: X migrations in 12 weeks
- Team structure required
- Tooling investments needed
- Partner enablement expansion

## Resource Request
- Headcount: [X FTEs]
- Tooling: [$X]
- Partner incentives: [$X]
- Total: [$X]

## Success Metrics
- Migration velocity
- NPS targets
- SEO impact limits
- Agency enablement

## Risks & Mitigations
[Updated from Phase 0 risk register]

## Recommendation
[GO / CONDITIONAL GO / NO-GO]
```

#### Key Artifacts to Deliver

1. **Phase 0 Retrospective** - What worked, what didn't, what we'd change
2. **Refined ROI Model** - Based on actual pilot costs and timelines
3. **Team Structure Proposal** - Who we need for Phase 1
4. **Tooling Roadmap** - Assessment engine v1.0, migration automation
5. **Partnership Playbook** - WPEngine co-marketing, agency program

### Phase 3 Exit Criteria

- [ ] 3 pilots complete with documented outcomes
- [ ] NPS >40 achieved
- [ ] Assessment engine validated on 3+ stores
- [ ] Agency enablement program defined
- [ ] Phase 1 proposal presented to CPO/CFO
- [ ] Product architecture roadmap (6-month view)

---

## Beyond 90 Days: Role Expansion

The migration initiative is your **entry point**, not your destination. Here's how the role expands:

### Quarter 2: Integration & Developer Experience

| Focus Area | Objective |
|------------|-----------|
| **Platform Integration** | Define how BigCommerce + Feedonomics + Makeswift work as unified stack |
| **Developer Experience** | Own the post-Catalyst headless story (what replaces Catalyst?) |
| **API Strategy** | GraphQL vs REST guidance, versioning strategy, deprecation policy |

### Quarter 3: Platform Architecture

| Focus Area | Objective |
|------------|-----------|
| **Technical Vision** | Long-term platform direction document |
| **Architecture Governance** | Establish review processes across three engineering orgs |
| **Competitive Intelligence** | Deep Shopify technical analysis, gap identification |

### Quarter 4: Enterprise & Scale

| Focus Area | Objective |
|------------|-----------|
| **Enterprise Architecture** | Reference architectures for large customers |
| **M&A Support** | Technical due diligence capabilities |
| **Customer Success** | Architecture reviews for strategic accounts |

---

## Appendix A: Platform Technical Summary

### BigCommerce Core Capabilities

**APIs:**
- REST Management API - Store operations, catalog, orders, customers
- GraphQL Storefront API - Customer-facing queries, optimized for headless
- GraphQL Admin API - Backend management operations
- Webhooks - Real-time event notifications

**Key Features:**
- Multi-storefront support
- B2B Edition for enterprise buyers
- Channel management for omnichannel
- Native checkout with customization options

**Headless Options:**
- Catalyst (Next.js 14, App Router, React Server Components) - *Currently being de-emphasized*
- Custom Next.js builds
- Any JavaScript framework via APIs

**Reference:** [BigCommerce Developer Center](https://developer.bigcommerce.com)

### Feedonomics Core Capabilities

**Primary Function:** Product feed management and data transformation at scale

**Key Capabilities:**
- Data ingestion from any ecommerce platform, ERP, or PIM
- Transformation rules for channel-specific requirements
- Syndication to 100+ marketplaces and advertising channels
- Real-time inventory and pricing synchronization
- Order synchronization across channels

**Migration Relevance:**
- ETL pipeline for WooCommerce → BigCommerce data migration
- Product data transformation and normalization
- Ongoing channel synchronization post-migration

**Notable Customers:** Dell Technologies, Lululemon

**Acquisition:** BigCommerce acquired Feedonomics in 2021 for ~$145M

**Reference:** [Feedonomics](https://feedonomics.com)

### Makeswift Core Capabilities

**Primary Function:** Composable visual page builder for Next.js

**Key Capabilities:**
- No-code visual editing for marketing teams
- React component architecture (any component can be made visual)
- Design system management (colors, typography, spacing)
- Responsive design with true breakpoint control
- Multi-user real-time collaboration
- Integration with CMS providers (Contentful, Strapi, WordPress)

**BigCommerce Integration:**
- Native Catalyst integration (primary path)
- Standalone Next.js integration (alternative path)
- Visual editing of commerce components

**Hosting Options:**
- Makeswift default hosting (fastest setup)
- Custom hosting via Next.js deployment (Vercel, etc.)

**Acquisition:** BigCommerce acquired Makeswift in Q4 2023

**Reference:** [Makeswift Documentation](https://docs.makeswift.com)

### Integration Points

```
┌─────────────────────────────────────────────────────────────────────┐
│                    COMMERCE.COM STACK INTEGRATION                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│                        ┌──────────────┐                             │
│                        │  Makeswift   │                             │
│                        │  (Visual)    │                             │
│                        └──────┬───────┘                             │
│                               │                                      │
│                    Visual Component Editing                          │
│                               │                                      │
│                        ┌──────▼───────┐                             │
│                        │   Next.js    │                             │
│                        │  Storefront  │                             │
│                        └──────┬───────┘                             │
│                               │                                      │
│              ┌────────────────┼────────────────┐                    │
│              │                │                │                    │
│              ▼                ▼                ▼                    │
│       ┌──────────┐    ┌──────────────┐  ┌──────────────┐           │
│       │WordPress │    │ BigCommerce  │  │ Feedonomics  │           │
│       │ GraphQL  │    │  GraphQL     │  │   Feeds      │           │
│       └──────────┘    └──────────────┘  └──────────────┘           │
│                                                                      │
│       Content &        Commerce &        Channel &                  │
│       Blog Data        Catalog Data      Marketplace                │
│                                          Syndication                 │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Current Integration Gaps (To Be Validated)

| Gap | Impact | Mitigation |
|-----|--------|------------|
| Unified identity across products | Customer experience fragmentation | SSO investigation |
| Consistent data models | Integration complexity | Schema alignment project |
| Shared component library | Duplicate development effort | Design system initiative |
| Cross-product analytics | Siloed insights | Data warehouse strategy |

---

## Appendix B: Competitive Context

### Shopify's Position

**Strengths:**
- Hydrogen/Oxygen headless stack (mature)
- Unified platform (no integration seams)
- App ecosystem scale (8,000+ apps)
- Brand recognition and default consideration

**Vulnerabilities:**
- "Replace everything" positioning alienates WordPress shops
- Oxygen hosting lock-in concerns
- Enterprise pricing complexity
- Less flexible for true composable architectures

### Commerce.com Differentiation Opportunity

| Dimension | Shopify | Commerce.com |
|-----------|---------|--------------|
| WordPress compatibility | Replace | Preserve |
| Hosting flexibility | Oxygen-centric | Any provider |
| Feed management | Third-party apps | Native (Feedonomics) |
| Visual editing | Shopify Editor | Makeswift (more flexible) |
| B2B capabilities | Limited | Strong (B2B Edition) |

### WooCommerce Migration Landscape

| Competitor | Approach | Weakness |
|------------|----------|----------|
| Shopify | Complete replatform | WordPress content loss |
| Adobe Commerce | Enterprise complexity | Cost, implementation time |
| Salesforce Commerce | Enterprise sales motion | Overkill for mid-market |
| **Commerce.com** | WordPress preservation | *Execution risk* |

---

## Appendix C: Risk Register

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Makeswift + non-Catalyst integration complexity | Medium | High | Spike in Week 2, fallback to custom Next.js |
| WooCommerce plugin diversity breaks automation | High | Medium | Focus on 80/20 plugins, manual path for edge cases |
| SEO redirect volume causes ranking drops | Medium | High | Staged rollout, monitoring, rollback plan |
| GraphQL API performance at scale | Low | High | Load testing in Phase 2 |

### Operational Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Pilot customer delays/disengages | Medium | High | Over-communicate, executive sponsor at customer |
| Agency partners lack capacity | Medium | Medium | Parallel training, backup agency identification |
| Jordan Sim availability constraints | Medium | High | Document everything, cross-train early |

### Partnership Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| WPEngine partnership terms change | Low | High | Get written commitments early |
| WPEngine competitive move (own migration tool) | Low | Critical | Speed to market, deep integration |
| Customer acquisition depends too heavily on WPEngine | Medium | High | Build direct marketing channel in parallel |

### Strategic Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Automattic improves WooCommerce significantly | Medium | High | Differentiate on ease, not just capability |
| Catalyst decision reverses mid-flight | Low | Medium | Architecture should work with or without Catalyst |
| Phase 1 funding not approved | Medium | High | Strong Phase 0 outcomes, conservative projections |

---

## Appendix D: Key Questions for CPO Interview

### Role Definition

1. "What does success look like at 90 days - for you personally?"
2. "What decision authority does this role have on architecture choices?"
3. "How do you see this role interacting with the three engineering orgs (BigCommerce, Feedonomics, Makeswift)?"
4. "Who are the other stakeholders I need to align with?"

### Strategic Context

5. "What's the real reason Catalyst is out? Technical? Political? Resource?"
6. "How committed is leadership to the WPEngine partnership?"
7. "What happens if Phase 0 doesn't meet targets?"

### Technical Reality

8. "What's the current state of BigCommerce + Feedonomics + Makeswift integration?"
9. "Where are the biggest technical debts or integration gaps today?"
10. "What's the developer experience vision post-Catalyst?"

### Team & Resources

11. "If Phase 0 succeeds, what's the hiring plan for Phase 1?"
12. "What's Jordan Sim's current scope and bandwidth?"
13. "How do I work with the Feedonomics and Makeswift engineering teams?"

---

*Document Version: 1.0*
*Last Updated: December 2025*
*Next Review: Day 30 Checkpoint*
