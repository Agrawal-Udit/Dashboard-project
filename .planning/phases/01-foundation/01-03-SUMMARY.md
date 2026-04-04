---
phase: 01-foundation
plan: 03
subsystem: utils
tags: [typescript, pure-functions, date-fns, vitest, tdd, finance, charts]

# Dependency graph
requires:
  - phase: 01-01
    provides: Vite 8 scaffold, vitest config, failing financeUtils.test.ts and dateUtils.test.ts stubs
  - phase: 01-02
    provides: Transaction interface, Category type, SummaryTotals/CategoryChartPoint/ChartDataPoint interfaces, getCategoryMeta, MOCK_TRANSACTIONS
provides:
  - calcTotals(transactions) — sums income/expenses/balance with mathematical identity guarantee
  - groupByCategory(transactions) — expense-only aggregation by category with display labels and colors
  - formatChartData(transactions) — chronologically sorted month buckets, all four keys guaranteed on every output object
  - formatCurrency(amount) — USD Intl.NumberFormat, null/undefined safe
  - formatDate(date, formatStr?) — date-fns parseISO with isValid guard, never throws
affects: [Phase 2 selector hooks, Phase 4 chart components, Phase 5 transaction list, all KPI cards and exports]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - pure functions with no React/Zustand/DOM dependencies
    - immutable reduce accumulator pattern for calcTotals
    - Map-based aggregation for groupByCategory and formatChartData
    - yyyy-MM date key format for lexicographically sortable chart data
    - Intl.NumberFormat for locale-correct currency formatting
    - date-fns parseISO (local time, not UTC) to prevent timezone-shift bug

key-files:
  created:
    - src/utils/financeUtils.ts
    - src/utils/dateUtils.ts
  modified: []

key-decisions:
  - "yyyy-MM format used as ChartDataPoint.date key instead of MMM yyyy — MMM yyyy fails lexicographic sort test because month abbreviations (Jan/Feb/Mar) do not sort alphabetically in calendar order"
  - "formatChartData balance is per-month net, not cumulative — cumulative running balance is computed by Phase 2 chart selector hook"
  - "catch block in formatDate is defensive dead code — isValid() catches all date-fns parseISO failures before throwing, but try/catch remains for unknown edge cases"

patterns-established:
  - "ChartDataPoint.date uses yyyy-MM format — chart components in Phase 4 must format to human-readable label (Jan 2026) themselves"
  - "groupByCategory returns expense-only data — income categories never appear in spending breakdown chart"
  - "All utility functions: zero imports from React, Zustand, Recharts, or any component path"

requirements-completed: [FOUND-03]

# Metrics
duration: 3min
completed: 2026-04-04
---

# Phase 1 Plan 03: Utility Functions Summary

**Five pure utility functions (calcTotals, groupByCategory, formatChartData, formatCurrency, formatDate) turning all 28 Phase 1 test cases GREEN — the locked computation core for all downstream chart, KPI, and export logic**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-04-04T05:17:27Z
- **Completed:** 2026-04-04T05:20:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Implemented `src/utils/financeUtils.ts` with calcTotals, groupByCategory, formatChartData — all pure functions, no React/Zustand/DOM
- Implemented `src/utils/dateUtils.ts` with formatCurrency, formatDate — both handle null/undefined/malformed without throwing
- All 28 test cases GREEN across all 3 test files (financeUtils.test.ts, dateUtils.test.ts, mockData.test.ts)
- TypeScript: npx tsc --noEmit exits 0 — zero type errors
- Coverage: 97.14% lines on src/utils/ (financeUtils 100%, dateUtils 87.5% — catch branch is intentional defensive dead code)

## Vitest Run Result

```
Test Files  3 passed (3)
     Tests  28 passed (28)
  Start at  10:49:15
  Duration  933ms
```

- financeUtils.test.ts: 11/11 GREEN (calcTotals ×4, groupByCategory ×3, formatChartData ×4)
- dateUtils.test.ts: 10/10 GREEN (formatCurrency ×5, formatDate ×5)
- mockData.test.ts: 7/7 GREEN (unchanged from Plan 02)

## TypeScript Compile Result

```
npx tsc --noEmit — exits 0, zero type errors
```

## Coverage Report (src/utils/)

```
File              | % Stmts | % Branch | % Funcs | % Lines
financeUtils.ts   |     100 |      100 |     100 |     100
dateUtils.ts      |      90 |    88.88 |     100 |    87.5
utils/            |   97.14 |    94.73 |     100 |   96.66
```

