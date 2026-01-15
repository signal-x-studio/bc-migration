# BigCommerce Integration Debt Diagnostic Framework

**Purpose:** Systematic assessment of integration debt across BigCommerce's acquired product portfolio (Core, Makeswift, Feedonomics) to inform architectural unification strategy.

**Owner:** Nino Chavez, Product Architect
**Timeline:** Post-April Summit (Months 4-9)

---

## Executive Summary

BigCommerce has grown through acquisition, creating three distinct products that serve different parts of the merchant journey:

| Product | Acquired | Primary Function | Target Segment |
|---------|----------|------------------|----------------|
| **BigCommerce Core** | Original | Commerce platform, checkout, catalog | All segments |
| **Makeswift** | 2022 | Visual page builder, storefront design | Mid-market, Enterprise |
| **Feedonomics** | 2021 | Product feed management, marketplace sync | Enterprise, multi-channel |

**The Problem:** These products were built independently and integrated post-acquisition. The depth of integration varies, creating friction for merchants, sales, and engineering.

**The Opportunity:** A unified architecture enables AI-native capabilities, reduces operational complexity, and strengthens the Enterprise value proposition.

---

## Diagnostic Dimensions

This framework assesses integration debt across seven dimensions:

```
┌─────────────────────────────────────────────────────────────────┐
│                    INTEGRATION DIMENSIONS                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. IDENTITY & ACCESS ──────► Single sign-on, permissions       │
│                                                                  │
│  2. DATA & SCHEMA ──────────► Data models, synchronization      │
│                                                                  │
│  3. API & CONTRACTS ────────► API consistency, versioning       │
│                                                                  │
│  4. INFRASTRUCTURE ─────────► Deployment, observability         │
│                                                                  │
│  5. USER EXPERIENCE ────────► Navigation, workflows             │
│                                                                  │
│  6. BILLING & LICENSING ────► Packaging, metering               │
│                                                                  │
│  7. ORGANIZATIONAL ─────────► Team structure, ownership         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Dimension 1: Identity & Access Management

### Questions to Answer

| Question | Why It Matters |
|----------|----------------|
| Is there a single identity provider across all products? | Merchants shouldn't need multiple logins |
| How are permissions managed? | Role-based access should span products |
| Can a merchant user access all products seamlessly? | Friction = churn risk |
| How is API authentication handled? | Developers need consistent auth patterns |
| Are there separate user databases? | Data duplication = inconsistency risk |

### Assessment Criteria

| Level | Description | Indicator |
|-------|-------------|-----------|
| **1 - Siloed** | Completely separate identity systems | Different login URLs, no SSO |
| **2 - Federated** | SSO exists but permissions are separate | Single login, separate permission models |
| **3 - Unified** | Single identity with cross-product permissions | One login, one permission model |
| **4 - Native** | Identity is invisible; products feel like one | No concept of "switching" products |

### Data Collection

```markdown
## Identity & Access Assessment

### BigCommerce Core
- Identity Provider: _______________
- Auth Mechanism: _______________
- User Database: _______________
- Permission Model: _______________

### Makeswift
- Identity Provider: _______________
- Auth Mechanism: _______________
- User Database: _______________
- Permission Model: _______________
- SSO with Core: [ ] Yes [ ] No [ ] Partial

### Feedonomics
- Identity Provider: _______________
- Auth Mechanism: _______________
- User Database: _______________
- Permission Model: _______________
- SSO with Core: [ ] Yes [ ] No [ ] Partial

