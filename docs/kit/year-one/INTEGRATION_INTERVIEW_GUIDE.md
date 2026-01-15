# Integration Debt Interview Guide

**Purpose:** Structured protocol for stakeholder interviews during the Q2 Integration Diagnostic.

**Timeline:** Post-Summit (April - June 2026)

**Goal:** Gather consistent, comparable data across all stakeholders to populate the 7-dimension diagnostic framework.

---

## Interview Logistics

### Before Each Interview

1. **Research the person** - What's their role? What do they own? How long have they been there?
2. **Review relevant docs** - Any architecture docs, postmortems, or past proposals they've written
3. **Customize questions** - Pick the relevant dimension-specific questions based on their domain
4. **Set expectations** - 45-60 minutes, confidential, trying to understand current state

### During the Interview

1. **Start with context** - Explain why you're doing this, what you'll do with the information
2. **Listen more than talk** - Your job is to learn, not to pitch
3. **Follow the threads** - If something interesting comes up, go deeper
4. **Take notes** - Capture quotes, not just summaries
5. **Ask for artifacts** - Docs, diagrams, dashboards they reference

### After Each Interview

1. **Write up notes same day** - Memory fades fast
2. **Score the relevant dimensions** - Based on what you learned
3. **Identify follow-ups** - Other people to talk to, docs to find
4. **Send thank-you** - Brief, acknowledges their time

---

## Interview Targets

### Engineering Leads (Technical State)

| Person | Focus Dimensions | Key Questions |
|--------|------------------|---------------|
| BC Core Engineering Lead | 1, 2, 3, 4 | APIs, data model, infrastructure |
| Makeswift Engineering Lead | 1, 2, 3, 4, 5 | Integration points, autonomy concerns |
| Feedonomics Engineering Lead | 1, 2, 3, 4 | Data sync, channel management |
| DevOps/Platform Lead | 4 | Infrastructure, observability, deployment |

### Business Stakeholders (Impact & Pain)

| Person | Focus Dimensions | Key Questions |
|--------|------------------|---------------|
| Product Marketing | 5, 6 | Positioning friction, packaging complexity |
| Sales Engineering | 5, 6, 7 | Deal friction, customer complaints |
| Support Lead | 5 | Common cross-product issues |
| Finance | 6, 7 | Billing complexity, P&L structure |

### Leadership (Strategy & Politics)

| Person | Focus Dimensions | Key Questions |
|--------|------------------|---------------|
| CPO | All | Strategic priorities, political landscape |
| Product leads (each product) | 7 | Roadmap coordination, autonomy vs. integration |

---

## Opening Script

> "Thanks for taking the time. I'm [X weeks/months] into my role as Product Architect, and I'm doing a systematic assessment of how well our products - Core, Makeswift, and Feedonomics - are integrated.
>
> This isn't about finding blame or making immediate changes. I'm trying to understand the current state so we can make informed decisions about where to invest.
>
> Everything you share is confidential - I'm synthesizing across conversations, not attributing quotes. I'd rather hear the unvarnished truth than the polished version.
>
> I have some specific questions, but I'm also interested in whatever you think I should know. Ready?"

---

## Universal Questions (Ask Everyone)

### Opening

1. **What's your role, and how long have you been in it?**
   - Context for their perspective

2. **How would you describe the relationship between Core, Makeswift, and Feedonomics today?**
   - Open-ended, see where they go

3. **What's the most painful integration issue you deal with?**
   - Gets to real problems quickly

4. **If you could fix one thing about how these products work together, what would it be?**
   - Priorities from their perspective

### History

5. **Has anyone tried to address integration before? What happened?**
   - Critical context - don't repeat past mistakes

6. **What's changed in the last 12-18 months?**
   - Trend direction

### Politics (Ask Carefully)

7. **Who else should I talk to about this?**
   - Expands your map

8. **Is there anyone who might have a different perspective than you?**
   - Identifies potential resistance

### Closing

9. **What questions should I be asking that I'm not?**
   - They know more than you

10. **Anything else you want me to know?**
    - Open door for off-script insights

---

## Dimension-Specific Questions

### Dimension 1: Identity & Access Management

**Ask:** Engineering leads, DevOps, Support

1. **How does a merchant log into each product today?**
   - Separate credentials? SSO? Seamless?

2. **If a merchant has access to Core, how do they get access to Makeswift?**
   - Manual provisioning? Automatic? Sales-driven?

3. **How are permissions managed across products?**
   - Can a store admin in Core also admin in Makeswift?

