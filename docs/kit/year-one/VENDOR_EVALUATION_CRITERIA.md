# Semantic Layer Vendor Evaluation Criteria

**Purpose:** Scoring rubric for evaluating vendors across the semantic layer stack (vector databases, event streaming, semantic layer platforms).

**Date:** January 2026

**Author:** Nino Chavez, Product Architect

**Related:** ADR-001 (Semantic Layer Decision)

---

## Evaluation Framework Overview

### What We're Evaluating

The semantic layer requires three component categories:

| Category | Purpose | Candidates |
|----------|---------|------------|
| **Vector Database** | Store and query embeddings | Pinecone, Weaviate, Qdrant, Milvus, pgvector |
| **Event Streaming** | Real-time data backbone | Confluent Cloud, AWS Kinesis, Redpanda, Apache Kafka |
| **Semantic Layer Platform** | Query abstraction, metrics layer | Cube, Materialize, dbt Semantic Layer, AtScale |

### Evaluation Process

1. **Week 1-2:** Initial vendor research and shortlisting
2. **Week 3-4:** Technical deep dives with top 2-3 per category
3. **Week 5-6:** POC with finalist in each category
4. **Week 7-8:** Final scoring and recommendation

### Scoring System

Each criterion is scored 1-5:
- **1:** Does not meet requirements
- **2:** Partially meets with significant gaps
- **3:** Meets basic requirements
- **4:** Exceeds requirements in meaningful ways
- **5:** Best-in-class for our use case

---

## Vector Database Evaluation

### Candidates

| Vendor | Type | Notes |
|--------|------|-------|
| **Pinecone** | Managed SaaS | Market leader, purpose-built |
| **Weaviate** | Managed + Self-hosted | Strong hybrid search |
| **Qdrant** | Managed + Self-hosted | Rust-based, performance focus |
| **Milvus/Zilliz** | Managed + Self-hosted | Open source, enterprise option |
| **pgvector** | Postgres extension | Familiar, but limited scale |

### Scoring Criteria

#### Technical Capabilities (40% weight)

| Criterion | Weight | What We're Looking For |
|-----------|--------|------------------------|
| **Query Performance** | 10% | P99 latency <100ms at our expected scale (10M+ vectors) |
| **Hybrid Search** | 8% | Combine vector similarity with metadata filtering |
| **Scalability** | 8% | Handle 10x growth without re-architecture |
| **Index Types** | 6% | Support for HNSW, IVF, or similar high-performance indexes |
| **Embedding Dimensions** | 4% | Support 1536+ dimensions (OpenAI ada-002 scale) |
| **Real-time Updates** | 4% | Near-instant index updates, not batch-only |

**Scoring Notes:**
- Test with representative dataset (product catalog, order history)
- Measure actual latency, not claimed benchmarks
- Verify filtering performance doesn't degrade with scale

#### Operational Excellence (25% weight)

| Criterion | Weight | What We're Looking For |
|-----------|--------|------------------------|
| **Managed Service Quality** | 8% | SLA, uptime history, incident response |
| **Monitoring & Observability** | 6% | Built-in metrics, logging, alerting |
| **Backup & Recovery** | 5% | Point-in-time recovery, cross-region backup |
| **Security & Compliance** | 6% | SOC2, encryption at rest/transit, VPC options |

**Scoring Notes:**
- Request SLA terms and historical uptime data
- Review public incident postmortems
- Verify compliance certifications

#### Integration & Developer Experience (20% weight)

| Criterion | Weight | What We're Looking For |
|-----------|--------|------------------------|
| **SDK Quality** | 6% | Python, Node.js, Go SDKs with good docs |
| **API Design** | 5% | RESTful or gRPC, consistent patterns |
| **Documentation** | 5% | Comprehensive, up-to-date, with examples |
| **Community & Support** | 4% | Active community, responsive support |

**Scoring Notes:**
- Have engineers actually build with SDKs during eval
- Check GitHub issues and community forums
- Test support responsiveness with real questions

#### Cost & Commercial (15% weight)

| Criterion | Weight | What We're Looking For |
|-----------|--------|------------------------|
| **Pricing Model** | 5% | Predictable, scales reasonably |
| **Total Cost at Scale** | 6% | Model cost at 10M, 50M, 100M vectors |
| **Contract Flexibility** | 4% | Monthly vs. annual, exit terms |

**Scoring Notes:**
- Get detailed pricing for realistic scenarios
- Include data transfer, query costs, storage
- Negotiate POC credits

