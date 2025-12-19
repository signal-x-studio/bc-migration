# User Guide: Assessing Your WooCommerce Store

The `bc-migrate` tool helps you qualify your WooCommerce store for a high-performance migration to BigCommerce. 

## Prerequisites
- A WordPress site with **WooCommerce** active.
- **REST API Keys**: 
    - Go to WooCommerce > Settings > Advanced > REST API.
    - Create a key with **Read** permissions for assessment.
- **Node.js**: Ensure you have Node.js 18+ installed.

## Running the Assessment
Run the following command from your terminal:

```bash
npx bc-migrate assess --url https://your-site.com --key ck_xxx --secret cs_xxx
```

### What happens during an assessment?
1. **Connectivity Check**: Validates that your API keys are correct and we can reach the store.
2. **Scale Metrics**: Calculates the total number of products, categories, orders, and customers.
3. **Complexity Scan**: Analyzes product types (e.g., Variable vs Simple) and custom metadata density.
4. **Logic Audit**: Identifies complex plugins (like Subscriptions or Memberships) that might require special handling.
5. **Plugin Mapping**: Suggests specific BigCommerce native features or App Store alternatives for your current WooCommerce plugins.

## Understanding Your Report
After completion, the tool generates a report in `./reports/`.

### Readiness Categories
| Category | Meaning |
| --- | --- |
| **GREEN** | Your store is an ideal fit for automated migration. |
| **YELLOW** | Migration is feasible, but some manual configuration of plugins or custom logic is expected. |
| **RED** | High complexity detected. We recommend a technical architectural review before proceeding. |

## Troubleshooting
- **401 Unauthorized**: Double-check your Consumer Key and Secret. Ensure the user has "Read" permissions.
- **404 Not Found**: Ensure the URL is the base for your WordPress site and that the WooCommerce plugin is active.
