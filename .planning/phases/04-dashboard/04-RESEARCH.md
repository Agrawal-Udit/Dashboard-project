# Phase 4: Dashboard - Research

**Researched:** 2026-04-04
**Domain:** Recharts 3.x chart APIs, insights calculations, KPI card design, dashboard layout
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DASH-01 | User can see a summary panel with Total Balance, Total Income, and Total Expenses as KPI cards | `useSummaryTotals()` already returns `{ balance, income, expenses }`; KPI card wraps existing `Card` primitive + `formatCurrency` utility + Lucide icon |
| DASH-02 | User can see a time-series chart showing balance trend over time (at least 2 months of data visible) | `formatChartData()` returns `ChartDataPoint[]` with `date` (yyyy-MM key), `income`, `expenses`, `balance`; maps directly to Recharts `AreaChart` + `ResponsiveContainer`; explicit pixel-height parent required |
| DASH-03 | User can see a categorical chart showing spending breakdown by category (pie or bar) | `groupByCategory()` returns `CategoryChartPoint[]` with `name`, `value`, `color`; maps to Recharts `PieChart` + `Pie` + `Cell`; empty array renders nothing (no crash) — guard required |
| DASH-04 | User can see an insights section showing highest spending category, month-over-month comparison, and one additional observation — all NaN/Infinity-free | New `calcInsights()` pure function extracts from `Transaction[]`; all three observations computed with safe division guards; testable in isolation with Vitest |
</phase_requirements>

---

## Summary

Phase 4 builds the primary dashboard view from four pieces: KPI summary cards, a time-series area chart, a categorical donut chart, and an insights panel. All data sources already exist — `useSummaryTotals` delivers the KPI numbers, `formatChartData` produces the time-series shape, `groupByCategory` produces the pie chart shape, and a new `calcInsights` pure utility will extract three observations from raw `Transaction[]`.

The primary technical risk is Recharts `ResponsiveContainer` height in flex/grid containers. The established fix is wrapping `ResponsiveContainer` in a parent `<div>` with an explicit pixel height (e.g., `h-[300px]`). Using `height="100%"` inside a flex container where the parent has no explicit height causes the chart to render at zero height or trigger resize warnings — this is a long-standing open issue in the Recharts repository. Always use a pixel-height wrapper.

The second risk is SVG gradient fill and dark mode. Area chart gradient fills use `<defs><linearGradient>` inside the chart with `stopColor` pointing to the chart CSS variable. Unique IDs per gradient are mandatory to prevent the Safari black-gradient bug (duplicate IDs across multiple charts on the same page lose their fill reference in Safari). The CSS chart variable palette is already defined in `src/index.css` under `:root` and `html.dark` from Phase 3 and requires no changes.

The insights utility must be a standalone pure function (not inline in the component) so it can be unit-tested with Vitest. All three insight types — highest spending category, month-over-month expense change, and income-to-expense ratio — must guard against empty arrays, zero denominators, and months with no prior data before outputting any display string.

**Primary recommendation:** Build `calcInsights` as a testable pure function first, then compose the dashboard page from one KPI row, one two-column chart row, and one insights section. Use the existing `Card` primitive for all four panels. Guard every chart with an empty-state branch that renders a message instead of an empty Recharts container.

---

## Standard Stack

### Core (all already installed — Phase 4 installs nothing new)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `recharts` | `^3.8.1` | Time-series and categorical charts | Already installed; v3 fixes React 19 NaN PieChart bug present in v2.15.x |
| `lucide-react` | `^1.7.0` | KPI card icons | Already installed; exact icons: `Wallet`, `TrendingUp`, `TrendingDown`, `ArrowUpRight`, `ArrowDownRight` |
| `date-fns` | `^4.1.0` | Month label formatting in insights and chart tick | Already installed; `format(parseISO(date), 'MMM yyyy')` for axis tick display labels |
| `tailwindcss` | `^4.2.2` | Layout grid, responsive classes | Already configured |

### No new installs required

Phase 4 consumes libraries installed in Phases 1–3. Do not install additional chart libraries or icon packs.

---

## Architecture Patterns

### Recommended File Structure for Phase 4

```
src/
├── pages/
│   └── DashboardPage.tsx          # REPLACE placeholder; composes all four dashboard sections
├── components/
│   └── dashboard/
│       ├── KpiCard.tsx            # Single KPI metric card (icon + label + value)
│       ├── BalanceTrendChart.tsx  # ResponsiveContainer + AreaChart time-series
│       ├── SpendingPieChart.tsx   # ResponsiveContainer + PieChart donut
│       └── InsightsPanel.tsx      # Three insight observations from calcInsights()
├── utils/
│   └── insightsUtils.ts           # NEW: calcInsights() pure function
└── utils/__tests__/
    └── insightsUtils.test.ts      # NEW: Vitest unit tests for calcInsights()
```

**Rule:** `components/dashboard/` components call `useTransactions()` or `useSummaryTotals()` directly — they own their own data subscriptions. `DashboardPage.tsx` is purely a layout compositor with no store imports of its own.

---

### Pattern 1: AreaChart with Correct ResponsiveContainer Height

