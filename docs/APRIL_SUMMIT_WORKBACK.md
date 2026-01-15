# BC-Migration: April Summit Workback Plan

**Target Date:** April 2026 (BigCommerce Summit)
**Objective:** Announcement-ready WooCommerce → BigCommerce migration capability in partnership with WPEngine
**Owner:** Nino Chavez, Product Architect

---

## Success Criteria for "Announceable"

The April announcement requires more than working code. It requires:

| Criteria | Definition | Status |
|----------|------------|--------|
| **Technical Readiness** | End-to-end migration flow works reliably | ✅ Core complete (87 tests) |
| **Integration Readiness** | Connects to BigCommerce provisioning/onboarding | 🔴 Not started |
| **Partner Alignment** | WPEngine co-marketing narrative locked | 🔴 Not started |
| **Customer Proof Point** | At least 1 merchant successfully migrated | 🔴 Not started |
| **Demo Quality** | Polished demo for keynote/breakout session | 🔴 Not started |
| **Sales Enablement** | Sales team can speak to the offering | 🔴 Not started |
| **Support Readiness** | Support team trained on migration issues | 🔴 Not started |

---

## Critical Path Dependencies

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        CRITICAL PATH                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  [WPEngine Alignment] ──────────────────────────────────────────────┐   │
│         │                                                            │   │
│         ▼                                                            │   │
│  [Joint Narrative] ───► [Marketing Assets] ───► [Announcement]      │   │
│         │                       │                                    │   │
│         │                       ▼                                    │   │
│         │              [Sales Enablement]                            │   │
│         │                                                            │   │
│  [BC Integration] ──► [Beta Merchant] ──► [Demo Polish] ────────────┘   │
│         │                    │                                          │
│         ▼                    ▼                                          │
│  [Support Training]   [Case Study]                                      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Parallel Workstreams:**
1. Technical Integration (you + Engineering cohorts)
2. Partner Alignment (you + Partnerships)
3. GTM Preparation (Marketing + Sales + Support)

---

## Week-by-Week Plan

### Phase 1: Foundation (Weeks 1-4) — January 2026

#### Week 1 (Jan 6-10): Stakeholder Alignment

| Day | Activity | Owner | Output |
|-----|----------|-------|--------|
| Mon | Kickoff with CPO — confirm scope, resources, risks | Nino | Alignment doc |
| Tue | Meet WPEngine partnership lead — intro, understand their timeline | Nino + Partnerships | Contact established |
| Wed | Identify Engineering cohort — who owns provisioning/onboarding APIs? | Nino | Engineering contact |
| Thu | Identify Marketing cohort — who owns Summit content? | Nino | Marketing contact |
| Fri | Draft initiative brief for cross-functional alignment | Nino | 1-pager circulated |

**Week 1 Deliverable:** Cross-functional team identified, initiative brief circulated

#### Week 2 (Jan 13-17): Technical Discovery

| Day | Activity | Owner | Output |
|-----|----------|-------|--------|
| Mon | Deep-dive on BigCommerce store provisioning API | Nino + Eng | API documentation |
| Tue | Map bc-migration outputs → BC onboarding inputs | Nino | Integration spec draft |
| Wed | Identify gaps in current bc-migration for BC integration | Nino | Gap analysis |
| Thu | WPEngine technical call — understand their migration triggers | Nino + WPE | Technical requirements |
| Fri | Draft integration architecture | Nino | Architecture doc |

**Week 2 Deliverable:** Integration architecture document, gap analysis

#### Week 3 (Jan 20-24): Partner Narrative Development

| Day | Activity | Owner | Output |
|-----|----------|-------|--------|
| Mon | WPEngine partnership strategy session | Nino + Partnerships | Joint value prop draft |
| Tue | Competitive positioning — why BC over Shopify for WC refugees? | Nino + Product Marketing | Positioning doc |
| Wed | Draft joint announcement narrative | Nino + Marketing | Narrative v1 |
| Thu | WPEngine review of narrative | Partnerships | Feedback incorporated |
| Fri | Finalize narrative for internal review | Nino | Narrative v2 |

**Week 3 Deliverable:** Joint narrative document (v2)

#### Week 4 (Jan 27-31): Integration Development Kickoff

