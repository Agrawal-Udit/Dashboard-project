# Phase 1: Foundation - Research

**Researched:** 2026-04-03
**Domain:** TypeScript data contracts, pure utility functions, mock seed data
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FOUND-01 | Application has a TypeScript Transaction type with fields: id, date, amount, category, type (income\|expense), description | TypeScript discriminated union pattern via `type` literal field; centralized in `types/index.ts` |
| FOUND-02 | Application ships with 25-30 mock seed transactions spanning at least 3 months, covering multiple categories and both income/expense types | Category enum with color map in `constants/categories.ts`; mockData typed as `Transaction[]` initialized by store on first load |
| FOUND-03 | Utility functions exist for formatCurrency, formatDate, groupByCategory, and calcTotals (balance, income, expenses) | `Intl.NumberFormat` for currency; `date-fns` v4 `format` for dates; pure reduce/filter aggregation functions; `formatChartData` as a Recharts crash-prevention utility |
</phase_requirements>

---

## Summary

Phase 1 establishes the data contract that every downstream phase depends on. Because the project has no backend, the `Transaction` TypeScript type is the system boundary — every chart, KPI card, insight calculation, and export derives from it. Nothing else should be built until this contract is locked and seeded.

This phase is entirely free of framework complexity. There are no React components, no store subscriptions, no async operations. Every deliverable is a plain TypeScript file: a type definition, a constant map, a seed array, and four pure utility functions. This makes the work highly testable in isolation with Vitest before any UI exists.

The single most important deliverable in this phase is `formatChartData()`. According to the project's own pitfall research, Recharts crashes at runtime when data objects have missing keys — and the crash happens silently in production. Building and verifying this normalizer before any chart component is written is the key risk-prevention step for Phase 1.

**Primary recommendation:** Define types first, then constants, then seed data, then utilities — in that exact order. Each file depends only on files that came before it. Test all utilities against the seed dataset before Phase 1 is declared complete.

---

## Standard Stack

### Core (Phase 1 only)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TypeScript | 5.x (5.9+) | Type-safe data contracts | Required by Zustand v5; zero-cost abstraction for domain modeling |
| `date-fns` | ^4.1.0 | Date formatting and grouping | Pure ESM, tree-shakeable, immutable API, 100% TypeScript, ~20KB vs Moment's 300KB |
| `Intl.NumberFormat` (built-in) | Browser API | Currency formatting | No install required; locale-aware; handles negative, zero, and large numbers correctly |

### Supporting (used in Phase 1, installed in scaffold)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Vitest | ^3.x | Unit testing utilities and types | Test all pure functions against edge cases before any UI |
| `@testing-library/jest-dom` | ^6.x | DOM matchers (available even for non-DOM tests) | Extend Vitest's expect for consistency across phases |

### Phase 1 does NOT install

Phase 1 produces zero UI output. Do not install Recharts, Zustand, motion, react-hook-form, or any React-dependent library in this phase. Those belong to phases 2–6.

**Installation (Phase 1 scope):**
```bash
# Scaffold first
npm create vite@latest finance-dashboard -- --template react-ts
cd finance-dashboard

# Core utilities
npm install date-fns

# Test tooling
npm install -D vitest @vitest/coverage-v8 @testing-library/react @testing-library/jest-dom jsdom
```

---

## Architecture Patterns

### Recommended File Structure for Phase 1

```
src/
├── types/
│   └── index.ts           # Transaction, Category, TransactionType, SummaryTotals
├── constants/
│   └── categories.ts      # Category array with id, label, color fields
├── data/
│   └── mockData.ts        # Transaction[] seed array (25-30 entries, typed)
├── utils/
│   ├── financeUtils.ts    # calcTotals, groupByCategory, formatChartData
│   └── dateUtils.ts       # formatDate, formatCurrency, groupByMonth
└── (tests live alongside source or in __tests__)
    ├── utils/financeUtils.test.ts
    └── utils/dateUtils.test.ts
```

**Rule:** No file in Phase 1 imports from React, Zustand, Recharts, or any component. `utils/` and `types/` must remain pure throughout the entire project — later phases call them, they never call later phases.

---

### Pattern 1: Transaction Type as Discriminated Union

**What:** The `type` field uses a string literal union `'income' | 'expense'` as the discriminant. TypeScript narrows types automatically in conditionals and reduces/filters.

