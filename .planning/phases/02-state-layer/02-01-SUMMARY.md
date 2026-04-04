---
phase: 02-state-layer
plan: 01
subsystem: testing
tags: [zustand, immer, vitest, jsdom, tdd, @testing-library/react]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Transaction types, MOCK_TRANSACTIONS seed data, utility functions

provides:
  - Zustand 5 and Immer installed as production dependencies
  - "@testing-library/react installed for renderHook support"
  - jsdom environment enabled in vitest for localStorage + hook tests
  - 5 failing test stub files covering store slices, persist middleware, and selector hooks (RED state)

affects:
  - 02-02 (txnSlice + uiSlice implementation — driven by these stubs)
  - 02-03 (selector hooks implementation — driven by these stubs)

# Tech tracking
tech-stack:
  added:
    - zustand@^5.0.12 (global state management)
    - immer@^11.1.4 (immutable state updates in Zustand slices)
    - "@testing-library/react (renderHook for custom hook tests)"
    - jsdom@25 (browser DOM simulation for vitest)
  patterns:
    - TDD RED state: test stubs import non-existent modules to establish failing baseline
    - jsdom environment enables localStorage API for persist middleware tests
    - useAppStore.getInitialState() + setState reset pattern for test isolation

key-files:
  created:
    - src/store/__tests__/txnSlice.test.ts
    - src/store/__tests__/uiSlice.test.ts
    - src/store/__tests__/store.test.ts
    - src/hooks/__tests__/useTransactions.test.ts
    - src/hooks/__tests__/useSummaryTotals.test.ts
  modified:
    - vitest.config.ts (environment node->jsdom, coverage expanded)
    - package.json (zustand, immer, @testing-library/react, jsdom@25)

key-decisions:
  - "jsdom downgraded from 27 to 25: jsdom 27 has a CJS/ESM incompatibility in @csstools/css-calc on Node 22.9 — @asamuzakjp/css-color requires ESM but vitest uses CJS workers"
  - "@testing-library/react installed explicitly: was not in package.json despite plan claiming it was already present"
  - "Hook tests use renderHook from @testing-library/react, not from vitest directly"

patterns-established:
  - "Test reset: useAppStore.setState(useAppStore.getInitialState(), true) in beforeEach for full store reset"
  - "Persist test pattern: (useAppStore as any).persist?.getOptions?.() to access partialize/migrate options"

requirements-completed:
  - FOUND-04
  - FOUND-05
  - ROLE-02

# Metrics
duration: 3min
completed: 2026-04-04
---

# Phase 2 Plan 01: State Layer TDD Setup Summary

**Zustand 5 + Immer installed, vitest switched to jsdom, and 17 failing test stubs across 5 files establish TDD RED state for all Phase 2 store slices and selector hooks**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-04T11:57:05Z
- **Completed:** 2026-04-04T12:00:50Z
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments

- Installed zustand, immer, @testing-library/react as dependencies; downgraded jsdom to v25 for Node 22.9 compatibility
- Updated vitest.config.ts to use jsdom environment and expanded coverage to include src/store and src/hooks
- Created 5 test stub files with 17 total tests in RED state — all fail with module-not-found since store.ts, useTransactions.ts, and useSummaryTotals.ts do not exist yet
- Confirmed 28 Phase 1 tests remain GREEN after environment change

## Task Commits

Each task was committed atomically:

1. **Task 1: Install dependencies and update vitest config** - `6a32287` (chore)
2. **Task 2: Write failing test stubs for store slices** - `f1fdb48` (test)
3. **Task 3: Write failing test stubs for selector hooks** - `a40284c` (test)

## Files Created/Modified

- `vitest.config.ts` - environment: jsdom, coverage.include expanded with src/store and src/hooks
- `package.json` - zustand, immer (production); @testing-library/react, jsdom@25 (dev)
- `src/store/__tests__/txnSlice.test.ts` - 6 tests for addTransaction, editTransaction, deleteTransaction
- `src/store/__tests__/uiSlice.test.ts` - 5 tests for initial state, setRole, setDarkMode isolation
- `src/store/__tests__/store.test.ts` - 6 tests for localStorage key, partialize shape, migrate versions
- `src/hooks/__tests__/useTransactions.test.ts` - 9 tests for filtering, sorting
- `src/hooks/__tests__/useSummaryTotals.test.ts` - 4 tests for aggregation totals

## Decisions Made

- jsdom downgraded from 27 to 25: jsdom 27 bundles @asamuzakjp/css-color which requires ESM css-calc, but vitest workers use CJS — breaks on Node 22.9. jsdom 25 does not have this dependency.
- @testing-library/react added explicitly: plan stated it was already installed but it was absent from package.json and node_modules.
- Hook test files import from `../../store/store` (absolute path) while store test files import from `../store` — matching the directory structure.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] jsdom 27 CJS/ESM incompatibility on Node 22.9**
- **Found during:** Task 1 (vitest config change verification)
- **Issue:** After switching to jsdom environment, all Phase 1 tests failed with `ERR_REQUIRE_ESM` from @csstools/css-calc inside @asamuzakjp/css-color (jsdom 27 dependency). Node 22.9 is below the 22.12 threshold where ESM-in-CJS was fixed.
- **Fix:** `npm install --save-dev jsdom@25` — v25 predates the problematic CSS color dependency
- **Files modified:** package.json, package-lock.json
- **Verification:** All 28 Phase 1 tests pass after downgrade
- **Committed in:** `6a32287` (Task 1 commit)

**2. [Rule 3 - Blocking] @testing-library/react missing from package.json**
- **Found during:** Task 1 (pre-execution check)
- **Issue:** Plan stated "@testing-library/react is already installed" but it was absent from both package.json devDependencies and node_modules. Hook test files use `renderHook` from this package.
- **Fix:** `npm install --save-dev @testing-library/react`
- **Files modified:** package.json, package-lock.json
- **Verification:** Package present in node_modules/@testing-library/react
- **Committed in:** `6a32287` (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both fixes were essential to unblock task execution. No scope creep.

## Issues Encountered

- Node 22.9 is below Vite 8's minimum (22.12), causing EBADENGINE warnings throughout. These are pre-existing and out of scope — tests pass despite warnings.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All 5 test stub files are in RED state and ready to drive Plan 02-02 (txnSlice + uiSlice implementation) and Plan 02-03 (selector hooks implementation)
- Store test stubs expect `export { useAppStore }` from `src/store/store.ts`
- Hook test stubs expect `export { useTransactions }` from `src/hooks/useTransactions.ts` and `export { useSummaryTotals }` from `src/hooks/useSummaryTotals.ts`
- jsdom environment is configured and working — localStorage API is available for persist tests

---
*Phase: 02-state-layer*
*Completed: 2026-04-04*
