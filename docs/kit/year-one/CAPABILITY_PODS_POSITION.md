# Position Paper: Why NOT Capability Pods (Yet)

**Purpose:** Counter-argument to the Capability Pods reorganization approach, explaining why we're deferring org structure changes to Year Two.

**Date:** January 2026

**Author:** Nino Chavez, Product Architect

**Classification:** Internal - Leadership Only

---

## Executive Summary

The Capability Pods model—reorganizing BigCommerce into cross-functional pods aligned to customer capabilities rather than products—has theoretical appeal. However, implementing it now would be premature and risky.

**Our Position:** Defer organizational restructuring until we have:
1. Evidence from the Q2 Integration Diagnostic about where coordination actually breaks down
2. Demonstrated success with coordination mechanisms that don't require reorg
3. Political capital from delivering tangible wins (bc-migration, integration improvements)

**The Risk We're Avoiding:** "Toxic Autonomy" - where pods optimize locally while the platform fragments further.

---

## The Capability Pods Concept

### What It Proposes

```
Current State                    Proposed State
─────────────────                ─────────────────
BC Core Team          →          Catalog Pod
Makeswift Team        →          Storefront Pod
Feedonomics Team      →          Channel Pod
                                 Checkout Pod
                                 Merchant Admin Pod
```

### The Appeal

1. **Customer-Centric:** Pods align to what merchants care about, not internal product boundaries
2. **End-to-End Ownership:** Each pod owns the full stack for their capability
3. **Reduced Handoffs:** Fewer cross-team dependencies for customer-facing features
4. **Clear Accountability:** One pod, one capability, one P&L

### Why It Looks Good on Paper

The current structure creates friction:
- A "unified checkout" feature requires coordination across 3 teams
- A "product sync" improvement needs Feedonomics and Core to align
- No one owns the merchant experience across products

Pods would theoretically solve this by making each capability self-contained.

---

## Why It Would Fail Right Now

### 1. Toxic Autonomy Risk

**The Pattern:** When you give pods full autonomy before establishing shared standards, they optimize locally.

**What Would Happen:**
- Catalog Pod builds their own auth system (faster for them)
- Storefront Pod creates their own data model (cleaner for them)
- Channel Pod develops their own API patterns (makes sense for them)

**Result:** You've recreated integration debt at the org level. Instead of 3 products that don't integrate well, you have 5 pods that don't integrate well.

**Historical Examples:**
- Spotify's "squad model" required years of platform investment before pods could be truly autonomous
- Amazon's two-pizza teams work because of massive shared infrastructure investment
- We have neither the platform maturity nor the shared infrastructure

### 2. We Don't Know Where Coordination Breaks

**The Problem:** We're proposing a solution without diagnosing the problem.

**What We Don't Know Yet:**
- Which integration points cause the most friction?
- Is the problem technical (APIs, data sync) or organizational (incentives, priorities)?
- Which teams would need to be combined vs. just better coordinated?
- Where does the current structure actually work well?

**The Q2 Diagnostic Will Tell Us:**
- 7-dimension scoring across all products
- Specific pain points with evidence
- Where coordination mechanisms would suffice
- Where structural change is actually needed

**Premature Restructuring Risk:** We might create a Storefront Pod when the real problem is that Makeswift and Core have incompatible data models—something a reorg won't fix.

### 3. Political Capital We Don't Have

**Reality Check:** I'm a new Product Architect. Proposing org restructure in Month 1 would:
- Signal that I think I know better than people who've been here for years
- Create anxiety across all teams about their futures
- Consume leadership attention on org design instead of execution
- Make enemies before I've made allies

**Better Approach:**
- Deliver wins first (bc-migration)
- Build relationships through diagnostic interviews
- Let evidence drive structural recommendations
- Propose changes from a position of credibility

### 4. The Transition Cost

**What Reorg Requires:**
- New reporting structures
- New team compositions
- New rituals and processes
- New incentive alignment
- New tooling and access patterns

**Estimated Disruption:** 2-3 months of reduced velocity during transition

**What We'd Be Sacrificing:**
- Q1: bc-migration momentum
- Q2: Integration diagnostic quality
- Q3: Semantic layer POC timeline

**The Math Doesn't Work:** A reorg that might help in 6 months vs. concrete deliverables in Q1-Q2.

---

## What We're Doing Instead

### Phase 1: Coordination Mechanisms (Q1-Q2)

**Goal:** Solve coordination problems without restructuring.

| Mechanism | Purpose | Owner |
|-----------|---------|-------|
| Cross-Product Roadmap Review | Monthly visibility into all product plans | Product Architect |
| Integration Standup | Weekly sync on cross-product dependencies | Rotating |
| Shared Architecture Principles | Documented standards for new work | Product Architect |
| Integration Debt Backlog | Prioritized list of friction points | Product Architect |

**Success Criteria:**
- Teams can ship cross-product features without escalation
- Dependencies are visible 2+ sprints in advance
- Integration debt is tracked and prioritized

### Phase 2: Evidence-Based Assessment (Q2)