**When to use:** Everywhere `type` is checked — in aggregation, in UI conditional rendering, in filter functions.

**Example:**
```typescript
// src/types/index.ts
export type TransactionType = 'income' | 'expense';

export type Category =
  | 'housing'
  | 'food'
  | 'transport'
  | 'utilities'
  | 'entertainment'
  | 'healthcare'
  | 'education'
  | 'salary'
  | 'freelance'
  | 'investment'
  | 'other';

export interface Transaction {
  id: string;
  date: string;         // ISO 8601: "YYYY-MM-DD" — string, not Date object
  amount: number;       // Always positive; type field determines sign semantics
  category: Category;
  type: TransactionType;
  description: string;
}

export interface SummaryTotals {
  balance: number;
  income: number;
  expenses: number;
}

export interface CategoryTotal {
  category: Category;
  total: number;
  label: string;        // Display name from constants/categories.ts
  color: string;        // CSS color for charts
}

export interface ChartDataPoint {
  date: string;         // Month label for X-axis: "Jan 2026"
  income: number;
  expenses: number;
  balance: number;
}

export interface CategoryChartPoint {
  name: string;         // Category display label
  value: number;        // Total amount
  color: string;        // Fill color for Recharts PieChart
}
```

**Why `date` as string:** Storing dates as ISO `"YYYY-MM-DD"` strings prevents timezone-shift bugs when deserializing from localStorage (JSON.parse does not restore Date objects — it returns strings). `date-fns` accepts both strings and Date objects.

**Why `amount` always positive:** Keeps aggregation simple. `type` determines whether a transaction is added or subtracted. No negative amounts in the data model.

---

### Pattern 2: Category Constants with Color Map

**What:** Categories are defined as a constant array of objects (not an enum) with `id`, `label`, and `color` fields. Downstream code uses `id` to look up `label` and `color` for display.

**When to use:** Anywhere a category needs a human-readable label or a chart color (Recharts PieChart, transaction row badge).

**Example:**
```typescript
// src/constants/categories.ts
import type { Category } from '../types';

export interface CategoryMeta {
  id: Category;
  label: string;
  color: string;   // Tailwind-compatible hex or CSS custom property
}

export const CATEGORIES: CategoryMeta[] = [
  { id: 'housing',       label: 'Housing',       color: '#6366f1' },
  { id: 'food',          label: 'Food & Dining',  color: '#f59e0b' },
  { id: 'transport',     label: 'Transport',      color: '#10b981' },
  { id: 'utilities',     label: 'Utilities',      color: '#3b82f6' },
  { id: 'entertainment', label: 'Entertainment',  color: '#ec4899' },
  { id: 'healthcare',    label: 'Healthcare',     color: '#ef4444' },
  { id: 'education',     label: 'Education',      color: '#8b5cf6' },
  { id: 'salary',        label: 'Salary',         color: '#22c55e' },
  { id: 'freelance',     label: 'Freelance',      color: '#14b8a6' },
  { id: 'investment',    label: 'Investment',     color: '#f97316' },
  { id: 'other',         label: 'Other',          color: '#94a3b8' },
];

export const CATEGORY_MAP = new Map<Category, CategoryMeta>(
  CATEGORIES.map((c) => [c.id, c])
);

export const getCategoryMeta = (id: Category): CategoryMeta =>
  CATEGORY_MAP.get(id) ?? { id: 'other', label: 'Other', color: '#94a3b8' };
```

**Why not an enum:** TypeScript enums compile to runtime objects that add bundle weight. String literal unions with a constant array give the same type safety with zero runtime overhead and better tree-shaking.

---

### Pattern 3: Pure Aggregation Functions

**What:** Finance utility functions are pure (no side effects, no imports from React or Zustand). They accept `Transaction[]` and return plain objects or primitives.

**When to use:** Called by Zustand selector hooks (`useSummaryTotals`, `useTransactions`) and directly in tests. Never called from inside component render bodies.

**Example — calcTotals:**
```typescript
// src/utils/financeUtils.ts
import type { Transaction, SummaryTotals } from '../types';

export function calcTotals(transactions: Transaction[]): SummaryTotals {
  return transactions.reduce<SummaryTotals>(
    (acc, t) => {
      if (t.type === 'income') {
        return { ...acc, income: acc.income + t.amount, balance: acc.balance + t.amount };
      }
      return { ...acc, expenses: acc.expenses + t.amount, balance: acc.balance - t.amount };
    },
    { balance: 0, income: 0, expenses: 0 }
  );
}
```