**What:** The definitive fix for `ResponsiveContainer` in a flex/grid parent is to wrap it in a `<div>` with an explicit Tailwind pixel height class. The chart then fills that container with `width="100%"` and `height="100%"`.

**Why:** `ResponsiveContainer` uses `ResizeObserver` to measure its parent. When the parent is a flex item without an explicit height, browsers disagree on its computed height, causing charts to render at zero height or log `width(-1) height(-1)` warnings. An explicit pixel height on the wrapper eliminates this ambiguity.

**Exact pattern:**
```tsx
// src/components/dashboard/BalanceTrendChart.tsx
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'
import type { ChartDataPoint } from '../../types'

interface Props {
  data: ChartDataPoint[]   // from formatChartData() — all keys guaranteed present
}

export function BalanceTrendChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-sm text-gray-400">
        No transaction data to display
      </div>
    )
  }

  return (
    // CRITICAL: explicit pixel height on wrapper — not height="100%" on the div
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <defs>
            {/* Unique gradient ID per chart — prevents Safari black-gradient bug */}
            <linearGradient id="balanceTrendGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="var(--chart-color-4)" stopOpacity={0.25} />
              <stop offset="95%" stopColor="var(--chart-color-4)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--recharts-grid-color, #e5e7eb)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tickFormatter={(val: string) => {
              // Convert "yyyy-MM" key to "Jan 2026" display label
              const [year, month] = val.split('-')
              const d = new Date(Number(year), Number(month) - 1, 1)
              return d.toLocaleString('en-US', { month: 'short', year: 'numeric' })
            }}
            tick={{ fill: 'var(--recharts-tick-color, #6b7280)', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(val: number) =>
              new Intl.NumberFormat('en-US', {
                style: 'currency', currency: 'USD',
                notation: 'compact', maximumFractionDigits: 1
              }).format(val)
            }
            tick={{ fill: 'var(--recharts-tick-color, #6b7280)', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={60}
          />
          <Tooltip content={<BalanceTrendTooltip />} />
          <Area
            type="monotone"
            dataKey="balance"
            stroke="var(--chart-color-4)"
            strokeWidth={2}
            fill="url(#balanceTrendGrad)"
            dot={false}
            activeDot={{ r: 4, fill: 'var(--chart-color-4)' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
```

**XAxis dataKey note:** `formatChartData()` returns `date` as a `yyyy-MM` string (e.g., `"2026-01"`). The `tickFormatter` converts this to `"Jan 2026"` for display. Do NOT change the `dataKey` — the key in the data must match the prop name exactly.

---

### Pattern 2: Custom Tooltip for Dark Mode

**What:** The built-in Recharts Tooltip uses a hardcoded white background that does not respect dark mode. Use a custom `content` component with Tailwind dark classes.

**TypeScript types (Recharts 3):**
```tsx
// CHANGED in Recharts 3: content prop receives TooltipContentProps, not TooltipProps
import type { TooltipProps } from 'recharts'
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'

function BalanceTrendTooltip(props: TooltipProps<ValueType, NameType>) {
  const { active, payload, label } = props
  if (!active || !payload || payload.length === 0) return null

  // Convert yyyy-MM key to display string
  const [year, month] = String(label).split('-')
  const monthLabel = new Date(Number(year), Number(month) - 1, 1)
    .toLocaleString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="rounded-md border border-gray-200 bg-white px-3 py-2 shadow-md
                    dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
      <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
        {monthLabel}
      </p>
      {payload.map((entry) => (
        <p key={entry.dataKey as string} className="text-sm font-semibold">
          {String(entry.name)}: {
            new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
              .format(Number(entry.value))
          }
        </p>
      ))}
    </div>
  )
}
```

**Alt approach for axis tick/grid dark mode:** Add CSS variables for text and grid colors in `index.css`. Since these are inline SVG attributes (not CSS properties), CSS variables in `tick={{ fill: 'var(--recharts-tick-color)' }}` work via SVG attribute resolution:

```css
/* Add to src/index.css :root block */
--recharts-tick-color: #6b7280;
--recharts-grid-color: #e5e7eb;

/* Add to src/index.css html.dark block */
html.dark {
  --recharts-tick-color: #9ca3af;
  --recharts-grid-color: #374151;
}
```

---

### Pattern 3: PieChart (Donut) with Empty State Guard

**What:** PieChart with `innerRadius` for donut style. `Cell` uses CSS variable fill per category. Empty array renders nothing in Recharts (no crash, just blank) — guard before rendering.

**Verified Recharts 3 behavior:** Recharts 3 fixes the React 19 NaN PieChart bug from v2.15.x. `PieChart` with an empty `data` array renders nothing without crashing. However, a blank space is not a "meaningful empty state" per DASH requirements — conditionally render the message instead.