| Day | Activity | Owner | Output |
|-----|----------|-------|--------|
| Mon | Begin BC provisioning API integration | Nino | Code started |
| Tue | Continue integration development | Nino | — |
| Wed | Sync with Engineering on blockers | Nino + Eng | Blockers identified |
| Thu | WPEngine technical sync — migration trigger mechanism | Nino + WPE | Trigger spec |
| Fri | Phase 1 retrospective + Phase 2 planning | All | Retro notes |

**Week 4 Deliverable:** Integration development in progress, WPEngine trigger spec

---

### Phase 2: Integration & Beta (Weeks 5-8) — February 2026

#### Week 5 (Feb 3-7): Core Integration

| Day | Activity | Owner | Output |
|-----|----------|-------|--------|
| Mon | Complete BC provisioning integration | Nino | Integration complete |
| Tue | Begin BC onboarding flow integration | Nino | Code started |
| Wed | Internal end-to-end test | Nino | Test results |
| Thu | Fix critical issues from testing | Nino | Issues resolved |
| Fri | Demo to CPO — checkpoint | Nino | CPO feedback |

**Week 5 Deliverable:** Working integration (internal testing)

#### Week 6 (Feb 10-14): Beta Merchant Recruitment

| Day | Activity | Owner | Output |
|-----|----------|-------|--------|
| Mon | Identify beta merchant candidates (via WPEngine or BC sales) | Nino + Sales | Candidate list |
| Tue | Outreach to top 3 candidates | Sales | Conversations started |
| Wed | Beta merchant selected | Nino + Sales | Beta commitment |
| Thu | Beta merchant kickoff call | Nino | Expectations set |
| Fri | Prepare beta environment | Nino | Environment ready |

**Week 6 Deliverable:** Beta merchant committed, environment ready

#### Week 7 (Feb 17-21): Beta Migration Execution

| Day | Activity | Owner | Output |
|-----|----------|-------|--------|
| Mon | Run assessment on beta merchant's WC store | Nino | Assessment report |
| Tue | Execute migration (with merchant on call) | Nino | Migration complete |
| Wed | Merchant validation of migrated data | Beta merchant | Validation feedback |
| Thu | Fix any data issues | Nino | Issues resolved |
| Fri | Merchant sign-off | Beta merchant | Sign-off received |

**Week 7 Deliverable:** Successful beta migration with merchant sign-off

#### Week 8 (Feb 24-28): Beta Learnings & Case Study

| Day | Activity | Owner | Output |
|-----|----------|-------|--------|
| Mon | Document beta learnings | Nino | Learnings doc |
| Tue | Incorporate fixes into bc-migration | Nino | Code updated |
| Wed | Case study interview with beta merchant | Marketing | Interview recorded |
| Thu | Draft case study | Marketing | Case study v1 |
| Fri | Phase 2 retrospective | All | Retro notes |

**Week 8 Deliverable:** Beta learnings incorporated, case study drafted

---

### Phase 3: Polish & Enablement (Weeks 9-12) — March 2026

#### Week 9 (Mar 2-6): Demo Development

| Day | Activity | Owner | Output |
|-----|----------|-------|--------|
| Mon | Define demo script — what story are we telling? | Nino + Marketing | Demo script v1 |
| Tue | Build demo environment (sanitized merchant data) | Nino | Demo env ready |
| Wed | Record demo walkthrough (internal) | Nino | Demo video v1 |
| Thu | Feedback from CPO + Marketing | CPO, Marketing | Feedback |
| Fri | Iterate on demo | Nino | Demo video v2 |

**Week 9 Deliverable:** Demo video v2 ready for review

#### Week 10 (Mar 9-13): Sales & Support Enablement

| Day | Activity | Owner | Output |
|-----|----------|-------|--------|
| Mon | Sales enablement session — product overview | Nino + Sales | Session complete |
| Tue | Create sales battlecard | Nino + Product Marketing | Battlecard v1 |
| Wed | Support training session — common issues, escalation path | Nino + Support | Session complete |
| Thu | Create support runbook | Nino | Runbook v1 |
| Fri | Q&A office hours for Sales + Support | Nino | Questions answered |

**Week 10 Deliverable:** Sales battlecard, support runbook

#### Week 11 (Mar 16-20): Final Polish

| Day | Activity | Owner | Output |
|-----|----------|-------|--------|
| Mon | Final demo polish | Nino | Demo final |
| Tue | Marketing asset review (landing page, blog post) | Marketing | Assets reviewed |
| Wed | Legal review of partnership announcement | Legal | Legal sign-off |
| Thu | Executive dry run (Travis, Dan, CPO) | Nino | Exec feedback |
| Fri | Incorporate exec feedback | Nino | Final adjustments |