**Example — groupByCategory:**
```typescript
import { getCategoryMeta } from '../constants/categories';
import type { Transaction, CategoryChartPoint } from '../types';

export function groupByCategory(transactions: Transaction[]): CategoryChartPoint[] {
  const expenseOnly = transactions.filter((t) => t.type === 'expense');
  const totals = new Map<string, number>();

  for (const t of expenseOnly) {
    totals.set(t.category, (totals.get(t.category) ?? 0) + t.amount);
  }

  return Array.from(totals.entries()).map(([category, value]) => {
    const meta = getCategoryMeta(category as never);
    return { name: meta.label, value, color: meta.color };
  });
}
```

---

### Pattern 4: formatChartData — Recharts Crash Prevention

**What:** A normalizer that converts raw `Transaction[]` into `ChartDataPoint[]` grouped by month. Every output object is guaranteed to have all keys (`date`, `income`, `expenses`, `balance`) so Recharts never receives an object with missing keys.

**This is the most critical utility in Phase 1.** The Recharts crash pitfall (Pitfall 1 in PITFALLS.md) happens when data objects have missing keys. Building and testing this normalizer before any chart component exists prevents the crash entirely.

**Example:**
```typescript
// src/utils/financeUtils.ts
import { format, parseISO } from 'date-fns';
import type { Transaction, ChartDataPoint } from '../types';

export function formatChartData(transactions: Transaction[]): ChartDataPoint[] {
  const monthMap = new Map<string, { income: number; expenses: number; balance: number }>();

  // Sort transactions chronologically before grouping
  const sorted = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  for (const t of sorted) {
    const monthKey = format(parseISO(t.date), 'MMM yyyy');
    const existing = monthMap.get(monthKey) ?? { income: 0, expenses: 0, balance: 0 };

    if (t.type === 'income') {
      monthMap.set(monthKey, {
        ...existing,
        income: existing.income + t.amount,
        balance: existing.balance + t.amount,
      });
    } else {
      monthMap.set(monthKey, {
        ...existing,
        expenses: existing.expenses + t.amount,
        balance: existing.balance - t.amount,
      });
    }
  }

  // Every output object has ALL required keys — no missing keys possible
  return Array.from(monthMap.entries()).map(([date, values]) => ({
    date,
    income: values.income,
    expenses: values.expenses,
    balance: values.balance,
  }));
}
```

**Key invariant:** The return type `ChartDataPoint[]` always has all four keys on every element, even for months with zero income or zero expenses. This is enforced by the `?? 0` initialization pattern.

---

### Pattern 5: formatCurrency and formatDate

**What:** Formatting utilities that handle edge cases (zero, negative, null/undefined inputs) without throwing.

**Why `Intl.NumberFormat` over custom logic:** Browser-native, handles locale-specific negative formatting (parentheses vs. minus sign in accounting mode), formats `0` cleanly as `$0.00`, and handles very large numbers correctly. No third-party dependency needed.

**Example:**
```typescript
// src/utils/dateUtils.ts
import { format, parseISO, isValid } from 'date-fns';

/**
 * Formats a currency amount.
 * - Returns "$0.00" for zero and negative zero
 * - Returns "-$X.XX" for negative values (standard accounting display)
 * - Returns "$X.XX" for positive values
 * - Returns "$0.00" for null/undefined inputs (safe fallback)
 */
export function formatCurrency(amount: number | null | undefined): string {
  const value = amount ?? 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Formats a date string (ISO "YYYY-MM-DD") or Date object.
 * - Returns formatted date for valid inputs
 * - Returns "Invalid date" for null/undefined/malformed inputs (safe fallback, never throws)
 */
export function formatDate(
  date: string | Date | null | undefined,
  formatStr: string = 'MMM d, yyyy'
): string {
  if (!date) return 'Invalid date';
  try {
    const parsed = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(parsed)) return 'Invalid date';
    return format(parsed, formatStr);
  } catch {
    return 'Invalid date';
  }
}
```

