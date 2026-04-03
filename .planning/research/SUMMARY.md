# Project Research Summary

**Project:** Finance Dashboard UI
**Domain:** React SPA — Personal Finance Dashboard (frontend-only, no backend)
**Researched:** 2026-04-03
**Confidence:** HIGH

## Executive Summary

This project is a frontend-only React SPA that simulates a personal finance dashboard: KPI summary cards, interactive charts, a filterable transaction list, role-based UI simulation, and data export. The established approach for this domain is a Vite + React 19 + TypeScript scaffold with Recharts for charting, Zustand for state with localStorage persistence, and Tailwind CSS v4 for styling. All four research files converge on the same stack with no significant disagreements, and all recommended libraries have confirmed React 19 compatibility. The architecture is well-understood: feature-scoped component folders, Zustand slice composition, and derived-state selector hooks — patterns with clear community consensus and no exotic integration requirements.

The recommended build order flows strictly from data dependency: types and mock data must exist before the state layer, the state layer must exist before any UI component, and the layout shell must exist before feature pages. Every chart, card, insight, and export derives from a single `Transaction` data model, making the data layer the true root dependency of the entire product. The most import differentiating features — insights panel, role-based UI simulation, dark mode, and CSV/JSON export — are all achievable at low-to-medium complexity and provide outsized evaluation signal relative to implementation cost.

The primary risks are all library-integration pitfalls, not domain complexity. Recharts requires data normalization and explicit container heights before it will render reliably; Zustand's persist middleware requires versioning and `partialize` from the start; and Tailwind's dark mode does not automatically theme Recharts SVG elements — chart colors must be driven by CSS variables. None of these risks are blocking if addressed in the correct phase. All pitfalls have clear, low-cost prevention strategies that should be baked into the foundation and state layers before feature work begins.

## Key Findings

### Recommended Stack

The stack is a modern React 19 + Vite 8 SPA. Vite 8 uses Rolldown (a Rust-based bundler) for dramatically faster builds and ships first-party Tailwind CSS v4 integration via `@tailwindcss/vite`, eliminating the need for PostCSS configuration. TypeScript 5.x is required by Zustand v5 and provides meaningful autocomplete on store slices and chart data shapes. Recharts 3.x is the correct charting library because it confirmed React 19 support (v2.x did not), uses a composable React-native API, and supports dark mode via CSS variable props. Zustand 5.x is the right state manager for this scope: ~1.2KB, no Provider boilerplate, native `useSyncExternalStore`, and built-in persist middleware.

**Core technologies:**
- React 19.x: UI rendering — concurrent-mode features, Actions, confirmed compat with all chosen libraries
- Vite 8.x: Build tool — Rolldown bundler, first-party Tailwind v4 plugin, replaces CRA
- TypeScript 5.x: Static typing — required by Zustand v5; autocomplete on data shapes
- Tailwind CSS 4.x: Styling — zero PostCSS config, built-in dark mode, `@tailwindcss/vite` plugin
- Recharts 3.x: Charting — React-native API, React 19 confirmed, CSS variable dark mode support
- Zustand 5.x: State management — persist middleware, slice composition, no Provider wrapping

**Supporting utilities:**
- `date-fns` v4: Date formatting for chart axes and monthly grouping (pure ESM, tree-shakeable)
- `clsx`: Conditional class composition for dark mode and state variants
- `lucide-react`: Tree-shakeable icon set for navigation and transaction rows
- `react-hook-form` + `zod`: Admin transaction form with schema validation
- `motion` (v12): Micro-interactions and card/chart entrance animations (import from `motion/react`)
- `react-papaparse`: CSV export with correct quoting and encoding edge-case handling

**Critical version constraint:** Vite 8.x requires Node 20.19+ or Node 22.12+ — Node 18 is not supported.

### Expected Features

