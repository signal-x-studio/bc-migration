# Component Library

This document catalogs the dashboard UI components for BC-Migration.

---

## Table of Contents

- [Quick Reference](#quick-reference)
- [UI Components](#ui-components)
  - [Button](#button)
  - [Card](#card)
  - [Badge](#badge)
  - [Alert](#alert)
  - [Input](#input)
  - [Progress](#progress)
- [Feature Components](#feature-components)
  - [AssessmentCard](#assessmentcard)
  - [ConnectionForm](#connectionform)
  - [BatchProgress](#batchprogress)
  - [NextActions](#nextactions)
  - [ReportExport](#reportexport)
- [Layout Components](#layout-components)
  - [HelpPanel](#helppanel)
  - [ThemeToggle](#themetoggle)
- [Icons](#icons)
- [Design Guidelines](#design-guidelines)

---

## Quick Reference

```tsx
// UI Components
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge, StatusBadge, CountBadge } from '@/components/ui/Badge';
import { Alert, InlineAlert } from '@/components/ui/Alert';
import { Input, PasswordInput } from '@/components/ui/Input';
import { Progress, CircularProgress, StepProgress } from '@/components/ui/Progress';

// Feature Components
import { AssessmentCard } from '@/components/AssessmentCard';
import { ConnectionForm } from '@/components/ConnectionForm';
import { BatchProgress } from '@/components/BatchProgress';
import { NextActions } from '@/components/NextActions';
import { ReportExport } from '@/components/ReportExport';

// Layout Components
import { HelpPanel } from '@/components/HelpPanel';
import { ThemeToggle } from '@/components/ThemeToggle';
```

---

## UI Components

### Button

Primary action element with multiple variants.

**Import:**
```tsx
import { Button } from '@/components/ui/Button';
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'danger'` | `'primary'` | Visual style |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| `isLoading` | `boolean` | `false` | Show loading spinner |
| `disabled` | `boolean` | `false` | Disable interaction |

**Variants:**

| Variant | Use Case | Color |
|---------|----------|-------|
| `primary` | Main actions | Blue |
| `secondary` | Secondary actions | Slate |
| `ghost` | Tertiary actions | Transparent |
| `danger` | Destructive actions | Red |

**Usage:**

```tsx
// Primary action
<Button onClick={handleSubmit}>Save Changes</Button>

// Loading state
<Button isLoading disabled>Processing...</Button>

// Danger action
<Button variant="danger" onClick={handleDelete}>Delete</Button>

// With icon
<Button>
  <Zap className="w-4 h-4 mr-2" />
  Run Assessment
</Button>
```

**Accessibility:**
- Has `focus:ring-2` for keyboard navigation
- Disabled state uses `disabled:cursor-not-allowed`

---

### Card

Container for grouped content.

**Import:**
```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
```

**Card Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'bordered' \| 'elevated'` | `'default'` | Visual style |

**Variants:**

| Variant | Visual | Use Case |
|---------|--------|----------|
| `default` | Subtle background | Standard containers |
| `bordered` | With border | Distinct sections |
| `elevated` | Shadow | Prominent content |

**Usage:**

```tsx
<Card variant="bordered">
  <CardHeader>
    <CardTitle>Products Assessment</CardTitle>
    <CardDescription>Analyze product catalog compatibility</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Found 150 products to migrate</p>
  </CardContent>
  <CardFooter>
    <Button>Run Assessment</Button>
  </CardFooter>
</Card>
```

---

### Badge

Status indicators and labels.

**Import:**
```tsx
import { Badge, StatusBadge, CountBadge } from '@/components/ui/Badge';
```

**Badge Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'success' \| 'warning' \| 'danger' \| 'info' \| 'outline'` | `'default'` | Color scheme |

**Variants:**

| Variant | Color | Use Case |
|---------|-------|----------|
| `success` | Green | Ready, complete |
| `warning` | Yellow | Needs attention |
| `danger` | Red | Blockers, errors |
| `info` | Blue | Informational |
| `outline` | Border only | Not assessed |

**Convenience Components:**

```tsx
// Status indicators
<StatusBadge status="ready" />     // ✓ Ready (green)
<StatusBadge status="warning" />   // ⚠ Warnings (yellow)
<StatusBadge status="blocker" />   // ✕ Blockers (red)
<StatusBadge status="loading" />   // ◌ Assessing... (blue)

// Count badges
<CountBadge count={3} type="blocker" />  // "3 blockers"
<CountBadge count={5} type="warning" />  // "5 warnings"
```

---

### Alert

Contextual feedback messages.

**Import:**
```tsx
import { Alert, InlineAlert } from '@/components/ui/Alert';
```

**Alert Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'info' \| 'success' \| 'warning' \| 'error'` | `'info'` | Alert type |
| `title` | `string` | - | Optional heading |
| `onDismiss` | `() => void` | - | Show dismiss button |

**Usage:**

```tsx
// Success message
<Alert variant="success" title="Migration Complete">
  All 150 products migrated successfully.
</Alert>

// Warning with dismiss
<Alert variant="warning" onDismiss={() => setShow(false)}>
  Some products have validation warnings.
</Alert>

// Inline validation error
<InlineAlert variant="error">Invalid API key format</InlineAlert>
```

**Icons (automatic):**

| Variant | Icon |
|---------|------|
| `info` | Info circle |
| `success` | Check circle |
| `warning` | Triangle |
| `error` | X circle |

---

### Input

Form text input with validation.

**Import:**
```tsx
import { Input, PasswordInput } from '@/components/ui/Input';
```

**Input Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Input label |
| `error` | `string` | - | Error message |
| `hint` | `string` | - | Help text |

**Usage:**

```tsx
// Basic input
<Input
  label="Store URL"
  placeholder="https://mystore.com"
  value={url}
  onChange={(e) => setUrl(e.target.value)}
/>

// With error
<Input
  label="API Key"
  error="Invalid API key format"
  value={key}
  onChange={(e) => setKey(e.target.value)}
/>

// Password with toggle
<PasswordInput
  label="Consumer Secret"
  value={secret}
  onChange={(e) => setSecret(e.target.value)}
/>
```

**States:**
- Normal: `border-slate-700`
- Hover: `hover:border-slate-600`
- Focus: `focus:ring-2 focus:ring-blue-500`
- Error: `border-red-500`
- Disabled: `opacity-50`

---

### Progress

Progress indicators for operations.

**Import:**
```tsx
import { Progress, CircularProgress, StepProgress } from '@/components/ui/Progress';
```

**Progress (Linear) Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | required | Current value |
| `max` | `number` | `100` | Maximum value |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Bar height |
| `variant` | `'default' \| 'success' \| 'warning' \| 'danger'` | `'default'` | Color |
| `showLabel` | `boolean` | `false` | Show percentage |

**CircularProgress Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | required | Current value |
| `size` | `number` | `64` | Diameter in pixels |
| `strokeWidth` | `number` | `4` | Ring thickness |
| `variant` | string | `'default'` | Color variant |
| `showLabel` | `boolean` | `true` | Show percentage |

**Usage:**

```tsx
// Linear progress
<Progress value={75} showLabel />

// Circular (readiness score)
<CircularProgress
  value={85}
  size={80}
  variant={blockers > 0 ? 'danger' : 'success'}
/>

// Step progress (batch operations)
<StepProgress
  steps={[
    { label: 'Products', status: 'complete' },
    { label: 'Categories', status: 'active' },
    { label: 'Customers', status: 'pending' },
  ]}
/>
```

---

## Feature Components

### AssessmentCard

Displays assessment results for a single area.

**Import:**
```tsx
import { AssessmentCard } from '@/components/AssessmentCard';
```

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `area` | `AssessmentArea` | 'products', 'categories', etc. |
| `assessment` | `Assessment \| null` | Assessment results |
| `isLoading` | `boolean` | Loading state |
| `error` | `string \| null` | Error message |
| `count` | `number` | Item count |
| `onAssess` | `() => void` | Run assessment |
| `onViewDetails` | `() => void` | Navigate to details |

**Usage:**

```tsx
<AssessmentCard
  area="products"
  assessment={products}
  isLoading={loading.products}
  error={errors.products}
  count={storeInfo?.productCount}
  onAssess={() => handleAssess('products')}
  onViewDetails={() => router.push('/products')}
/>
```

---

### ConnectionForm

WooCommerce store connection form.

**Import:**
```tsx
import { ConnectionForm, APISetupGuide } from '@/components/ConnectionForm';
```

**Features:**
- URL validation
- Credential fields (Consumer Key, Consumer Secret)
- Error display
- Setup guide accordion

**Usage:**

```tsx
<ConnectionForm />
<APISetupGuide />
```

---

### BatchProgress

Shows progress during batch assessment.

**Import:**
```tsx
import { BatchProgress } from '@/components/BatchProgress';
```

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `currentArea` | `AssessmentArea \| null` | Currently assessing |
| `completedAreas` | `AssessmentArea[]` | Finished areas |
| `isRunning` | `boolean` | Operation in progress |

---

### NextActions

Contextual action recommendations.

**Import:**
```tsx
import { NextActions } from '@/components/NextActions';
```

Displays recommended next steps based on assessment state:
- If blockers: "Address blocking issues"
- If warnings: "Review warnings"
- If ready: "Proceed to migration"

---

### ReportExport

Export assessment report to JSON/PDF.

**Import:**
```tsx
import { ReportExport } from '@/components/ReportExport';
```

**Features:**
- JSON export for technical review
- PDF export for stakeholders
- Markdown export for documentation

---

## Layout Components

### HelpPanel

Contextual help panel (global).

**Import:**
```tsx
import { HelpPanel } from '@/components/HelpPanel';
```

Renders as overlay panel with:
- FAQ sections
- Quick links
- Support contact

---

### ThemeToggle

Dark/light mode toggle.

**Import:**
```tsx
import { ThemeToggle } from '@/components/ThemeToggle';
```

**Features:**
- System preference detection
- Persistent user preference
- Smooth transition

---

## Icons

All icons from [Lucide React](https://lucide.dev/).

**Common icons used:**

| Category | Icons |
|----------|-------|
| **Navigation** | `ArrowLeft`, `ArrowRight`, `ExternalLink`, `Link2` |
| **Status** | `CheckCircle`, `AlertTriangle`, `XCircle`, `Info` |
| **Actions** | `Play`, `RefreshCw`, `Download`, `Zap` |
| **Data** | `Package`, `FolderTree`, `Users`, `ShoppingCart` |
| **Settings** | `Settings`, `Eye`, `EyeOff` |

**Usage:**

```tsx
import { Zap, CheckCircle, AlertTriangle } from 'lucide-react';

<Zap className="w-5 h-5 text-blue-400" />
<CheckCircle className="w-4 h-4 text-green-400" />
```

---

## Design Guidelines

### Color Usage

Always use semantic tokens, not raw colors:

```tsx
// CORRECT
<div className="text-slate-300">Primary text</div>
<div className="text-slate-500">Secondary text</div>
<div className="bg-slate-800">Card background</div>

// WRONG - Raw hex values
<div className="text-[#cbd5e1]">Text</div>
```

### Status Colors

| Status | Text | Background |
|--------|------|------------|
| Success | `text-green-400` | `bg-green-500/20` |
| Warning | `text-yellow-400` | `bg-yellow-500/20` |
| Error | `text-red-400` | `bg-red-500/20` |
| Info | `text-blue-400` | `bg-blue-500/20` |

### Spacing

Use Tailwind spacing utilities on 4px grid:

| Size | Value | Use Case |
|------|-------|----------|
| `p-2` | 8px | Tight padding |
| `p-4` | 16px | Standard padding |
| `p-6` | 24px | Card padding |
| `gap-3` | 12px | Icon + text |
| `gap-4` | 16px | Card items |
| `space-y-4` | 16px | Stacked elements |

### Typography

| Element | Classes |
|---------|---------|
| Page title | `text-2xl font-bold text-slate-100` |
| Section title | `text-lg font-semibold text-slate-200` |
| Card title | `text-lg font-semibold text-slate-100` |
| Body text | `text-sm text-slate-300` |
| Secondary text | `text-sm text-slate-400` |
| Hint/caption | `text-xs text-slate-500` |

### Accessibility

All interactive components must have:

1. **Focus states**: `focus:ring-2 focus:ring-blue-500`
2. **Keyboard support**: Enter/Space activation
3. **ARIA labels** when icon-only
4. **Color contrast**: 4.5:1 minimum

```tsx
// Icon button needs aria-label
<button aria-label="Dismiss" onClick={onDismiss}>
  <X className="h-4 w-4" />
</button>
```

---

## Related Documentation

- [DESIGN_TOKENS.md](./DESIGN_TOKENS.md) - Color and spacing tokens
- [UI_UX_REVIEW.md](./UI_UX_REVIEW.md) - Visual review process
- [PATTERNS.md](./PATTERNS.md) - CSS patterns
