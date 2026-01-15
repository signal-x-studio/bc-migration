# Design Tokens

This document defines the CSS design token system for the BC-Migration dashboard.

---

## Architecture

The dashboard uses a **two-tier token system** to ensure consistent theming across light and dark modes.

```
Tier 1: Primitive Values (raw colors, spacing)
    ↓
Tier 2: Semantic Tokens (CSS variables)
    ↓
Components (Tailwind classes or CSS)
```

**Key Principle:** Components should ONLY use semantic tokens. Never use raw color values directly.

---

## Token Categories

### Background Tokens

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--color-base` | `#ffffff` | `#0a0a0a` | Page background |
| `--color-surface` | `#f8f9fa` | `#1a1a1a` | Cards, panels |
| `--color-surface-elevated` | `#ffffff` | `#262626` | Modals, dropdowns |
| `--color-sidebar-bg` | `#f8f9fa` | `#1a1a1a` | Sidebar background |

### Text Tokens

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--color-text-primary` | `#0a2540` | `#f1f5f9` | Headings, important text |
| `--color-text-secondary` | `#425466` | `#cbd5e1` | Body text, descriptions |
| `--color-text-tertiary` | `#8898aa` | `#94a3b8` | Placeholders, hints |

### Border Tokens

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--color-border` | `#e9ecef` | `#333333` | Card borders, dividers |
| `--color-border-light` | `#f1f3f5` | `#262626` | Subtle separators |
| `--color-sidebar-border` | `#e9ecef` | `#333333` | Sidebar dividers |

### Brand/Accent Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary` | `#635bff` | Primary actions, links |
| `--color-primary-hover` | `#5851ea` | Hover states |
| `--color-accent` | `#0d9488` | Secondary accent |

### Status Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--color-success` | `#10b981` | Success states, completed |
| `--color-warning` | `#f59e0b` | Warnings, attention |
| `--color-error` | `#ef4444` | Errors, failures |

---

## Spacing Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--spacing-xs` | `0.5rem` | Tight spacing |
| `--spacing-sm` | `1rem` | Default spacing |
| `--spacing-md` | `2rem` | Section spacing |
| `--spacing-lg` | `4rem` | Major sections |
| `--spacing-xl` | `6rem` | Page-level spacing |

---

## Typography Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--font-display` | System font stack | Headings |
| `--font-body` | System font stack | Body text |
| `--font-code` | `'SF Mono', 'Monaco', ...` | Code blocks |

---

## Tailwind Integration

The dashboard extends Tailwind with semantic color classes:

```tsx
// In tailwind.config.ts
colors: {
  docs: {
    bg: 'var(--docs-bg)',
    surface: 'var(--docs-surface)',
    border: 'var(--docs-border)',
    text: {
      primary: 'var(--docs-text-primary)',
      secondary: 'var(--docs-text-secondary)',
      tertiary: 'var(--docs-text-tertiary)',
    },
  },
}
```

**Usage:**
```tsx
<div className="bg-docs-surface text-docs-text-primary border-docs-border">
  Content
</div>
```

---

## Usage Patterns

### Correct Usage

```css
/* Use semantic tokens */
.card {
  background: var(--color-surface);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}
```

```tsx
/* Use Tailwind semantic classes */
<div className="bg-docs-surface text-docs-text-primary border border-docs-border rounded-lg p-4">
  <h2 className="text-docs-text-primary font-semibold">Title</h2>
  <p className="text-docs-text-secondary">Description</p>
</div>
```

### Incorrect Usage

```css
/* WRONG: Raw color values */
.card {
  background: #ffffff;
  color: #1a1a1a;
}

/* WRONG: Component-level dark mode overrides */
.card {
  background: white;
}
@media (prefers-color-scheme: dark) {
  .card {
    background: #1a1a1a;
  }
}
```

```tsx
/* WRONG: Hardcoded Tailwind colors */
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
  {/* Dark mode handling scattered */}
</div>
```

---

## Dark Mode Implementation

Dark mode is handled via the `.dark` class on `<html>`:

```css
/* In globals.css */
:root {
  --color-base: #ffffff;
  --color-text-primary: #0a2540;
}

.dark {
  --color-base: #0a0a0a;
  --color-text-primary: #f1f5f9;
}
```

**Tailwind Configuration:**
```ts
// tailwind.config.ts
darkMode: 'class'
```

**Why `.dark` class instead of `prefers-color-scheme`?**
- Allows user preference override
- Easier to test and debug
- Consistent with common frameworks

---

## Adding New Tokens

When you need a new token:

1. **Check if an existing token works:**
   - Review this document
   - Check `globals.css`

2. **Add to globals.css:**
   ```css
   :root {
     --my-new-token: #value;
   }

   .dark {
     --my-new-token: #dark-value;
   }
   ```

3. **Add Tailwind mapping (if needed):**
   ```ts
   // tailwind.config.ts
   extend: {
     colors: {
       'my-new': 'var(--my-new-token)',
     }
   }
   ```

4. **Document in this file**

---

## Status Colors

Status colors can be used directly as they're designed for both modes:

```tsx
// Success/Error/Warning feedback
<span className="text-green-600 dark:text-green-400">Success</span>
<span className="text-yellow-600 dark:text-yellow-400">Warning</span>
<span className="text-red-600 dark:text-red-400">Error</span>
```

For background states, use opacity variants:
```tsx
<div className="bg-green-500/10 text-green-700 dark:text-green-400">
  Success message
</div>
```

---

## Code Block Tokens

| Token | Light Mode | Dark Mode |
|-------|------------|-----------|
| `--docs-code-bg` | `#f8f9fa` | `#1a1a1a` |
| `--docs-code-text` | `#0a2540` | `#f1f5f9` |
| `--docs-code-border` | `#e9ecef` | `#333333` |

---

## Related Documentation

- [PATTERNS.md](./PATTERNS.md) - CSS patterns for components
- [CLAUDE.md](../CLAUDE.md) - Dashboard overview