All features for this project are v1 scope (it is a one-shot evaluation submission). The dependency tree is rooted in the `Transaction` data model: every chart, KPI card, insight, and export derives from it, so it must be defined and seeded before any display component is built.

**Must have (table stakes — grader checks these first):**
- Summary KPI cards (Balance, Income, Expenses) — establishes financial picture; first thing grader sees
- Transaction list with date, amount, category, type — core data surface
- Filter, sort, and search on transactions — expected on any data list; multi-criteria required
- Time-series chart (monthly balance or income/expense trend) — users expect to "see money move"
- Categorical breakdown chart (spending by category, pie/donut) — standard in every finance product
- Responsive layout (mobile, tablet, desktop) — non-negotiable; non-responsive is an automatic fail
- Empty states on all data surfaces — blank screen on no data signals incomplete product
- Data persistence across page refresh via localStorage — without this, every reload loses added transactions

**Should have (differentiators — elevate from functional to impressive):**
- Dark mode toggle with persistence — expected in 2026; most submissions skip it; signals polish
- Role-based UI simulation (Viewer read-only / Admin add-edit) — demonstrates RBAC pattern knowledge
- Insights section (highest spending category, monthly comparison, income/expense ratio) — transforms raw data into value; shows data analysis thinking
- Export CSV and JSON — demonstrates data ownership thinking; low cost, high signal
- Smooth animations and micro-interactions — card count-up, chart entrance, hover states

**Defer to v2+ (out of scope for this submission):**
- Backend API and real database
- Budget goals and category spending limits
- Real bank sync (Plaid)
- Recurring transaction detection

**Anti-features to avoid:**
- Authentication flow — out of scope; role toggle in header is sufficient simulation
- Pagination on transaction list — adds interaction friction with no performance benefit at mock-data scale
- 3D or overlapping chart effects — distort proportional reading; evaluators with data background penalize this
- Dashboard drag-and-drop widget customization — disproportionate complexity for evaluation credit

### Architecture Approach

The architecture is a straightforward 5-layer SPA: entry, layout, page, state, and persistence. State is split into two Zustand slices — `txnSlice` (transactions, CRUD, filter params) and `uiSlice` (role, dark mode) — composed at `store/index.ts` with the `persist` middleware. Derived values (totals, filtered lists, chart-ready data shapes) are computed in custom selector hooks (`useSummaryTotals`, `useTransactions`) using `useMemo`, keeping component render functions free of business logic. The project structure is feature-scoped: `features/dashboard/` and `features/transactions/` are self-contained and communicate only through the shared store, never through direct imports of each other's components.

**Major components:**
1. `store/txnSlice.ts` + `store/uiSlice.ts` — all state ownership, CRUD actions, filter params, role, dark mode
2. `hooks/useTransactions.ts` + `hooks/useSummaryTotals.ts` — derived state boundary; components call these, never raw store
3. `features/dashboard/` — `SummaryCards`, `BalanceTrendChart`, `SpendingBreakdownChart`, `InsightsPanel`
4. `features/transactions/` — `FilterBar`, `TransactionTable`, `TransactionForm` (Admin-gated)
5. `components/layout/` — `AppShell`, `Header` (role switch, dark toggle, export), `Sidebar`
6. `utils/` — `financeUtils.ts`, `dateUtils.ts`, `exportUtils.ts` — pure functions with no store imports
7. `data/mockData.ts` — typed seed data; initializes store on first load when localStorage is empty

**Internal boundary rules:**
- Feature components read from the store via selector hooks only — no direct store imports inside components
- `utils/` has no store imports — testable in isolation
- `components/layout/` uses `{children}` slot pattern — feature-agnostic
- The two feature folders have no direct coupling with each other

### Critical Pitfalls

1. **Recharts crashes on malformed or empty data** — Normalize all data before passing to any chart. Every object in the array must have all expected keys (fill missing with `0`). Gate chart rendering with `data.length > 0` check; show `EmptyState` component when false. Build a `formatChartData()` utility in the Data Layer phase before wiring any chart.

