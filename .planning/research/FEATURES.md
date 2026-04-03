# Feature Research

**Domain:** Personal Finance Dashboard UI (Frontend Assignment)
**Researched:** 2026-04-03
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete. In an evaluation context these are the baseline the grader checks first.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Summary KPI cards (Balance, Income, Expenses) | First thing every finance dashboard shows; establishes financial picture at a glance | LOW | Three cards minimum: Total Balance, Total Income, Total Expenses. Values must update reactively when transactions change. |
| Transaction list with date, amount, category, type | Core data surface; every finance product exposes raw transactions | MEDIUM | Must support income and expense types. Display newest-first by default. |
| Filter transactions (category, type, date range) | Users cannot understand spending without being able to isolate periods or categories | MEDIUM | Multi-criteria filtering. Active filter indicators required so users know filters are applied. |
| Sort transactions (date, amount, category) | Table stakes for any data table — users sort to find patterns and extremes | LOW | Ascending/descending toggles per column. |
| Search transactions | Expected for any list of >10 items; users look up specific payees or memos | LOW | Live search, debounced. Match on description/category fields. |
| Time-series chart (balance or income/expense trend) | Line/area charts over time are how finance products show trend — users expect to "see their money move" | MEDIUM | Monthly granularity is sufficient for mock data. Recharts AreaChart or LineChart. |
| Categorical breakdown chart (spending by category) | Pie/donut charts for spending by category are standard across every personal finance product (Mint, YNAB, etc.) | MEDIUM | Labels must be legible. Show percentages. |
| Responsive layout (mobile, tablet, desktop) | 2026 standard — a non-responsive dashboard is an automatic fail for frontend evaluation | MEDIUM | Breakpoints: <640px mobile, 640-1024px tablet, >1024px desktop. Recharts must resize. |
| Empty / zero-data state | Users (and evaluators) will load the app with no transactions; a blank white page signals incomplete product | LOW | Meaningful icon + message + call-to-action for each empty surface. Charts, transaction list, and insights all need empty states. |
| Data persistence across page refresh | Without persistence, every reload loses all added transactions; breaks the mental model | LOW | localStorage for transactions and selected role. Zustand middleware (persist) handles this cleanly. |

### Differentiators (Competitive Advantage)

Features that elevate the submission from functional to impressive. These map directly to the evaluation criteria of "design/creativity," "UX," and "attention to detail."

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Dark mode toggle | Demonstrates UI polish and system awareness; expected in 2026 but differentiates in assignment context because most submissions skip it | LOW | CSS custom properties or Tailwind dark: variants. Persist preference in localStorage. Smooth transition (no flash). |
| Role-based UI simulation (Viewer vs Admin) | Demonstrates RBAC pattern knowledge without a backend. Evaluators specifically look for this as a "feature understanding" signal | MEDIUM | Role dropdown or toggle in header. Admin: add/edit transactions. Viewer: read-only. Use Zustand role store. Protect add/edit actions with conditional rendering, not routing. |
| Insights section (highest spending category, monthly comparison, key observations) | Transforms raw data into value; most finance apps differentiate here. Shows data analysis thinking beyond basic charts | MEDIUM | Derive 3-4 key insights from transaction data: highest category, month-over-month change, income vs expense ratio. Auto-updating as transactions change. |
| Export transactions (CSV / JSON) | Demonstrates thinking beyond display; shows the user owns their data — a trust and value signal | LOW | Client-side only using Blob API. No libraries needed. Two buttons: Export CSV, Export JSON. |
| Smooth animations and micro-interactions | Small polish signals big attention to detail — exactly what evaluation rewards. Card count-up, chart entrance animations, hover states | MEDIUM | Framer Motion for card/page transitions. Recharts has built-in animation on mount. Avoid animation on every interaction — keep it purposeful. |
| Monthly comparison / trend insight | Contextual comparison ("You spent 18% more this month than last month") turns a number into a decision — evaluators notice this | MEDIUM | Compare current month vs previous month for expenses. Requires grouping transactions by month. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem like good ideas but introduce scope risk, complexity, or UX harm for this specific project.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Real-time / WebSocket data feed | "Live data makes it feel real" | Requires a backend; out of scope. Mock data with fake "live" polling creates complexity for zero user benefit in a static assignment | Use realistic mock data with enough variety to demonstrate all UI states. Static is sufficient. |
| Complex budget management (limits per category, alerts) | Personal finance apps like YNAB do this | Requires additional data model (budgets table), UI for budget CRUD, and alert logic — doubles scope for a feature not in requirements | Insights section already shows highest category; that's sufficient budget awareness for this scope. |
| Authentication flow (login/logout screens) | RBAC implies auth | Out of scope per PROJECT.md. Adding login screens means routing, form validation, and token handling — all complexity that distracts from the actual dashboard | Role dropdown/toggle in header simulates role switching cleanly without auth overhead. |
| Pagination on transaction list | "Performance best practice" | With mock data of <200 rows, pagination adds interaction complexity for zero performance gain. Evaluators navigating between pages is friction, not value | Use virtual scrolling or simple infinite scroll only if transaction count exceeds 100. Otherwise scroll the full list. |
| Third-party integrations (Plaid, bank sync) | "Real finance apps do this" | Requires backend, OAuth, sensitive credential handling — completely out of scope for a frontend-only assignment | Mock realistic-looking transaction data that covers all categories and edge cases |
| Overlapping / 3D chart effects | "Looks impressive" | 3D pie charts distort proportional reading. Visual flourishes that sacrifice accuracy signal poor data visualization judgment — evaluators with data background penalize this | Flat 2D charts with clear labels. Recharts defaults are correct. |
| Dashboard widget drag-and-drop customization | "Personalization is a differentiator" | High implementation complexity (react-grid-layout or similar), difficult to make accessible, and not in requirements. Time investment is disproportionate to evaluation credit | Focus polish time on transitions and micro-interactions instead — higher signal per hour. |
| Notification / alert system | "Finance apps have alerts" | Requires a persistence layer for alert state, logic for threshold detection, and notification UI — significant scope for a feature not requested | Insights section already surfaces the same information (high spending, anomalies) in a readable, non-intrusive way. |

