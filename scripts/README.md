# Test Data Generation Scripts

Scripts for generating WooCommerce test data to test the migration assessment and migration tools.

## Prerequisites

### WooCommerce REST API (Method 1)

1. Log into WordPress admin
2. Navigate to **WooCommerce > Settings > Advanced > REST API**
3. Click **Add Key**
4. Set:
   - Description: "BC Migration Test Data Generator"
   - User: Admin user
   - Permissions: **Read/Write**
5. Click **Generate API Key**
6. Copy the Consumer Key and Secret to your `.env` file:

```env
WC_URL=https://your-woocommerce-site.com
WC_CONSUMER_KEY=ck_xxxxx
WC_CONSUMER_SECRET=cs_xxxxx
```

### WP-CLI (Method 2)

- SSH access to the WordPress server
- WP-CLI installed on the server
- WooCommerce plugin active

## Usage

### Method 1: REST API Generator (Recommended)

```bash
# Test with dry run first
npx tsx scripts/generate-test-data.ts --dry-run

# Generate small dataset
npx tsx scripts/generate-test-data.ts --scale=small

# Generate medium dataset (default)
npx tsx scripts/generate-test-data.ts

# Generate large dataset
npx tsx scripts/generate-test-data.ts --scale=large
```

### Method 2: WP-CLI (Server-Side)

```bash
# Direct execution (if on the server)
./scripts/wp-cli-generate.sh medium

# Via SSH (WPEngine example)
ssh wpengine@bcmigration.ssh.wpengine.net 'bash -s' < scripts/wp-cli-generate.sh medium

# Dry run
./scripts/wp-cli-generate.sh medium --dry-run
```

## Data Scales

| Scale  | Categories | Simple Products | Variable Products | Virtual | Downloadable | Customers | Orders |
|--------|------------|-----------------|-------------------|---------|--------------|-----------|--------|
| Small  | 10         | 50              | 20                | 5       | 5            | 30        | 20     |
| Medium | 50         | 300             | 150               | 30      | 20           | 200       | 100    |
| Large  | 100        | 600             | 300               | 60      | 40           | 500       | 300    |

## Edge Cases Generated

The scripts automatically include edge cases to test migration handling:

| Edge Case | Description | Implementation |
|-----------|-------------|----------------|
| Missing SKUs | Products without SKU values | First 20 simple products |
| Missing Images | Products without images | First 30 simple products |
| Unicode Names | Products with special characters | Every 10th product |
| Long Descriptions | Products with 5000+ char descriptions | Every 20th product |
| Orphan Products | Products without categories | Last 10 simple products |
| 600+ Variants | Products exceeding BC limit | First 2 variable products |
| No Addresses | Customers without billing/shipping | First 20 customers |
| All Order Statuses | Orders with each WC status | Random distribution |
| Category Hierarchy | 3-level deep categories | Automatically structured |

## File Structure

```
scripts/
├── generate-test-data.ts  # REST API generator (Node.js)
├── wp-cli-generate.sh     # WP-CLI generator (Bash)
├── faker-data.ts          # Shared faker data generators
└── README.md              # This file
```

## Verification

After generating data, verify with the assessment tools:

```bash
# Run assessment
npm run assess

# View dashboard
npm run dashboard

# Check counts
npx tsx src/cli.ts assess --url $WC_URL --key $WC_CONSUMER_KEY --secret $WC_CONSUMER_SECRET
```

## Cleanup

To remove generated data, use the WordPress admin or WP-CLI:

```bash
# Via WP-CLI (be careful!)
wp post delete $(wp post list --post_type=product --format=ids) --force
wp post delete $(wp post list --post_type=shop_order --format=ids) --force
wp user delete $(wp user list --role=customer --format=ids) --reassign=1
```

## Troubleshooting

### Connection Errors

- Verify `.env` credentials are correct
- Ensure WC REST API keys have Read/Write permission
- Check if SSL certificate is valid (use `queryStringAuth: true` for issues)

### Rate Limiting

The REST API generator includes built-in delays between requests. If you still encounter rate limits:
- Reduce the scale
- Increase delays in `generate-test-data.ts`

### WP-CLI Not Found

Ensure WP-CLI is installed and in the PATH:
```bash
which wp
wp --version
```

### Duplicate Data

The generators don't check for existing data. To avoid duplicates:
- Clean up existing data first
- Or use unique prefixes (generated automatically)