2. **Zustand persist corrupts state on schema change** — Set `version: 1` in persist options from the first write. Use `partialize` to persist only serializable state (exclude action functions). Provide a `migrate` function. This must be configured in the State Management phase before any persistent state is written — retroactive fixes require users to manually clear localStorage.

3. **Recharts `ResponsiveContainer` renders at zero height** — Never use `height="100%"` on `ResponsiveContainer` inside flex/grid containers without an explicit parent height. Always use a fixed pixel value (e.g., `height={300}`). Build a `ChartWrapper` component with this convention enforced before individual charts are implemented.

4. **Tailwind dark mode does not theme Recharts SVG elements** — Recharts accepts colors as props (`stroke`, `fill`), not CSS classes. Use CSS variables (`var(--chart-axis-color)`) defined under `:root` and `html.dark`, and pass these variables to all Recharts color props. Custom Tooltip content components must be used in place of Recharts' default tooltip. Define the CSS variable palette in the Theming phase before any chart is built.

5. **Role-based UI misleading as a security feature** — Frontend role switching has no security value and can be bypassed via DevTools. Add a visible UI note near the role switcher ("UI simulation — no backend authentication") and document clearly in the README. Centralize all role checks behind a single `<RoleGate>` component — never scatter `role === 'admin'` conditionals across the codebase.

**Additional pitfalls to address by phase:**
- Zustand store created inside a component body (recreated every render) — define stores at module scope only
- CSV injection via unescaped transaction descriptions starting with `=`, `,`, or `@` — escape in export logic
- Insights section showing `NaN` or `Infinity` on division by zero — guard all computed values before display
- `framer-motion` + Tailwind `transition-*` class conflicts — remove Tailwind transition classes from motion-controlled elements

## Implications for Roadmap

Based on the combined research, a 6-phase build sequence maps directly to the architectural dependency graph identified in ARCHITECTURE.md, with pitfall prevention baked into the correct phases.

### Phase 1: Foundation — Types, Data, and Utilities

**Rationale:** The `Transaction` data model is the root dependency of every chart, card, insight, and export. Nothing else can be built until the data shape is locked and seeded. Pure utility functions (date grouping, finance aggregation) have zero dependencies and are easiest to unit-test in isolation. Building these first establishes the contract that all downstream components depend on.

**Delivers:** Typed `Transaction` entity, `Category` enum with color map, 20-30 realistic seed transactions covering all categories and months, `financeUtils.ts` (sum, group-by-category, monthly-diff), `dateUtils.ts` (format, range helpers), `exportUtils.ts` (CSV/JSON serialization).

**Addresses:** Transaction data model (root dependency for all features); "Provide Reset data in Admin mode so evaluator can test empty states" requirement.

**Avoids:** Recharts crashes on malformed data (Pitfall 1) — `formatChartData()` utility built here before any chart component exists.

### Phase 2: State Layer — Zustand Slices and Selector Hooks

**Rationale:** State must exist before any UI component can subscribe to it. Configuring persist middleware correctly here prevents the schema-corruption pitfall from ever occurring. Selector hooks establish the API boundary between state and presentation — all downstream components code against these hooks, not raw store subscriptions.

**Delivers:** `txnSlice.ts` (transactions array, CRUD actions, filter params), `uiSlice.ts` (role, darkMode), `store/index.ts` (slice composition + persist with `version: 1` + `partialize`), `useTransactions.ts` (filtered/sorted selector), `useSummaryTotals.ts` (memoized aggregates).

**Addresses:** localStorage persistence (table stakes); role state for Viewer/Admin simulation; dark mode state.

**Avoids:** Zustand persist schema corruption (Pitfall 2) — version and partialize configured from day one. Zustand store inside component (Pitfall 5) — module-level creation enforced.

