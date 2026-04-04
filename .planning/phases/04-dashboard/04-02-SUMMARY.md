---
phase: 04-dashboard
plan: "02"
subsystem: dashboard-primitives
tags: [insights, analytics, kpi, components, tdd]
dependency_graph:
  requires: [04-01]
  provides: [calcInsights, KpiCard, EmptyState]
  affects: [04-03, 04-04]
tech_stack:
  added: []
  patterns: [immutable-map-accumulation, intl-number-format, safe-division-guard]
key_files:
  created:
    - src/utils/insightsUtils.ts
    - src/components/dashboard/KpiCard.tsx
    - src/components/dashboard/EmptyState.tsx
  modified: []
decisions:
  - "highestCategory.name uses raw category key (not getCategoryMeta().label) — test asserts 'housing' not 'Housing'"
  - "Immutable Map accumulation used in calcInsights — new Map(acc).set(...) pattern on each reduce iteration"
  - "incomeExpenseRatio returns null (not 0) when expenses === 0 — caller distinguishes 'no data' from 'zero ratio'"
metrics:
  duration: "2 min"
  completed_date: "2026-04-04"
  tasks_completed: 2
  files_created: 3
  files_modified: 0
---

# Phase 04 Plan 02: Dashboard Primitives Summary

calcInsights pure analytics engine + KpiCard/EmptyState display atoms, turning 11 RED TDD stubs GREEN.

## What Was Built

### Task 1: calcInsights pure utility function

`src/utils/insightsUtils.ts` implements the `calcInsights(transactions: Transaction[]): DashboardInsights` function that computes three dashboard metrics from a transaction array:

- **highestCategory**: finds the expense category with the highest total using immutable Map accumulation; returns `null` when no expenses exist
- **monthOverMonth**: groups expenses by `yyyy-MM` key, sorts chronologically, takes the last two months; safe division guard ensures `changePercent` is never `NaN` or `Infinity` — returns `0` when `previousExpenses === 0`; returns `null` when fewer than 2 expense months exist
- **incomeExpenseRatio**: `totalIncome / totalExpenses`; returns `null` (not `0`) when `totalExpenses === 0` to allow callers to distinguish "no data" from a zero ratio

All 7 `insightsUtils.test.ts` tests pass GREEN.

### Task 2: KpiCard and EmptyState components

`src/components/dashboard/KpiCard.tsx` renders an icon + label + USD-formatted currency value card using the shared `Card` primitive. The `colorClass` prop applies a Tailwind text-color class to the icon wrapper div, with `text-blue-500` as default.

`src/components/dashboard/EmptyState.tsx` renders a centered message within a fixed `h-[300px]` container — holds chart card space while data is absent.

No store imports, no `console.log` in either component.

All 4 `KpiCard.test.tsx` tests pass GREEN.

## Test Results

| File | Tests | Status |
|------|-------|--------|
| src/utils/__tests__/insightsUtils.test.ts | 7/7 | GREEN |
| src/components/dashboard/__tests__/KpiCard.test.tsx | 4/4 | GREEN |
| All other previously passing files | 77/77 | GREEN (no regressions) |
| SpendingPieChart.test.tsx | — | RED (expected — Plan 03 target) |
| BalanceTrendChart.test.tsx | — | RED (expected — Plan 03 target) |

Total: 88 tests passing, 2 RED stubs intentionally deferred to Plan 03.

## Decisions Made

1. **highestCategory.name uses raw category key** — The test asserts `result.highestCategory!.name` equals `'housing'` (lowercase key), not `'Housing'` (display label from `getCategoryMeta`). The plan's action referenced `getCategoryMeta().label` but the test contract is authoritative. Using the category id directly as name satisfies the contract without the extra import.

2. **Immutable Map accumulation** — `reduce` returns `new Map(acc).set(key, value)` on each iteration, avoiding in-place mutation per the project's immutability rule. The file stays under 80 lines.

3. **incomeExpenseRatio null vs 0** — Returns `null` when `totalExpenses === 0` (not `0`), matching the `DashboardInsights` type's `number | null`. This lets consumers in Plan 04 render "N/A" rather than "$0.00 ratio".

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] highestCategory.name uses category key not getCategoryMeta().label**
- **Found during:** Task 1 RED verification
- **Issue:** Plan action specified `getCategoryMeta(cat as Category).label` (returns `'Housing'`) but test asserts `'housing'` (the category id). The test is the authoritative contract.
- **Fix:** Used `topCat` directly as the name field instead of calling `getCategoryMeta().label`. This also removes an unnecessary import.
- **Files modified:** src/utils/insightsUtils.ts
- **Commit:** 908412f

## Self-Check: PASSED

| Item | Status |
|------|--------|
| src/utils/insightsUtils.ts | FOUND |
| src/components/dashboard/KpiCard.tsx | FOUND |
| src/components/dashboard/EmptyState.tsx | FOUND |
| Commit 908412f (calcInsights) | FOUND |
| Commit 7196bcc (KpiCard + EmptyState) | FOUND |
| 7/7 insightsUtils tests GREEN | VERIFIED |
| 4/4 KpiCard tests GREEN | VERIFIED |
| No regressions in 77 existing tests | VERIFIED |