**Edge cases handled:**
- `formatCurrency(0)` → `"$0.00"` (not `"$-0.00"` or empty)
- `formatCurrency(-150)` → `"-$150.00"`
- `formatCurrency(null)` → `"$0.00"` (safe fallback)
- `formatCurrency(undefined)` → `"$0.00"` (safe fallback)
- `formatDate(null)` → `"Invalid date"` (no throw)
- `formatDate("not-a-date")` → `"Invalid date"` (no throw)

---

### Pattern 6: Seed Data Design

**What:** A `Transaction[]` constant in `data/mockData.ts` that covers all the edge cases required by the success criteria. The seed data is the first integration test for the utilities.

**Requirements for seed data:**
- 25–30 entries
- At least 3 distinct months (e.g., January, February, March 2026)
- All 11 category IDs represented at least once across the dataset
- Both `income` and `expense` types present
- At least 3–4 income transactions (salary, freelance, investment)
- Varying amounts: small (<$50), medium ($100–$500), large (>$1000)
- At least one transaction per category that will be used in chart grouping

**mockData.ts structure:**
```typescript
// src/data/mockData.ts
import type { Transaction } from '../types';

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'txn-001',
    date: '2026-01-05',
    amount: 4500,
    category: 'salary',
    type: 'income',
    description: 'Monthly salary',
  },
  // ... 24-29 more entries
];
```

**ID convention:** Use `'txn-001'` through `'txn-030'` — predictable IDs enable deterministic test assertions. Do NOT use `crypto.randomUUID()` in the seed file because that generates different IDs on every import in tests.

---

### Anti-Patterns to Avoid

- **Using `Date` objects in the Transaction type:** JSON serialization round-trips through localStorage destroy `Date` objects (they become strings). Store dates as ISO strings; parse only when formatting for display.
- **Negative amounts in the data model:** Makes aggregation logic branch on both sign and type. Keep amounts positive; use `type` as the sole indicator of income vs. expense.
- **Importing React or store in utils/:** `financeUtils.ts` and `dateUtils.ts` must remain pure. If any utility file starts importing from `'../store'` or `'react'`, it breaks testability and creates circular dependencies.
- **Category as a TypeScript enum:** Runtime enums add bundle overhead and create issues with `JSON.parse` round-trips. Use string literal unions with a constant array.
- **Hardcoding category colors inside chart components:** Chart colors belong in `constants/categories.ts`. Components read them from the constant — never hardcode hex values in component files.
- **`crypto.randomUUID()` in seed data:** Generates a different ID every import. Use fixed string IDs for deterministic tests.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Currency formatting | Custom `$` string concatenation | `Intl.NumberFormat` (built-in) | Handles locale conventions, negative display, decimal precision, negative zero edge cases |
| Date formatting | Manual month/day extraction with `getMonth()` | `date-fns` v4 `format` + `parseISO` | Handles timezone offsets, leap years, locale month names, and invalid date detection |
| UUID generation for seed IDs | `Math.random()` string | Fixed string constants (`'txn-001'`) | Deterministic IDs enable test assertions without mocking `crypto.randomUUID` |
| Category color lookup | Switch statement with 11 cases | `CATEGORY_MAP.get(id)` with fallback | O(1) lookup, type-safe, single source of truth for colors used across charts and badges |

**Key insight:** Phase 1 has near-zero third-party surface area. The main external dependency is `date-fns` for the two date utilities. Everything else is TypeScript, native browser APIs, or plain reduce/filter operations. This is intentional — pure data functions have no dependency tree to break.

---

## Common Pitfalls

### Pitfall 1: Recharts Crash from Missing Chart Data Keys

**What goes wrong:** When `formatChartData` is called on an empty array or on transactions spanning only one type (all income, no expenses), the resulting chart data objects may be missing `expenses: 0` or `income: 0`. Recharts reads all data objects and assumes consistent key presence. A missing key at index N causes a crash on hover or tooltip interaction.

**Why it happens:** Developers initialize the accumulator object lazily and only add keys that appear in the data. A month with only income entries never gets an `expenses` key.

**How to avoid:** Always initialize the accumulator with all keys set to `0`:
```typescript
const existing = monthMap.get(monthKey) ?? { income: 0, expenses: 0, balance: 0 };
```
Never use `Object.assign` or spreading partial objects. The spread creates a new full object every iteration; combined with `?? { ... }` initialization, all keys are guaranteed.

**Warning signs:** Chart works with full seed data but crashes when filtered to a single month or a single category.

