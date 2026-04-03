# Architecture Research

**Domain:** React Finance Dashboard SPA (frontend-only, no backend)
**Researched:** 2026-04-03
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Entry Layer                              │
│   main.tsx → App.tsx (ThemeProvider, Router, StoreInit)          │
├─────────────────────────────────────────────────────────────────┤
│                         Layout Layer                             │
│  ┌──────────────┐  ┌──────────────────────────────────────────┐ │
│  │   Sidebar    │  │              AppShell                     │ │
│  │  Navigation  │  │   Header (DarkToggle, RoleSwitch, Export) │ │
│  └──────────────┘  └──────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                         Page Layer                               │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   DashboardPage                          │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │    │
│  │  │  SummaryRow  │  │  ChartsRow  │  │  InsightsPanel  │ │    │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘ │    │
│  └─────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                  TransactionsPage                        │    │
│  │  ┌──────────────┐  ┌──────────────────────────────────┐ │    │
│  │  │  FilterBar   │  │       TransactionTable            │ │    │
│  │  └──────────────┘  └──────────────────────────────────┘ │    │
│  └─────────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────────┤
│                        State Layer (Zustand)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  txnSlice    │  │  uiSlice     │  │   derivedSelectors   │  │
│  │ transactions │  │  role/theme  │  │   computed totals    │  │
│  │ CRUD + filter│  │  darkMode    │  │   category sums      │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                      Persistence Layer                           │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              localStorage (zustand/persist middleware)      │ │
│  │   key: "finance-txns"   key: "finance-ui"                  │ │
│  └────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                        Data Layer                                │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              mockData.ts  (seed transactions)            │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Communicates With |
|-----------|----------------|-------------------|
| `App.tsx` | Root: wraps ThemeProvider, Router, global store init | All children via providers |
| `AppShell` | Persistent layout chrome: sidebar + header frame | Layout children only |
| `Header` | Dark mode toggle, role switcher, export trigger | uiSlice (Zustand), export util |
| `Sidebar` | Navigation links, active route highlight | React Router |
| `DashboardPage` | Orchestrates summary + chart + insights layout | txnSlice selectors |
| `SummaryCards` | Display total balance, income, expenses | txnSlice derived totals |
| `BalanceTrendChart` | Time-series area/line chart via Recharts | txnSlice (date-sorted data) |
| `SpendingBreakdownChart` | Pie/bar chart by category | txnSlice (category sums) |
| `InsightsPanel` | Computed observations: top category, monthly diff | txnSlice selectors |
| `TransactionsPage` | Orchestrates filter bar + transaction table | txnSlice, uiSlice (role) |
| `FilterBar` | Search input, category filter, date range, sort | Local state → txnSlice filter actions |
| `TransactionTable` | Paginated list with sort headers | txnSlice (filtered list) |
| `TransactionForm` | Add/edit transaction (Admin role only) | txnSlice CRUD actions |
| `EmptyState` | No-data placeholder with context-specific copy | Props only |
| `ThemeProvider` | HTML class toggle (`dark`), persist to localStorage | uiSlice or React context |
| `mockData.ts` | Static seed data array (typed `Transaction[]`) | Consumed by store init |
| `exportUtils.ts` | CSV / JSON serialization and download trigger | Called from Header |

## Recommended Project Structure

