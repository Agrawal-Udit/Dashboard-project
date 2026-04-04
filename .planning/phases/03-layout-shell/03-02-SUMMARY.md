---
phase: 03-layout-shell
plan: 02
subsystem: ui
tags: [react, tailwind, headlessui, zustand, dark-mode, components]

# Dependency graph
requires:
  - phase: 03-01
    provides: Tailwind v4 dark variant config, CSS variable palette, RED test stubs for ThemeSync and UI primitives
  - phase: 02-state-layer
    provides: useAppStore with darkMode boolean selector

provides:
  - ThemeSync component syncing Zustand darkMode to document.documentElement.classList
  - Button with variant prop (primary/secondary/ghost/danger) and dark: Tailwind variants
  - Card container with border, shadow, dark mode bg-gray-800
  - Badge pill with income/expense/default variant color classes
  - Input controlled text input with label association and error state
  - Select native select with label association and dark mode styling
  - Modal accessible dialog via @headlessui/react Dialog with focus-trap

affects:
  - 03-03 (Header consumes Button, uses ThemeSync context)
  - 03-04 (Sidebar consumes Badge)
  - 04-dashboard (all primitives used across dashboard cards and charts)
  - 05-transactions (Input, Select, Modal used in filter and transaction forms)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Side-effect-only component pattern: ThemeSync returns null, manages DOM via useEffect"
    - "Variant class map pattern: Record<Variant, string> lookup avoids if/else chains"
    - "Headlessui Dialog wrapping pattern: Dialog + DialogPanel + DialogTitle for accessible modals"

key-files:
  created:
    - src/components/layout/ThemeSync.tsx
    - src/components/ui/Button.tsx
    - src/components/ui/Card.tsx
    - src/components/ui/Badge.tsx
    - src/components/ui/Input.tsx
    - src/components/ui/Select.tsx
    - src/components/ui/Modal.tsx
  modified: []

key-decisions:
  - "ThemeSync uses classList.toggle(token, force) with boolean force argument — reliable cross-browser API for conditional class application"
  - "All UI primitives use inline className strings only — no @apply directives, no store imports in ui/"
  - "Modal uses @headlessui/react Dialog for focus-trap and aria-modal without custom implementation"

patterns-established:
  - "Variant class map: const variantClasses: Record<ButtonVariant, string> = { ... } — avoids runtime conditionals"
  - "Side-effect render null: components that only manage DOM side effects return null and keep JSX trees clean"
  - "Label association: Input and Select always wire htmlFor={id} to ensure getByLabelText works in tests and screen readers"

requirements-completed: [UX-01, UX-02]

# Metrics
duration: 4min
completed: 2026-04-04
---

# Phase 3 Plan 02: ThemeSync and UI Primitives Summary

**ThemeSync syncs Zustand darkMode to document.documentElement.classList; six shared UI primitives (Button, Card, Badge, Input, Select, Modal) with Tailwind dark: variants and headlessui Modal**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-04T14:23:48Z
- **Completed:** 2026-04-04T14:27:30Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- ThemeSync component implemented — classList.toggle('dark', darkMode) turns Plan 01 RED stubs GREEN (3/3 tests)
- Six shared UI primitives implemented with consistent dark: Tailwind variants — all 9 primitives tests GREEN
- npm run build exits zero with no TypeScript errors; build artifact includes headlessui Dialog and all component code

## Task Commits

Each task was committed atomically:

1. **Task 1: Implement ThemeSync component** - `d4e4b42` (feat)
2. **Task 2: Implement shared UI primitives** - `701546f` (feat)

**Plan metadata:** `(docs commit — see below)`

_Note: TDD pattern — tests were RED stubs from Plan 01; implementation turns them GREEN in this plan._

## Files Created/Modified
- `src/components/layout/ThemeSync.tsx` - Side-effect component: useEffect syncing darkMode store value to document.documentElement.classList
- `src/components/ui/Button.tsx` - Button with variant prop (primary/secondary/ghost/danger), disabled:opacity-50
- `src/components/ui/Card.tsx` - Card container: border, shadow-sm, dark:bg-gray-800, dark:border-gray-700
- `src/components/ui/Badge.tsx` - Badge pill: income (emerald), expense (red), default (gray) variant color classes
- `src/components/ui/Input.tsx` - Controlled input: label/htmlFor association, error state, dark mode styling
- `src/components/ui/Select.tsx` - Native select: label/htmlFor association, option children, dark mode styling
- `src/components/ui/Modal.tsx` - Headlessui Dialog: backdrop overlay, DialogPanel, DialogTitle, accessible focus-trap

## Decisions Made
- classList.toggle(token, force) with explicit boolean force argument chosen over classList.add/remove — single call handles both add and remove, most reliable cross-browser API
- No @apply directives in any component file — all Tailwind classes as inline className strings for predictable purging and readable component code
- Headlessui Dialog used for Modal rather than custom ARIA implementation — handles focus-trap, keyboard dismissal, and aria-modal attribute automatically

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Header.test.tsx remains RED as expected (Header component ships in Plan 03) — this is documented in Plan 02 success criteria as the correct outcome

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- ThemeSync and all six UI primitives are complete and tested — Header and Sidebar in Plan 03 can import Button, Badge, Card immediately
- Dark mode toggle wire-up is complete end-to-end: store.darkMode → ThemeSync → html.dark class → Tailwind dark: variants activate
- No blockers for Plan 03

## Self-Check: PASSED

- FOUND: src/components/layout/ThemeSync.tsx
- FOUND: src/components/ui/Button.tsx
- FOUND: src/components/ui/Card.tsx
- FOUND: src/components/ui/Badge.tsx
- FOUND: src/components/ui/Input.tsx
- FOUND: src/components/ui/Select.tsx
- FOUND: src/components/ui/Modal.tsx
- FOUND commit: d4e4b42 (ThemeSync)
- FOUND commit: 701546f (UI primitives)
- CLEAN: no @apply directives in any component file
- CLEAN: no store imports in ui/

---
*Phase: 03-layout-shell*
*Completed: 2026-04-04*
