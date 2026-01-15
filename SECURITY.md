# Security Policy

## Reporting Vulnerabilities

If you discover a security vulnerability, please report it privately:

1. **Do NOT** open a public issue
2. Email security concerns to the maintainers
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will respond within 48 hours and work with you to address the issue.

---

## Credential Handling

### Storage Rules

| Do | Don't |
|----|-------|
| Store credentials in `.env` | Commit credentials to git |
| Use environment variables | Hardcode credentials in code |
| Keep `.env` in `.gitignore` | Share `.env` files |
| Use CI/CD secrets for pipelines | Log credentials |

### Environment Variables

Required credentials are loaded from environment:

```bash
# WooCommerce
WC_URL=https://...
WC_CONSUMER_KEY=ck_...
WC_CONSUMER_SECRET=cs_...

# BigCommerce
BC_STORE_HASH=...
BC_ACCESS_TOKEN=...
```

### In Code

```typescript
// CORRECT: Load from environment
const token = process.env.BC_ACCESS_TOKEN;
if (!token) {
  throw new ConfigurationError('BC_ACCESS_TOKEN is required');
}

// WRONG: Hardcoded credentials
const token = 'abc123secret'; // NEVER DO THIS
```

### In Logs

```typescript
// CORRECT: Redact sensitive data
logger.info({
  url: config.wcUrl,
  hasKey: !!config.wcKey  // Boolean, not the actual key
}, 'Connecting to WooCommerce');

// WRONG: Logging credentials
logger.info({ key: config.wcKey }, 'Using key');
```

---

## API Security

### WooCommerce

- **Authentication**: OAuth 1.0a (consumer key/secret pair)
- **Transport**: HTTPS required
- **Permissions**: Read access minimum for assessment

### BigCommerce

- **Authentication**: Bearer token (X-Auth-Token header)
- **Transport**: HTTPS required
- **Scopes**: Products, Customers, Orders (read/write)

### Best Practices

1. **Principle of least privilege**: Request only needed API scopes
2. **Token rotation**: Rotate API tokens periodically
3. **Scope limitation**: Don't request admin scopes if not needed

---

## Rate Limiting

Rate limiting is a security feature that protects both our system and the APIs we connect to.

### BigCommerce Limits

| Limit | Value |
|-------|-------|
| Requests per 30 seconds | 150 |
| Concurrent requests | 10 |
| Batch size | 10 items |

### Implementation

```typescript
// Rate limiter enforces limits automatically
import { bcRateLimiter } from '../lib/rate-limiter.js';

// All BCClient methods use the rate limiter
// Manual bypass is not possible without modifying bc-client.ts
```

### Why This Matters

- Prevents API bans from BigCommerce
- Ensures fair usage of shared infrastructure
- Protects against accidental DoS

---

## Data Handling

### Customer Data

| Data Type | Handling |
|-----------|----------|
| Email addresses | Hashed in debug logs |
| Names | Not logged in production |
| Addresses | Never logged |
| Payment info | Not migrated (orders are read-only) |

### Logging Policy

```typescript
// Customer logging pattern
logger.info({
  customerId: customer.id,
  emailHash: hashEmail(customer.email),  // SHA256 hash
  hasAddress: !!customer.billing_address
}, 'Processing customer');
```

### Data Retention

- Migration logs: Retained for 30 days
- Assessment reports: Retained locally only
- State files: Contain ID mappings, no PII

---

## Input Validation

### API Responses

All API responses are validated with Zod schemas:

```typescript
import { WCProductSchema } from '../schemas/wc.js';

// Validates structure and types
const product = WCProductSchema.parse(apiResponse);
```

### User Input

CLI arguments are validated before use:

```typescript
// URL validation
if (!isValidUrl(options.url)) {
  throw new ConfigurationError('Invalid URL format');
}

// Numeric validation
const batchSize = parseInt(options.batchSize);
if (isNaN(batchSize) || batchSize < 1 || batchSize > 100) {
  throw new ConfigurationError('Batch size must be 1-100');
}
```

---

## Dependency Security

### Keeping Dependencies Updated

```bash
# Check for vulnerabilities
npm audit

# Update dependencies
npm update

# Check for major updates
npx npm-check-updates
```

### Dependency Policy

- Review new dependencies before adding
- Prefer well-maintained packages
- Pin versions in package-lock.json
- Run `npm audit` in CI pipeline

---

## Git Security

### What NOT to Commit

The following are in `.gitignore`:

```
.env              # Credentials
*.log             # May contain sensitive data
reports/*.json    # Assessment data
.migration-state.json  # Contains ID mappings
```

### Pre-Commit Checklist

Before committing, verify:

```bash
# Check for accidental credential exposure
grep -r "ck_\|cs_\|token" --include="*.ts" | grep -v ".env"

# Verify .env is not staged
git status | grep ".env"  # Should be empty
```

---

## Security Checklist for PRs

- [ ] No credentials in code
- [ ] No credentials in logs
- [ ] Input validation present
- [ ] Rate limiting respected
- [ ] Error messages don't expose internals
- [ ] Dependencies are from trusted sources

---

## Related Documentation

- [docs/PATTERNS.md](docs/PATTERNS.md) - Secure coding patterns
- [docs/CODE_REVIEW.md](docs/CODE_REVIEW.md) - Security review checklist
