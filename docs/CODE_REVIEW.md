# Code Review Guidelines

This document defines the code review process for BC-Migration.

---

## Philosophy

- **Be constructive**: Focus on improvement, not criticism
- **Explain why**: Help the author understand the reasoning
- **Be timely**: Review within 24 hours when possible
- **Assume good intent**: The author is trying to improve the codebase

---

## Severity Labels

Use these labels to indicate importance:

### BLOCKER

Must fix before merge. Use sparingly.

```
BLOCKER: This bypasses rate limiting and will cause API bans.
```

Examples:
- Security vulnerabilities
- Data loss potential
- Breaking changes without migration
- Missing tests for critical paths

### SUGGESTION

Should consider fixing.

```
SUGGESTION: Consider using processBatches() here for better error handling.
```

Examples:
- Pattern violations
- Performance concerns
- Missing error handling
- Documentation gaps

### NIT

Optional polish. Author can ignore.

```
nit: Could rename this to `fetchProducts` for consistency.
```

Examples:
- Style preferences
- Minor naming improvements
- Comment suggestions

### QUESTION

Seeking clarification.

```
QUESTION: Why do we need to check for null here? Can this ever be null?
```

---

## Review Checklist

### All PRs

- [ ] **Tests pass**: CI is green
- [ ] **Types compile**: `npx tsc --noEmit` passes
- [ ] **No `any` types**: Unless explicitly justified
- [ ] **Error handling**: Async operations have try/catch
- [ ] **Logging**: Uses Pino, not console.log

### Migration Code

- [ ] **Uses BCClient**: No direct axios calls
- [ ] **Rate limiting**: Respects 150 req/30s limit
- [ ] **Batch operations**: Uses `processBatches()` for bulk
- [ ] **Idempotency**: Checks for existing resources
- [ ] **Transformer tests**: New transformers have tests

### Dashboard Code

- [ ] **Semantic tokens**: Uses CSS variables, not raw colors
- [ ] **No dark mode overrides**: All theming in `globals.css`
- [ ] **Responsive**: Works on mobile
- [ ] **Accessible**: Keyboard navigation, ARIA labels

### Security

- [ ] **No credentials**: No hardcoded secrets
- [ ] **Input validation**: User input validated
- [ ] **Error messages**: Don't expose internals
- [ ] **Logging**: No PII in logs

---

## Review Process

### Before Reviewing

1. Read the PR description
2. Understand the context (linked issues, previous discussion)
3. Run the code locally if substantial changes

### During Review

1. **Start positive**: Note what's done well
2. **Be specific**: Point to exact lines
3. **Provide alternatives**: Don't just criticize
4. **Ask questions**: If unsure, ask rather than assume

### Example Good Review Comments

```markdown
SUGGESTION: This could use the `processBatches()` utility instead of
manual chunking. It handles partial failures automatically.

See docs/PATTERNS.md#batch-processing for the pattern.
```

```markdown
QUESTION: I see we're catching all errors here. Should we distinguish
between retriable errors (429, 5xx) and non-retriable ones?

The `isRetriableError()` utility in lib/errors.ts might help.
```

```markdown
BLOCKER: This logs the full customer object which includes email and
address. We should only log the customer ID and a hashed email.

See SECURITY.md#data-handling for the pattern.
```

### After Review

- Leave a summary comment
- Approve, request changes, or comment
- Be available for follow-up questions

---

## Response Time Targets

| PR Size | Target Response |
|---------|-----------------|
| < 100 lines | 24 hours |
| 100-500 lines | 48 hours |
| > 500 lines | 72 hours |

If you can't review in time, let the author know.

---

## Approval Criteria

### Requirements by Change Type

| Change Type | Approvals | Notes |
|-------------|-----------|-------|
| Documentation | 1 | Quick turnaround |
| Bug fix | 1 | Include test |
| New feature | 1 | Include tests, update docs |
| API change | 2 | Breaking change review |
| Architecture | 2 | Team discussion |

### Merge Requirements

- All BLOCKERS resolved
- Reasonable response to SUGGESTIONS
- CI passing
- Approved by required reviewers

---

## Common Review Points

### Code Quality

```typescript
// Watch for: Missing error context
catch (error) {
  throw error; // BLOCKER: Loses context
}

// Better:
catch (error) {
  throw wrapError(error, { sku, operation: 'createProduct' });
}
```

### Performance

```typescript
// Watch for: N+1 queries
for (const product of products) {
  const category = await getCategory(product.categoryId); // SUGGESTION
}

// Better: Batch fetch
const categories = await getCategoriesByIds(products.map(p => p.categoryId));
```

### Testing

```typescript
// Watch for: Missing edge cases
it('should migrate product', async () => {
  // Only tests happy path
});

// Better: Include error cases
it('should handle missing SKU', async () => { ... });
it('should handle API errors', async () => { ... });
```