### Phase 3: Layout Shell — App Frame, Theme, and Navigation

**Rationale:** The layout shell (AppShell, Header, Sidebar, ThemeProvider) is the harness that all feature pages mount inside. Building it before features means feature pages slot into a complete frame rather than being rebuilt when the frame is added later. Dark mode CSS variables must be defined here before any chart component is built.

**Delivers:** `ThemeProvider.tsx` (dark class toggle on `document.documentElement`), `AppShell.tsx`, `Header.tsx` (role switcher with "UI simulation" disclaimer, dark toggle, export button wiring), `Sidebar.tsx` (navigation), shared UI primitives (`Button`, `Card`, `Badge`, `Input`, `Select`, `Modal`), CSS variable palette for chart colors under `:root` and `html.dark`.

**Addresses:** Dark mode toggle with persistence (differentiator); role-based UI switcher in header (differentiator).

**Avoids:** Tailwind + Recharts dark mode mismatch (Pitfall 4) — CSS variable palette defined here before any chart is built. Role-based UI misleading as security (Pitfall 6) — UI disclaimer label set here.

**Research flag:** Standard patterns — Tailwind v4 dark mode with CSS variables is well-documented. No additional research needed.

### Phase 4: Dashboard Feature — Charts, KPI Cards, and Insights

**Rationale:** The dashboard is the primary evaluator landing view and delivers the highest concentration of evaluation criteria: charts, KPI cards, insights. Building in this order (cards first, then charts, then insights) maps to increasing complexity while keeping each step testable. The `ChartWrapper` component with correct `ResponsiveContainer` height conventions must be the first thing built in this phase.

**Delivers:** `ChartWrapper.tsx` (ResponsiveContainer with fixed pixel heights), `SummaryCards.tsx` (Balance, Income, Expenses — reads from `useSummaryTotals`), `BalanceTrendChart.tsx` (monthly area/line chart with CSS-variable colors), `SpendingBreakdownChart.tsx` (pie/donut by category), `InsightsPanel.tsx` (highest category, monthly comparison, income/expense ratio — with division-by-zero guards), `DashboardPage.tsx`.

**Addresses:** Summary KPI cards, time-series chart, categorical chart, insights section — all table stakes or differentiators.

**Avoids:** ResponsiveContainer zero height (Pitfall 3) — `ChartWrapper` enforces fixed pixel height. Insights NaN/Infinity — division-by-zero guards in `InsightsPanel`. Chart rendering on empty data — `EmptyState` shown when `data.length === 0`.

**Research flag:** Standard patterns — Recharts composable API and chart shaping with selector hooks are well-documented. Pitfall prevention strategies are clear.

### Phase 5: Transactions Feature — List, Filters, and Admin Forms

**Rationale:** The transactions view is the second primary page and the home of all interactive CRUD functionality. FilterBar and TransactionTable can be built and tested against real store data from Phase 2. TransactionForm is Admin-gated and represents the highest-complexity component (form validation with react-hook-form + zod, localStorage mutation).

**Delivers:** `FilterBar.tsx` (search, category filter, date range, sort — with active filter indicators), `TransactionTable.tsx` (newest-first default, sort headers, combined filter+sort), `TransactionForm.tsx` (Admin-only add/edit with react-hook-form + zod validation, input sanitization against XSS), `<RoleGate>` component (centralized role-check wrapper), `TransactionsPage.tsx`.

**Addresses:** Transaction list, filter/sort/search, Admin add/edit transactions, role-based write-action gating, CSV injection prevention in form inputs.

**Avoids:** Role logic scattered across components (Pitfall 6 recovery) — `<RoleGate>` centralizes all role checks. CSV injection via form input — zod schema validation sanitizes descriptions before they enter the store.

**Research flag:** Standard patterns — react-hook-form + zod integration is thoroughly documented.

### Phase 6: Polish — Export, Animations, Responsive, Empty States, and QA

