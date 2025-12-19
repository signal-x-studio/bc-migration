# ADR 001: Drop Catalyst for Mid-Market Efficiency

## Status
Accepted

## Context
Initial project plans (Strateg Kit, Roadmap) suggested using BigCommerce Catalyst (Next.js headless framework) as the frontend stack. However, based on a direct conversation with the Commerce CFO (2025-12-17), Catalyst is considered "too upmarket" and "high priced" for the targeted mid-market WooCommerce merchants.

## Decision
We will **not** use Catalyst for the migration solution. Instead, we will focus on a "WordPress-native" approach:
1.  Keep the existing WordPress site on WPEngine.
2.  Use a "BC Bridge" plugin to replace WooCommerce functionality.
3.  Ensure a low-friction, highly automated migration path.

## Consequences
- **Positive**: Reduced implementation complexity for the ROI/Target segment. Faster "time-to-migration" for merchants.
- **Negative**: Merchants won't benefit from the modern Catalyst/Makeswift frontend performance without additional effort.
- **Neutral**: The technical complexity shifts from a full headless site build to a deep WordPress integration.
