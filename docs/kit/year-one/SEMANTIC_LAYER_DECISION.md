# Architecture Decision Record: Semantic Layer Approach

**ADR Number:** 001
**Status:** PROPOSED
**Author:** Nino Chavez, Product Architect
**Date:** January 2026
**Decision:** BUY managed infrastructure, BUILD semantic definitions

---

## Context

BigCommerce's AI-native strategy requires a Semantic Layer - the infrastructure that converts operational data into AI-readable context (vector embeddings, knowledge graphs, real-time signals). This layer is foundational; without it, AI capabilities cannot be built.

The original architectural proposal suggested building this infrastructure in-house within a 6-month window. This ADR recommends against that approach.

---

## Decision

**BUY the infrastructure plumbing. BUILD the semantic definitions.**

Specifically:
- **BUY:** Vector database, embedding pipeline infrastructure, event stream backbone
- **BUILD:** Commerce-specific semantic models, business logic, domain mappings

---

## Options Considered

### Option A: Build Everything In-House

| Aspect | Assessment |
|--------|------------|
| Timeline | 6 months proposed, 16-23 months realistic |
| Cost | Engineering headcount + infrastructure + opportunity cost |
| Control | Maximum control over all components |
| Risk | Very high - data freshness, CDC complexity, compliance |

**Why This Fails:**

1. **The Staleness Gap Problem**
   - When operational data changes (inventory hits zero, customer tier changes), vector embeddings must update immediately
   - Building a system that tracks this lineage is exponentially difficult
   - Race conditions in CDC streams cause AI to hallucinate stale data
   - Custom pipelines lack sophistication for surgical updates

2. **The Frankenstein Architecture**
   - Internal builds become fragile stacks: CDC connectors (Debezium) + message queues (Kafka) + stream processors (Flink) + caching (Redis)
   - Managing race conditions across distributed commerce events is non-trivial
   - Observability gets deprioritized; system fails silently
   - No team wants to own the "glue code"

3. **Timeline Reality**
   - Ingestion & Embedding: 3-5 months (proposed: 2)
   - Vector Indexing & Search: 4-6 months (proposed: 2)
   - Security & Compliance: 3-6 months (proposed: 1)
   - Hardening & Scale: 6+ months (proposed: 0)
   - **Realistic total: 16-23 months**

4. **Regulatory Exposure**
   - EU AI Act (enforceable mid-2025) requires audit trails, reproducibility, runtime visibility
   - In-house build assumes 100% compliance liability
   - Failing standards could make platform illegal in major markets

### Option B: Buy Everything

| Aspect | Assessment |
|--------|------------|
| Timeline | 2-3 months to integrate |
| Cost | Vendor fees + integration engineering |
| Control | Limited - constrained by vendor capabilities |
| Risk | Low infrastructure risk, high vendor dependency |

**Why This Isn't Quite Right:**

- Loses differentiation on commerce-specific semantics
- Vendor lock-in on critical path
- May not fit BigCommerce's specific data models

### Option C: Buy Infrastructure, Build Semantics (RECOMMENDED)

| Aspect | Assessment |
|--------|------------|
| Timeline | 3-6 months for infrastructure, ongoing for semantics |
| Cost | Vendor fees + focused engineering on differentiation |
| Control | Control where it matters (domain logic), commodity where it doesn't |
| Risk | Moderate - vendor selection matters, but bounded |

**Why This Works:**

1. **Focus Engineering on Differentiation**
   - Engineers build commerce-specific semantic models
   - Not debugging Kafka consumer lag at 2am
   - Domain expertise is the moat, not infrastructure

2. **Compliance as a Service**
   - Managed platforms updating for EU AI Act
   - Audit logging, explainability features included
   - Liability shared with vendor

3. **Proven at Scale**
   - Pinecone, Weaviate, Materialize run billions of vectors
   - They've solved the hard distributed systems problems
   - We benefit from their learnings

4. **Faster Time to Value**
   - Infrastructure ready in weeks, not months
   - AI-native capabilities can ship sooner
   - Competitive window is narrow

---

## Recommended Vendor Evaluation

### Vector Database

| Vendor | Strengths | Considerations |
|--------|-----------|----------------|
| **Pinecone** | Managed, scales well, good DX | Cost at scale, single-purpose |
| **Weaviate** | Open-source option, flexible | More operational overhead |
| **Qdrant** | Performance, hybrid search | Newer, smaller community |

**Recommendation:** Evaluate Pinecone and Weaviate. Decision by end of Q1.

### Event Stream

| Vendor | Strengths | Considerations |
|--------|-----------|----------------|
| **Confluent (Kafka)** | Industry standard, ecosystem | Complexity, cost |
| **AWS Kinesis** | AWS-native, simpler | Less flexible, AWS lock-in |
| **Redpanda** | Kafka-compatible, simpler ops | Smaller ecosystem |