**Rationale:** Polish builds on top of fully working functionality. Attempting animations or empty states before core features are complete wastes effort on components that may need restructuring. This phase addresses every item on the "Looks Done But Isn't" checklist from PITFALLS.md.

**Delivers:** CSV and JSON export wired to Header button (raw number values, CSV injection escaped), `EmptyState` component deployed on all data surfaces (charts, transaction table, insights), entrance animations on KPI cards and charts via `motion` (with `prefers-reduced-motion` respect via `useReducedMotion`), responsive layout audit at 375px/768px/1280px breakpoints, "Clear all transactions" Admin action to enable empty state testing by evaluator, README with role simulation disclaimer, final QA pass against the full checklist.

**Addresses:** Export CSV/JSON (differentiator), empty/zero-data states (table stakes), responsive layout (table stakes), animations/micro-interactions (differentiator).

**Avoids:** framer-motion + Tailwind transition conflict — Tailwind `transition-*` classes removed from motion-controlled elements. CSV injection in export — raw numbers exported, formula characters escaped. Mobile chart overflow — explicit smaller heights at mobile breakpoints.

**Research flag:** Standard patterns — animation patterns and responsive Recharts are well-documented.

### Phase Ordering Rationale

- Types and utilities have zero dependencies — they must come before anything else, otherwise the data contract is undefined during development.
- State layer depends only on types — configuring it early, with persist versioning from the start, is the single most important pitfall prevention step in the entire project.
- Layout shell depends on state (for role and theme) and must precede feature pages — building it before features means pages slot into a complete frame.
- Dashboard before transactions — dashboard is the primary evaluator landing view and delivers more evaluation criteria per line of code than any other phase.
- Polish last — it layers on top of working functionality and requires all components to be structurally complete before animation and responsive work is meaningful.

### Research Flags

Phases with standard patterns (skip additional research during planning — patterns are clear):
- **Phase 1 (Foundation):** `date-fns` formatting and Zustand type patterns are thoroughly documented.
- **Phase 2 (State):** Zustand slice composition and persist middleware are standard patterns with official documentation.
- **Phase 3 (Layout):** Tailwind v4 dark mode with CSS variables is documented; `@tailwindcss/vite` plugin setup is straightforward.
- **Phase 4 (Dashboard):** Recharts composable API patterns and `useMemo`-based selector hooks are well-documented.
- **Phase 5 (Transactions):** react-hook-form + zod is one of the most documented React form patterns available.
- **Phase 6 (Polish):** Animation and responsive patterns are standard; the "Looks Done But Isn't" checklist from PITFALLS.md serves as the QA guide.

No phase in this project requires additional `/gsd:research-phase` invocation. All integration patterns are sufficiently documented in the research files.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All library versions verified against official release pages and npm. React 19 compat confirmed for all chosen libraries. Node version constraint (20.19+) documented. |
| Features | HIGH | Feature list derived from fintech UX research, competitor analysis (Mint, YNAB), and evaluation criteria interpretation. All features have clear implementation paths. |
| Architecture | HIGH | Patterns sourced from official Zustand docs, React architectural guides, and Recharts internals documentation. Slice composition and selector hook patterns have broad community consensus. |
| Pitfalls | HIGH | Pitfalls verified against official GitHub issue trackers (Recharts, Zustand, Tailwind) and community postmortems. Each pitfall has a confirmed prevention strategy with code-level specificity. |

**Overall confidence:** HIGH

### Gaps to Address

