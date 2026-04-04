---
phase: 03-layout-shell
plan: 01
subsystem: ui
tags: [tailwindcss, tailwind-v4, css-variables, dark-mode, react-router-dom, recharts, lucide-react, motion, headlessui, vitest, tdd]

# Dependency graph
requires:
  - phase: 02-state-layer
    provides: Zustand store with role+darkMode persisted to localStorage key finance-dashboard-store

provides:
  - Tailwind v4 installed and processing via @tailwindcss/vite plugin
  - CSS variable palette (--chart-color-1 through --chart-color-11) for light and dark modes
  - FOWT-prevention inline script in index.html reading finance-dashboard-store from localStorage
  - Three RED test stub files for ThemeSync, Header, and UI primitives components

affects:
  - 03-02-layout-shell (implements ThemeSync and Header, turns stubs GREEN)
  - 03-03-ui-primitives (implements Button, Card, Badge, Input, Select, Modal, turns stubs GREEN)
  - 04-dashboard (uses chart CSS variables via var() in Recharts fill props)

# Tech tracking
tech-stack:
  added:
    - tailwindcss@4.2.2 (CSS processing via @tailwindcss/vite, no config file)
    - "@tailwindcss/vite@4.2.2 (replaces PostCSS entirely for Tailwind v4)"
    - react-router-dom@7.14.0
    - lucide-react@1.7.0
    - recharts@3.8.1
    - motion@12.38.0
    - "@headlessui/react@2.2.9"
  patterns:
    - "@custom-variant dark used instead of Tailwind v3 darkMode: 'class' config"
    - CSS variables for chart palette allow Recharts SVG and React components to share color tokens
    - FOWT prevention via synchronous inline script before React module load

key-files:
  created:
    - src/components/layout/__tests__/ThemeSync.test.tsx
    - src/components/layout/__tests__/Header.test.tsx
    - src/components/ui/__tests__/primitives.test.tsx
  modified:
    - package.json (7 new dependencies)
    - vite.config.ts (tailwindcss() plugin added)
    - src/index.css (full replacement with Tailwind import + CSS variable palette)
    - index.html (FOWT inline script + title update)

key-decisions:
  - "Tailwind v4 dark mode uses @custom-variant dark syntax — no tailwind.config.js or darkMode config needed"
  - "No postcss.config.js created — @tailwindcss/vite replaces PostCSS entirely in v4"
  - "FOWT script reads nested stored.state.darkMode because Zustand persist wraps state under state key in localStorage"
  - "Chart color palette defined as CSS variables under :root and html.dark — shared by React and Recharts SVG fill props"

patterns-established:
  - "Tailwind v4 pattern: @import tailwindcss + @custom-variant dark on consecutive lines in index.css"
  - "FOWT pattern: synchronous IIFE in <head> before module script reads localStorage and applies html.dark class"
  - "CSS variable chart tokens: var(--chart-color-N) referenced by Recharts fill props in Phase 4"

requirements-completed:
  - ROLE-01
  - UX-01
  - UX-02

# Metrics
duration: 4min
completed: 2026-04-04
---

# Phase 3 Plan 01: Layout Shell Foundation Summary

**Tailwind v4 installed with @custom-variant dark, 11-color CSS variable chart palette in light/dark modes, FOWT-prevention script, and 3 RED test stubs for ThemeSync/Header/primitives**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-04T14:16:02Z
- **Completed:** 2026-04-04T14:20:53Z
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments

- Installed all 7 Phase 3 packages: tailwindcss, @tailwindcss/vite, react-router-dom, lucide-react, recharts, motion, @headlessui/react
- Replaced index.css entirely with Tailwind v4 @import + @custom-variant dark + full CSS variable chart palette (11 colors, light + dark)
- Added FOWT-prevention blocking script to index.html head — prevents flash of wrong theme before React boots
- Created 3 test stub files in correct RED state (all fail with missing module errors, confirming TDD setup)
- Build succeeds (zero TypeScript errors); Tailwind CSS bundle grew from 1.78 kB to 21.58 kB confirming v4 processing active

## Task Commits

Each task was committed atomically:

1. **Task 1: Install Phase 3 packages and configure vite.config.ts** - `554fe74` (feat)
2. **Task 2: Replace index.css and add FOWT script to index.html** - `fbe61dd` (feat)
3. **Task 3: Create failing test stub files (RED state)** - `74504e8` (test)

## Files Created/Modified

- `package.json` - Added 7 new dependencies for Phase 3
- `package-lock.json` - Updated lockfile with 78 new packages
- `vite.config.ts` - Added tailwindcss() plugin after react() plugin
- `src/index.css` - Full replacement: @import tailwindcss, @custom-variant dark, 11-color :root + html.dark palette
- `index.html` - Added FOWT inline script in head, updated title to "Finance Dashboard"
- `src/components/layout/__tests__/ThemeSync.test.tsx` - Stubs for dark class toggling behavior (3 tests)
- `src/components/layout/__tests__/Header.test.tsx` - Stubs for role switcher, disclaimer, dark toggle (5 tests)
- `src/components/ui/__tests__/primitives.test.tsx` - Smoke stubs for Button, Card, Badge, Input, Select, Modal (8 tests)

## Decisions Made

- Tailwind v4 uses `@custom-variant dark (&:where(.dark, .dark *))` instead of v3's `darkMode: 'class'` config option — no tailwind.config.js needed
- No postcss.config.js created — @tailwindcss/vite replaces PostCSS entirely in Tailwind v4
- FOWT script reads `stored.state.darkMode` (not `stored.darkMode`) because Zustand's persist middleware wraps state under a `state` key in localStorage
- CSS chart variables defined under `html.dark` (not `.dark`) because `:root` IS the `<html>` element — this ensures variables activate when ThemeSync adds the class to `document.documentElement`

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all three tasks completed cleanly. Engine warning on Node 22.9.0 (requires 22.12+) is a pre-existing environment constraint documented in Phase 1, not a new issue.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Tailwind v4 dark mode infrastructure fully in place — implementation tasks (03-02, 03-03) can begin immediately
- All test stubs in RED state — ThemeSync, Header, and UI primitive components need to be created in plans 02 and 03
- CSS variable chart palette ready for Recharts integration in Phase 4
- react-router-dom, lucide-react, motion, @headlessui/react installed and available for layout implementation

---
*Phase: 03-layout-shell*
*Completed: 2026-04-04*
