# Troubleshooting Guide

Solutions for common issues encountered with BC-Migration.

---

## Authentication Errors

### WooCommerce 401 Unauthorized

**Symptoms:**
```
Error: Request failed with status code 401
```

**Causes:**
1. Invalid consumer key or secret
2. REST API not enabled
3. Incorrect permalink structure
4. API key lacks permissions

**Solutions:**

1. **Verify credentials:**
   ```bash
   # Test with curl
   curl -u "ck_xxx:cs_xxx" https://your-store.com/wp-json/wc/v3/products
   ```

2. **Check REST API is enabled:**
   - WP Admin → WooCommerce → Settings → Advanced → REST API
   - Ensure keys exist and have correct permissions

3. **Verify permalink structure:**
   - WP Admin → Settings → Permalinks
   - Must NOT be "Plain" - use "Post name" or custom

4. **Regenerate API keys:**
   - Delete existing keys
   - Create new with Read/Write permissions

---

### BigCommerce 401/403

**Symptoms:**
```
ApiError: Request failed with status code 401
ApiError: Request failed with status code 403
```

**Causes:**
1. Invalid store hash
2. Invalid or expired access token
3. Token missing required scopes

**Solutions:**

1. **Verify store hash:**
   ```bash
   # Store hash is in your BC URL
   # https://api.bigcommerce.com/stores/{STORE_HASH}/v3/...
   ```

2. **Check token validity:**
   ```bash
   # Test connection
   npm run validate-target
   ```

3. **Verify token scopes:**
   - BC Admin → Settings → API Accounts
   - Required scopes: Products (modify), Customers (modify), Orders (read)

4. **Regenerate token:**
   - Create new API account with required scopes
   - Update `.env` with new token

---

## Rate Limiting

### 429 Too Many Requests

**Symptoms:**
```
RateLimitError: Rate limit exceeded
```

**Explanation:**
This is **normal behavior**. The rate limiter is working correctly. BigCommerce allows 150 requests per 30 seconds, and the tool automatically manages this.

**What happens:**
1. Rate limiter queues excess requests
2. Automatic backoff (1-5 seconds)
3. Requests resume when limit resets

**What to do:**
- **Wait** - the tool handles this automatically
- Check `logs/migration-*.log` for timing details
- For very large migrations, expect periodic pauses

**If requests still fail after backoff:**
1. Check BC Admin for any account issues
2. Verify your API tier allows sufficient calls
3. Contact BC support if persistent

---

## Migration Issues

### Missing Products After Migration

**Symptoms:**
- `npm run validate` shows count mismatch
- Some products didn't transfer

**Diagnosis:**
```bash
npm run validate -- --sample 20
```

**Common Causes & Solutions:**

1. **Products without SKUs:**
   - Check for products with `wc-` prefix SKUs (auto-generated)
   - Original WC products lacked SKUs

2. **Variable products with 600+ variants:**
   - BC limit: 600 variants per product
   - Excess variants are truncated with warning
   - Check logs for truncation warnings

3. **Draft/pending products:**
   - Only published products are migrated
   - Publish in WC first, then re-run

4. **Validation failures:**
   - Check `reports/failed-products-*.json`
   - Common: missing required fields, invalid characters

---

### Category Hierarchy Lost

**Symptoms:**
- Categories appear flat instead of nested
- Parent-child relationships missing

**Cause:**
Migration ran in wrong order, or parent categories failed.

**Solution:**
```bash
# Run categories first (creates hierarchy)
npm run migrate -- --type=categories

# Then run products (assigns to categories)
npm run migrate -- --type=products
```

**If already migrated:**
1. Check BC Admin for category structure
2. Delete and re-run category migration if needed

---

### Customer Deduplication Issues

**Symptoms:**
- Duplicate customers in BC
- "Customer already exists" errors

**Solution:**
The migrator checks by email. If duplicates appear:

1. **Check original WC data:**
   - Multiple accounts with same email?
   - Guest orders vs registered customers?

2. **BC handles by email:**
   - First customer with email wins
   - Subsequent matches are skipped

---

### Order Migration Failures