- **Vite 8 + Tailwind v4 `@custom-variant dark` syntax:** Tailwind v4 changed the dark mode configuration syntax from `darkMode: 'class'` (v3) to `@custom-variant dark`. The exact CSS syntax should be verified against the `@tailwindcss/vite` plugin changelog at implementation time — the integration guide in ARCHITECTURE.md notes this difference but recommends confirming the exact config format during Phase 3.
- **Recharts 3.x tooltip custom content API:** The PITFALLS.md research recommends custom Tooltip components for dark mode compatibility but does not provide the exact Recharts 3.x API for custom tooltip content (`content` prop shape). Verify against the Recharts 3.x docs during Phase 4 chart implementation.
- **`react-papaparse` vs native Blob:** STACK.md notes that the `CSVDownloader` component from `react-papaparse` can be blocked by some browsers and recommends using `jsonToCSV` utility + native Blob instead. The exact `react-papaparse` API surface for `jsonToCSV` should be confirmed at implementation time in Phase 6.

None of these gaps are blocking. They are implementation-time verification points, not unknowns that affect phase structure or technology choices.

## Sources

### Primary (HIGH confidence — official documentation and release pages)
- [Vite 8.0 Official Announcement](https://vite.dev/blog/announcing-vite8) — version and Node requirement confirmed
- [React v19 Official Blog](https://react.dev/blog/2024/12/05/react-19) — stable release confirmed
- [Tailwind CSS v4.0 Official Blog](https://tailwindcss.com/blog/tailwindcss-v4) — stable release, Vite plugin, dark mode changes
- [Recharts GitHub Releases](https://github.com/recharts/recharts/releases) — v3.8.1 confirmed
- [Recharts 3.0 Migration Guide](https://github.com/recharts/recharts/wiki/3.0-migration-guide) — React 19 compat, state rewrite
- [Zustand v5 Announcement](https://pmnd.rs/blog/announcing-zustand-v5) — v5.0.11 confirmed
- [Zustand persist middleware reference](https://zustand.docs.pmnd.rs/reference/middlewares/persist) — version, migrate, partialize API
- [Motion for React docs](https://motion.dev/docs/react) — import path `motion/react` confirmed
- [Tailwind CSS dark mode — Official Docs](https://tailwindcss.com/docs/dark-mode) — class strategy and v4 syntax

### Secondary (MEDIUM confidence — community consensus, multiple sources agree)
- [Recharts GitHub Issues — data structure crashes](https://github.com/recharts/recharts/issues) — Pitfall 1 validation
- [Zustand best practices — Project Rules](https://www.projectrules.ai/rules/zustand) — module-level store creation
- [Zustand Architecture Patterns at Scale — Brainhub](https://brainhub.eu/library/zustand-architecture-patterns-at-scale) — slice composition pattern
- [React Financial Dashboard Design Patterns — Oliver Triunfo](https://olivertriunfo.com/react-financial-dashboards/) — architecture reference
- [Fintech UX Best Practices 2026 — Eleken](https://www.eleken.co/blog-posts/fintech-ux-best-practices) — feature expectations
- [Implementing RBAC in React — Permit.io](https://www.permit.io/blog/implementing-react-rbac-authorization) — role gate pattern
- [Empty State UX Examples — Eleken](https://www.eleken.co/blog-posts/empty-state-ux) — empty state design guidance
- [framer-motion + Tailwind conflict resolution](https://motion.dev/docs/react-tailwind) — Pitfall 9 validation
- [Frontend RBAC — not a security boundary — LogRocket](https://blog.logrocket.com/choosing-best-access-control-model-frontend/) — Pitfall 6 validation

### Tertiary (contextual — blog posts and community guides)
- [Tailwind CSS v4 Vite setup guide — DEV Community](https://dev.to/imamifti056/how-to-setup-tailwind-css-v415-with-vite-react-2025-updated-guide-3koc) — install steps
- [Zustand migrate store to new version — Relatable Code](https://relatablecode.com/how-to-migrate-zustand-local-storage-store-to-a-new-version) — migration pattern
- [State of React State Management 2026 — PkgPulse](https://www.pkgpulse.com/blog/state-of-react-state-management-2026) — Zustand adoption signal

---
*Research completed: 2026-04-03*
*Ready for roadmap: yes*