```tsx
// src/components/dashboard/SpendingPieChart.tsx
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { CategoryChartPoint } from '../../types'

interface Props {
  data: CategoryChartPoint[]   // from groupByCategory() — already filtered to expenses only
}

export function SpendingPieChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-sm text-gray-400">
        No spending data to display
      </div>
    )
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius="40%"   // donut style
            outerRadius="70%"
            paddingAngle={2}
            label={({ name, percent }) =>
              percent > 0.05   // only label segments > 5% to avoid overlap
                ? `${name} ${(percent * 100).toFixed(0)}%`
                : ''
            }
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}   // hex from CATEGORIES constant — always present
              />
            ))}
          </Pie>
          <Tooltip content={<SpendingTooltip />} />
          <Legend
            formatter={(value) => (
              <span className="text-xs text-gray-700 dark:text-gray-300">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
```

**Cell fill note:** `groupByCategory()` returns `color` as a hex string from `CATEGORIES` constant (e.g., `#6366f1`). Do NOT use CSS variable strings here — `Cell.fill` expects a resolved color value for SVG attributes, and the hex values from the constants already have dark-mode counterparts defined in `index.css`. If the requirement for dark-mode SVG repaint is needed, switch to `var(--chart-color-N)` pattern with an index-based lookup array.

**Deciding between hex vs CSS variable for Cell:** The existing `CategoryChartPoint.color` field holds hex values from `CATEGORIES` constants, which are the light-mode colors. These will not change when dark mode activates. For dark-mode responsive pie segments, an additional mapping from category to CSS variable index would be needed. Given the Phase 3 research confirmed CSS variables work in SVG `fill` attributes, the cleanest approach is an index-based CSS variable array rather than the hex from the constant:

```tsx
// Replace per-category hex with CSS variable array for dark mode support
const PIE_CHART_COLORS = [
  'var(--chart-color-1)', 'var(--chart-color-2)', 'var(--chart-color-3)',
  'var(--chart-color-4)', 'var(--chart-color-5)', 'var(--chart-color-6)',
  'var(--chart-color-7)', 'var(--chart-color-8)', 'var(--chart-color-9)',
  'var(--chart-color-10)', 'var(--chart-color-11)',
]
// Then: fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]}
```

This is consistent with the Phase 3 pattern and enables dark mode color switching.

---

### Pattern 4: calcInsights() Pure Utility Function

**What:** A standalone pure function that accepts `Transaction[]` and returns a typed `DashboardInsights` object with all three observations. Pure function = testable in isolation, no React/store imports.

**Three required observations:**
1. Highest spending category by total expense amount
2. Month-over-month expense change as percentage (current month vs previous month)
3. Third observation: income-to-expense ratio (income / expenses, expressed as "for every $1 spent, you earn $X.XX")

**Edge case matrix:**

| Condition | Observation 1 | Observation 2 | Observation 3 |
|-----------|--------------|--------------|--------------|
| Empty array | `null` | `null` | `null` |
| All income (no expenses) | `null` | `"No expense data"` | `null` (expenses = 0, avoid division) |
| Only one month of data | returns category | `"No prior month to compare"` | returns ratio |
| Previous month expenses = 0 | — | `"New month — no previous expenses"` | — |
| Current month expenses = 0 | — | `"No expenses this month"` | — |

**Implementation pattern:**
```typescript
// src/utils/insightsUtils.ts
import { format, parseISO } from 'date-fns'
import type { Transaction } from '../types'
import { getCategoryMeta } from '../constants/categories'
import type { Category } from '../types'

export interface DashboardInsights {
  highestCategory: { name: string; amount: number } | null
  monthOverMonth: {
    currentMonth: string
    previousMonth: string
    changePercent: number    // positive = increase, negative = decrease
    currentExpenses: number
    previousExpenses: number
  } | null
  incomeExpenseRatio: number | null   // income / expenses; null when expenses === 0
}

export function calcInsights(transactions: Transaction[]): DashboardInsights {
  if (transactions.length === 0) {
    return { highestCategory: null, monthOverMonth: null, incomeExpenseRatio: null }
  }

  // --- Observation 1: highest spending category ---
  const expenseTotals = new Map<string, number>()
  for (const t of transactions) {
    if (t.type === 'expense') {
      expenseTotals.set(t.category, (expenseTotals.get(t.category) ?? 0) + t.amount)
    }
  }
  let highestCategory: DashboardInsights['highestCategory'] = null
  if (expenseTotals.size > 0) {
    let maxAmount = 0
    let maxCat = ''
    for (const [cat, amt] of expenseTotals) {
      if (amt > maxAmount) { maxAmount = amt; maxCat = cat }
    }
    const meta = getCategoryMeta(maxCat as Category)
    highestCategory = { name: meta.label, amount: maxAmount }
  }

  // --- Observation 2: month-over-month expense comparison ---
  // Group expenses by yyyy-MM key, sort chronologically
  const monthExpenses = new Map<string, number>()
  for (const t of transactions) {
    if (t.type === 'expense') {
      const key = format(parseISO(t.date), 'yyyy-MM')
      monthExpenses.set(key, (monthExpenses.get(key) ?? 0) + t.amount)
    }
  }
  const sortedMonths = Array.from(monthExpenses.keys()).sort()
  let monthOverMonth: DashboardInsights['monthOverMonth'] = null
  if (sortedMonths.length >= 2) {
    const currentKey = sortedMonths[sortedMonths.length - 1]
    const previousKey = sortedMonths[sortedMonths.length - 2]
    const currentExpenses = monthExpenses.get(currentKey) ?? 0
    const previousExpenses = monthExpenses.get(previousKey) ?? 0
    // Safe division: previousExpenses > 0 guard prevents Infinity/NaN
    const changePercent = previousExpenses > 0
      ? ((currentExpenses - previousExpenses) / previousExpenses) * 100
      : 0   // 0% change when there's nothing to compare against
    monthOverMonth = { currentMonth: currentKey, previousMonth: previousKey,
                       changePercent, currentExpenses, previousExpenses }
  }

  // --- Observation 3: income-to-expense ratio ---
  let totalIncome = 0
  let totalExpenses = 0
  for (const t of transactions) {
    if (t.type === 'income') totalIncome += t.amount
    else totalExpenses += t.amount
  }
  // Avoid divide-by-zero: return null when expenses = 0
  const incomeExpenseRatio = totalExpenses > 0
    ? totalIncome / totalExpenses
    : null

  return { highestCategory, monthOverMonth, incomeExpenseRatio }
}
```