```
src/
├── assets/                  # Static images, icons, fonts
├── components/              # Shared, domain-agnostic UI primitives
│   ├── ui/                  # Badge, Button, Card, Input, Select, Modal
│   ├── charts/              # ChartWrapper, tooltips (Recharts wrappers)
│   └── layout/              # AppShell, Header, Sidebar, PageContainer
├── features/                # Feature-scoped modules (high cohesion)
│   ├── dashboard/
│   │   ├── components/      # SummaryCards, BalanceTrendChart, SpendingBreakdownChart, InsightsPanel
│   │   └── index.tsx        # DashboardPage
│   ├── transactions/
│   │   ├── components/      # TransactionTable, TransactionForm, FilterBar
│   │   └── index.tsx        # TransactionsPage
│   └── theme/
│       ├── ThemeProvider.tsx
│       └── useTheme.ts
├── store/                   # Zustand slices
│   ├── txnSlice.ts          # Transaction state + CRUD + filter actions
│   ├── uiSlice.ts           # Role, dark mode, modal state
│   └── index.ts             # Compose slices into single store
├── data/
│   └── mockData.ts          # Seed transactions (typed, realistic)
├── types/
│   └── index.ts             # Transaction, Category, Role, SummaryTotals types
├── utils/
│   ├── exportUtils.ts       # CSV / JSON export helpers
│   ├── dateUtils.ts         # Date formatting, range helpers
│   └── financeUtils.ts      # Sum, group-by-category, monthly diff
├── hooks/
│   ├── useTransactions.ts   # Selector hook: filtered + sorted transactions
│   └── useSummaryTotals.ts  # Derived totals from txnSlice
├── constants/
│   └── categories.ts        # Enum-like category list, colors
├── App.tsx                  # Router + providers root
└── main.tsx                 # Vite entry, React.render
```

### Structure Rationale

- **features/:** Each feature is self-contained. The dashboard and transactions views have distinct concerns — grouping by feature keeps related components, pages, and logic co-located and prevents cross-feature coupling.
- **components/ui/ and components/layout/:** Shared primitives (Button, Card) and layout chrome (AppShell, Sidebar) belong outside features because they serve the whole app, not a single domain.
- **store/:** Slice-per-domain pattern. `txnSlice` owns all transaction data and mutations. `uiSlice` owns presentation preferences. Selectors and derived state live in custom hooks (`useTransactions`, `useSummaryTotals`) rather than raw store subscriptions in components.
- **utils/:** Pure functions only — no side effects, no store access. Easy to unit-test in isolation.
- **types/:** Centralized TypeScript types. `Transaction` is the core entity; typed from the start prevents refactoring pain later.

## Architectural Patterns

### Pattern 1: Derived State via Selector Hooks

**What:** Compute aggregates (totals, category sums, filtered lists) in custom hooks that subscribe to the Zustand store. Components call the hook — they never compute in render.

**When to use:** Anywhere you need filtered lists, summed values, or chart-ready data shapes derived from raw transactions.

**Trade-offs:** Keeps component render functions clean and logic testable. Small overhead of an extra hook file per domain.

**Example:**
```typescript
// hooks/useSummaryTotals.ts
export function useSummaryTotals(): SummaryTotals {
  const transactions = useTransactionStore((s) => s.transactions);
  return useMemo(() => ({
    balance: transactions.reduce((acc, t) =>
      t.type === 'income' ? acc + t.amount : acc - t.amount, 0),
    income:  transactions.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0),
    expenses: transactions.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0),
  }), [transactions]);
}
```

### Pattern 2: Zustand Slice Composition

**What:** Split the global store into domain slices (`txnSlice`, `uiSlice`), composed at `store/index.ts` using Zustand's `create` with `immer` or plain spread for immutability.

**When to use:** Any time more than one domain of state exists. Prevents one monolithic file that becomes impossible to navigate.

**Trade-offs:** Slight boilerplate per slice file. Pays off quickly as features grow. Each slice re-renders only its subscribers.

**Example:**
```typescript
// store/index.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createTxnSlice, TxnSlice } from './txnSlice';
import { createUiSlice, UiSlice } from './uiSlice';

export const useStore = create<TxnSlice & UiSlice>()(
  persist(
    (...a) => ({
      ...createTxnSlice(...a),
      ...createUiSlice(...a),
    }),
    { name: 'finance-store' }
  )
);
```

### Pattern 3: Role-Gated Render (No Backend)