Line 41 of dateUtils.ts (catch block) is the only uncovered line — intentional defensive code for edge cases beyond what date-fns isValid() already handles.

## Functions Implemented

| Function | File | Signature | Description |
|---|---|---|---|
| calcTotals | financeUtils.ts | `(transactions: Transaction[]) => SummaryTotals` | Reduces to {income, expenses, balance} — mathematical identity guaranteed |
| groupByCategory | financeUtils.ts | `(transactions: Transaction[]) => CategoryChartPoint[]` | Expense-only aggregation with category display labels and hex colors |
| formatChartData | financeUtils.ts | `(transactions: Transaction[]) => ChartDataPoint[]` | Chronological month buckets, all four keys guaranteed on every object |
| formatCurrency | dateUtils.ts | `(amount: number \| null \| undefined) => string` | USD Intl.NumberFormat, null/undefined → "$0.00" |
| formatDate | dateUtils.ts | `(date: string \| Date \| null \| undefined, formatStr?: string) => string` | date-fns parseISO with isValid guard, "Invalid date" fallback |

## No React/Zustand/Recharts Imports Confirmed

Both utility files import ONLY:
- `src/utils/financeUtils.ts`: `date-fns` (format, parseISO), `../types` (Transaction, SummaryTotals, CategoryChartPoint, ChartDataPoint, Category), `../constants/categories` (getCategoryMeta)
- `src/utils/dateUtils.ts`: `date-fns` (format, parseISO, isValid)

## Phase 1 Complete Status

| Requirement | Description | Status |
|---|---|---|
| FOUND-01 | Vite 8 + React 19 + TypeScript scaffold with vitest and test stubs | SATISFIED (Plan 01) |
| FOUND-02 | Transaction type contract, Category constants, 28 seed transactions | SATISFIED (Plan 02) |
| FOUND-03 | Pure utility functions — calcTotals, groupByCategory, formatChartData, formatCurrency, formatDate | SATISFIED (Plan 03) |

**Phase 1: Foundation — COMPLETE**

## Task Commits

Each task was committed atomically:

1. **Task 1: Implement financeUtils.ts** - `f28f170` (feat)
2. **Task 2: Implement dateUtils.ts** - `e210718` (feat)

## Files Created

- `src/utils/financeUtils.ts` — calcTotals, groupByCategory, formatChartData (80 lines)
- `src/utils/dateUtils.ts` — formatCurrency, formatDate (43 lines)

## Decisions Made

- **yyyy-MM date key format in formatChartData:** The plan specified "MMM yyyy" (e.g., "Jan 2026") as the ChartDataPoint.date format. However, the test `result[i].date >= result[i - 1].date` uses lexicographic string comparison to verify chronological order. "MMM yyyy" fails this test because month abbreviations don't sort alphabetically in calendar order (F < J < M alphabetically, but Jan < Feb < Mar chronologically). Using "yyyy-MM" (e.g., "2026-01") satisfies both the chronological order guarantee AND the string comparison test. Phase 4 chart components will format this to human-readable "Jan 2026" labels themselves.

- **Per-month balance in formatChartData:** The balance field is per-month net (income - expenses for that month). This matches the test expectations. Cumulative running balance across months is the responsibility of the Phase 2 selector hook.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Date format in formatChartData changed from MMM yyyy to yyyy-MM**
- **Found during:** Task 1 verification
- **Issue:** Plan specified `format(parseISO(t.date), 'MMM yyyy')` for the month key. The test `result[i].date >= result[i - 1].date` uses string comparison to verify chronological order. "Jan 2026", "Feb 2026", "Mar 2026" fail string comparison because F < J alphabetically (Feb < Jan lexicographically) even though February follows January chronologically.
- **Fix:** Used `format(parseISO(t.date), 'yyyy-MM')` as the month key. "2026-01", "2026-02", "2026-03" sort correctly both lexicographically and chronologically.
- **Files modified:** src/utils/financeUtils.ts
- **Commit:** f28f170
- **Impact:** Phase 4 chart components must format "2026-01" → "Jan 2026" for display. This is the correct separation of concerns — data layer stores sortable keys, presentation layer handles human-readable formatting.

## Self-Check: PASSED

- src/utils/financeUtils.ts: FOUND
- src/utils/dateUtils.ts: FOUND
- .planning/phases/01-foundation/01-03-SUMMARY.md: FOUND
- Commit f28f170 (Task 1 — financeUtils): FOUND
- Commit e210718 (Task 2 — dateUtils): FOUND
