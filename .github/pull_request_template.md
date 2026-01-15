## Summary

<!-- 1-2 sentences describing what this PR does and why -->

## Changes

- [ ] CLI changes (`src/cli.ts`, `src/lib/`)
- [ ] Migration logic (`src/migration/`)
- [ ] Assessment engine (`src/assessment/`)
- [ ] Dashboard UI (`src/dashboard/`)
- [ ] Types/Schemas (`src/types/`, `src/schemas/`)
- [ ] Documentation
- [ ] Tests

## Anti-Pattern Verification

<!-- Run these commands and paste the output. Empty output = passing. -->

```bash
# Check for direct axios calls (should be empty - existing files are allowed)
grep -rn "from 'axios'" src/ --include="*.ts" | grep -v "bc-client.ts" | grep -v "errors.ts" | grep -v "retry.ts" | grep -v "data-validator.ts" | grep -v "node_modules"

# Check for console.log in production code (should be empty)
grep -rn "console\.log" src/ --include="*.ts" | grep -v "__tests__" | grep -v "node_modules"

# Check for any types (review each match)
grep -rn ": any" src/ --include="*.ts" | grep -v "node_modules" | grep -v "__tests__"
```

**Results:**
<!-- Paste output here, or write "All clear" if empty -->

## Test Plan

### Automated
- [ ] All tests pass (`npm test`)
- [ ] TypeScript compiles (`npx tsc --noEmit`)

### Manual Testing
<!-- Describe manual verification steps -->

- [ ] Tested command: `npm run ___`
- [ ] Verified output: ___

## Migration Code Checklist

<!-- Only if changing src/migration/ -->

- [ ] Uses `BCClient` (not direct axios)
- [ ] Uses `processBatches()` for bulk operations
- [ ] Respects 600 variant limit
- [ ] Preserves idempotency (checks for existing resources)
- [ ] Logs with structured context (`{ sku, bcId }`)
- [ ] Transformer has corresponding test

## Dashboard Code Checklist

<!-- Only if changing src/dashboard/ -->

- [ ] Uses semantic CSS tokens (not raw colors)
- [ ] No hardcoded dark mode overrides
- [ ] Responsive on mobile
- [ ] Accessible (keyboard nav, ARIA labels)

## Related Issues

<!-- Link related issues: Fixes #123, Related to #456 -->

---

**CI Status:** Waiting for all checks to pass before merge.