## Feature Dependencies

```
Summary KPI cards
    └──requires──> Transaction data model (income/expense/category/date)
                       └──requires──> Mock data seed + localStorage persistence

Transaction list (display)
    └──requires──> Transaction data model
        └──enhances──> Filter + Sort + Search (needs base list to operate on)

Time-series chart
    └──requires──> Transaction data model
    └──requires──> Date grouping utility (group by month)

Categorical chart
    └──requires──> Transaction data model
    └──requires──> Category grouping utility

Insights section
    └──requires──> Transaction data model
    └──requires──> Date grouping utility (for monthly comparison)
    └──enhances──> Summary KPI cards (contextualizes the numbers)

Admin: Add/Edit transactions
    └──requires──> Role state (Viewer vs Admin)
    └──requires──> Transaction data model
    └──requires──> localStorage persistence (changes must survive refresh)

Export CSV/JSON
    └──requires──> Transaction data model (array access)

Dark mode toggle
    └──independent──> all other features (CSS layer only)

Role toggle (Viewer/Admin)
    └──independent──> visual features
    └──gates──> Admin: Add/Edit transactions

Empty states
    └──requires──> All data-displaying components (wraps each one)
    └──conflicts──> Seeded mock data (empty state never shows if data is pre-seeded)
        └──resolution──> Provide "Clear all transactions" in Admin mode to trigger empty states
```

### Dependency Notes

- **Transaction data model is the root dependency**: Every chart, card, list, insight, and export derives from it. It must be defined and seeded before any display component is built.
- **Date grouping utility is shared**: Both the time-series chart and the insights section need transactions grouped by month. Extract this as a pure utility function early to avoid duplication.
- **Empty state conflicts with pre-seeded data**: If mock data is always present, evaluators never see empty states. Admin role should expose a "Reset data" or "Clear transactions" action so the evaluator can verify empty state handling deliberately.
- **Role state gates Admin features**: Conditional rendering (not routing) is the right pattern here. All data is always accessible; only write actions are hidden for Viewer role.

## MVP Definition

### Launch With (v1)

This is a single-version submission — all requirements are v1. Every item below is in scope.

- [ ] Transaction data model + mock seed data (20-30 varied transactions across categories and months) — root dependency for everything
- [ ] localStorage persistence with Zustand persist middleware — required before any mutation features
- [ ] Summary KPI cards (Balance, Income, Expenses) — first thing grader sees
- [ ] Transaction list with filter, sort, search — core functional demonstration
- [ ] Time-series chart (monthly balance or income/expense trend) — demonstrates charting skill
- [ ] Categorical chart (spending by category, pie or donut) — completes charting requirement
- [ ] Insights section (3-4 auto-derived observations) — differentiates from basic implementations
- [ ] Role-based UI (Viewer read-only, Admin add/edit) with role toggle — demonstrates RBAC understanding
- [ ] Dark mode toggle with persistence — demonstrates UI polish
- [ ] Export CSV and JSON — demonstrates data ownership thinking
- [ ] Smooth animations on cards and charts — micro-polish for evaluation impression
- [ ] Responsive layout across mobile/tablet/desktop — non-negotiable in 2026
- [ ] Empty/no-data states for all data surfaces — signals complete, production-minded thinking

