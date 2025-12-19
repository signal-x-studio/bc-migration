# BC Bridge Plugin - Intent Document

> **Document Type:** Agent-Native Intent Specification
> **Version:** 1.0.0
> **Status:** Draft
> **Last Updated:** 2025-12-18

---

## Purpose Statement

This document defines the **intent, constraints, and success criteria** for the BC Bridge Plugin in a format optimized for AI-assisted development. It serves as the authoritative source of truth that AI agents reference when making implementation decisions.

---

## 1. WHAT WE ARE BUILDING

### 1.1 One-Sentence Definition

A WordPress plugin that enables existing WordPress/WooCommerce sites to use BigCommerce as their commerce backend while preserving the WordPress frontend, theme, and content—without requiring a full platform migration.

### 1.2 The Problem We Solve

**For merchants:**
- WooCommerce doesn't scale beyond ~$5M GMV without significant infrastructure investment
- Replatforming to BigCommerce means abandoning WordPress investment (content, SEO, themes, plugins)
- Current BC4WP plugin is abandoned, buggy, and architecturally flawed

**For BigCommerce:**
- 8,000+ WP Engine WooCommerce mid-market customers represent untapped migration targets
- Current migration path requires "rip and replace" which creates sales friction
- Partnership with WP Engine needs a technical enabler

### 1.3 The Solution We Provide