---

### Pitfall 2: Date String Timezone Shift

**What goes wrong:** Constructing a `Date` object from an ISO date string `"2026-01-15"` in some JavaScript environments produces a UTC midnight Date, which when displayed in a UTC-5 timezone renders as January 14th.

**Why it happens:** `new Date("2026-01-15")` is parsed as UTC. Formatting with locale-aware methods shifts the date to the local timezone.

**How to avoid:** Always use `date-fns` `parseISO()` which parses the string as local time (not UTC) when it lacks a time component. Store dates as `"YYYY-MM-DD"` strings in the `Transaction` type and call `parseISO` only at the display boundary inside `formatDate`.

**Warning signs:** Transaction dated January 15th appears as January 14th in the UI.

---

### Pitfall 3: `calcTotals` Treating `amount` as Signed

**What goes wrong:** If seed data is accidentally created with negative amounts for expenses, `calcTotals` double-subtracts — the amount is already negative AND the `type === 'expense'` branch subtracts again.

**How to avoid:** Enforce the invariant in the type: `amount` is always a positive number. The `type` field is the sole determiner of sign semantics. Add a note in the type definition:
```typescript
amount: number; // Always positive; type determines whether added or subtracted
```
Add a test that verifies all seed transactions have `amount > 0`.

---

### Pitfall 4: `groupByCategory` Including Income Transactions

**What goes wrong:** The "spending breakdown" chart should show expense distribution, not total transaction volume. If `groupByCategory` includes income transactions, the `salary` category dominates the pie chart and the expense breakdown is meaningless.

**How to avoid:** Filter to `type === 'expense'` as the first operation in `groupByCategory`. Document this behavior in a JSDoc comment on the function.

---

## Code Examples

Verified patterns from official sources and project research:

### date-fns v4 basic usage
```typescript
// Source: https://date-fns.org/docs/format
import { format, parseISO } from 'date-fns';

// Parse ISO date string as local time (not UTC)
const date = parseISO('2026-01-15');

// Format for display
format(date, 'MMM d, yyyy');    // → "Jan 15, 2026"
format(date, 'MMM yyyy');       // → "Jan 2026" (chart X-axis label)
format(date, 'yyyy-MM-dd');     // → "2026-01-15" (round-trip storage)
```

### Intl.NumberFormat edge cases (confirmed browser behavior)
```typescript
// Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat
const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

fmt.format(0);       // → "$0.00"
fmt.format(-0);      // → "$0.00" (not "-$0.00")
fmt.format(-150.5);  // → "-$150.50"
fmt.format(1234567); // → "$1,234,567.00"
```