**Recommendation:** If already AWS-heavy, evaluate Kinesis. Otherwise, Confluent. Decision by end of Q1.

### Semantic Layer / Data Platform

| Vendor | Strengths | Considerations |
|--------|-----------|----------------|
| **Materialize** | Real-time SQL, IVM | Newer, learning curve |
| **AtScale** | Enterprise semantic layer | May be overkill |
| **Cube** | Developer-friendly, flexible | Less enterprise focus |

**Recommendation:** Evaluate Materialize for real-time correctness. Decision by end of Q2.

---

## What We Build Internally

The differentiation - what makes BigCommerce's AI-native capabilities unique - is the semantic definitions:

### Commerce Semantic Models
- Product taxonomy and relationships
- Customer lifecycle stages
- Order state machines
- Inventory availability rules
- Pricing and promotion logic

### Cross-Product Mappings
- How BC Core entities map to Makeswift content
- How Feedonomics channels relate to BC catalog
- Unified customer identity across products

### Business Logic
- What makes a "good" product recommendation for commerce
- How to score feed optimization opportunities
- When to trigger AI-assisted actions

**This is where the 10-year domain expertise matters. This is the moat.**

---

## Cost Comparison

### Option A: Build In-House (Estimated)

| Item | Year 1 | Ongoing |
|------|--------|---------|
| Engineering (4-6 FTEs) | $800K - $1.2M | $600K - $900K |
| Infrastructure (self-hosted) | $200K - $300K | $150K - $250K |
| Opportunity cost | High | Ongoing |
| **Total** | **$1M - $1.5M** | **$750K - $1.15M** |

### Option C: Buy + Build (Estimated)

| Item | Year 1 | Ongoing |
|------|--------|---------|
| Vendor fees | $100K - $200K | $150K - $300K |
| Integration engineering (2 FTEs) | $400K - $500K | $300K - $400K |
| Semantic layer development (2 FTEs) | $400K - $500K | $400K - $500K |
| **Total** | **$900K - $1.2M** | **$850K - $1.2M** |

**Net:** Similar cost, dramatically lower risk, faster time to value.

---

## Decision Rationale

1. **Risk Reduction:** Building distributed data infrastructure is hard. Vendors have solved these problems. Let them.

2. **Focus:** Engineering capacity is finite. Spend it on what differentiates BigCommerce, not on commodity infrastructure.

3. **Speed:** The competitive window for AI-native commerce is narrow. Shopify is moving. Salesforce is moving. We can't afford 18-month infrastructure projects.

4. **Compliance:** EU AI Act is real. Managed services are updating for it. We don't have the regulatory expertise in-house.

5. **Reversibility:** Vendor decisions can be changed (painful but possible). Failed internal builds waste irreplaceable time.

---

## Implementation Phases

### Phase 1: Evaluation (Q1 2026)
- Evaluate vector database options (Pinecone, Weaviate)
- Evaluate event stream options (Confluent, Kinesis)
- POC with bc-migration data
- Vendor selection by end of Q1

### Phase 2: Foundation (Q2 2026)
- Implement chosen vector database
- Implement event stream backbone
- Begin semantic model development
- First AI capability using new infrastructure

### Phase 3: Scale (Q3-Q4 2026)
- Expand semantic models across products
- Integrate Makeswift and Feedonomics data
- Production AI-native capabilities

---

## Risks of This Approach

| Risk | Mitigation |
|------|------------|
| Vendor lock-in | Choose vendors with open standards, plan exit paths |
| Vendor pricing changes | Negotiate multi-year contracts, have backup options |
| Integration complexity | Dedicated integration team, clear ownership |
| Semantic model quality | Invest in domain expertise, iterate on models |

---

## What I'm Asking For

1. **Alignment** on the Buy + Build approach
2. **Budget** for vendor evaluation and procurement
3. **Engineering capacity** for integration (2 FTEs)
4. **Air cover** to make this call without re-litigation

---

## Appendix: External Validation

This recommendation aligns with external analysis:

> "The risks of building the Semantic Layer in-house outweigh the benefits of control. The technical complexity of maintaining real-time correctness, coupled with the regulatory burden and the stark timeline discrepancy, makes this a likely point of failure."
>
> — Project Aion Red Team Assessment (Gemini Deep Research)

> "Procure a managed Semantic Layer and Vector Database. Do not build this infrastructure. Focus engineering resources on the domain model and migration logic."
>
> — Red Team Recommendation #1

---

*Status: PROPOSED - Pending CPO Review*
*Next Step: Schedule decision meeting*