---

## Event Streaming Evaluation

### Candidates

| Vendor | Type | Notes |
|--------|------|-------|
| **Confluent Cloud** | Managed Kafka | Enterprise leader, rich ecosystem |
| **AWS Kinesis** | AWS Native | Good if AWS-heavy |
| **Redpanda** | Kafka-compatible | Performance focus, simpler ops |
| **Apache Kafka (self-managed)** | Open Source | Maximum control, high ops burden |
| **AWS MSK** | Managed Kafka on AWS | Middle ground |

### Scoring Criteria

#### Technical Capabilities (40% weight)

| Criterion | Weight | What We're Looking For |
|-----------|--------|------------------------|
| **Throughput** | 10% | Handle 100K+ events/second |
| **Latency** | 8% | P99 <50ms end-to-end |
| **Durability** | 8% | Zero data loss guarantees |
| **Exactly-once Semantics** | 6% | Critical for data consistency |
| **Schema Registry** | 4% | Native or integrated schema management |
| **Connectors Ecosystem** | 4% | Pre-built connectors for our data sources |

**Scoring Notes:**
- Benchmark with realistic event patterns
- Test failure scenarios (broker failure, network partition)
- Verify connector availability for Postgres, MySQL, etc.

#### Operational Excellence (25% weight)

| Criterion | Weight | What We're Looking For |
|-----------|--------|------------------------|
| **Managed Service Quality** | 8% | SLA, uptime, auto-scaling |
| **Multi-region Support** | 6% | Active-active or fast failover |
| **Monitoring & Alerting** | 6% | Lag monitoring, consumer health |
| **Security** | 5% | ACLs, encryption, audit logging |

**Scoring Notes:**
- Review multi-region architecture options
- Test auto-scaling behavior under load
- Verify compliance with our security requirements

#### CDC & Integration (20% weight)

| Criterion | Weight | What We're Looking For |
|-----------|--------|------------------------|
| **CDC Capabilities** | 8% | Debezium or native CDC support |
| **Database Connectors** | 6% | Postgres, MySQL, MongoDB support |
| **Sink Connectors** | 6% | Connect to vector DB, data warehouse |

**Scoring Notes:**
- Critical: CDC is how we feed the semantic layer
- Test actual CDC setup with our database types
- Verify sink connector for chosen vector DB

#### Cost & Commercial (15% weight)

| Criterion | Weight | What We're Looking For |
|-----------|--------|------------------------|
| **Pricing Model** | 5% | Per-partition, per-GB, or throughput-based |
| **Cost at Scale** | 6% | Model at 10TB/month, 100TB/month |
| **Contract Terms** | 4% | Flexibility, SLA guarantees |

---

## Semantic Layer Platform Evaluation

### Candidates

| Vendor | Type | Notes |
|--------|------|-------|
| **Cube** | Semantic layer | Headless BI, good API |
| **Materialize** | Streaming SQL | Real-time materialized views |
| **dbt Semantic Layer** | Metrics layer | If already using dbt |
| **AtScale** | Enterprise semantic layer | Heavy enterprise focus |
| **Build Custom** | Internal | Maximum control, high cost |

### Scoring Criteria

#### Technical Capabilities (40% weight)

| Criterion | Weight | What We're Looking For |
|-----------|--------|------------------------|
| **Query Performance** | 10% | Sub-second for common queries |
| **Real-time Support** | 8% | Not just batch; support streaming sources |
| **Caching & Optimization** | 8% | Smart caching, query optimization |
| **Multi-source Federation** | 6% | Query across vector DB, event stream, warehouse |
| **Semantic Modeling** | 4% | Define metrics, dimensions, relationships |
| **API Quality** | 4% | GraphQL or REST API for applications |

**Scoring Notes:**
- Critical: Must work with vector DB results
- Test query patterns from our use cases
- Verify streaming source support

#### Integration (25% weight)

| Criterion | Weight | What We're Looking For |
|-----------|--------|------------------------|
| **Vector DB Integration** | 10% | Native or easy integration with our vector DB |
| **Event Stream Integration** | 8% | Connect to Kafka/Kinesis |
| **Existing Stack Compatibility** | 7% | Work with our current BI tools, data warehouse |

**Scoring Notes:**
- This is make-or-break for our architecture
- If can't integrate with vector DB, it's a no-go
- Test actual integration, not just claimed support

#### Developer Experience (20% weight)