A **headless commerce bridge** that:
1. Intercepts WooCommerce routes (/shop, /product/*, /cart, /checkout)
2. Fetches data from BigCommerce APIs in real-time (no sync)
3. Renders commerce UI within existing WordPress themes
4. Handles cart state, checkout flow, and customer accounts via BC APIs

---

## 2. WHAT WE ARE NOT BUILDING

### 2.1 Explicit Non-Goals

| We Are NOT Building | Rationale |
|---------------------|-----------|
| Bidirectional data sync | Root cause of 80% of BC4WP bugs |
| WooCommerce feature parity | Not competing with WC, replacing backend only |
| Full BigCommerce storefront | Merchants keep their WordPress theme |
| Migration tooling (in plugin) | Separate product in bc-migration repo |
| Multi-store management | Single store per WordPress install |
| B2B features (price lists, quotes) | Phase 2+ consideration |
| Marketplace/multi-vendor | Out of scope entirely |

### 2.2 Boundaries

```
┌─────────────────────────────────────────────────────────────────┐
│                        IN SCOPE                                  │
├─────────────────────────────────────────────────────────────────┤
│ • Product display (catalog, PDP, search)                        │
│ • Cart management (add, update, remove, persist)                │
│ • Checkout flow (embedded or redirect)                          │
│ • Customer accounts (login, register, order history)            │
│ • Basic analytics events (GTM dataLayer)                        │
│ • WooCommerce route interception                                │
│ • Theme compatibility layer                                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       OUT OF SCOPE                               │
├─────────────────────────────────────────────────────────────────┤
│ • Data migration (separate tooling)                             │
│ • Inventory management UI                                        │
│ • Order management UI (use BC admin)                            │
│ • Email/notification customization                              │
│ • Shipping rule configuration                                    │
│ • Tax configuration                                              │
│ • Payment gateway setup (done in BC)                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. ARCHITECTURAL INTENT

### 3.1 Core Principles

```yaml
principles:
  stateless_first:
    description: "Minimize WordPress database usage"
    implementation: "Fetch from BC API at runtime, cache in transients"
    rationale: "BC4WP's sync architecture caused 80% of bugs"

  defensive_initialization:
    description: "Never crash WordPress on activation"
    implementation: "Try/catch all hooks, fail gracefully with admin notices"
    rationale: "BC4WP site crashes are #1 complaint"

  clean_uninstall:
    description: "Leave no trace when removed"
    implementation: "Single cleanup routine removes ALL plugin data"
    rationale: "BC4WP leaves stale entries in 7+ tables"

  api_v3_only:
    description: "Use BigCommerce V3 APIs exclusively"
    implementation: "Typed PHP clients wrapping V3 endpoints"
    rationale: "BC4WP V2/V3 mismatch caused webhook failures"

  cdn_direct:
    description: "Use BigCommerce CDN for all assets"
    implementation: "Never download/mirror images to WordPress"
    rationale: "BC4WP image handling is fundamentally broken"
```

### 3.2 Data Flow Intent

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  WordPress   │     │  BC Bridge   │     │ BigCommerce  │
│   Request    │────▶│   Plugin     │────▶│    API       │
└──────────────┘     └──────────────┘     └──────────────┘
                            │                    │
                            │◀───────────────────┘
                            │     JSON Response
                            ▼
                     ┌──────────────┐
                     │   Render in  │
                     │   WP Theme   │
                     └──────────────┘

Key: NO data is stored in WordPress database except:
  - API credentials (encrypted in wp_options)
  - Plugin settings (wp_options)
  - Transient cache (wp_options, auto-expires)
```

### 3.3 What Gets Stored Where

| Data Type | Storage Location | TTL | Rationale |
|-----------|------------------|-----|-----------|
| API credentials | wp_options (encrypted) | Permanent | Required for API calls |
| Plugin settings | wp_options | Permanent | User configuration |
| Product cache | Transients | 5 min | Performance, auto-expires |
| Category cache | Transients | 15 min | Changes less frequently |
| Cart ID | Cookie | Session | Cross-request persistence |
| Customer token | Cookie (httpOnly) | 24h | Authentication state |
| **Products** | ❌ NOT STORED | - | Fetched from BC API |
| **Orders** | ❌ NOT STORED | - | Managed in BC admin |
| **Customers** | ❌ NOT STORED | - | Managed in BC admin |

---

## 4. SUCCESS CRITERIA

### 4.1 Functional Success

```yaml
must_work:
  - description: "Product catalog displays correctly"
    test: "Visit /shop, see BC products rendered in WP theme"

  - description: "Add to cart functions"
    test: "Click add to cart, item appears in mini-cart"

  - description: "Checkout completes"
    test: "Complete purchase, order appears in BC admin"

  - description: "Customer can log in"
    test: "BC customer credentials work on WP site"

  - description: "Mobile checkout works"
    test: "Complete purchase on iOS Safari and Android Chrome"

  - description: "Plugin activates without crashing"
    test: "Activate on fresh WP 6.5+ with PHP 8.2+, no errors"

  - description: "Plugin uninstalls cleanly"
    test: "Uninstall, verify zero plugin data remains in database"
```

### 4.2 Performance Success

```yaml
performance_targets:
  product_page_load:
    target: "< 200ms added latency vs static page"
    measurement: "Time to first byte delta"

  api_response_cache:
    target: "95% cache hit rate for product data"
    measurement: "Transient hit/miss ratio"

  checkout_completion:
    target: "< 3s total checkout flow"
    measurement: "Add to cart → order confirmation"

  memory_usage:
    target: "< 10MB additional memory per request"
    measurement: "WordPress memory delta"
```

### 4.3 Compatibility Success

```yaml
compatibility_matrix:
  wordpress:
    minimum: "6.2"
    tested_up_to: "6.7"

  php:
    minimum: "8.1"
    tested_up_to: "8.3"

  woocommerce:
    status: "Can coexist but deactivated"
    note: "Plugin detects WC and offers deactivation guidance"

  themes:
    tested:
      - "Twenty Twenty-Four"
      - "Astra"
      - "GeneratePress"
      - "Flavor flavor flavor flavor flavor flavor flavorflavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavorflavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavorflavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavorflavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavorflavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavorflavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavorStorefront (ironic)"
      - "flavor flavor flavor flavor flavor flavor flavorflavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavorflavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavorflavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavorflavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavorflavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavor flavorKadence"

  page_builders:
    tested:
      - "Elementor"
      - "Gutenberg (native)"
    not_tested:
      - "Divi"
      - "WPBakery"
      - "Beaver Builder"
```

---

## 5. AGENT DIRECTIVES

### 5.1 Code Generation Rules

```yaml
when_generating_code:
  always:
    - Use PHP 8.1+ typed properties and return types
    - Implement try/catch for all external API calls
    - Use WordPress coding standards (WPCS)
    - Escape all output with esc_html(), esc_attr(), esc_url()
    - Use prepared statements for any database queries
    - Fire WordPress hooks for extensibility
    - Add PHPDoc blocks with @since tags

  never:
    - Store product/order/customer data in WordPress database
    - Use WooCommerce functions or classes
    - Throw uncaught exceptions during initialization
    - Use V2 BigCommerce APIs
    - Download images to WordPress media library
    - Modify WordPress core tables
    - Use eval() or create_function()
```

### 5.2 Decision Framework

When an agent encounters ambiguity, apply these rules in order:

```yaml
decision_priority:
  1_security: "If security vs convenience, choose security"
  2_stability: "If stability vs features, choose stability"
  3_simplicity: "If simple vs clever, choose simple"
  4_stateless: "If stateless vs stateful, choose stateless"
  5_user_control: "If automatic vs manual, let user decide"
```

### 5.3 Error Handling Intent

```yaml
error_philosophy:
  external_api_failure:
    action: "Degrade gracefully, show cached data or friendly message"
    never: "Crash the page or show PHP errors"

  missing_configuration:
    action: "Show admin notice with setup link"
    never: "Throw exception or fatal error"

  incompatible_environment:
    action: "Deactivate self, show requirements notice"
    never: "Partially activate or corrupt state"

  unexpected_state:
    action: "Log error, return safe default"
    never: "Expose internal details to frontend"
```

---

## 6. CONSTRAINTS

### 6.1 Technical Constraints

```yaml
hard_constraints:
  - "Must work without WooCommerce active"
  - "Must not require Composer in production"
  - "Must work on shared hosting (no CLI requirements)"
  - "Must support WordPress multisite (future)"
  - "Must not exceed 10MB plugin size"

soft_constraints:
  - "Should work with common caching plugins"
  - "Should work behind CDNs (Cloudflare, etc)"
  - "Should support WP REST API authentication"
```

### 6.2 Business Constraints

```yaml
business_constraints:
  licensing:
    type: "Proprietary (BigCommerce owned)"
    distribution: "WordPress.org plugin directory"

  support:
    tier_1: "Community forums"
    tier_2: "BigCommerce support tickets"

  timeline:
    mvp: "Q1 2025 (WP Engine partnership launch)"

  team:
    size: "Ultra-small (2-3 people)"
    model: "AI-augmented development"
```

### 6.3 BigCommerce Platform Constraints

These are **not bugs to fix** but **platform realities to document**:

```yaml
bc_platform_constraints:
  domain_binding:
    constraint: "Channel domain cannot be changed in dashboard"
    workaround: "Document setup requirements, provide setup wizard"

  checkout_domain:
    constraint: "Embedded checkout requires domain match"
    workaround: "Validate domain during setup, offer redirect checkout alternative"

  api_rate_limits:
    constraint: "150 requests per 30 seconds (varies by plan)"
    workaround: "Implement request queuing and caching"

  webhook_limits:
    constraint: "Webhooks fire for all events, cannot filter server-side"
    workaround: "Filter client-side, don't over-subscribe"
```

---

## 7. GLOSSARY

| Term | Definition | Context |
|------|------------|---------|
| BC Bridge | This plugin | - |
| BC4WP | BigCommerce for WordPress (legacy plugin) | Competitor/predecessor |
| Channel | BigCommerce sales channel (storefront) | One channel per WP install |
| Headless | Commerce backend separate from frontend | Our architecture |
| PDP | Product Detail Page | /product/* routes |
| PLP | Product Listing Page | /shop, category pages |
| Transient | WordPress auto-expiring cache | Our caching mechanism |
| Embedded Checkout | BC checkout in iframe | Preferred checkout method |
| Redirect Checkout | Full redirect to BC domain | Fallback checkout method |

---

## 8. REFERENCES

### 8.1 Related Documents

| Document | Purpose | Location |
|----------|---------|----------|
| Roadmap | Phase/milestone planning | `docs/BC_BRIDGE_ROADMAP.md` |
| BRD | Business requirements | `docs/BC_BRIDGE_BRD.md` |
| PRD | Product requirements | `docs/BC_BRIDGE_PRD.md` |
| BC4WP Issue Analysis | Lessons learned | This conversation |

### 8.2 External References

| Resource | URL |
|----------|-----|
| BigCommerce API Docs | https://developer.bigcommerce.com/docs/rest |
| BigCommerce GraphQL | https://developer.bigcommerce.com/docs/storefront/graphql |
| WordPress Plugin Handbook | https://developer.wordpress.org/plugins/ |
| WPCS Coding Standards | https://developer.wordpress.org/coding-standards/wordpress-coding-standards/php/ |

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-12-18 | AI-assisted | Initial draft |

---

*This document is designed to be read by both humans and AI agents. When in doubt, agents should reference the decision framework in Section 5.2.*