### Current State Score: ___ / 4
### Target State Score: ___ / 4
### Gap Analysis: _______________
```

---

## Dimension 2: Data & Schema

### Questions to Answer

| Question | Why It Matters |
|----------|----------------|
| Is there a canonical data model for core entities (products, orders, customers)? | Inconsistent models = integration bugs |
| How is data synchronized between products? | Real-time vs. batch affects UX |
| Are there data duplication issues? | Duplication = inconsistency risk |
| What happens when data changes in one product? | Event propagation matters |
| Are there schema versioning strategies? | Breaking changes affect all products |

### Core Entities to Assess

| Entity | BC Core | Makeswift | Feedonomics | Sync Mechanism |
|--------|---------|-----------|-------------|----------------|
| Product | ✓ | ? | ✓ | ? |
| Category | ✓ | ? | ✓ | ? |
| Customer | ✓ | ? | ? | ? |
| Order | ✓ | ? | ✓ | ? |
| Inventory | ✓ | ? | ✓ | ? |
| Content/Pages | ✓ | ✓ | — | ? |
| Media/Assets | ✓ | ✓ | ✓ | ? |

### Assessment Criteria

| Level | Description | Indicator |
|-------|-------------|-----------|
| **1 - Siloed** | Separate data models, manual sync | CSV exports, manual reconciliation |
| **2 - Replicated** | Data copied between systems | Batch sync jobs, eventual consistency |
| **3 - Federated** | Single source of truth, APIs for access | Real-time APIs, clear ownership |
| **4 - Unified** | Single data layer, all products read/write | Shared database or event-driven |

### Data Collection

```markdown
## Data & Schema Assessment

### Product Entity
- BC Core Schema: _______________
- Makeswift Schema: _______________
- Feedonomics Schema: _______________
- Sync Mechanism: _______________
- Sync Frequency: _______________
- Known Issues: _______________

### [Repeat for each entity]

### Current State Score: ___ / 4
### Target State Score: ___ / 4
### Gap Analysis: _______________
```

---

## Dimension 3: API & Contracts

### Questions to Answer

| Question | Why It Matters |
|----------|----------------|
| Are APIs consistent in style (REST, GraphQL, naming)? | Developer experience |
| Is there a unified API gateway? | Single entry point reduces complexity |
| How is API versioning handled? | Breaking changes affect integrations |
| Are there internal APIs between products? | Internal contracts matter |
| Is there API documentation consistency? | Developer onboarding |

### Assessment Criteria

| Level | Description | Indicator |
|-------|-------------|-----------|
| **1 - Siloed** | Completely separate APIs, no consistency | Different domains, auth, styles |
| **2 - Documented** | Separate but documented APIs | Docs exist but no consistency |
| **3 - Consistent** | Shared patterns, conventions | Same auth, naming, error handling |
| **4 - Unified** | Single API surface, composable | One API with product-specific endpoints |

### Data Collection

```markdown
## API & Contracts Assessment

### API Inventory
| Product | API Style | Base URL | Auth | Versioning | Docs |
|---------|-----------|----------|------|------------|------|
| BC Core | | | | | |
| Makeswift | | | | | |
| Feedonomics | | | | | |

### Cross-Product APIs
- BC Core → Makeswift: _______________
- BC Core → Feedonomics: _______________
- Makeswift → Feedonomics: _______________

### Current State Score: ___ / 4
### Target State Score: ___ / 4
### Gap Analysis: _______________
```

---

## Dimension 4: Infrastructure

### Questions to Answer

| Question | Why It Matters |
|----------|----------------|
| Are products deployed on the same infrastructure? | Operational complexity |
| Is there shared observability (logging, metrics, tracing)? | Debugging cross-product issues |
| Are there shared services (CDN, caching, queues)? | Cost efficiency |
| How are deployments coordinated? | Cross-product dependencies |
| Is there a shared CI/CD pipeline? | Development velocity |

### Assessment Criteria

| Level | Description | Indicator |
|-------|-------------|-----------|
| **1 - Siloed** | Completely separate infrastructure | Different clouds, no shared services |
| **2 - Colocated** | Same cloud, separate accounts/clusters | Shared cloud, separate everything else |
| **3 - Shared** | Common services, some shared infra | Shared CDN, logging, some services |
| **4 - Unified** | Single platform, shared everything | One deployment platform, full observability |

### Data Collection

```markdown
## Infrastructure Assessment

### Deployment
| Product | Cloud | Region(s) | Orchestration | CI/CD |
|---------|-------|-----------|---------------|-------|
| BC Core | | | | |
| Makeswift | | | | |
| Feedonomics | | | | |