**What:** The active role (`viewer` | `admin`) lives in `uiSlice`. Components read the role and conditionally render UI elements — Admin sees `TransactionForm` and edit controls, Viewer sees the same view read-only.

**When to use:** All admin-only surfaces (add/edit form, delete button). Gate at the immediate parent, not deep inside a component.

**Trade-offs:** This is UI-only simulation. No actual auth. Clear enough for evaluation context; explicitly documented in README as a UI mock.

**Example:**
```typescript
// features/transactions/index.tsx
const role = useStore((s) => s.role);
return (
  <>
    {role === 'admin' && <TransactionForm />}
    <TransactionTable />
  </>
);
```

## Data Flow

### User Interaction Flow

```
User Action (click, input, form submit)
    ↓
Component event handler
    ↓
Zustand action (txnSlice: addTransaction / setFilter / uiSlice: setRole / toggleDark)
    ↓
Store state updates (immutably)
    ↓
zustand/persist middleware writes to localStorage
    ↓
Subscribed selector hooks re-derive (useSummaryTotals, useTransactions)
    ↓
Components re-render with new data
```

### State Management Flow

```
                  ┌─────────────────────────────────────┐
                  │          Zustand Store               │
                  │  txnSlice         uiSlice            │
                  │  - transactions   - role             │
                  │  - filter params  - darkMode         │
                  └─────────┬───────────────┬───────────┘
                            │ subscribe     │ subscribe
                 ┌──────────▼────┐   ┌──────▼──────────┐
                 │ Selector Hooks│   │  Theme/Role Hooks│
                 │ useTransactions│  │  useTheme        │
                 │ useSummaryTotals│  │  useRole         │
                 └──────────┬────┘   └──────┬───────────┘
                            │               │
                 ┌──────────▼────────────────▼──────────┐
                 │   Feature Components (render layer)   │
                 │  SummaryCards, Charts, Table, Header  │
                 └───────────────────────────────────────┘
                            │ dispatch actions
                            ▼
                 Store actions → state update → re-render cycle
```

### Key Data Flows

1. **Seed → Store:** On first load, if localStorage is empty, `mockData.ts` initializes the transactions array in `txnSlice`. Subsequent loads restore from localStorage via `zustand/persist`.

2. **Transaction CRUD:** `TransactionForm` (Admin only) calls `addTransaction` / `updateTransaction` / `deleteTransaction` actions on `txnSlice`. All consumers of `useTransactions` automatically re-derive.

3. **Filter → Table:** `FilterBar` updates filter params in `txnSlice` (search string, category, date range, sort key). `useTransactions` hook applies these as pure filter/sort on the `transactions` array, passing the result to `TransactionTable`.

4. **Totals → Summary Cards:** `useSummaryTotals` subscribes to `transactions`, memoizes aggregation. `SummaryCards` receives totals as plain props — no store coupling inside the card components.

5. **Chart data shaping:** `BalanceTrendChart` uses `useMemo` to group transactions by date into `{date, balance}[]` array. `SpendingBreakdownChart` groups by category into `{name, value}[]` for Recharts PieChart — computed in the hook, not in the component body.

6. **Dark mode:** `Header` toggle calls `uiSlice.toggleDark`. `ThemeProvider` subscribes and adds/removes `dark` class on `document.documentElement`. Tailwind's `dark:` variant responds to this class.

7. **Export:** Export button in `Header` reads raw `transactions` from the store, passes to `exportUtils.ts` pure functions, triggers browser download. No state mutation.

## Suggested Build Order

Dependencies between components determine a natural build sequence:

