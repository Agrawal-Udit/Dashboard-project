# Roadmap: Finance Dashboard

## Overview

This roadmap builds the Finance Dashboard from the ground up in six phases, ordered strictly by the data dependency graph. Types and mock data come first because every chart, card, insight, and export derives from the Transaction model. The state layer comes second to establish the API boundary all UI components code against. The layout shell comes third to provide the frame into which feature pages slot. Dashboard and transactions features follow in order of evaluation priority. Polish is last because animations and responsive audit require structurally complete components.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - Types, mock data, and utility functions — the data contract everything else depends on (completed 2026-04-04)
- [x] **Phase 2: State Layer** - Zustand slices, persist middleware, and selector hooks (completed 2026-04-04)
- [ ] **Phase 3: Layout Shell** - App frame, dark mode theming, role switcher, and shared UI primitives
- [ ] **Phase 4: Dashboard** - KPI cards, time-series chart, categorical chart, and insights panel
- [ ] **Phase 5: Transactions** - Transaction list, filter/sort/search, and Admin add/edit forms
- [ ] **Phase 6: Polish** - Export, animations, responsive audit, empty states, and final QA

## Phase Details

### Phase 1: Foundation
**Goal**: The data contract is locked — typed Transaction entity, realistic seed data, and pure utility functions exist and are testable in isolation before any UI component is written
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-02, FOUND-03
**Success Criteria** (what must be TRUE):
  1. A TypeScript Transaction type exists with id, date, amount, category, type (income|expense), and description fields — compiles with zero type errors
  2. 25-30 seed transactions exist covering at least 3 months, multiple categories, and both income and expense entries — importable from mockData.ts
  3. formatCurrency and formatDate utilities return correctly formatted output for valid inputs and edge cases (zero, negative, missing values)
  4. groupByCategory and calcTotals return correct aggregates when run against the seed dataset
  5. formatChartData utility normalizes transaction arrays into chart-ready shapes with no missing keys (Recharts crash prevention verified)
**Plans**: 3 plans

Plans:
- [x] 01-01-PLAN.md — Vite scaffold, test infra, and failing test stubs (Wave 0 — RED state)
- [x] 01-02-PLAN.md — Transaction type, Category constants, and 25-30 seed transactions
- [x] 01-03-PLAN.md — Pure utility functions: formatCurrency, formatDate, calcTotals, groupByCategory, formatChartData

### Phase 2: State Layer
**Goal**: All application state is owned by Zustand slices with persist middleware configured correctly from day one — components can subscribe to transactions, role, and dark mode without importing raw store state
**Depends on**: Phase 1
**Requirements**: FOUND-04, FOUND-05, ROLE-02
**Success Criteria** (what must be TRUE):
  1. Zustand store has a transactions slice with add, edit, and delete actions that update state immutably
  2. Zustand store has a UI slice with role (Viewer|Admin) and darkMode (boolean) fields
  3. Persist middleware is configured with version: 1, partialize (excluding action functions), and a migrate function — localStorage schema is stable
  4. Selected role persists correctly across a full page refresh (observable in browser)
  5. useTransactions and useSummaryTotals selector hooks return filtered/sorted and aggregated data respectively, derived from store state via useMemo
**Plans**: 4 plans

Plans:
- [ ] 02-01-PLAN.md — Install zustand+immer, update vitest config to jsdom, write all failing test stubs (Wave 0 — RED state)
- [ ] 02-02-PLAN.md — Implement txnSlice.ts and uiSlice.ts StateCreator functions
- [ ] 02-03-PLAN.md — Implement store.ts with persist middleware and selector hooks (useTransactions, useSummaryTotals)
- [ ] 02-04-PLAN.md — Manual browser verification: role persists across page refresh (ROLE-02)