---

## Self-Review Checklist

Before requesting review, authors should verify:

- [ ] I've read my own diff
- [ ] Tests are included and passing
- [ ] PR template is filled out
- [ ] Anti-pattern checks pass
- [ ] Documentation is updated if needed
- [ ] Commit messages are clear

---

## Visual/UI Review

For PRs that include dashboard changes, perform visual review in addition to code review.

### When to Perform Visual Review

- New pages or routes
- Component changes
- CSS/styling modifications
- Layout adjustments
- Responsive breakpoint changes

### Visual Review Checklist

#### Layout & Spacing

- [ ] **Consistent spacing**: Uses 4px/8px grid (p-2, p-4, gap-3, etc.)
- [ ] **Alignment**: Elements align to grid
- [ ] **Visual hierarchy**: Important content stands out
- [ ] **Balance**: Page feels visually balanced

#### Colors & Tokens

- [ ] **Semantic tokens**: No hardcoded hex colors
- [ ] **No dark mode overrides**: Dark mode handled in globals.css only
- [ ] **Status colors**: Correct colors for success/warning/error
- [ ] **Contrast**: Text readable against background

```tsx
// BLOCKER: Hardcoded colors
<div className="bg-white text-gray-900">

// CORRECT: Semantic tokens
<div className="bg-slate-900 text-slate-100">
```

#### Dark Mode Verification

Test in both modes:

- [ ] All text readable in light mode
- [ ] All text readable in dark mode
- [ ] No white-on-white or black-on-black
- [ ] Form inputs have visible borders
- [ ] Focus states visible in both modes

#### Responsive Design

Test at these breakpoints:

| Breakpoint | Width | Check |
|------------|-------|-------|
| Mobile | 375px | Layout adapts, no horizontal scroll |
| Tablet | 768px | Appropriate column layout |
| Desktop | 1280px | Content doesn't stretch too wide |

- [ ] Touch targets 44px minimum on mobile
- [ ] Text readable without zoom
- [ ] Navigation collapses appropriately

#### Accessibility

- [ ] **Focus rings**: All interactive elements have visible focus
- [ ] **Keyboard nav**: Can tab through all controls
- [ ] **ARIA labels**: Icon-only buttons have labels
- [ ] **Color alone**: Don't rely on color alone for meaning
- [ ] **Contrast ratio**: 4.5:1 for text, 3:1 for UI elements

#### Component Consistency

- [ ] **Button variants**: Uses correct variant (primary/secondary/ghost/danger)
- [ ] **Card structure**: Uses Card/CardHeader/CardContent properly
- [ ] **Badge variants**: Correct variant for status type
- [ ] **Alert variants**: Matches severity (info/success/warning/error)

### Screenshot Review

For significant visual changes, request screenshots:

```markdown
## Screenshots

| View | Light Mode | Dark Mode |
|------|------------|-----------|
| Desktop | ![](url) | ![](url) |
| Mobile | ![](url) | ![](url) |
```

### Visual Review Tools

- **Browser DevTools**: Responsive mode, accessibility panel
- **Lighthouse**: Accessibility audit score
- **WebAIM Contrast Checker**: Color contrast verification
- **VoiceOver/NVDA**: Screen reader testing

### Example Visual Review Comments

```markdown
BLOCKER: This card uses hardcoded `bg-white` which breaks dark mode.
Use `bg-slate-800` or Card component instead.

See docs/DESIGN_TOKENS.md for the token system.
```

```markdown
SUGGESTION: The spacing between these cards (gap-2) feels tight.
Consider gap-4 for consistency with other card grids.
```

```markdown
QUESTION: Should this button be primary or secondary? It's in a
modal footer which typically uses secondary for cancel actions.

See docs/COMPONENTS.md#button for variant guidelines.
```

---

## Gestalt Review Points

When reviewing layouts, consider these principles:

| Principle | Check |
|-----------|-------|
| **Proximity** | Related elements grouped together |
| **Similarity** | Similar elements look consistent |
| **Continuity** | Elements align on visual lines |
| **Closure** | Bounded regions are clear |
| **Figure-Ground** | Active elements stand out from background |

For comprehensive UI/UX review, see [UI_UX_REVIEW.md](./UI_UX_REVIEW.md).

---

## Related Documentation

- [CONTRIBUTING.md](../CONTRIBUTING.md) - Contribution process
- [PATTERNS.md](./PATTERNS.md) - Code patterns
- [SECURITY.md](../SECURITY.md) - Security guidelines
- [UI_UX_REVIEW.md](./UI_UX_REVIEW.md) - Comprehensive visual review
- [COMPONENTS.md](./COMPONENTS.md) - Component inventory
- [DESIGN_TOKENS.md](./DESIGN_TOKENS.md) - CSS token reference
- [USER_JOURNEYS.md](./USER_JOURNEYS.md) - User flow documentation