```
Phase 1 — Foundation (no UI dependencies)
  types/index.ts              ← Core entity types
  constants/categories.ts     ← Category list with colors
  data/mockData.ts            ← Typed seed data
  utils/financeUtils.ts       ← Pure aggregation functions
  utils/dateUtils.ts          ← Date helpers
  utils/exportUtils.ts        ← CSV/JSON export

Phase 2 — State Layer
  store/txnSlice.ts           ← Transaction state + CRUD + filter actions
  store/uiSlice.ts            ← Role + dark mode
  store/index.ts              ← Compose slices + persist
  hooks/useTransactions.ts    ← Filtered/sorted selector hook
  hooks/useSummaryTotals.ts   ← Derived totals hook

Phase 3 — Layout Shell
  components/ui/              ← Button, Card, Badge, Input, Select
  features/theme/ThemeProvider.tsx   ← Dark mode class toggle
  components/layout/AppShell.tsx     ← Sidebar + header frame
  components/layout/Header.tsx       ← Role switch, dark toggle, export
  components/layout/Sidebar.tsx      ← Navigation links

Phase 4 — Dashboard Feature
  components/charts/ChartWrapper.tsx ← Recharts responsive container helper
  features/dashboard/components/SummaryCards.tsx
  features/dashboard/components/BalanceTrendChart.tsx
  features/dashboard/components/SpendingBreakdownChart.tsx
  features/dashboard/components/InsightsPanel.tsx
  features/dashboard/index.tsx       ← DashboardPage composes all above

Phase 5 — Transactions Feature
  features/transactions/components/FilterBar.tsx
  features/transactions/components/TransactionTable.tsx
  features/transactions/components/TransactionForm.tsx  ← Admin-only
  features/transactions/index.tsx    ← TransactionsPage

Phase 6 — Polish
  EmptyState component
  Animations (Framer Motion or Tailwind transitions)
  Responsive layout adjustments
  Export wiring to Header
  README + final QA
```

**Rationale:** Types and utilities have zero dependencies — build first. State layer depends only on types. Layout shell depends on state (for role/theme). Feature pages depend on both layout and state. Polish is last because it layers on top of working functionality.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| Single assignment submission | Current architecture is correct — no additions needed |
| Multiple dashboard views | Add React Router with lazy-loaded page chunks per route |
| Real API data | Add `services/` layer with fetch wrappers; replace mockData init with async thunks or React Query |
| Team project | Add Storybook for component isolation; split feature folders per team member |

### Scaling Priorities

1. **First bottleneck:** Large transaction lists (1000+ items) cause table re-render lag. Fix: virtualise rows with `react-window` or `react-virtual`. Not needed for assignment.
2. **Second bottleneck:** Chart re-renders on every store update. Fix: memoize chart-shaped data with `useMemo` and `React.memo` on chart components — already covered in the selector hook pattern.

## Anti-Patterns

### Anti-Pattern 1: Prop Drilling Chart Data

**What people do:** Fetch/derive chart data in the page component and pass it down through 3+ layers of components as props.

**Why it's wrong:** Creates rigid coupling — every intermediate component must forward props it doesn't use. Refactoring chart data shape requires touching every component in the chain.

**Do this instead:** Use selector hooks (`useSummaryTotals`, `useTransactions`) directly in the chart component. The hook is the API boundary; the chart component owns its own data retrieval.

### Anti-Pattern 2: Monolithic Store File

**What people do:** Put all state — transactions, filter params, UI preferences, role, dark mode — into a single `store.ts` file.

**Why it's wrong:** File grows to 300+ lines quickly, unclear ownership, every state change subscription touches unrelated code, hard to test slices in isolation.

**Do this instead:** Zustand slice pattern — one file per domain (`txnSlice.ts`, `uiSlice.ts`). Compose at `store/index.ts`. Each slice is independently testable.

### Anti-Pattern 3: Computing Aggregates Inside Component Render

**What people do:** Filter, sort, and sum the transactions array directly inside `SummaryCards` or `BalanceTrendChart` render bodies without `useMemo`.

**Why it's wrong:** Computation runs on every render regardless of whether transactions changed. Causes unnecessary CPU work and ties business logic to presentation components.

**Do this instead:** All derived computation lives in custom hooks with `useMemo`. Components receive already-computed values — they are pure display.

