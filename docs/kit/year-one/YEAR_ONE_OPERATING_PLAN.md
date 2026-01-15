# Year-One Operating Plan: Product Architect

**Author:** Nino Chavez
**Role:** Product Architect (First in Role)
**Reports To:** CPO
**Start Date:** January 2026

---

## The Job

You were hired to solve a specific problem: BigCommerce has grown through acquisition (Core + Makeswift + Feedonomics) but lacks architectural coherence. The products don't talk to each other well, and this blocks both the Enterprise value proposition and the AI-native future.

Your job is to:
1. **Diagnose** what's actually broken (not what people think is broken)
2. **Architect** the path forward (make the hard technical calls)
3. **Influence** execution across teams you don't control
4. **Deliver** visible wins that justify the role

---

## Success Criteria: What Does "Good" Look Like?

### By End of Year One, You Will Have:

| Outcome | Evidence |
|---------|----------|
| Established credibility | bc-migration shipped, announced at Summit, in production use |
| Mapped integration debt | Completed diagnostic across all 7 dimensions with real data |
| Made the first major architectural call | Semantic Layer approach decided and funded |
| Built cross-functional relationships | Engineering leads, Product leads, Partnership lead all see you as useful |
| Created architectural artifacts | Decision docs that outlive you, not just opinions |
| Influenced roadmaps | AI-native capabilities appear on 2027 roadmaps because of your input |

### What You Will NOT Have Done:

- Rewritten anything major (too early)
- Built a team (you're a single-threaded owner with cohorts)
- Solved the integration problem (that's a multi-year effort)
- Shipped AI-native features beyond migration (foundation first)

---

## Quarterly Breakdown

### Q1 2026: Establish Credibility (January - March)

**Theme:** Deliver the mission you were hired for. No architecture astronautics.

| Milestone | Target Date | Success Metric |
|-----------|-------------|----------------|
| bc-migration technical integration complete | End of February | E2E flow works with BC provisioning |
| Beta merchant migrated | Mid-March | At least 1 successful migration with sign-off |
| Summit demo ready | End of March | Polished demo, backup plan in place |
| Semantic Layer decision doc circulated | End of March | CPO alignment on Buy approach |

**Key Activities:**
- Weekly CPO 1:1s (status, blockers, decisions)
- WPEngine bi-weekly syncs (partner alignment)
- Engineering cohort coordination (API integration)
- Begin stakeholder mapping (who owns what)

**Risks:**
- WPEngine partnership delays → Escalation path to executives
- No beta merchant available → Start recruitment early, have backups
- BC integration APIs not ready → Identify owners Week 2, escalate early

**What You're Learning:**
- How decisions actually get made here
- Who the real power centers are
- What the engineering culture is like
- Where the bodies are buried

---

### Q2 2026: Expand Understanding (April - June)

**Theme:** Use post-Summit credibility to go deep on the integration problem.

| Milestone | Target Date | Success Metric |
|-----------|-------------|----------------|
| Summit announcement delivered | April | Positive reception, WPEngine co-marketing live |
| Integration diagnostic kickoff | April | Stakeholder interviews scheduled |
| Integration diagnostic complete | End of June | All 7 dimensions scored with evidence |
| Architecture gap analysis | End of June | Prioritized list of what to fix first |

**Key Activities:**
- Stakeholder interviews (Engineering leads, Product leads, Support, Finance)
- Technical deep-dives (trace entities across systems)
- Document current state (architecture diagrams, data flows)
- Synthesize findings into actionable recommendations

**Interview Targets:**
- BC Core Engineering Lead → Infrastructure, APIs, data model
- Makeswift Engineering Lead → Integration points, tech stack, roadmap
- Feedonomics Engineering Lead → Integration points, data sync, APIs
- DevOps/Platform Team → Infrastructure, observability, deployment
- Product Marketing → Packaging, positioning, merchant feedback
- Sales Engineering → Integration friction, customer complaints
- Support Lead → Common cross-product issues
- Finance → Billing systems, P&L structure

**What You're Learning:**
- Where the real integration pain is (vs. perceived pain)
- What's been tried before and why it failed
- Who's aligned with unification vs. who's protecting turf
- What the actual technical debt looks like

---

### Q3 2026: Architect the Path (July - September)

**Theme:** Make the hard calls. Propose the architecture.

| Milestone | Target Date | Success Metric |
|-----------|-------------|----------------|
| Unified Event Stream proposal | End of July | Architecture doc reviewed by Engineering |
| AI-native capability prototype | End of August | Working demo of one Tier 2 capability |
| Unification architecture proposal | End of September | Executive presentation with phased plan |

**Key Activities:**
- Draft architectural proposals (event stream, data layer, identity)
- Build prototype of first AI-native capability (likely catalog enrichment)
- Socialize proposals with Engineering leads (get buy-in before exec presentation)
- Prepare executive presentation (business case, not just tech)

**Architectural Decisions to Make:**
- Event stream: Kafka/Confluent vs. AWS Kinesis vs. other
- Vector storage: Pinecone vs. Weaviate vs. other
- LLM integration: Direct API vs. gateway abstraction
- Identity unification: Approach and sequencing

**What You're Producing:**
- Architecture Decision Records (ADRs) for each major call
- Phased roadmap for unification (what order, what dependencies)
- Business case for investment (ROI, risk, timeline)

---

### Q4 2026: Influence Roadmaps (October - December)

**Theme:** Get your architecture into 2027 plans.

| Milestone | Target Date | Success Metric |
|-----------|-------------|----------------|
| AI-native capabilities on 2027 roadmap | November | At least 2 capabilities funded/staffed |
| Event stream project kicked off | December | Engineering team assigned, work begun |
| Year-one retrospective | December | Documented learnings, Year Two plan drafted |

**Key Activities:**
- Participate in 2027 planning cycles
- Advocate for foundational work (event stream, identity)
- Build coalition of Engineering leads who want this
- Document lessons learned from Year One

**What Success Looks Like:**
- Engineering teams are building toward your architecture, not around it
- You're consulted on cross-product decisions
- The AI-native vision has organizational buy-in
- You have a clear mandate for Year Two

---

## Operating Rhythm

### Weekly
- CPO 1:1 (30 min) - Status, blockers, decisions needed
- Personal planning (1 hr) - What am I trying to accomplish this week?

### Bi-Weekly
- Cross-functional sync (as needed) - Coordination with cohorts
- Partner sync (WPEngine, others) - External alignment

### Monthly
- Executive update (Travis, Dan, CPO) - Strategic alignment
- Architecture review (self) - Am I still on track?

### Quarterly
- Retrospective - What worked, what didn't
- Plan update - Adjust based on learnings

---

## Key Relationships to Build

### Must Have (Q1)
- **CPO** - Your sponsor, air cover provider
- **BC Core Engineering Lead** - Technical decisions go through them
- **Partnerships Lead** - WPEngine coordination

### Should Have (Q2)
- **Makeswift Engineering Lead** - Integration partner
- **Feedonomics Engineering Lead** - Integration partner
- **Product Marketing Lead** - Positioning, messaging

### Nice to Have (Q3-Q4)
- **Sales Engineering** - Customer pain points
- **Support Lead** - Operational issues
- **Finance** - Investment decisions

---

## Metrics You'll Track

### Leading Indicators (Your Activities)
- Stakeholder interviews completed
- Architecture docs produced
- Decisions documented
- Prototypes built

### Lagging Indicators (Outcomes)
- bc-migration adoption (merchants migrated)
- Integration diagnostic score (improvement over time)
- AI-native capabilities on roadmap
- Engineering alignment (do they build what you recommend?)

---

## What Could Go Wrong

| Risk | Mitigation |
|------|------------|
| bc-migration fails to ship for Summit | Focus relentlessly Q1, escalate early |
| Integration diagnostic reveals political landmines | Build relationships before delivering bad news |
| Architecture proposals get ignored | Socialize with Engineering leads before executives |
| Role gets sucked into operational work | Protect strategic time, push back on scope creep |
| AI-native vision loses executive interest | Tie everything to business outcomes (margin, retention) |

---

## Year Two Preview (What You're Setting Up)

If Year One goes well, Year Two is about **execution**:

- Event stream in production
- First AI-native capabilities shipping
- Identity unification underway
- Expanded scope (more products, more decisions)

But that's not your problem yet. Focus on Year One.

---

*Last Updated: January 2026*
