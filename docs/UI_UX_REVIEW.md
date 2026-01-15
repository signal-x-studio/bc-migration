# UI/UX Review Guide

This document defines the visual design and user experience review process for BC-Migration.

---

## Table of Contents

- [Philosophy](#philosophy)
- [Review Triggers](#review-triggers)
- [Visual Design Audit](#visual-design-audit)
- [Gestalt Principles Checklist](#gestalt-principles-checklist)
- [Layout & Spacing Audit](#layout--spacing-audit)
- [Typography Audit](#typography-audit)
- [Color & Contrast Audit](#color--contrast-audit)
- [Accessibility Audit](#accessibility-audit)
- [Dark Mode Verification](#dark-mode-verification)
- [Responsive Design Audit](#responsive-design-audit)
- [Interaction Design Audit](#interaction-design-audit)
- [User Flow Verification](#user-flow-verification)
- [Screenshot Review Process](#screenshot-review-process)

---

## Philosophy

- **Function before form**: Does it work correctly first?
- **Consistency over novelty**: Match existing patterns
- **Accessibility is non-negotiable**: WCAG 2.1 AA minimum
- **Test both modes**: Light and dark mode equally important
- **Mobile-first thinking**: Responsive is not optional

---

## Review Triggers

Perform UI/UX review when:

- [ ] New dashboard page or component
- [ ] Significant layout changes
- [ ] New interactive elements (forms, modals, wizards)
- [ ] Color or typography changes
- [ ] Accessibility complaints or audit findings
- [ ] Cross-browser issues reported

---

## Visual Design Audit

### Overall Impression

| Check | Pass | Notes |
|-------|------|-------|
| Visual hierarchy is clear | [ ] | |
| Important elements stand out | [ ] | |
| Page feels balanced | [ ] | |
| Whitespace is appropriate | [ ] | |
| No visual clutter | [ ] | |

### Brand Consistency

| Check | Pass | Notes |
|-------|------|-------|
| Uses semantic color tokens | [ ] | |
| Typography matches system | [ ] | |
| Icons are from consistent set | [ ] | |
| Spacing follows 8px grid | [ ] | |

---

## Gestalt Principles Checklist

Apply these perceptual principles to evaluate visual grouping:

### Proximity

Related items should be close together.

```
✅ CORRECT                    ❌ WRONG
┌─────────────────┐           ┌─────────────────┐
│ Product Name    │           │ Product Name    │
│ $29.99          │           │                 │
│ In Stock        │           │ $29.99          │
└─────────────────┘           │                 │
                              │ In Stock        │
                              └─────────────────┘
```

| Check | Pass |
|-------|------|
| Related form fields are grouped | [ ] |
| Card content has logical proximity | [ ] |
| Actions are near their targets | [ ] |
| Labels are closer to their inputs than other elements | [ ] |

### Similarity

Similar elements should look similar.

| Check | Pass |
|-------|------|
| All primary buttons look the same | [ ] |
| All links have consistent styling | [ ] |
| Status indicators use consistent colors | [ ] |
| Card layouts are uniform | [ ] |

### Continuity

Elements arranged on a line/curve are perceived as related.

| Check | Pass |
|-------|------|
| Navigation items align horizontally | [ ] |
| Form fields align vertically | [ ] |
| Progress indicators show clear direction | [ ] |
| Tables have consistent column alignment | [ ] |

### Closure

The mind completes incomplete shapes.

| Check | Pass |
|-------|------|
| Card boundaries are clear (even with minimal borders) | [ ] |
| Section dividers create clear regions | [ ] |
| Grouped items feel contained | [ ] |

### Figure-Ground

Elements should clearly separate from background.

| Check | Pass |
|-------|------|
| Modals stand out from page content | [ ] |
| Active/selected states are obvious | [ ] |
| Disabled elements are distinguishable | [ ] |
| Focus indicators are visible | [ ] |

### Common Region

Elements in the same bounded area are grouped.

| Check | Pass |
|-------|------|
| Related controls share a container | [ ] |
| Form sections have visual boundaries | [ ] |
| Sidebar is clearly separated from content | [ ] |

---

## Layout & Spacing Audit

### Spacing System (8px Grid)

| Token | Value | Usage |
|-------|-------|-------|
| `--spacing-xs` | 4px | Tight inline spacing |
| `--spacing-sm` | 8px | Related elements |
| `--spacing-md` | 16px | Between sections |
| `--spacing-lg` | 24px | Major sections |
| `--spacing-xl` | 32px | Page-level spacing |

### Audit Checklist

| Check | Pass | Notes |
|-------|------|-------|
| Spacing is consistent (not arbitrary) | [ ] | |
| Margins follow 8px multiples | [ ] | |
| Padding is uniform within components | [ ] | |
| Vertical rhythm is maintained | [ ] | |
| Content doesn't touch edges | [ ] | |

### Alignment Audit

| Check | Pass |
|-------|------|
| Text left-aligns (except centered headings) | [ ] |
| Numbers right-align in tables | [ ] |
| Form labels align consistently | [ ] |
| Buttons align with form fields | [ ] |
| Grid items align on baseline | [ ] |

---

## Typography Audit

### Hierarchy Check

| Level | Element | Size | Weight |
|-------|---------|------|--------|
| H1 | Page title | 2rem+ | Bold |
| H2 | Section title | 1.5rem | Semibold |
| H3 | Card title | 1.25rem | Semibold |
| Body | Content | 1rem | Regular |
| Small | Captions | 0.875rem | Regular |

### Audit Checklist

| Check | Pass | Notes |
|-------|------|-------|
| Only 2-3 font sizes per page | [ ] | |
| Headings use consistent hierarchy | [ ] | |
| Body text is readable (16px minimum) | [ ] | |
| Line height is comfortable (1.5+) | [ ] | |
| Line length is readable (50-75 chars) | [ ] | |
| No orphaned words at line ends | [ ] | |

---

## Color & Contrast Audit

### Token Usage

| Check | Pass | Notes |
|-------|------|-------|
| Uses semantic tokens (not hex values) | [ ] | |
| No hardcoded colors in components | [ ] | |
| Status colors match meaning (red=error) | [ ] | |
| Brand colors used sparingly | [ ] | |

### Contrast Requirements (WCAG 2.1 AA)

| Element | Minimum Ratio | Tool |
|---------|---------------|------|
| Body text | 4.5:1 | WebAIM Contrast Checker |
| Large text (18px+ bold, 24px+) | 3:1 | |
| UI components | 3:1 | |
| Focus indicators | 3:1 | |

### Audit Checklist

| Check | Pass | Notes |
|-------|------|-------|
| Text passes contrast check | [ ] | |
| Links are distinguishable | [ ] | |
| Error states are visible | [ ] | |
| Disabled states are perceivable | [ ] | |
| Don't rely on color alone | [ ] | |

---

## Accessibility Audit

### WCAG 2.1 AA Checklist

#### Perceivable

| Check | Pass | Notes |
|-------|------|-------|
| Images have alt text | [ ] | |
| Color is not only indicator | [ ] | |
| Text can be resized to 200% | [ ] | |
| Contrast ratios meet minimums | [ ] | |

#### Operable

| Check | Pass | Notes |
|-------|------|-------|
| All functions keyboard accessible | [ ] | |
| Focus order is logical | [ ] | |
| Focus indicator is visible | [ ] | |
| No keyboard traps | [ ] | |
| Skip links available | [ ] | |
| Touch targets are 44x44px minimum | [ ] | |

#### Understandable

| Check | Pass | Notes |
|-------|------|-------|
| Language is declared | [ ] | |
| Labels describe inputs | [ ] | |
| Error messages are helpful | [ ] | |
| Navigation is consistent | [ ] | |

#### Robust

| Check | Pass | Notes |
|-------|------|-------|
| Valid HTML structure | [ ] | |
| ARIA used correctly | [ ] | |
| Works with screen readers | [ ] | |

### Keyboard Navigation Patterns

```typescript
// Required keyboard support
- Tab: Move to next focusable element
- Shift+Tab: Move to previous element
- Enter: Activate button/link
- Space: Toggle checkbox, activate button
- Escape: Close modal/dropdown
- Arrow keys: Navigate within component (tabs, menus)
```

### Screen Reader Testing

Test with at least one:
- macOS: VoiceOver (Cmd+F5)
- Windows: NVDA (free) or JAWS
- Browser: Chrome Screen Reader extension

| Check | Pass |
|-------|------|
| Page title is descriptive | [ ] |
| Headings announce correctly | [ ] |
| Form labels are associated | [ ] |
| Buttons have accessible names | [ ] |
| Dynamic content announces | [ ] |

---

## Dark Mode Verification

### Critical Checks

| Check | Pass | Notes |
|-------|------|-------|
| All text is readable | [ ] | |
| No white-on-white issues | [ ] | |
| No black-on-black issues | [ ] | |
| Images/icons are visible | [ ] | |
| Form inputs have visible borders | [ ] | |
| Focus states are visible | [ ] | |
| Status colors work in both modes | [ ] | |

### Common Dark Mode Failures

```css
/* WRONG: Hardcoded colors break in dark mode */
.card {
  background: white;      /* Invisible in dark mode */
  color: #333;            /* Low contrast in dark mode */
}

/* CORRECT: Semantic tokens adapt automatically */
.card {
  background: var(--color-surface);
  color: var(--color-text-primary);
}
```

### Testing Process

1. Toggle to dark mode
2. Check every page
3. Test all interactive states (hover, focus, active)
4. Verify modals and dropdowns
5. Check form validation states
6. Review status messages

---

## Responsive Design Audit

### Breakpoints

| Name | Width | Device |
|------|-------|--------|
| Mobile | < 640px | Phones |
| Tablet | 640-1024px | Tablets |
| Desktop | > 1024px | Laptops+ |

### Audit Checklist

| Check | Pass | Notes |
|-------|------|-------|
| **Mobile (< 640px)** | | |
| Navigation collapses to menu | [ ] | |
| Content is single column | [ ] | |
| Touch targets are 44px+ | [ ] | |
| No horizontal scroll | [ ] | |
| Text is readable without zoom | [ ] | |
| **Tablet (640-1024px)** | | |
| Layout adapts appropriately | [ ] | |
| Sidebar behavior is correct | [ ] | |
| Tables scroll horizontally if needed | [ ] | |
| **Desktop (> 1024px)** | | |
| Content doesn't stretch too wide | [ ] | |
| Multi-column layouts work | [ ] | |
| Hover states are present | [ ] | |

### Testing Process

1. Use browser DevTools device mode
2. Test at each breakpoint boundary (639px, 640px, 1023px, 1024px)
3. Test actual devices when possible
4. Check both orientations (portrait/landscape)

---

## Interaction Design Audit

### Feedback States

| State | Visual Indicator | Required |
|-------|------------------|----------|
| Hover | Color change, cursor | Yes |
| Focus | Ring/outline | Yes (accessibility) |
| Active | Pressed appearance | Yes |
| Loading | Spinner, disabled | Yes |
| Disabled | Reduced opacity | Yes |
| Error | Red border, message | Yes |
| Success | Green indicator | Yes |

### Audit Checklist

| Check | Pass | Notes |
|-------|------|-------|
| Buttons have hover states | [ ] | |
| Links have hover states | [ ] | |
| Form inputs have focus rings | [ ] | |
| Loading states prevent double-submit | [ ] | |
| Disabled states are clear | [ ] | |
| Error states are obvious | [ ] | |
| Success feedback is shown | [ ] | |

### Micro-interactions

| Check | Pass |
|-------|------|
| Transitions are smooth (150-300ms) | [ ] |
| No jarring animations | [ ] |
| Progress indicators for long operations | [ ] |
| Confirmation for destructive actions | [ ] |

---

## User Flow Verification

### Critical Paths to Test

For BC-Migration dashboard:

1. **Assessment Flow**
   - [ ] Enter credentials
   - [ ] Start assessment
   - [ ] View progress
   - [ ] Review results
   - [ ] Export report

2. **Migration Flow**
   - [ ] Select migration type
   - [ ] Configure options
   - [ ] Start migration
   - [ ] Monitor progress
   - [ ] Handle errors
   - [ ] Review completion

3. **Validation Flow**
   - [ ] Start validation
   - [ ] View comparison results
   - [ ] Identify discrepancies
   - [ ] Export validation report

### Error Recovery

| Scenario | Expected Behavior | Pass |
|----------|-------------------|------|
| Network error | Show retry option | [ ] |
| API error | Show error message | [ ] |
| Validation error | Highlight fields | [ ] |
| Session timeout | Redirect to login | [ ] |

---

## Screenshot Review Process

### When to Capture

- Before/after significant changes
- Each responsive breakpoint
- Both light and dark mode
- All interactive states

### Screenshot Checklist

| Screenshot | Light | Dark | Mobile | Desktop |
|------------|-------|------|--------|---------|
| Landing page | [ ] | [ ] | [ ] | [ ] |
| Assessment form | [ ] | [ ] | [ ] | [ ] |
| Migration wizard | [ ] | [ ] | [ ] | [ ] |
| Progress view | [ ] | [ ] | [ ] | [ ] |
| Results page | [ ] | [ ] | [ ] | [ ] |
| Error states | [ ] | [ ] | [ ] | [ ] |

### Review Questions

For each screenshot, ask:

1. Is the visual hierarchy clear?
2. Are interactive elements obvious?
3. Is the layout balanced?
4. Does it feel like part of the same app?
5. Would a first-time user understand it?

---

## Tools

### Recommended Tools

| Purpose | Tool |
|---------|------|
| Contrast checking | [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) |
| Accessibility audit | Chrome DevTools Lighthouse |
| Screen reader | VoiceOver (macOS), NVDA (Windows) |
| Responsive testing | Browser DevTools |
| Visual diff | Percy, Chromatic |
| Color blindness | Sim Daltonism (macOS) |

### Browser DevTools Accessibility Panel

1. Open DevTools (F12)
2. Go to Elements tab
3. Select Accessibility panel
4. Review ARIA tree and computed properties

---

## Review Severity

Use these labels in UI/UX review comments:

### BLOCKER

Must fix before merge:
- Accessibility violations (WCAG A/AA)
- Broken functionality
- Invisible text (contrast failure)
- Keyboard traps

### SUGGESTION

Should strongly consider:
- Gestalt violations
- Inconsistent spacing
- Missing hover states
- Typography hierarchy issues

### NIT

Optional polish:
- Minor alignment issues
- Animation timing preferences
- Subjective visual preferences

---

## Related Documentation

- [DESIGN_TOKENS.md](./DESIGN_TOKENS.md) - Color and spacing tokens
- [PATTERNS.md](./PATTERNS.md) - CSS patterns
- [CODE_REVIEW.md](./CODE_REVIEW.md) - General review process
- [USER_JOURNEYS.md](./USER_JOURNEYS.md) - User flow documentation
- [COMPONENTS.md](./COMPONENTS.md) - Component inventory