| Criterion | Weight | What We're Looking For |
|-----------|--------|------------------------|
| **Modeling Language** | 7% | Intuitive, version-controllable |
| **Documentation** | 6% | Comprehensive, with examples |
| **SDK/Client Quality** | 7% | Good clients for our languages |

#### Cost & Commercial (15% weight)

| Criterion | Weight | What We're Looking For |
|-----------|--------|------------------------|
| **Pricing Model** | 5% | Seat-based vs. usage-based |
| **Cost at Scale** | 6% | Model with realistic query volumes |
| **Open Source Option** | 4% | Can self-host if needed |

---

## Evaluation Scorecard Template

### Per-Vendor Scorecard

```
Vendor: _________________
Category: [ ] Vector DB  [ ] Event Streaming  [ ] Semantic Layer
Evaluator: _________________
Date: _________________

TECHNICAL CAPABILITIES (40%)
┌────────────────────────────┬────────┬───────┬─────────────────────┐
│ Criterion                  │ Weight │ Score │ Notes               │
├────────────────────────────┼────────┼───────┼─────────────────────┤
│                            │        │  /5   │                     │
│                            │        │  /5   │                     │
│                            │        │  /5   │                     │
│                            │        │  /5   │                     │
├────────────────────────────┼────────┼───────┼─────────────────────┤
│ Weighted Subtotal          │  40%   │       │                     │
└────────────────────────────┴────────┴───────┴─────────────────────┘

OPERATIONAL EXCELLENCE (25%)
┌────────────────────────────┬────────┬───────┬─────────────────────┐
│ Criterion                  │ Weight │ Score │ Notes               │
├────────────────────────────┼────────┼───────┼─────────────────────┤
│                            │        │  /5   │                     │
│                            │        │  /5   │                     │
│                            │        │  /5   │                     │
├────────────────────────────┼────────┼───────┼─────────────────────┤
│ Weighted Subtotal          │  25%   │       │                     │
└────────────────────────────┴────────┴───────┴─────────────────────┘

INTEGRATION & DX (20%)
┌────────────────────────────┬────────┬───────┬─────────────────────┐
│ Criterion                  │ Weight │ Score │ Notes               │
├────────────────────────────┼────────┼───────┼─────────────────────┤
│                            │        │  /5   │                     │
│                            │        │  /5   │                     │
│                            │        │  /5   │                     │
├────────────────────────────┼────────┼───────┼─────────────────────┤
│ Weighted Subtotal          │  20%   │       │                     │
└────────────────────────────┴────────┴───────┴─────────────────────┘

COST & COMMERCIAL (15%)
┌────────────────────────────┬────────┬───────┬─────────────────────┐
│ Criterion                  │ Weight │ Score │ Notes               │
├────────────────────────────┼────────┼───────┼─────────────────────┤
│                            │        │  /5   │                     │
│                            │        │  /5   │                     │
│                            │        │  /5   │                     │
├────────────────────────────┼────────┼───────┼─────────────────────┤
│ Weighted Subtotal          │  15%   │       │                     │
└────────────────────────────┴────────┴───────┴─────────────────────┘

TOTAL WEIGHTED SCORE: _____ / 5.0

RECOMMENDATION: [ ] Proceed to POC  [ ] Consider  [ ] Eliminate

KEY STRENGTHS:
1.
2.
3.

KEY CONCERNS:
1.
2.
3.

QUESTIONS FOR VENDOR:
1.
2.
```

---

## POC Requirements

### Vector Database POC

**Dataset:**
- 1M product vectors (synthetic or anonymized real data)
- Metadata: category, price range, merchant ID, timestamps

**Test Scenarios:**
1. Similarity search (top-10 similar products)
2. Filtered search (similar products in category X, price range Y)
3. Bulk insert (100K vectors in batch)
4. Real-time insert (single vector, measure latency)
5. Delete and re-query (consistency check)

**Success Criteria:**
- P99 query latency <100ms at 1M vectors
- Filtered search doesn't degrade >2x vs. unfiltered
- Bulk insert completes in <10 minutes
- Real-time insert latency <50ms

### Event Streaming POC

**Setup:**
- CDC from test Postgres database
- 3-topic architecture (products, orders, customers)
- Consumer that writes to vector DB

**Test Scenarios:**
1. Steady-state throughput (10K events/second)
2. Burst handling (100K events in 1 minute)
3. Consumer lag recovery
4. Schema evolution (add field, verify compatibility)
5. Failover (simulate broker failure)

**Success Criteria:**
- Sustained 10K events/second with <50ms latency
- Burst absorbed without data loss
- Consumer catches up within 5 minutes after 1-hour pause
- Schema evolution works without consumer restart