**Why a utility, not inline in the component:** The requirement explicitly asks for NaN/Infinity-free values. A pure utility is unit-testable in Vitest before the component exists. Components should never contain business logic — they receive computed results as props or from a selector hook.

---

### Pattern 5: KPI Card Design

**What:** Three KPI cards in a responsive row. Each card shows: icon, label, and formatted value. Trend indicators are optional for Phase 4 but add visual quality.

**Lucide icons for each metric:**
- Total Balance: `Wallet` (wallet icon — neutral, represents account state)
- Total Income: `TrendingUp` (trending-up line — earnings direction)
- Total Expenses: `TrendingDown` (trending-down line — spending direction)

**KPI card pattern:**
```tsx
// src/components/dashboard/KpiCard.tsx
import type { LucideIcon } from 'lucide-react'
import { Card } from '../ui/Card'
import { formatCurrency } from '../../utils/dateUtils'

interface KpiCardProps {
  label: string
  value: number
  icon: LucideIcon
  variant?: 'neutral' | 'positive' | 'negative'
}

export function KpiCard({ label, value, icon: Icon, variant = 'neutral' }: KpiCardProps) {
  const iconColors = {
    neutral:  'text-blue-500  dark:text-blue-400',
    positive: 'text-green-500 dark:text-green-400',
    negative: 'text-red-500   dark:text-red-400',
  }
  return (
    <Card className="flex items-center gap-4 p-5">
      <div className={`rounded-full bg-gray-100 p-3 dark:bg-gray-700 ${iconColors[variant]}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {formatCurrency(value)}
        </p>
      </div>
    </Card>
  )
}
```

**Empty state for KPI cards:** Show `$0.00` (the `formatCurrency(0)` output). KPI cards with zero values are a valid, meaningful state — they communicate "no transactions yet" without special handling.

---

### Pattern 6: Dashboard Page Layout

**What:** Three-section layout: KPI cards row, charts row (area left, pie right), insights panel.

**Responsive grid:**
```tsx
// src/pages/DashboardPage.tsx (structure)
export function DashboardPage() {
  const totals = useSummaryTotals()
  const transactions = useTransactions()
  const chartData = useMemo(() => formatChartData(transactions), [transactions])
  const categoryData = useMemo(() => groupByCategory(transactions), [transactions])
  const insights = useMemo(() => calcInsights(transactions), [transactions])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>

      {/* KPI cards — 1 col mobile, 3 col tablet+ */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Total Balance"  value={totals.balance}  icon={Wallet}      variant="neutral" />
        <KpiCard label="Total Income"   value={totals.income}   icon={TrendingUp}  variant="positive" />
        <KpiCard label="Total Expenses" value={totals.expenses} icon={TrendingDown} variant="negative" />
      </div>

      {/* Charts — stacked mobile, side-by-side from md+ */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
            Balance Trend
          </h2>
          <BalanceTrendChart data={chartData} />
        </Card>
        <Card>
          <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
            Spending by Category
          </h2>
          <SpendingPieChart data={categoryData} />
        </Card>
      </div>

      {/* Insights panel */}
      <InsightsPanel insights={insights} />
    </div>
  )
}
```

**Responsive breakpoints:**
- `grid-cols-1`: stacked (mobile, 375px)
- `sm:grid-cols-3`: KPI cards 3-up (≥640px tablet)
- `md:grid-cols-2`: charts side-by-side (≥768px)

---

### Pattern 7: formatChartData Output → Recharts Mapping

**Critical facts about the existing `formatChartData` utility:**
- Returns `ChartDataPoint[]` where `date` is a `yyyy-MM` string (e.g., `"2026-01"`)
- The `balance` field is the **per-month net** (income − expenses for that month), NOT cumulative — see the comment in `financeUtils.ts` line 43
- All four keys (`date`, `income`, `expenses`, `balance`) are guaranteed present on every element

**XAxis `dataKey` mapping:**
```
ChartDataPoint.date (string "yyyy-MM") → XAxis dataKey="date"
tickFormatter: "2026-01" → "Jan 2026" via Date constructor
```

**Area `dataKey` mapping:**
```
dataKey="balance"   → per-month net balance line/area
dataKey="income"    → optional second area for income overlay
dataKey="expenses"  → optional third area for expenses overlay
```

**Cumulative balance note:** The Phase 1 decision log records: "formatChartData balance is per-month net — cumulative running balance computed by Phase 2 chart selector hook." However, no such hook was built in Phase 2. Phase 4 must compute cumulative balance inline if needed for a true "balance trend" chart. A `useMemo` reducer over `ChartDataPoint[]` can produce cumulative values:

```typescript
// Compute cumulative balance from per-month net values
const cumulativeChartData = useMemo(() => {
  let running = 0
  return chartData.map((point) => {
    running += point.balance   // point.balance = per-month net
    return { ...point, cumulativeBalance: running }
  })
}, [chartData])
// Then use dataKey="cumulativeBalance" on the Area component
```

---

### Anti-Patterns to Avoid

- **`height="100%"` on ResponsiveContainer inside a flex item with no explicit parent height:** Renders at zero height or causes infinite resize loop. Always use a pixel-height wrapper div.
- **Duplicate linearGradient IDs across charts:** Safari renders black fill when the last gradient with a given ID is removed. Use unique IDs per chart component (e.g., `"balanceTrendGrad"`, `"incomeTrendGrad"`).
- **Inline insights calculations in the component render body:** Move all aggregations to `calcInsights()`. Component render bodies should read from memoized values, not compute them.
- **`connectNulls` default behavior change in Recharts 3:** In v3, `connectNulls={true}` now treats `null` datapoints as `0` instead of skipping them. With `formatChartData()` guaranteeing no null values, this prop is irrelevant for this project, but do not set it to `true` unintentionally.
- **Using `groupByCategory()` output colors for dark mode:** The `color` field is a static hex from `CATEGORIES` constant. It will not repaint when dark mode activates. Use the CSS variable array pattern (`PIE_CHART_COLORS`) for dark-mode-reactive pie segments.
- **No guard before rendering charts on empty data:** `AreaChart` with an empty `data` array renders a chart frame with no content. `PieChart` renders nothing. Both are poor empty states. Guard with `if (data.length === 0)` before the `ResponsiveContainer`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Time-series visualization | Custom SVG path or canvas drawing | `recharts AreaChart` | Handles axis scaling, tooltip interaction, animation, responsive resize |
| Categorical spending breakdown | Custom SVG pie segments | `recharts PieChart` + `Pie` + `Cell` | Handles arc math, label placement, legend, active sector highlighting |
| Currency compact formatting ($1.2k) | Custom number-to-string function | `Intl.NumberFormat` with `notation: 'compact'` | Handles locale rules, SI suffixes (k/M/B), rounding edge cases |
| Responsive chart container | Manual `ResizeObserver` + `useState` for chart width | `recharts ResponsiveContainer` | Already wraps ResizeObserver correctly; just provide a pixel-height parent |
| Dark mode tooltip | Custom tooltip with `window.matchMedia` | Tailwind `dark:` classes on tooltip wrapper div | ThemeSync already manages `html.dark` class; Tailwind dark: utilities activate automatically |
| Month-over-month calculation | Date arithmetic with `getMonth()` / `getFullYear()` | String sort on `yyyy-MM` keys (already in `formatChartData` output) | `yyyy-MM` strings sort lexicographically in chronological order; no date parsing needed |

**Key insight:** All chart data transformation is already done by Phase 1 utilities. Phase 4 consumes their output shapes directly — no additional data transformation libraries needed.

---

## Common Pitfalls

### Pitfall 1: ResponsiveContainer Height Zero in Flex Layout

**What goes wrong:** Chart appears to render but is invisible. No error in console.
**Why it happens:** `ResponsiveContainer` measures its parent's computed height. In a flex container where the parent height is `auto`, the computed height is 0 before the chart renders, so the chart mounts at 0px × 0px.
**How to avoid:** Always wrap `ResponsiveContainer` in a `<div className="h-[300px] w-full">`. Do NOT use `height="100%"` on the wrapper div unless the wrapper's parent also has an explicit height.
**Warning signs:** Chart frame/border appears but no chart content; browser dev tools show chart element at 0 height.

---

### Pitfall 2: Safari Black Gradient (Duplicate linearGradient IDs)

**What goes wrong:** Area chart fill is solid black instead of the gradient color, but only in Safari.
**Why it happens:** When two `<linearGradient>` elements share the same `id` attribute in the same SVG document, Safari removes the earlier one when the later one is removed from the DOM. The `fill="url(#colorId)"` reference then has no valid target and falls back to the SVG default fill (black).
**How to avoid:** Every `<linearGradient>` must have a globally unique `id`. Use component-scoped names like `"balanceTrendGrad"`, `"incomeTrendGrad"` — never generic names like `"color"` or `"gradient"`.
**Warning signs:** Gradient works in Chrome/Firefox, renders black in Safari; appears fine when only one chart is on the page.

---

### Pitfall 3: Division by Zero in Insights

**What goes wrong:** `incomeExpenseRatio` returns `Infinity`, `changePercent` returns `NaN` or `Infinity`, and these values render as "NaN%" or "Infinity" in the UI.
**Why it happens:** JavaScript division by zero yields `Infinity`; `0/0` yields `NaN`. Both slip through `typeof` checks.
**How to avoid:** Guard every division: `denominator > 0 ? numerator / denominator : null`. Use `Number.isFinite(value)` before formatting.
**Warning signs:** UI shows "NaN%" or "Infinity" in the insights panel, especially on fresh load or when filtering to income-only data.

---

### Pitfall 4: Recharts 3 — `connectNulls` Changed Semantics

**What goes wrong:** An area chart that worked in Recharts 2.x now renders differently after upgrading.
**Why it happens:** In Recharts 3, `connectNulls={true}` treats `null` as `0` instead of bridging over the gap. This is a breaking change in the migration guide.
**How to avoid:** Do not set `connectNulls`. Since `formatChartData()` guarantees no null values, the prop is irrelevant and should be omitted.

---

### Pitfall 5: Recharts 3 Custom Tooltip Type Changed

**What goes wrong:** TypeScript error: `Property 'payload' does not exist on type ...` when typing a custom tooltip.
**Why it happens:** In Recharts 3, the custom `content` prop receives `TooltipContentProps` not the old `TooltipProps`. The generic type parameter order changed.
**How to avoid:** Import `TooltipProps` from `'recharts'` and use `TooltipProps<ValueType, NameType>`. Import `ValueType` and `NameType` from `'recharts/types/component/DefaultTooltipContent'`.

---

### Pitfall 6: `formatChartData` Balance is Per-Month Net, Not Cumulative

**What goes wrong:** The area chart shows wildly oscillating balance lines rather than a smooth upward trend.
**Why it happens:** `ChartDataPoint.balance` is per-month net (income − expenses for that month). January might be +$2000 and February might be +$1800 — the line drops even though the account balance is still growing.
**How to avoid:** For a "balance trend" chart, compute cumulative balance via a `useMemo` scan before passing to `AreaChart`. Use `dataKey="cumulativeBalance"` on the `Area` component.

---

## Code Examples

Verified patterns from official sources and confirmed working with the project's installed versions:

### XAxis tickFormatter: yyyy-MM to "Jan 2026"
```typescript
// Source: project financeUtils.ts — yyyy-MM is the existing date key format
tickFormatter={(val: string) => {
  const [year, month] = val.split('-')
  return new Date(Number(year), Number(month) - 1, 1)
    .toLocaleString('en-US', { month: 'short', year: 'numeric' })
}}
// "2026-01" → "Jan 2026"
// "2026-03" → "Mar 2026"
```

### Month-over-month calculation (safe division)
```typescript
// Only compute when sortedMonths.length >= 2 ensures previousExpenses key exists
const changePercent = previousExpenses > 0
  ? ((currentExpenses - previousExpenses) / previousExpenses) * 100
  : 0
// result: -10.5 means "10.5% decrease", +12.0 means "12% increase"
```

### Cumulative balance from per-month net
```typescript
// Source: project types/index.ts — ChartDataPoint.balance is per-month net
const cumulativeData = chartData.reduce<Array<ChartDataPoint & { cumBalance: number }>>(
  (acc, point, idx) => {
    const prev = idx === 0 ? 0 : acc[idx - 1].cumBalance
    return [...acc, { ...point, cumBalance: prev + point.balance }]
  },
  []
)
```

### PieChart Cell with CSS variable colors (dark-mode aware)
```tsx
// Source: Phase 3 research — CSS variables resolve at SVG paint time
const PIE_CHART_COLORS = [
  'var(--chart-color-1)', 'var(--chart-color-2)', 'var(--chart-color-3)',
  'var(--chart-color-4)', 'var(--chart-color-5)', 'var(--chart-color-6)',
  'var(--chart-color-7)', 'var(--chart-color-8)', 'var(--chart-color-9)',
  'var(--chart-color-10)', 'var(--chart-color-11)',
]
{data.map((_, index) => (
  <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />
))}
```

### Compact currency formatter (YAxis ticks)
```typescript
// Source: MDN Intl.NumberFormat — notation: 'compact' for axis tick legibility
new Intl.NumberFormat('en-US', {
  style: 'currency', currency: 'USD',
  notation: 'compact', maximumFractionDigits: 1
}).format(4500)
// → "$4.5K"
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Recharts 2.x PieChart crashed on React 19 with NaN | Recharts 3.x (v3.0.2+) renders correctly on React 19 | Recharts 3.0 released 2024 | Project already on 3.8.1 — no action needed |
| `connectNulls={true}` bridged null data gaps | v3: `connectNulls={true}` treats null as 0 | Recharts 3.0 migration guide | Do not use `connectNulls`; `formatChartData()` ensures no nulls |
| `TooltipProps` generic type for custom tooltips | `TooltipProps<ValueType, NameType>` with imported generics | Recharts 3.0 | Updated import pattern required |
| Recharts 3 `Customized` wrapper for custom components | Custom components render directly without `Customized` | Recharts 3.0 | Simpler component wrapping |
| `blendStroke` on PieChart for merged borders | `stroke="none"` on Pie or Cell | Recharts 3.0 breaking change | Use explicit `stroke="none"` if no segment border desired |

**Deprecated/outdated:**
- `blendStroke` prop on PieChart: removed in v3, use `stroke="none"` on Pie or Cell
- `activeIndex` prop: removed in v3, use `trigger="click"` on Tooltip
- `animateNewValues` prop on Area: removed in v3

---

## Open Questions

1. **Cumulative balance computation**
   - What we know: `ChartDataPoint.balance` is per-month net; STATE.md decision log says "cumulative running balance computed by Phase 2 chart selector hook" but no such hook was built
   - What's unclear: Whether a cumulative balance chart is preferred over per-month net or if both should be shown (e.g., two Area layers)
   - Recommendation: Build cumulative balance as a `useMemo` in `BalanceTrendChart` — single responsibility, no new hook needed. Show cumulative line only, label it "Running Balance"

2. **InsightsPanel third observation: ratio vs. average transaction size**
   - What we know: Income-to-expense ratio is clean mathematically and easy to understand; average transaction size is also computable
   - What's unclear: Which is more compelling for an evaluator
   - Recommendation: Income-to-expense ratio ("For every $1 spent, you earn $X.XX") is more financial-domain-relevant and requires a single safe division

3. **Recharts 3 `accessibilityLayer` prop default**
   - What we know: Recharts 3 enables `accessibilityLayer={true}` by default, adding ARIA attributes
   - What's unclear: Whether this adds any meaningful keyboard interaction that conflicts with existing layout
   - Recommendation: Leave default (`true`). It adds aria-label attributes and keyboard navigation — net positive, no configuration needed.

---

## Validation Architecture

> `nyquist_validation` is `true` in `.planning/config.json` — this section is required.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.x |
| Config file | `vitest.config.ts` (exists, environment: 'jsdom', globals: true) |
| Quick run command | `npx vitest run src/utils/insightsUtils.test.ts` |
| Full suite command | `npx vitest run --coverage` |

### Testability Split

Recharts SVG rendering in jsdom is largely non-functional — `ResponsiveContainer` cannot measure its parent (jsdom has no layout engine), SVG elements render as empty nodes, and chart canvas dimensions are always 0. Do not attempt to assert on Recharts internals in Vitest.

| What Can Be Automated (Vitest) | What Requires Browser/Manual Verification |
|-------------------------------|-------------------------------------------|
| `calcInsights()` — all edge cases (empty array, no expenses, single month, zero denominator) | Chart visual appearance (gradient fills, area curve shape, pie segment proportions) |
| `calcInsights()` — NaN/Infinity-free output (use `Number.isFinite`) | Dark mode chart colors switching when `html.dark` toggles |
| `formatChartData()` output shape (already tested in Phase 1, but cumulative variant needs test) | ResponsiveContainer height rendering correctly at 300px in browser |
| Empty state rendering: component renders `"No data"` text when passed empty array | Tooltip appearance and content on hover |
| KpiCard renders `formatCurrency(0)` for zero values | Pie label truncation at <5% threshold |
| `DashboardPage` renders without crashing when store is empty | Responsive layout at 375px / 768px / 1280px |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DASH-01 | `KpiCard` renders formatted value from `useSummaryTotals` | Unit (render) | `npx vitest run src/components/dashboard/__tests__/KpiCard.test.tsx` | Wave 0 |
| DASH-01 | `useSummaryTotals` returns `{balance:0, income:0, expenses:0}` on empty store | Unit (hook) | `npx vitest run src/hooks` | Already passes |
| DASH-02 | `BalanceTrendChart` renders empty state text when `data=[]` | Unit (render) | `npx vitest run src/components/dashboard/__tests__/BalanceTrendChart.test.tsx` | Wave 0 |
| DASH-02 | Cumulative balance reducer produces correct running totals | Unit (pure fn) | `npx vitest run src/utils/insightsUtils.test.ts` | Wave 0 |
| DASH-03 | `SpendingPieChart` renders empty state text when `data=[]` | Unit (render) | `npx vitest run src/components/dashboard/__tests__/SpendingPieChart.test.tsx` | Wave 0 |
| DASH-03 | `groupByCategory` excludes income (already tested in Phase 1) | Unit (pure fn) | `npx vitest run src/utils` | Already passes |
| DASH-04 | `calcInsights([])` returns all-null insight object | Unit (pure fn) | `npx vitest run src/utils/insightsUtils.test.ts` | Wave 0 |
| DASH-04 | `calcInsights` — no NaN/Infinity in any field on MOCK_TRANSACTIONS | Unit (pure fn) | `npx vitest run src/utils/insightsUtils.test.ts` | Wave 0 |
| DASH-04 | `calcInsights` — `monthOverMonth` is null when only 1 month present | Unit (pure fn) | `npx vitest run src/utils/insightsUtils.test.ts` | Wave 0 |
| DASH-04 | `calcInsights` — `incomeExpenseRatio` is null when expenses = 0 | Unit (pure fn) | `npx vitest run src/utils/insightsUtils.test.ts` | Wave 0 |
| DASH-04 | `calcInsights` — `changePercent` is 0 when previous month expenses = 0 | Unit (pure fn) | `npx vitest run src/utils/insightsUtils.test.ts` | Wave 0 |

### Sampling Rate

- **Per task commit:** `npx vitest run src/utils/insightsUtils.test.ts`
- **Per wave merge:** `npx vitest run --coverage`
- **Phase gate:** Full suite green (`npx tsc --noEmit && npx vitest run --coverage`) before Phase 5 begins

### Wave 0 Gaps

- [ ] `src/utils/insightsUtils.ts` — `calcInsights()` pure function (created in implementation wave)
- [ ] `src/utils/__tests__/insightsUtils.test.ts` — covers DASH-04 edge cases (must be RED stubs before implementation)
- [ ] `src/components/dashboard/__tests__/KpiCard.test.tsx` — covers DASH-01 render behavior
- [ ] `src/components/dashboard/__tests__/BalanceTrendChart.test.tsx` — covers DASH-02 empty state
- [ ] `src/components/dashboard/__tests__/SpendingPieChart.test.tsx` — covers DASH-03 empty state
- [ ] Add `src/components/dashboard/**` to vitest.config.ts `coverage.include` array

**Note:** Chart component tests are limited to render-without-crash and empty-state assertions. Do not attempt to assert on SVG output from Recharts — jsdom has no layout engine and Recharts charts render as empty SVG nodes in tests. The valuable automation target is `calcInsights()`, which is a pure function with zero browser dependencies.

---

## Sources

### Primary (HIGH confidence)
- [Recharts 3.0 Migration Guide (GitHub Wiki)](https://github.com/recharts/recharts/wiki/3.0-migration-guide) — breaking changes: `connectNulls`, `blendStroke`, `activeIndex`, `TooltipContentProps` vs `TooltipProps`, `accessibilityLayer`
- [Recharts ResponsiveContainer API](https://recharts.github.io/en-US/api/ResponsiveContainer/) — confirmed props: `width`, `height`, `aspect`, `minHeight`, `initialDimension`
- [Recharts Pie component API](https://recharts.github.io/en-US/api/Pie/) — `innerRadius`, `outerRadius`, `label`, `labelLine`, `dataKey`, `nameKey`
- [Phase 3 Research (03-RESEARCH.md)](E:/Udit/.planning/phases/03-layout-shell/03-RESEARCH.md) — confirmed: CSS variables resolve at SVG paint time; `fill="var(--chart-color-1)"` pattern on Cell; chart color palette in `index.css`
- [Recharts Issue #6056 (React 19 NaN fix)](https://github.com/recharts/recharts/issues/6056) — confirmed: Recharts 3.0.2+ fixes NaN PieChart bug on React 19
- [Project types/index.ts](E:/Udit/src/types/index.ts) — confirmed: `ChartDataPoint.date` is string `"yyyy-MM"`, `balance` is per-month net
- [Project financeUtils.ts](E:/Udit/src/utils/financeUtils.ts) — confirmed: `formatChartData` uses `yyyy-MM` key format, balance is per-month net
- [Project index.css](E:/Udit/src/index.css) — confirmed: 11 chart color CSS variables defined under `:root` and `html.dark`

### Secondary (MEDIUM confidence)
- [Recharts Issue #2251 — ResponsiveContainer flex/grid cross-browser](https://github.com/recharts/recharts/issues/2251) — explicit pixel-height wrapper as the reliable cross-browser fix
- [Recharts Issue #1813 — Safari black gradient](https://github.com/recharts/recharts/issues/1813) — duplicate `linearGradient` ID as root cause; unique IDs as fix
- [GitHub Discussion #3677 — Custom Tooltip TypeScript types](https://github.com/recharts/recharts/discussions/3677) — `TooltipProps<ValueType, NameType>` import pattern
- [Lucide icons search results](https://lucide.dev/icons/) — confirmed: `Wallet`, `TrendingUp`, `TrendingDown`, `ArrowUp`, `ArrowDown` available in `lucide-react`
- [leanylabs.com Recharts gradient article](https://leanylabs.com/blog/awesome-react-charts-tips/) — `<defs><linearGradient>` pattern with vertical gradient and stopOpacity fade

### Tertiary (LOW confidence — verify at implementation)
- Recharts 3 `accessibilityLayer` default behavior — documented in migration guide but specific keyboard behavior not tested
- Safari CSS variable behavior in SVG `stopColor` — multiple sources confirm `var()` works in modern Safari; edge cases on older Safari versions unverified

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already installed and validated in Phases 1–3; no new installs
- Recharts component API: HIGH — verified against official GitHub wiki migration guide and component API pages
- ResponsiveContainer height fix: HIGH — confirmed from multiple GitHub issues as the canonical solution
- Architecture patterns: HIGH — derived from existing project file structure and confirmed Phase 1/3 patterns
- Insights calculation: HIGH — pure arithmetic with verified edge cases; no external dependency
- Safari gradient bug: HIGH — root cause and fix confirmed from GitHub issue #1813
- Dark mode Recharts styling: MEDIUM — CSS variable approach confirmed in theory; exact Tailwind `dark:` class behavior on tooltip confirmed via Phase 3 pattern

**Research date:** 2026-04-04
**Valid until:** 2026-07-04 (90 days — Recharts 3.x is stable; no fast-moving parts)