**Week 11 Deliverable:** Executive sign-off on announcement

#### Week 12 (Mar 23-27): Pre-Summit Prep

| Day | Activity | Owner | Output |
|-----|----------|-------|--------|
| Mon | Final WPEngine alignment call | Nino + Partnerships | Partner aligned |
| Tue | Presentation deck finalized | Nino + Marketing | Deck final |
| Wed | Rehearsal for Summit session | Nino | Rehearsal complete |
| Thu | Contingency planning — what if demo fails? | Nino | Backup plan |
| Fri | Final go/no-go decision | CPO | Go decision |

**Week 12 Deliverable:** Summit-ready

---

### Phase 4: Summit Week (Week 13) — Late March/Early April

| Day | Activity | Owner | Output |
|-----|----------|-------|--------|
| Pre-Summit | Travel, setup, final prep | Nino | On-site |
| Day 1 | Attend keynote, network with WPEngine team | Nino | Relationships |
| Day 2 | **Announcement** — keynote mention or breakout session | Nino | Announced |
| Day 2 | Partner booth presence (if applicable) | Nino + WPE | Visibility |
| Day 3 | Follow-up conversations, collect feedback | Nino | Feedback |
| Post-Summit | Debrief with CPO | Nino | Learnings |

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| WPEngine partnership delays | Medium | High | Early alignment (Week 1), escalation path to execs |
| No beta merchant available | Medium | High | Start recruitment Week 5, have backup candidates |
| BC integration APIs not ready | Low | High | Identify API owners Week 2, escalate blockers early |
| Demo fails at Summit | Low | High | Pre-recorded backup, tested offline demo |
| Legal blocks partnership announcement | Low | Medium | Engage legal Week 10, no surprises |
| Engineering cohort pulled to other priorities | Medium | Medium | CPO air cover, documented commitments |

---

## Resource Requirements

| Resource | Need | Status |
|----------|------|--------|
| Engineering cohort (BC provisioning) | 10-20 hours over 12 weeks | 🔴 To be identified |
| Partnerships lead (WPEngine) | Ongoing coordination | 🔴 To be identified |
| Marketing lead (Summit content) | Weeks 3, 8-12 | 🔴 To be identified |
| Sales lead (beta recruitment, enablement) | Weeks 6, 10 | 🔴 To be identified |
| Support lead (training) | Week 10 | 🔴 To be identified |
| Legal (partnership review) | Week 11 | 🔴 To be identified |
| Beta merchant | Weeks 6-8 | 🔴 To be recruited |

---

## Communication Cadence

| Meeting | Frequency | Attendees | Purpose |
|---------|-----------|-----------|---------|
| CPO 1:1 | Weekly | Nino, CPO | Status, blockers, decisions |
| Cross-functional sync | Bi-weekly | All cohorts | Coordination |
| WPEngine sync | Bi-weekly | Nino, WPE lead | Partner alignment |
| Executive update | Monthly | Nino, Travis, Dan, CPO | Strategic alignment |

---

## Decision Log

| Date | Decision | Rationale | Decided By |
|------|----------|-----------|------------|
| TBD | Beta merchant selection | — | Nino + Sales |
| TBD | Demo format (live vs. recorded) | — | Nino + Marketing |
| TBD | Announcement placement (keynote vs. breakout) | — | CPO + Marketing |

---

## Appendix: bc-migration Current State

**Completed (from MIGRATION_HARDENING_PLAN.md):**
- ✅ Infrastructure setup (vitest, bottleneck, pino, zod)
- ✅ Type safety (WC/BC/migration types)
- ✅ Rate limiting & retry logic
- ✅ Batch operations (max 10 items per request)
- ✅ Error handling & structured logging
- ✅ Product variants (600 limit per product)
- ✅ Idempotency (skip existing items)
- ✅ Validation command (data comparison)
- ✅ Schema validation (Zod)
- ✅ Testing (87 tests across 5 files)

**Remaining for Summit:**
- 🔴 BigCommerce provisioning API integration
- 🔴 BigCommerce onboarding flow integration
- 🔴 WPEngine trigger mechanism
- 🔴 Demo polish
- 🔴 Documentation for Sales/Support

---

*Last Updated: January 2026*
*Next Review: Weekly with CPO*