### Vitest unit test pattern for pure utility
```typescript
// src/utils/__tests__/financeUtils.test.ts
import { describe, it, expect } from 'vitest';
import { calcTotals, groupByCategory, formatChartData } from '../financeUtils';
import { MOCK_TRANSACTIONS } from '../../data/mockData';

describe('calcTotals', () => {
  it('returns zero totals for empty array', () => {
    expect(calcTotals([])).toEqual({ balance: 0, income: 0, expenses: 0 });
  });

  it('calculates correct totals from seed data', () => {
    const result = calcTotals(MOCK_TRANSACTIONS);
    expect(result.income).toBeGreaterThan(0);
    expect(result.expenses).toBeGreaterThan(0);
    expect(result.balance).toBe(result.income - result.expenses);
  });
});

describe('formatChartData', () => {
  it('returns empty array for empty input', () => {
    expect(formatChartData([])).toEqual([]);
  });

  it('every output object has all required keys', () => {
    const result = formatChartData(MOCK_TRANSACTIONS);
    for (const point of result) {
      expect(point).toHaveProperty('date');
      expect(point).toHaveProperty('income');
      expect(point).toHaveProperty('expenses');
      expect(point).toHaveProperty('balance');
    }
  });

  it('no data point has undefined or NaN values', () => {
    const result = formatChartData(MOCK_TRANSACTIONS);
    for (const point of result) {
      expect(typeof point.income).toBe('number');
      expect(typeof point.expenses).toBe('number');
      expect(typeof point.balance).toBe('number');
      expect(Number.isNaN(point.income)).toBe(false);
      expect(Number.isNaN(point.expenses)).toBe(false);
    }
  });
});
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Moment.js date formatting | `date-fns` v4 pure ESM | Moment deprecated 2020; date-fns v4 released 2024 | ~280KB bundle savings; immutable API prevents mutation bugs |
| TypeScript `enum` for categories | String literal union + const array | TS best practices evolved ~2022 | Zero runtime overhead; better JSON round-trip behavior |
| `new Date(isoString)` directly | `parseISO(isoString)` from date-fns | Recognized issue since Node 10 era | Prevents timezone-shift bugs in date display |
| Custom UUID (Math.random) | `crypto.randomUUID()` for runtime IDs, fixed strings for seed | crypto.randomUUID() became standard 2022 | Cryptographically safe; but seed data MUST use fixed strings |
| `Number.toFixed(2)` for currency | `Intl.NumberFormat` | Intl APIs matured ~2019, now universally supported | Locale-aware; handles negative, zero, accounting formats correctly |

**Deprecated/outdated:**
- Moment.js: Officially in maintenance mode; bundle is ~300KB; never use in new projects.
- TypeScript `const enum`: Has runtime issues with `isolatedModules` (required by Vite); use string literal unions.
- `new Date(string)`: Use `parseISO` from date-fns for consistent local-time parsing.

---

## Open Questions

1. **Vite scaffold already exists vs. fresh create**
   - What we know: The project root at `E:/Udit` contains only `.git` and `.planning` — no `src/` directory or `package.json` exists yet.
   - What's unclear: Whether `npm create vite@latest` should be run inside `E:/Udit` directly or in a subdirectory.
   - Recommendation: Run `npm create vite@latest .` (dot = current directory) to scaffold into `E:/Udit` directly, keeping the git repo at the project root. Confirm no conflicts with existing `.git` directory before running.

2. **`formatChartData` balance: cumulative vs. per-month**
   - What we know: The success criteria says "balance trend over time" for Phase 4 charts (DASH-02).
   - What's unclear: Whether `balance` in `ChartDataPoint` should be the running cumulative balance (each month adds to previous) or the per-month net (income minus expenses for that month only).
   - Recommendation: Implement cumulative balance. A running total produces the "balance trend" chart that shows account growth over time. A per-month net produces a bar chart of monthly surplus/deficit. Document this decision as a comment in `formatChartData`.

3. **Node version on the development machine**
   - What we know: Vite 8 requires Node 20.19+ or 22.12+. Node 18 is dropped.
   - What's unclear: The Node version currently installed in this environment.
   - Recommendation: Run `node --version` at the start of Phase 1 plan execution. If Node 18 is detected, document the upgrade requirement before any installation step.

---

## Validation Architecture

> `nyquist_validation` is `true` in `.planning/config.json` — this section is required.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 3.x |
| Config file | `vitest.config.ts` (Wave 0 — does not exist yet) |
| Quick run command | `npx vitest run src/utils` |
| Full suite command | `npx vitest run --coverage` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FOUND-01 | Transaction type compiles with zero type errors | Type check | `npx tsc --noEmit` | Wave 0 |
| FOUND-01 | Transaction type has all required fields | Unit | `npx vitest run src/types` | Wave 0 |
| FOUND-02 | mockData has 25–30 entries | Unit | `npx vitest run src/data` | Wave 0 |
| FOUND-02 | mockData spans at least 3 distinct months | Unit | `npx vitest run src/data` | Wave 0 |
| FOUND-02 | mockData contains both income and expense types | Unit | `npx vitest run src/data` | Wave 0 |
| FOUND-03 | `formatCurrency(0)` returns `"$0.00"` | Unit | `npx vitest run src/utils` | Wave 0 |
| FOUND-03 | `formatCurrency(-150)` returns `"-$150.00"` | Unit | `npx vitest run src/utils` | Wave 0 |
| FOUND-03 | `formatCurrency(null)` returns `"$0.00"` (no throw) | Unit | `npx vitest run src/utils` | Wave 0 |
| FOUND-03 | `formatDate(null)` returns `"Invalid date"` (no throw) | Unit | `npx vitest run src/utils` | Wave 0 |
| FOUND-03 | `calcTotals([])` returns `{ balance: 0, income: 0, expenses: 0 }` | Unit | `npx vitest run src/utils` | Wave 0 |
| FOUND-03 | `calcTotals(MOCK_TRANSACTIONS).balance === income - expenses` | Unit | `npx vitest run src/utils` | Wave 0 |
| FOUND-03 | `groupByCategory` excludes income transactions | Unit | `npx vitest run src/utils` | Wave 0 |
| FOUND-03 | `formatChartData([])` returns `[]` | Unit | `npx vitest run src/utils` | Wave 0 |
| FOUND-03 | Every `formatChartData` output object has `date`, `income`, `expenses`, `balance` | Unit | `npx vitest run src/utils` | Wave 0 |
| FOUND-03 | No output object from `formatChartData` contains `NaN` or `undefined` | Unit | `npx vitest run src/utils` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run src/utils src/data`
- **Per wave merge:** `npx vitest run --coverage`
- **Phase gate:** Full suite green (`npx tsc --noEmit && npx vitest run --coverage`) before Phase 2 begins