4. **How does API authentication work?**
   - Same tokens? Different auth systems?

5. **Are there separate user databases?**
   - If yes, how are they synced?

6. **What breaks when identity is inconsistent?**
   - Real examples of pain

**Scoring Guide:**
- Level 1 (Siloed): Completely separate identity systems
- Level 2 (Federated): SSO exists but permissions are separate
- Level 3 (Unified): Single identity with cross-product permissions
- Level 4 (Native): Identity is invisible; products feel like one

---

### Dimension 2: Data & Schema

**Ask:** Engineering leads, DevOps

1. **What's the canonical source of truth for [Product/Category/Customer/Order]?**
   - Walk through each major entity

2. **When a product is created in Core, how does Makeswift know about it?**
   - Real-time? Batch? Manual?

3. **When a product is updated in Feedonomics, does Core know?**
   - Bidirectional sync or one-way?

4. **What happens when the same entity has different data in different systems?**
   - Conflict resolution

5. **How do you handle schema changes?**
   - Versioning, migration, coordination

6. **Where does data get duplicated? Why?**
   - Intentional vs. accidental

7. **What's the latency on data sync?**
   - Seconds? Minutes? Hours?

**Scoring Guide:**
- Level 1 (Siloed): Separate data models, manual sync
- Level 2 (Replicated): Data copied between systems
- Level 3 (Federated): Single source of truth, APIs for access
- Level 4 (Unified): Single data layer, all products read/write

---

### Dimension 3: API & Contracts

**Ask:** Engineering leads, DevOps, Developer Relations (if exists)

1. **How consistent are the APIs across products?**
   - REST vs. GraphQL? Naming conventions? Error formats?

2. **Is there a unified API gateway?**
   - Or separate entry points for each product?

3. **How do you handle API versioning?**
   - Breaking changes? Deprecation policy?

4. **Are there internal APIs between products?**
   - Or only external-facing APIs?

5. **How does a developer building on BigCommerce discover what APIs exist?**
   - Documentation, discoverability

6. **What's the biggest API pain point you hear about?**
   - From internal teams or external developers

**Scoring Guide:**
- Level 1 (Siloed): Completely separate APIs, no consistency
- Level 2 (Documented): Separate but documented APIs
- Level 3 (Consistent): Shared patterns, conventions
- Level 4 (Unified): Single API surface, composable

---

### Dimension 4: Infrastructure

**Ask:** DevOps/Platform lead, Engineering leads

1. **Are the products deployed on the same infrastructure?**
   - Same cloud? Same clusters? Same region?

2. **Is there shared observability?**
   - Can you trace a request across products?

3. **What shared services exist?**
   - CDN? Caching? Message queues? Databases?

4. **How are deployments coordinated?**
   - Independent? Dependent? Coordinated windows?

5. **Is there a shared CI/CD pipeline?**
   - Or separate pipelines per product?

6. **What happens when one product has an outage?**
   - Blast radius? Cascading failures?

7. **What's the cost structure look like?**
   - Shared infrastructure costs vs. separate?

**Scoring Guide:**
- Level 1 (Siloed): Completely separate infrastructure
- Level 2 (Colocated): Same cloud, separate accounts/clusters
- Level 3 (Shared): Common services, some shared infra
- Level 4 (Unified): Single platform, shared everything

---

### Dimension 5: User Experience

**Ask:** Product Marketing, Support, Sales Engineering, Product leads

1. **How does a merchant navigate between products today?**
   - Separate URLs? Integrated nav? Context switching?

2. **Are the design systems consistent?**
   - Same components? Same look and feel?

3. **What's the most common UX complaint from merchants?**
   - Specific examples

4. **Is there a unified notification system?**
   - Or separate alerts from each product?

5. **Is there a single dashboard or home?**
   - Or do merchants have to context-switch?

6. **How do merchants perceive the products?**
   - One platform? Separate tools?

**Scoring Guide:**
- Level 1 (Siloed): Completely separate UIs
- Level 2 (Linked): Links between products
- Level 3 (Embedded): Products embedded in each other
- Level 4 (Unified): Single cohesive experience

---

### Dimension 6: Billing & Licensing

**Ask:** Finance, Sales, Product Marketing

1. **How is billing structured today?**
   - Separate invoices? Unified?

2. **How are the products packaged?**
   - Separate SKUs? Bundles? Tiers?

3. **Are there cross-product bundles?**
   - How are they priced?

4. **How is usage metered?**
   - Per product? Unified?

