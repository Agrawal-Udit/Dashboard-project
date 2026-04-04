---
phase: 03-layout-shell
plan: "03"
subsystem: layout-shell
tags: [layout, header, sidebar, routing, dark-mode, role-switcher, responsive]

dependency_graph:
  requires:
    - 03-01  # ThemeSync, FOWT, Tailwind v4, test infra
    - 03-02  # UI primitives (Button, Card, Badge, Input, Select, Modal)
  provides:
    - App shell: Header + Sidebar + AppLayout fully wired
    - Routing: BrowserRouter with / and /transactions routes
    - Page placeholders: DashboardPage, TransactionsPage
  affects:
    - src/App.tsx (restructured with BrowserRouter + Routes)
    - All future pages (rendered inside AppLayout)

tech_stack:
  added: []
  patterns:
    - Responsive sidebar: md:static + fixed slide-in on mobile with overlay
    - NavLink active-state className callback for visual route highlighting
    - Functional update form setSidebarOpen((prev) => !prev) to avoid stale closure

key_files:
  created:
    - src/components/layout/Header.tsx
    - src/components/layout/Sidebar.tsx
    - src/components/layout/AppLayout.tsx
    - src/pages/DashboardPage.tsx
    - src/pages/TransactionsPage.tsx
  modified:
    - src/App.tsx

decisions:
  - "Header uses four separate useAppStore((s) => s.field) selector calls — matches test mock's per-call interception pattern"
  - "Sidebar NavLink uses end={to === '/'} to prevent Dashboard always appearing active at /transactions"
  - "ThemeSync placed outside AppLayout but inside BrowserRouter to remain in React tree without affecting layout"
  - "setSidebarOpen uses functional updater (prev) => !prev to avoid stale closure in Header onMenuClick callback"
  - "AppLayout mobile sidebar uses hidden class toggled with translate-x-full to avoid layout shift"

metrics:
  duration: "2 minutes"
  completed_date: "2026-04-04"
  tasks_completed: 3
  tasks_total: 3
  files_created: 5
  files_modified: 1

requirements-completed: [ROLE-01, UX-01, UX-02]
---

# Phase 3 Plan 03: App Shell — Header, Sidebar, AppLayout, Routing Summary

**One-liner:** Full app shell with responsive sidebar, role-switcher + disclaimer, dark-mode toggle, and React Router routes — all 17 component tests GREEN and all 5 browser checks approved.

## What Was Built

Wave 2 of Phase 3 completes the app shell:

1. **Header** (`src/components/layout/Header.tsx`) — Role combobox (aria-label "Switch role") writes to `useAppStore.setRole`; "UI simulation — no backend authentication" disclaimer always visible; Moon/Sun dark-mode toggle writes `setDarkMode(!darkMode)` with aria-label matching `/switch to (dark|light) mode/i`.

2. **Sidebar** (`src/components/layout/Sidebar.tsx`) — Two `NavLink` items for `/` (Dashboard) and `/transactions` (Transactions) with `end={to === '/'}` to prevent double-active state; active item gets indigo highlight via className callback.

3. **AppLayout** (`src/components/layout/AppLayout.tsx`) — Responsive flex wrapper: sidebar is `md:static` (always visible) and `fixed slide-in` on mobile with a black/50 overlay. Sidebar closes on navigation or overlay click.

4. **DashboardPage** and **TransactionsPage** (`src/pages/`) — Minimal placeholder pages for Phase 4 and Phase 5 respectively.

5. **App.tsx** (replaced) — `BrowserRouter` wraps `ThemeSync` (outside `AppLayout`) + `AppLayout` + `Routes` for `/` and `/transactions`.

## Test Results

| Suite | Tests | Result |
|-------|-------|--------|
| Header.test.tsx | 5/5 | GREEN |
| ThemeSync.test.tsx | 3/3 | GREEN |
| primitives (Button, Card, Badge...) | 9/9 | GREEN |
| **Total** | **17/17** | **GREEN** |

## Build Verification

`npm run build` exits zero — 1745 modules transformed, 253.95 kB JS bundle, 21.64 kB CSS bundle.

## Browser Verification (Task 3) — APPROVED

User confirmed all 5 checks on 2026-04-04:

| Check | Requirement | Result |
|-------|-------------|--------|
| Role switcher with disclaimer visible | ROLE-01 | PASSED |
| Dark mode toggles entire UI and persists across F5 | UX-01 | PASSED |
| CSS variables (:root and html.dark) visible in DevTools | UX-02 | PASSED |
| Navigation between Dashboard and Transactions | Navigation | PASSED |
| Responsive sidebar collapses at 375px with hamburger overlay | Responsive | PASSED |

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check

| Claim | Status |
|-------|--------|
| src/components/layout/Header.tsx exists | FOUND |
| src/components/layout/Sidebar.tsx exists | FOUND |
| src/components/layout/AppLayout.tsx exists | FOUND |
| src/pages/DashboardPage.tsx exists | FOUND |
| src/pages/TransactionsPage.tsx exists | FOUND |
| Task 1 commit 74bc548 | FOUND |
| Task 2 commit 8d9474b | FOUND |
| Task 3 browser verification | APPROVED by user |
| 17/17 tests GREEN | VERIFIED |
| npm run build exits zero | VERIFIED |
| All 5 browser checks | PASSED |

## Self-Check: PASSED