**Goal:** Determine if coordination mechanisms are sufficient or if structural change is needed.

**Inputs:**
- Q2 Integration Diagnostic results
- Coordination mechanism effectiveness
- Stakeholder feedback from interviews
- Comparative analysis (how do similar companies structure?)

**Outputs:**
- Data on where coordination is working
- Data on where coordination is insufficient
- Specific recommendations for Year Two

### Phase 3: Targeted Proposals (Q4)

**Goal:** Propose structural changes only where evidence supports them.

**Possible Outcomes:**
1. **Coordination sufficient** - No reorg needed, double down on mechanisms
2. **Targeted changes** - Specific team mergers or splits based on evidence
3. **Full pod model** - Only if evidence strongly supports it

**Key Principle:** The burden of proof is on restructuring, not on the status quo.

---

## Counter-Arguments Addressed

### "But Amazon/Spotify/[Company] Uses Pods"

**Response:** They also have:
- Massive shared platform investment (we don't)
- Years of iteration on the model (we'd be starting fresh)
- Different scale and context (not directly comparable)

**What We Can Learn:** Build the platform first, then enable autonomy.

### "The Current Structure Is Clearly Broken"

**Response:** Is it? We don't actually know yet.

**What We See:** Integration friction between products.

**What We Don't Know:**
- Is it structural or just under-invested?
- Would a different structure fix it or just move the problem?
- What's working well that we'd disrupt?

**The Diagnostic Will Tell Us:** Let's get evidence before concluding the structure is the problem.

### "We're Losing to Competitors Who Move Faster"

**Response:** A reorg won't make us faster in the short term—it will make us slower.

**What Makes Companies Fast:**
- Clear priorities (we can do this without reorg)
- Reduced dependencies (we can invest in this without reorg)
- Technical excellence (independent of org structure)
- Strong coordination (what we're building in Q1-Q2)

**The Real Speed Problem:** Integration debt, not org structure.

### "People Are Frustrated with the Current State"

**Response:** Valid. But frustration doesn't mean reorg is the answer.

**What People Are Frustrated About:**
- Lack of visibility into other teams' work
- Dependencies that block their progress
- No clear owner for cross-product decisions
- Feeling like integration is no one's job

**What Would Fix This:**
- Coordination mechanisms (faster, lower risk)
- Clear ownership of integration (my role)
- Visible roadmaps and dependencies
- Investment in integration work

**A Reorg Might Not Fix This:** If the problem is underinvestment or unclear ownership, changing boxes on the org chart doesn't help.

---

## The Year Two Conversation

### What We'll Know by End of Year One

1. **Diagnostic Results:** Where integration actually breaks down
2. **Coordination Effectiveness:** What mechanisms solved vs. didn't
3. **Political Landscape:** Who supports integration, who resists
4. **Technical Blockers:** What structural issues (data, APIs) exist
5. **Quick Wins Delivered:** Credibility from bc-migration and improvements

### What We Might Propose

| Scenario | Evidence | Proposal |
|----------|----------|----------|
| Coordination works | Mechanisms solve friction | Formalize and expand |
| Specific pain points | 1-2 dimensions stuck | Targeted team changes |
| Systemic issues | Multiple dimensions stuck | Broader restructure |
| Platform gaps | Technical, not org problem | Platform investment |

### How We'll Propose It

- Grounded in Year One evidence
- Specific about what changes and why
- Clear on transition plan and costs
- Owned by stakeholders, not imposed

---

## Risks of This Approach

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Coordination mechanisms fail to improve things | Medium | Quarterly assessment, adjust as needed |
| Stakeholders push for reorg anyway | Low | CPO alignment, evidence-based framing |
| Competitors gain ground while we "study" | Low | We're still delivering (bc-migration, improvements) |
| Year Two proposal is still contentious | Medium | Build coalition throughout Year One |

---

## Key Messages for Stakeholders

### For Leadership

> "We're not saying Capability Pods are wrong—we're saying it's premature. Let's get evidence from the diagnostic, prove we can coordinate effectively, and then make an informed decision about structure in Year Two."

### For Product Leads

> "Your teams aren't changing in Year One. We're focused on making coordination easier, not reorganizing. If structural changes make sense later, you'll be part of designing them."

### For Engineering Leads

> "We're investing in integration, not disruption. The goal is to reduce friction, not create new reporting structures. Your feedback in the diagnostic will shape what we propose."

### For Individual Contributors

> "No org changes are planned for Year One. We're improving how teams work together, not shuffling people around."

---

## Conclusion

The Capability Pods model is seductive because it promises to solve coordination problems through structure. But structure follows strategy, and we don't yet have enough information to know what structure would actually help.

**Our Year One Focus:**
1. Deliver concrete wins (bc-migration)
2. Build coordination mechanisms
3. Gather evidence through diagnostic
4. Earn the right to propose structural changes

**Year Two is for structural proposals. Year One is for understanding and credibility.**

---

*This document is confidential. Not for distribution beyond Product Architecture and executive leadership.*

*Last Updated: January 2026*