5. **What's the upgrade path look like?**
   - If a merchant wants to add Feedonomics, what happens?

6. **What's the biggest billing/packaging complaint from Sales?**
   - Friction in deals

**Scoring Guide:**
- Level 1 (Siloed): Separate billing systems
- Level 2 (Consolidated): Separate systems, one invoice
- Level 3 (Bundled): Product bundles, unified pricing
- Level 4 (Unified): Single subscription, feature-based

---

### Dimension 7: Organizational

**Ask:** CPO, Product leads, Engineering leads

1. **Are there separate P&Ls for each product?**
   - How are they measured?

2. **Who owns cross-product decisions?**
   - Is there a clear owner?

3. **Are roadmaps coordinated?**
   - How? How often?

4. **How integrated are the teams culturally?**
   - Same slack channels? Same rituals?

5. **What happens when priorities conflict?**
   - Who decides?

6. **What's the incentive structure?**
   - Are people rewarded for integration work?

**Scoring Guide:**
- Level 1 (Autonomous): Separate business units
- Level 2 (Coordinated): Regular alignment, separate execution
- Level 3 (Integrated): Shared goals, some shared teams
- Level 4 (Unified): One team, one roadmap

---

## Synthesis Template

After completing interviews, synthesize using this template:

### Per-Dimension Summary

```
## Dimension [X]: [Name]

### Current State Score: [1-4]

### Evidence:
- [Quote or fact from interview 1]
- [Quote or fact from interview 2]
- ...

### Key Findings:
1. [Finding]
2. [Finding]

### Disagreements/Tensions:
- [Person A says X, Person B says Y]

### Recommended Target State: [1-4]

### Gap: [Current - Target]

### Blockers to Closing Gap:
- [Technical blocker]
- [Organizational blocker]
- [Political blocker]
```

### Overall Synthesis

```
## Integration Debt Assessment Summary

### Total Score: [X/28]

### Interpretation:
- 0-7: Critical (products are functionally separate)
- 8-14: High (some integration, significant friction)
- 15-21: Moderate (workable, but inefficient)
- 22-28: Low (well-integrated, minor improvements)

### Top 3 Pain Points:
1. [Pain point] - affects [who] - dimension [X]
2. [Pain point] - affects [who] - dimension [X]
3. [Pain point] - affects [who] - dimension [X]

### Top 3 Quick Wins:
1. [Win] - effort [L/M/H] - impact [L/M/H]
2. [Win] - effort [L/M/H] - impact [L/M/H]
3. [Win] - effort [L/M/H] - impact [L/M/H]

### Top 3 Strategic Investments:
1. [Investment] - enables [what]
2. [Investment] - enables [what]
3. [Investment] - enables [what]

### Political Landmines:
- [Thing to be careful about]

### Recommended Sequencing:
1. [First priority]
2. [Second priority]
3. [Third priority]
```

---

## Interview Schedule Template

| Week | Person | Role | Dimensions | Status |
|------|--------|------|------------|--------|
| 1 | | BC Core Eng Lead | 1,2,3,4 | [ ] Scheduled [ ] Complete |
| 1 | | Makeswift Eng Lead | 1,2,3,4,5 | [ ] Scheduled [ ] Complete |
| 1 | | Feedonomics Eng Lead | 1,2,3,4 | [ ] Scheduled [ ] Complete |
| 2 | | DevOps/Platform Lead | 4 | [ ] Scheduled [ ] Complete |
| 2 | | Product Marketing | 5,6 | [ ] Scheduled [ ] Complete |
| 2 | | Sales Engineering | 5,6,7 | [ ] Scheduled [ ] Complete |
| 3 | | Support Lead | 5 | [ ] Scheduled [ ] Complete |
| 3 | | Finance contact | 6,7 | [ ] Scheduled [ ] Complete |
| 3 | | CPO (synthesis check) | All | [ ] Scheduled [ ] Complete |

---

## Common Pitfalls to Avoid

1. **Leading the witness** - Don't say "Integration is broken, right?" Ask open questions.

2. **Solving in the interview** - Your job is to learn, not to propose solutions yet.

3. **Taking sides** - If someone vents about another team, stay neutral.

4. **Promising outcomes** - Don't commit to fixing things you haven't diagnosed.

5. **Skipping the history** - Understanding what's been tried is as important as current state.

6. **Only talking to allies** - Seek out people who might disagree with integration.

7. **Rushing synthesis** - Take time to see patterns across interviews.

---

*Last Updated: January 2026*
