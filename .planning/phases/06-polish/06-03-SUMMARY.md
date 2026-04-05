---
phase: 06-polish
plan: 03
subsystem: motion-and-empty-states
tags: [vitest, tdd, motion, reduced-motion, dashboard, kpi, accessibility]

# Dependency graph
requires:
  - phase: 06-polish
    plan: 01
    provides: RED contracts for motion surfaces and KPI empty-state behavior
  - phase: 06-polish
    plan: 02
    provides: phase continuity and baseline green test suite for export features
provides:
  - centralized motion preset utility for route/card/modal/chart surfaces
  - reduced-motion-aware animations across app shell and dashboard surfaces
  - KPI empty-state messaging when transaction dataset is empty
  - green conversion of 06-03 wave contracts
affects: [06-04]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Motion behavior is configured from a single utility via getSurfaceMotion(surface, reduced)"
    - "Route transitions are location-keyed with AnimatePresence under BrowserRouter"
    - "Closed modal content remains unmounted while entrance/exit animations are preserved"

key-files:
  created:
    - src/utils/motionConfig.ts
  modified:
    - src/App.tsx
    - src/components/ui/Card.tsx
    - src/components/ui/Modal.tsx
    - src/components/dashboard/BalanceTrendChart.tsx
    - src/components/dashboard/SpendingPieChart.tsx
    - src/components/dashboard/KpiCard.tsx
    - src/pages/DashboardPage.tsx

key-decisions:
  - "Reduced-motion presets use zero-duration transitions and avoid translate/scale movement"
  - "Chart animation is disabled with Recharts isAnimationActive={!shouldReduceMotion}"
  - "KpiCard exposes optional emptyMessage to suppress currency emphasis in empty state"
  - "BalanceTrendChart cumulative derivation uses immutable reducer pattern (lint-compliant)"

requirements-completed: [UX-05, UX-06]

# Metrics
duration: ~12min
completed: 2026-04-05
---

# Phase 6 Plan 03: Motion + KPI Empty-State Summary

**Implemented reduced-motion-aware animation polish across route/card/modal/chart surfaces and completed KPI card no-data messaging behavior.**

## Performance

- **Duration:** ~12 min
- **Tasks:** 2/2 complete
- **Files created:** 1
- **Files modified:** 7

## Accomplishments

- Added `src/utils/motionConfig.ts` with:
  - `MotionSurface` type (`route`, `card`, `modal`, `chart`)
  - `getSurfaceMotion(surface, reduced)` surface presets
  - reduced-motion branch with `duration: 0` and no movement-heavy transforms
- Updated `src/App.tsx` to add location-keyed route transitions:
  - introduced `AnimatedAppRoutes` under `BrowserRouter`
  - used `AnimatePresence` + `motion.div` keyed by pathname
- Updated `src/components/ui/Card.tsx` and `src/components/ui/Modal.tsx`:
  - card entrance animation via shared motion presets
  - modal backdrop/panel animation while preserving unmounted closed state
- Updated charts (`BalanceTrendChart`, `SpendingPieChart`):
  - motion wrappers applied
  - Recharts animation disabled when reduced motion is enabled
- Updated KPI behavior (`KpiCard`, `DashboardPage`):
  - `emptyMessage?: string` branch added
  - dashboard passes card-specific no-data messages when transactions are empty

## Verification Results

### Targeted motion + modal + chart checks

`npx vitest run src/utils/__tests__/motionConfig.test.ts src/components/ui/__tests__/primitives.test.tsx src/components/dashboard/__tests__/BalanceTrendChart.test.tsx src/components/dashboard/__tests__/SpendingPieChart.test.tsx`

- **Result:** PASS
- **Counts:** `4 passed` test files, `15 passed` tests
- Note: existing non-blocking `act(...)` warning still appears in modal primitive test (pre-existing behavior)

### Targeted KPI checks

`npx vitest run src/components/dashboard/__tests__/KpiCard.test.tsx src/components/dashboard/__tests__/KpiCard.emptyState.test.tsx`

- **Result:** PASS
- **Counts:** `2 passed` test files, `6 passed` tests

### Full suite + TypeScript checks

- `npx vitest run` → **PASS** (`23 passed` files, `121 passed` tests)
- `npx tsc --noEmit` → **PASS** (no diagnostics)

### Review and lint follow-up

- Initial review flagged 2 high issues in `BalanceTrendChart` (hook-order risk + immutability lint failure).
- Refactor applied to use immutable reducer and stable hook order.
- Focus lint check on `BalanceTrendChart.tsx` now passes.
- Final review verdict: **Approved (no blocking issues)**.

## Next Phase Readiness

- `06-03` is complete and ready to hand off to `06-04`.
- Next targets:
  - responsive hardening at 375/768/1280
  - transactions table mobile-safe rendering path
  - final blocking QA checkpoint

---

_Phase: 06-polish_
_Completed: 2026-04-05_