### Semantic Layer POC

**Setup:**
- Connect to vector DB and event stream
- Define 3-5 semantic models (product similarity, customer segments, order patterns)

**Test Scenarios:**
1. API query for product recommendations
2. Real-time metric update (new order → updated stats)
3. Cross-source query (vector results + structured data)
4. Caching effectiveness (same query, second request)

**Success Criteria:**
- API queries return in <200ms
- Real-time updates reflected within 1 second
- Cross-source queries work correctly
- Cached queries return in <50ms

---

## Comparison Matrix Template

### Vector Database Comparison

| Criterion | Pinecone | Weaviate | Qdrant | Milvus | pgvector |
|-----------|----------|----------|--------|--------|----------|
| Query Performance |  |  |  |  |  |
| Hybrid Search |  |  |  |  |  |
| Scalability |  |  |  |  |  |
| Managed Quality |  |  |  |  |  |
| Security |  |  |  |  |  |
| SDK Quality |  |  |  |  |  |
| Pricing |  |  |  |  |  |
| **TOTAL** |  |  |  |  |  |

### Event Streaming Comparison

| Criterion | Confluent | Kinesis | Redpanda | MSK | Self-managed |
|-----------|-----------|---------|----------|-----|--------------|
| Throughput |  |  |  |  |  |
| Latency |  |  |  |  |  |
| CDC Support |  |  |  |  |  |
| Managed Quality |  |  |  |  |  |
| Multi-region |  |  |  |  |  |
| Connectors |  |  |  |  |  |
| Pricing |  |  |  |  |  |
| **TOTAL** |  |  |  |  |  |

### Semantic Layer Comparison

| Criterion | Cube | Materialize | dbt SL | AtScale | Custom |
|-----------|------|-------------|--------|---------|--------|
| Query Performance |  |  |  |  |  |
| Real-time Support |  |  |  |  |  |
| Vector DB Integration |  |  |  |  |  |
| Stream Integration |  |  |  |  |  |
| Modeling Language |  |  |  |  |  |
| Pricing |  |  |  |  |  |
| **TOTAL** |  |  |  |  |  |

---

## Decision Framework

### Must-Haves (Elimination Criteria)

If a vendor fails any of these, they're eliminated:

| Category | Must-Have |
|----------|-----------|
| All | SOC2 compliance or clear path to it |
| All | Managed service option (no self-hosting requirement) |
| Vector DB | Hybrid search support |
| Vector DB | 10M+ vector scale demonstrated |
| Event Streaming | CDC support (native or Debezium) |
| Event Streaming | Exactly-once semantics |
| Semantic Layer | Real-time source support |
| Semantic Layer | API access (not just BI tool) |

### Weighted Decision

After must-haves are verified:

1. Calculate weighted score for each vendor
2. Top scorer in each category proceeds to POC
3. POC results may override initial scoring
4. Final decision requires:
   - Technical team sign-off
   - Cost approval from Finance
   - Security review passed

### Tie-Breaker Criteria

If scores are within 0.3 points:
1. Prefer vendor with better BigCommerce/e-commerce references
2. Prefer vendor with simpler pricing model
3. Prefer vendor with stronger open-source foundation

---

## Timeline

| Week | Activity |
|------|----------|
| 1 | Initial research, request demos |
| 2 | Complete scorecards for all candidates |
| 3 | Technical deep dives with top 2-3 per category |
| 4 | POC setup and initial testing |
| 5 | POC completion, gather results |
| 6 | Final scoring, recommendation to leadership |
| 7 | Contract negotiation with selected vendors |
| 8 | Finalize and sign |

---

## Appendix: Vendor Contact Tracker

| Vendor | Category | Contact | Status | Notes |
|--------|----------|---------|--------|-------|
| Pinecone |  |  | [ ] Contacted [ ] Demo [ ] POC |  |
| Weaviate |  |  | [ ] Contacted [ ] Demo [ ] POC |  |
| Qdrant |  |  | [ ] Contacted [ ] Demo [ ] POC |  |
| Confluent |  |  | [ ] Contacted [ ] Demo [ ] POC |  |
| Redpanda |  |  | [ ] Contacted [ ] Demo [ ] POC |  |
| Cube |  |  | [ ] Contacted [ ] Demo [ ] POC |  |
| Materialize |  |  | [ ] Contacted [ ] Demo [ ] POC |  |

---

*Last Updated: January 2026*