### Anti-Pattern 4: Using React Context Instead of Zustand for Transaction State

**What people do:** Store transactions in `React.createContext` + `useReducer` instead of Zustand.

**Why it's wrong:** Every context value change re-renders all consumers simultaneously. With transactions + filter params + role all in one context, adding a transaction re-renders the dark mode toggle. Context also lacks middleware (persist, devtools).

**Do this instead:** Zustand with slice composition. Components subscribe to exactly the slice they need; unrelated state changes cause zero re-renders in unsubscribed components.

### Anti-Pattern 5: Embedding Role Logic Deep Inside Components

**What people do:** Check `role === 'admin'` inside `TransactionTable` rows to show/hide edit buttons.

**Why it's wrong:** Scatters access control logic throughout the tree. Adding a new role requires hunting for every conditional.

**Do this instead:** Gate at the page/section level. `TransactionsPage` conditionally renders `TransactionForm` at the top. Individual cell components remain role-unaware.

## Integration Points

### External Libraries

| Library | Integration Pattern | Notes |
|---------|---------------------|-------|
| Recharts | Wrap each chart type in a thin component (`BalanceTrendChart.tsx`). Accept pre-shaped `{date, value}[]` as props. Never pass raw transactions to Recharts. | Recharts uses internal Redux for its own state — keep app state separate |
| zustand/persist | Configure in `store/index.ts` with a stable key. Use `partialize` to exclude ephemeral filter params from persistence if desired. | Avoid persisting the entire store if filter state should reset on reload |
| Tailwind CSS dark mode | Set `darkMode: 'class'` in config. `ThemeProvider` owns the `document.documentElement.classList` toggle. No component needs to know the mechanism. | Tailwind v4 uses `@custom-variant dark` syntax instead |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| features/dashboard ↔ store | Selector hooks only — no direct store imports in components | Keeps components portable and testable |
| features/transactions ↔ features/dashboard | No direct coupling — both read from the same store slices | Changes to one feature don't affect the other |
| components/layout ↔ features/ | Layout passes no feature-specific props — uses `{children}` slot pattern | AppShell is feature-agnostic |
| utils/ ↔ store/ | Utils are pure functions; store calls them for transformations | No circular dependency: utils have no store imports |

## Sources

- [React Financial Dashboard Design Patterns — Oliver Triunfo](https://olivertriunfo.com/react-financial-dashboard-design-patterns/)
- [Zustand Slices Pattern — DeepWiki](https://deepwiki.com/pmndrs/zustand/7.1-slices-pattern)
- [Zustand Architecture Patterns at Scale — Brainhub](https://brainhub.eu/library/zustand-architecture-patterns-at-scale)
- [Recommended Folder Structure for React 2025 — DEV Community](https://dev.to/pramod_boda/recommended-folder-structure-for-react-2025-48mc)
- [Feature-Based Folder Structure — Medium](https://asrulkadir.medium.com/3-folder-structures-in-react-ive-used-and-why-feature-based-is-my-favorite-e1af7c8e91ec)
- [React Folder Structure in 5 Steps — Robin Wieruch](https://www.robinwieruch.de/react-folder-structure/)
- [Dark Mode in React with Tailwind — Medium](https://medium.com/@roman_fedyskyi/dark-mode-in-react-a-scalable-theme-system-with-tailwind-d14e9c1afd1a)
- [Recharts Chart Generation and Component Lifecycle — DeepWiki](https://deepwiki.com/recharts/recharts/2.1-chart-generation-and-component-lifecycle)
- [React Anti-Patterns — Caktus Group](https://www.caktusgroup.com/blog/2023/02/02/3-react-anti-patterns-and-how-fix-them/)
- [Tailwind CSS Dark Mode — Official Docs](https://tailwindcss.com/docs/dark-mode)

---
*Architecture research for: React Finance Dashboard SPA*
*Researched: 2026-04-03*
