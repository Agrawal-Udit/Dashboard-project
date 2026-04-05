---
phase: 06-polish
plan: 01
subsystem: testing
tags: [vitest, tdd, export, csv, json, motion, kpi, wave-0]

# Dependency graph
requires:
  - phase: 05-transactions
    provides: transaction page shape, test style, vitest + RTL setup
  - phase: 04-dashboard
    provides: existing KpiCard behavior and dashboard component test conventions
provides:
  - 4 Wave-0 RED stub files for Phase 6
  - export utility contract tests (CSV/JSON ordering, safety, immutability)
  - export action wiring tests bound to visibleTransactions prop
  - motion reduced-motion contract tests for route/card/modal/chart surfaces
  - KPI empty-state behavior contract tests
affects: [06-02, 06-03, 06-04]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Wave-0 RED pattern: import from not-yet-implemented modules to enforce failing state"
    - "Export action tests mock utility module with vi.mock('../../../utils/exportUtils')"
    - "KPI empty-state tests assert message rendering and suppression of normal currency emphasis"

key-files:
  created:
    - src/utils/__tests__/exportUtils.test.ts
    - src/components/transactions/__tests__/TransactionExportActions.test.tsx
    - src/utils/__tests__/motionConfig.test.ts
    - src/components/dashboard/__tests__/KpiCard.emptyState.test.tsx
  modified: []

key-decisions:
  - "CSV contract uses deterministic header: date,description,category,type,amount"
  - "Dangerous-leading spreadsheet values are explicitly tested for apostrophe-guarding"
  - "Motion contract checks both reduced=true zero-duration behavior and normal-mode modal/route characteristics"

patterns-established:
  - "Serializer tests use fixed visibleTransactions fixtures with both dangerous and quoted descriptions"
  - "Full-suite verification after wave-0 confirms legacy tests remain green while new stubs fail as designed"

requirements-completed: [UX-03, UX-04, UX-05, UX-06]

# Metrics
duration: ~8min
completed: 2026-04-05
---

# Phase 6 Plan 01: Wave 0 RED Stubs Summary

**Created all four Phase 6 Wave-0 RED test stubs and verified expected failing state, while pre-existing test suites remain green.**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-04-05T12:18:00Z
- **Completed:** 2026-04-05T12:26:00Z
- **Tasks:** 2/2 complete
- **Files created:** 4

## Accomplishments

- Added `exportUtils` RED tests covering:
  - deterministic CSV header order
  - stable row ordering
  - formula-injection guard behavior
  - quote escaping
  - JSON ordering and numeric type fidelity
  - no mutation contract
- Added `TransactionExportActions` RED tests covering:
  - CSV export uses `visibleTransactions`
  - JSON export uses `visibleTransactions`
  - downloader called with expected MIME types/extensions
- Added `motionConfig` RED tests covering:
  - reduced-motion zero-duration contract for route/card/modal/chart
  - reduced-motion no movement-heavy transform contract
  - normal mode modal transition duration and route exit availability
- Added `KpiCard.emptyState` RED tests covering:
  - `emptyMessage` rendering contract
  - suppression of normal currency emphasis in empty state

## Verification Results

### Targeted Wave-0 run

`npx vitest run src/utils/__tests__/exportUtils.test.ts src/components/transactions/__tests__/TransactionExportActions.test.tsx src/utils/__tests__/motionConfig.test.ts src/components/dashboard/__tests__/KpiCard.emptyState.test.tsx`

- **Expected RED achieved:**
  - Missing-module failures for:
    - `src/utils/exportUtils.ts`
    - `src/utils/motionConfig.ts`
    - `src/components/transactions/TransactionExportActions.tsx`
  - Behavioral failures for KPI empty-state expectations (component not yet updated)

### Full suite run

`npx vitest run`

- **Result:** `19 passed` test files, `4 failed` test files
- **Counts:** `106 passed`, `2 failed` tests
- Failures are exclusively from newly added Wave-0 stubs (expected)

## Issues Encountered

- Non-blocking Vitest worker termination warning (`EPERM`) appeared after failure runs; does not affect RED-state validation outcome.

## Next Phase Readiness

- `06-01` is complete and ready to hand off to `06-02` implementation.
- Clear implementation targets now exist for:
  - `src/utils/exportUtils.ts`
  - `src/components/transactions/TransactionExportActions.tsx`
  - `src/utils/motionConfig.ts`
  - KPI empty-state support in `KpiCard`

---

_Phase: 06-polish_
_Completed: 2026-04-05_