### Phase 3: Layout Shell
**Goal**: A complete app frame exists — header with role switcher and dark toggle, sidebar navigation, shared UI primitives, and the CSS variable color palette for charts — ready for feature pages to slot in
**Depends on**: Phase 2
**Requirements**: ROLE-01, UX-01, UX-02
**Success Criteria** (what must be TRUE):
  1. User can switch between Viewer and Admin roles via a dropdown or toggle in the header; a visible "UI simulation — no backend authentication" disclaimer is present near the switcher
  2. User can toggle between light and dark mode via a control in the header; the entire UI (cards, sidebar, navigation) switches theme correctly
  3. Dark mode preference persists correctly across a full page refresh
  4. CSS variable palette for chart colors is defined under :root and html.dark — Recharts SVG elements receive color values via CSS variables, not hardcoded hex
  5. Shared UI primitives (Button, Card, Badge, Input, Select, Modal) render correctly in both light and dark themes
**Plans**: TBD

### Phase 4: Dashboard
**Goal**: The primary evaluator landing view is complete — KPI summary cards, a time-series chart, a categorical spending chart, and an insights panel all read from live store data
**Depends on**: Phase 3
**Requirements**: DASH-01, DASH-02, DASH-03, DASH-04
**Success Criteria** (what must be TRUE):
  1. User can see Total Balance, Total Income, and Total Expenses as KPI cards that display correct values derived from the current transaction dataset
  2. User can see a time-series chart (area or line) showing balance trend across at least 2 months of data; chart renders at correct height and does not crash on the seed dataset
  3. User can see a categorical chart (pie or donut) showing spending breakdown by category with correct proportions and labeled segments
  4. User can see an insights section displaying: the highest spending category by amount, a month-over-month comparison (e.g., "Expenses up 12% vs last month"), and at least one additional observation — all values are free of NaN and Infinity even on edge-case data
  5. All dashboard charts and cards display a meaningful empty state when the transaction store is empty rather than a blank or broken layout
**Plans**: TBD

### Phase 5: Transactions
**Goal**: The transactions page is fully functional — users can view, filter, sort, and search the full transaction list, and Admin users can add and edit transactions via a validated form
**Depends on**: Phase 4
**Requirements**: TXN-01, TXN-02, TXN-03, TXN-04, TXN-05, TXN-06, TXN-07, TXN-08
**Success Criteria** (what must be TRUE):
  1. User can view a list of all transactions showing date, amount, category, type (income/expense), and description for each row
  2. User can filter transactions by type (income / expense / all) and see the list update immediately
  3. User can filter transactions by category (single or multi-select) and see the list update immediately
  4. User can type in a search box and see only transactions whose description contains the search text
  5. User can sort transactions by date, amount, or category by clicking column headers; default sort is newest-first
  6. Admin user can open an add-transaction form, fill in all fields with validation feedback, submit, and see the new transaction appear in the list
  7. Admin user can click edit on any existing transaction, modify fields, and see the updated values reflected immediately
  8. Viewer user does not see the add or edit controls anywhere in the transactions view (role-gated via RoleGate component)
**Plans**: TBD

### Phase 6: Polish
**Goal**: The application is submission-ready — CSV/JSON export works, all data surfaces have empty states, entrance animations play on load, the layout is verified usable at 375px/768px/1280px, and a final QA pass confirms no regressions
**Depends on**: Phase 5
**Requirements**: UX-03, UX-04, UX-05, UX-06, UX-07
**Success Criteria** (what must be TRUE):
  1. User can export the currently visible (filtered) transaction list as a CSV file that opens correctly in a spreadsheet app; formula-injection characters in descriptions are escaped
  2. User can export the currently visible (filtered) transaction list as a JSON file with correctly structured data
  3. KPI cards, charts, and page transitions have smooth entrance animations that respect prefers-reduced-motion; no Tailwind transition-class conflicts with motion-controlled elements
  4. All list, chart, and card views display a meaningful empty state (helpful message, not a blank area) when no data matches the current filters or when the transaction store is empty
  5. The application is usable without horizontal scrolling or overlapping elements at 375px (mobile), 768px (tablet), and 1280px+ (desktop) viewport widths
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 3/3 | Complete    | 2026-04-04 |
| 2. State Layer | 4/4 | Complete   | 2026-04-04 |
| 3. Layout Shell | 0/TBD | Not started | - |
| 4. Dashboard | 0/TBD | Not started | - |
| 5. Transactions | 0/TBD | Not started | - |
| 6. Polish | 0/TBD | Not started | - |