### Wave 0 Gaps (must be created before implementation tasks run)

- [ ] `vite.config.ts` — Vite scaffold base (from `npm create vite@latest`)
- [ ] `vitest.config.ts` — Vitest environment config with `environment: 'node'` (no jsdom needed for pure utility tests)
- [ ] `src/setupTests.ts` — `expect.extend(matchers)` from `@testing-library/jest-dom`
- [ ] `tsconfig.json` — add `"vitest/globals"` to `compilerOptions.types`
- [ ] `src/utils/__tests__/financeUtils.test.ts` — covers FOUND-03 (finance utilities)
- [ ] `src/utils/__tests__/dateUtils.test.ts` — covers FOUND-03 (date/currency formatting)
- [ ] `src/data/__tests__/mockData.test.ts` — covers FOUND-02 (seed data shape and coverage)

**Note:** Phase 1 utilities are pure functions with no DOM dependency. Use `environment: 'node'` in Vitest config for this phase's tests — it is faster and avoids jsdom overhead. Later phases that test React components will need jsdom, but that config is added in Phase 3+.

---

## Sources

### Primary (HIGH confidence)
- [Vite 8.0 Official Announcement](https://vite.dev/blog/announcing-vite8) — Node version constraint confirmed (20.19+ / 22.12+)
- [date-fns v4 Official Blog](https://blog.date-fns.org/v40-with-time-zone-support/) — v4 release, `parseISO` behavior confirmed
- [date-fns format docs](https://date-fns.org/docs/format) — format string tokens verified
- [MDN: Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat) — currency formatting, edge cases (zero, negative), signDisplay option
- [TypeScript Official Docs: Discriminated Unions](https://www.typescriptlang.org/play/typescript/meta-types/discriminate-types.ts.html) — string literal union pattern
- [Vitest official config docs](https://vitest.dev/config/) — environment options, setupFiles configuration

### Secondary (MEDIUM confidence)
- [Project PITFALLS.md](E:/Udit/.planning/research/PITFALLS.md) — Recharts crash pattern, CSV injection, role security pitfalls (verified against official GitHub issues)
- [Project ARCHITECTURE.md](E:/Udit/.planning/research/ARCHITECTURE.md) — file structure, naming conventions, data flow diagram
- [Project STACK.md](E:/Udit/.planning/research/STACK.md) — library versions, version compatibility table
- [Vitest + React Testing Library setup — Makers' Den](https://makersden.io/blog/guide-to-react-testing-library-vitest) — 2025 setup pattern confirmed
- [TypeScript discriminated union examples — CodeSpud 2025](https://www.codespud.com/2025/discriminated-unions-examples-typescript/) — pattern verification

### Tertiary (LOW confidence — informational only)
- [Currency handling in React — Jacob Paris](https://www.jacobparis.com/content/currency-handling) — `Intl.NumberFormat` recommendation

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — date-fns v4 and Intl.NumberFormat are well-documented; TypeScript type patterns are stable
- Architecture: HIGH — file structure and naming follow conventions established in project ARCHITECTURE.md with community consensus
- Code examples: HIGH — all patterns verified against official API documentation; no framework-specific behavior at risk of version changes
- Test patterns: HIGH — Vitest config pattern confirmed against official docs and 2025 community guides
- Pitfalls: HIGH — sourced from project PITFALLS.md which was researched against official GitHub issues

**Research date:** 2026-04-03
**Valid until:** 2026-07-03 (90 days — stable, no fast-moving parts in Phase 1 domain)