### Shared Services
- CDN: [ ] Shared [ ] Separate
- Caching: [ ] Shared [ ] Separate
- Message Queue: [ ] Shared [ ] Separate
- Search: [ ] Shared [ ] Separate
- Logging: [ ] Shared [ ] Separate
- Metrics: [ ] Shared [ ] Separate
- Tracing: [ ] Shared [ ] Separate

### Current State Score: ___ / 4
### Target State Score: ___ / 4
### Gap Analysis: _______________
```

---

## Dimension 5: User Experience

### Questions to Answer

| Question | Why It Matters |
|----------|----------------|
| Is there a unified navigation across products? | Merchant confusion |
| Are design systems consistent? | Brand coherence |
| How do merchants move between products? | Workflow friction |
| Are notifications unified? | Alert fatigue |
| Is there a single dashboard/home? | Merchant orientation |

### Assessment Criteria

| Level | Description | Indicator |
|-------|-------------|-----------|
| **1 - Siloed** | Completely separate UIs | Different URLs, designs, navigation |
| **2 - Linked** | Links between products | "Go to Makeswift" buttons |
| **3 - Embedded** | Products embedded in each other | iframes, modals |
| **4 - Unified** | Single cohesive experience | One app with product "features" |

### Data Collection

```markdown
## User Experience Assessment

### Navigation
- BC Core URL: _______________
- Makeswift URL: _______________
- Feedonomics URL: _______________
- Cross-product navigation: _______________

### Design System
- BC Core: _______________
- Makeswift: _______________
- Feedonomics: _______________
- Shared components: [ ] Yes [ ] No [ ] Partial

### Merchant Workflows (document friction points)
1. _______________
2. _______________
3. _______________

### Current State Score: ___ / 4
### Target State Score: ___ / 4
### Gap Analysis: _______________
```

---

## Dimension 6: Billing & Licensing

### Questions to Answer

| Question | Why It Matters |
|----------|----------------|
| Is there unified billing? | Merchant billing complexity |
| How are products packaged? | Sales complexity |
| Are there cross-product bundles? | Pricing strategy |
| How is usage metered? | Cost visibility |
| Are there licensing dependencies? | Upgrade paths |

### Assessment Criteria

| Level | Description | Indicator |
|-------|-------------|-----------|
| **1 - Siloed** | Separate billing systems | Multiple invoices |
| **2 - Consolidated** | Separate systems, one invoice | Single bill, visible line items |
| **3 - Bundled** | Product bundles, unified pricing | Package deals |
| **4 - Unified** | Single subscription, feature-based | One plan with feature toggles |

### Data Collection

```markdown
## Billing & Licensing Assessment

### Billing Systems
- BC Core: _______________
- Makeswift: _______________
- Feedonomics: _______________

### Packaging
- Standalone products: [ ] Yes [ ] No
- Bundles available: [ ] Yes [ ] No
- Cross-sell motions: _______________

### Current State Score: ___ / 4
### Target State Score: ___ / 4
### Gap Analysis: _______________
```

---

## Dimension 7: Organizational

### Questions to Answer

| Question | Why It Matters |
|----------|----------------|
| Are there separate P&Ls? | Incentive alignment |
| Who owns cross-product decisions? | Decision velocity |
| Are teams integrated or autonomous? | Collaboration patterns |
| Is there shared engineering culture? | Technical consistency |
| Are roadmaps coordinated? | Strategic alignment |

### Assessment Criteria

| Level | Description | Indicator |
|-------|-------------|-----------|
| **1 - Autonomous** | Separate business units | Separate P&L, leadership, roadmaps |
| **2 - Coordinated** | Regular alignment, separate execution | Joint planning sessions |
| **3 - Integrated** | Shared goals, some shared teams | Cross-functional projects |
| **4 - Unified** | One team, one roadmap | Product is a feature, not a unit |

### Data Collection

```markdown
## Organizational Assessment

### Structure
- BC Core reporting: _______________
- Makeswift reporting: _______________
- Feedonomics reporting: _______________

### Decision Making
- Cross-product decisions: _______________
- Escalation path: _______________
- Roadmap coordination: _______________