### Add After Validation (v1.x)

Not applicable — this is a one-shot submission. All features are v1.

### Future Consideration (v2+)

Features that would be natural next steps if this were a real product (not relevant to submission scope):

- [ ] Backend API + real database — enables real user data
- [ ] Budget goals and category spending limits — adds planning layer
- [ ] Recurring transaction detection — pattern recognition
- [ ] Real bank sync (Plaid) — replaces mock data

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Transaction data model + mock data | HIGH | LOW | P1 |
| localStorage persistence | HIGH | LOW | P1 |
| Summary KPI cards | HIGH | LOW | P1 |
| Transaction list display | HIGH | LOW | P1 |
| Filter / sort / search | HIGH | MEDIUM | P1 |
| Time-series chart | HIGH | MEDIUM | P1 |
| Categorical chart | HIGH | MEDIUM | P1 |
| Responsive layout | HIGH | MEDIUM | P1 |
| Role-based UI (Viewer/Admin) | HIGH | MEDIUM | P1 |
| Empty states | MEDIUM | LOW | P1 |
| Dark mode toggle | MEDIUM | LOW | P1 |
| Insights section | HIGH | MEDIUM | P1 |
| Export CSV/JSON | MEDIUM | LOW | P1 |
| Smooth animations / micro-interactions | MEDIUM | MEDIUM | P1 |
| Add/Edit transaction forms (Admin) | HIGH | MEDIUM | P1 |

**Priority key:**
- P1: Must have for launch (all features are P1 per project requirements)
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | Mint / Credit Karma | YNAB | Our Approach |
|---------|---------------------|------|--------------|
| Summary cards | Balance, spending, net worth | Budget remaining per category | Balance + Income + Expenses (simpler, clear) |
| Transaction list | Infinite scroll, category auto-assign | Manual entry, goal-linked | Manual entry with category select, sortable/filterable |
| Charts | Line chart (spending over time) + pie (by category) | Bar chart (budget vs actual) | Area chart (trend) + pie/donut (by category) — matches evaluator expectations |
| Insights | "You spent X% more than average" | "Overspent in Dining" | Auto-derived observations: highest category, monthly comparison, income/expense ratio |
| Roles | Not applicable (single-user) | Not applicable | Viewer/Admin toggle — frontend simulation only |
| Dark mode | Mint: No. Credit Karma: Yes | YNAB: Yes | Yes — persist to localStorage |
| Export | Limited CSV | Full CSV | CSV + JSON both — demonstrates technical depth |
| Empty states | Generic | Guided onboarding | Contextual icon + message + CTA per surface |

## Sources

- [Fintech UX Best Practices 2026 — Eleken](https://www.eleken.co/blog-posts/fintech-ux-best-practices)
- [Fintech Dashboard Design — Merge Rocks](https://merge.rocks/blog/fintech-dashboard-design-or-how-to-make-data-look-pretty)
- [Fintech UX Mistakes to Avoid — Toda Pay](https://todapay.com/blog/ctrl-z-mistakes-we-keep-repeating-in-fintech-design)
- [Dashboard Design Principles 2026 — DesignRush](https://www.designrush.com/agency/ui-ux-design/dashboard/trends/dashboard-design-principles)
- [Empty State UX Examples — Eleken](https://www.eleken.co/blog-posts/empty-state-ux)
- [Open-Source Financial Dashboard (React) — DEV Community](https://dev.to/reactjsguru/open-source-financial-dashboard-track-manage-your-money-1jg1)
- [Finance Dashboard — GitHub (Thakurkartik30)](https://github.com/Thakurkartik30/finance-dashboard)
- [Implementing RBAC in React — Permit.io](https://www.permit.io/blog/implementing-react-rbac-authorization)
- [Personal Finance Dashboard UX — Designing for Financial Behavior — Eleven Space](https://www.elevenspace.co/blog/designing-for-financial-behavior-ux-that-builds-better-money-habits)

---
*Feature research for: Personal Finance Dashboard UI (React + Vite frontend assignment)*
*Researched: 2026-04-03*
