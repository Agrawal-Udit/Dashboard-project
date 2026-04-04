---
phase: 04-dashboard
plan: "03"
subsystem: dashboard-charts
tags: [recharts, area-chart, pie-chart, dark-mode, css-variables, empty-state]
dependency_graph:
  requires: [04-02]
  provides: [BalanceTrendChart, SpendingPieChart]
  affects: [DashboardPage]
tech_stack:
  added: []
  patterns: [useMemo-cumulative-balance, css-variable-fills, custom-tooltip, empty-state-guard]
key_files:
  created:
    - src/components/dashboard/BalanceTrendChart.tsx
    - src/components/dashboard/SpendingPieChart.tsx
  modified:
    - src/index.css
decisions:
  - "useMemo computes cumulative balance from per-month net (ChartDataPoint.balance) — not passed directly to Recharts Area"
  - "Cell fill uses CSS variable array (var(--chart-color-N)) not hex strings from CategoryChartPoint.color — enables dark mode"
  - "linearGradient id='balanceTrendGrad' is unique page-wide to avoid Safari SVG gradient bug"
  - "Recharts CSS variables (--recharts-tick-color, --recharts-grid-color) added as separate :root/html.dark blocks after chart color palette"
metrics:
  duration: "1 min"
  completed_date: "2026-04-04"
  tasks_completed: 2
  files_created: 2
  files_modified: 1
---

# Phase 04 Plan 03: Chart Components Summary

AreaChart with cumulative balance trend and PieChart donut with CSS variable fills, both with custom dark-mode tooltips and empty state guards.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add recharts CSS variables and implement BalanceTrendChart | cedd100 | src/index.css, src/components/dashboard/BalanceTrendChart.tsx |
| 2 | Implement SpendingPieChart | fda9972 | src/components/dashboard/SpendingPieChart.tsx |

## What Was Built

### BalanceTrendChart (src/components/dashboard/BalanceTrendChart.tsx)
- AreaChart wrapping an `h-[300px] w-full` div (explicit pixel height — Recharts ResponsiveContainer requirement)
- `useMemo` computes cumulative running balance from `ChartDataPoint.balance` (per-month net) before passing to Recharts
- `linearGradient id="balanceTrendGrad"` — unique ID prevents Safari SVG gradient cross-reference bug
- `BalanceTrendTooltip` component: converts `yyyy-MM` label to "Month YYYY" display, formats value as USD, dark mode Tailwind classes
- `CartesianGrid` and `XAxis`/`YAxis` use `var(--recharts-tick-color)` and `var(--recharts-grid-color)` CSS variables
- Empty state: returns `<EmptyState message="No transaction data to display" />` when `data.length === 0`
- No store imports, no console.log, immutable data patterns throughout

### SpendingPieChart (src/components/dashboard/SpendingPieChart.tsx)
- PieChart donut: `innerRadius="40%"` `outerRadius="70%"` `paddingAngle={2}`
- `PIE_COLORS` array of 11 CSS variables (`var(--chart-color-1)` through `var(--chart-color-11)`) — NOT hex from `CategoryChartPoint.color`
- Labels rendered only for slices > 5% (`percent > 0.05`)
- `SpendingTooltip`: shows category name and USD-formatted value with dark mode Tailwind classes
- `Legend` formatter returns styled span with dark mode text classes
- Empty state: returns `<EmptyState message="No spending data to display" />` when `data.length === 0`

### index.css additions
- Two new variable blocks appended after existing `html.dark` palette block:
  - `:root { --recharts-tick-color: #6b7280; --recharts-grid-color: #e5e7eb; }`
  - `html.dark { --recharts-tick-color: #9ca3af; --recharts-grid-color: #374151; }`

## Verification

- `BalanceTrendChart.test.tsx`: 1/1 GREEN — empty state text renders
- `SpendingPieChart.test.tsx`: 1/1 GREEN — empty state text renders
- Full suite: 15 test files, 90 tests — all GREEN, no regressions

## Deviations from Plan

None — plan executed exactly as written.

The types comment in `src/types/index.ts` (`ChartDataPoint.date: "Jan 2026"`) conflicts with actual `formatChartData` output (`yyyy-MM`). The `useMemo` for cumulative balance was implemented as specified — `financeUtils.ts` computes per-month balance, so the running accumulation in the component is correct regardless of the types comment.

## Self-Check: PASSED

- FOUND: src/components/dashboard/BalanceTrendChart.tsx
- FOUND: src/components/dashboard/SpendingPieChart.tsx
- FOUND: src/index.css
- FOUND commit cedd100: feat(04-03): implement BalanceTrendChart and add recharts CSS variables
- FOUND commit fda9972: feat(04-03): implement SpendingPieChart donut with CSS variable fills