### Current State Score: ___ / 4
### Target State Score: ___ / 4
### Gap Analysis: _______________
```

---

## Assessment Summary Template

```markdown
# Integration Debt Assessment Summary

**Date:** _______________
**Assessor:** _______________
**Products Assessed:** BC Core, Makeswift, Feedonomics

## Scores

| Dimension | Current | Target | Gap |
|-----------|---------|--------|-----|
| Identity & Access | /4 | /4 | |
| Data & Schema | /4 | /4 | |
| API & Contracts | /4 | /4 | |
| Infrastructure | /4 | /4 | |
| User Experience | /4 | /4 | |
| Billing & Licensing | /4 | /4 | |
| Organizational | /4 | /4 | |
| **TOTAL** | /28 | /28 | |

## Integration Debt Score

- **0-7:** Critical — Products are functionally separate
- **8-14:** High — Some integration, significant friction
- **15-21:** Moderate — Workable, but inefficient
- **22-28:** Low — Well-integrated, minor improvements needed

## Top 3 Gaps (by business impact)

1. _______________
2. _______________
3. _______________

## Recommendations

### Quick Wins (< 1 quarter)
1. _______________
2. _______________

### Strategic Initiatives (1-4 quarters)
1. _______________
2. _______________

### Foundational Changes (4+ quarters)
1. _______________
2. _______________
```

---

## Data Collection Process

### Phase 1: Document Review (Week 1)

1. Gather existing architecture documentation for each product
2. Review API documentation
3. Review onboarding flows for each product
4. Review billing/packaging documentation

### Phase 2: Stakeholder Interviews (Weeks 2-3)

| Stakeholder | Focus Areas |
|-------------|-------------|
| BC Core Engineering Lead | Infrastructure, APIs, data model |
| Makeswift Engineering Lead | Integration points, tech stack, roadmap |
| Feedonomics Engineering Lead | Integration points, data sync, APIs |
| DevOps/Platform Team | Infrastructure, observability, deployment |
| Product Marketing | Packaging, positioning, merchant feedback |
| Sales Engineering | Integration friction, customer complaints |
| Support Lead | Common cross-product issues |
| Finance | Billing systems, P&L structure |

### Interview Template

```markdown
## Integration Debt Interview

**Interviewee:** _______________
**Role:** _______________
**Date:** _______________

### Context
1. How long have you been working with [product]?
2. What's your interaction with the other products?

### Integration Points
3. What are the main integration points between your product and others?
4. What's the current state of those integrations?
5. What are the biggest pain points?

### Data & APIs
6. How does data flow between products?
7. What APIs do you expose/consume?
8. Are there consistency issues?

### Organizational
9. How do you coordinate with other product teams?
10. What decisions require cross-team alignment?
11. What would make your job easier?

### Wishlist
12. If you could change one thing about cross-product integration, what would it be?
```

### Phase 3: Technical Deep-Dive (Weeks 3-4)

1. Trace a product entity (e.g., Product) across all three systems
2. Map API calls for common merchant workflows
3. Review infrastructure topology
4. Analyze authentication/authorization flows

### Phase 4: Synthesis & Recommendations (Week 5)

1. Complete assessment summary
2. Prioritize gaps by business impact
3. Draft recommendations
4. Present to CPO

---

## Output: Unification Roadmap

The diagnostic produces a **Unification Roadmap** with:

1. **Current State Architecture Diagram**
2. **Target State Architecture Diagram**
3. **Gap Analysis by Dimension**
4. **Prioritized Initiative List**
5. **Dependency Map**
6. **Resource Estimates**
7. **Risk Assessment**

---

## Connection to AI-Native Strategy

Integration debt directly impacts AI-native capabilities:

| AI Capability | Blocked By |
|---------------|------------|
| Unified product recommendations | Siloed data |
| Cross-product personalization | Separate identity |
| AI-assisted store setup | Disconnected onboarding |
| Intelligent feed optimization | Feedonomics isolation |
| Visual content generation | Makeswift API limitations |

**The diagnostic reveals which integration gaps must be addressed before AI-native capabilities can be built.**

---

*Last Updated: January 2026*
*Owner: Nino Chavez, Product Architect*