**Symptoms:**
- Orders not appearing in BC
- Reference errors

**Causes:**
1. Products not migrated first
2. Customers not migrated first
3. ID mapping mismatch

**Solution:**
```bash
# Correct order
npm run migrate -- --type=categories
npm run migrate -- --type=products
npm run migrate -- --type=customers
npm run migrate -- --type=orders
```

---

## Dashboard Issues

### Dark Mode Not Working

**Symptoms:**
- Theme toggle has no effect
- Colors stay in light mode

**Solutions:**

1. **Check Tailwind config:**
   ```ts
   // tailwind.config.ts
   darkMode: 'class'  // Must be 'class', not 'media'
   ```

2. **Verify HTML class:**
   ```tsx
   // Check that .dark class is added to <html>
   document.documentElement.classList.add('dark')
   ```

3. **Check CSS variables:**
   ```css
   /* globals.css should have .dark overrides */
   .dark {
     --color-base: #0a0a0a;
   }
   ```

---

### Dashboard Build Failures

**Symptoms:**
```
npm run build fails in src/dashboard
```

**Solutions:**

1. **Clean install:**
   ```bash
   cd src/dashboard
   rm -rf .next node_modules
   npm install
   npm run build
   ```

2. **Check Node version:**
   ```bash
   node --version  # Must be 18+
   ```

3. **Check for missing env vars:**
   ```bash
   # Build needs placeholder values
   NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co \
   NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder \
   npm run build
   ```

---

### Docs Not Rendering

**Symptoms:**
- 404 on documentation pages
- Blank content areas

**Solutions:**

1. **Check docs exist:**
   ```bash
   ls docs/*.md
   ```

2. **Rebuild if using MDX:**
   ```bash
   cd src/dashboard
   npm run build
   ```

3. **Check file paths:**
   - Docs router expects specific structure
   - Check `src/dashboard/app/docs/` routes

---

## CLI Issues

### Command Not Found

**Symptoms:**
```bash
bc-migrate: command not found
```

**Solutions:**

1. **Use npx during development:**
   ```bash
   npx tsx src/cli.ts assess
   ```

2. **Build and link globally:**
   ```bash
   npm run build
   npm link
   bc-migrate assess
   ```

---

### Environment Variables Not Loading

**Symptoms:**
- "Missing required environment variable" errors
- Credentials not being read

**Solutions:**

1. **Check .env file exists:**
   ```bash
   ls -la .env
   ```

2. **Check .env format:**
   ```bash
   # No quotes around values
   BC_STORE_HASH=abc123

   # NOT
   BC_STORE_HASH="abc123"
   ```

3. **Source from correct location:**
   - CLI reads from project root
   - Must run from bc-migration directory

---

## Logging & Debugging

### Finding Log Files

```bash
# List migration logs
ls logs/

# View latest log
cat logs/migration-*.log | tail -100

# Search for errors
grep -i error logs/migration-*.log

# Search for specific SKU
grep "ABC123" logs/migration-*.log
```

### Enabling Debug Logs

```bash
# Set log level
LOG_LEVEL=debug npm run migrate

# Very verbose
LOG_LEVEL=trace npm run migrate
```

### Understanding Log Format

```
{"level":30,"time":1234567890,"msg":"Product migrated","sku":"ABC","wcId":100,"bcId":200}
```

- `level`: 10=trace, 20=debug, 30=info, 40=warn, 50=error
- `time`: Unix timestamp (ms)
- Additional fields: contextual data

---

## Getting Help

If you can't resolve an issue:

1. **Check existing documentation:**
   - [CLAUDE.md](../CLAUDE.md) - Quick reference
   - [PATTERNS.md](./PATTERNS.md) - Code patterns
   - [ARCHITECTURE.md](./ARCHITECTURE.md) - System design

2. **Search logs for specific errors:**
   ```bash
   grep -i "your error message" logs/*.log
   ```

3. **Check failed item reports:**
   ```bash
   cat reports/failed-*.json
   ```

4. **Open an issue** with:
   - Error message (full stack trace)
   - Steps to reproduce
   - Relevant log excerpts
   - Environment (Node version, OS)
