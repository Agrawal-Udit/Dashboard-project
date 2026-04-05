# FinanceHub — Junior Developer Guide

> This document is a practical handoff for junior developers.
> It explains **routing, core functions, state flow, and where to write what** in this codebase.

---

## 1) Quick Project Overview

- **Stack:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS v4 + custom CSS tokens in `src/index.css`
- **State:** Zustand (`store` with slices)
- **Routing:** React Router v7
- **Charts:** Recharts
- **Animation:** `motion/react`
- **Currency:** **INR (₹)** in transaction and dashboard financial displays

Main entry files:
- `src/main.tsx`
- `src/App.tsx`

---

## 2) Folder Structure (Mental Map)

```text
src/
  components/
    auth/           # Role-based UI guard
    dashboard/      # KPI, charts, insights
    layout/         # Header, sidebar, shell, theme sync
    transactions/   # Form, filters, table, export actions
    ui/             # Reusable primitives (Button, Card, Modal, Input, Select)
  constants/        # Category metadata
  data/             # Mock seed data
  hooks/            # Derived state + animation hooks
  pages/            # Route-level screens
  store/            # Zustand store + slices
  types/            # Shared app types
  utils/            # Pure helpers (formatting, insights, exports, validation)
```

---

## 3) App Boot and Routing (Most Important)

### `src/main.tsx`
- Wraps app in `StrictMode`
- Renders `<App />`

### `src/App.tsx`
Core routing architecture has 3 layers:

1. **`BrowserRouter`** at top level
2. **Public route:** `/login`
3. **Protected routes:** everything else through `AnimatedAppRoutes`

Important functions/components:

- **`ProtectedRoute`**
  - Reads `isAuthenticated` from store
  - If false → redirects to `/login`
  - If true → renders children

- **`AnimatedAppRoutes`**
  - Uses `useLocation()` + `AnimatePresence`
  - Applies route transition preset from `getSurfaceMotion("route", reducedMotion)`
  - Renders `AppLayout` and nested pages:
    - `/` → `DashboardPage`
    - `/transactions` → `TransactionsPage`
    - `/insights` → `InsightsPage`
    - `/settings` → `SettingsPage`

### Route table

| Path | Access | Component |
|------|--------|-----------|
| `/login` | Public | `LoginPage` |
| `/` | Protected | `DashboardPage` |
| `/transactions` | Protected | `TransactionsPage` |
| `/insights` | Protected | `InsightsPage` |
| `/settings` | Protected | `SettingsPage` |

---

## 4) Authentication + Role Logic

### Login flow (`src/pages/LoginPage.tsx`)
- Form state: `username`, `password`, `role`
- `handleSubmit()` validates minimal inputs
- Calls `login(username, role)` from store
- Navigates to `/`

### Logout flow (`src/components/layout/Header.tsx`)
- `handleLogout()` calls `logout()` from store
- Redirects to `/login`

### Role-based UI (`src/components/auth/RoleGate.tsx`)
- `RoleGate` receives `allowedRoles`
- Returns `null` if current role not allowed
- Used for admin-only controls (e.g., add/edit/reset)

> Note: This is **UI simulation auth**, no backend token/session.

---

## 5) State Management (Zustand)

### Store root (`src/store/store.ts`)
Store = `TxnSlice + UiSlice`.

Middleware:
- `immer` for mutable-style updates in reducers
- `persist` for localStorage (`finance-dashboard-store`)

Persist behavior:
- Persists only: `role`, `darkMode`
- Does **not** persist transactions/actions
- `migrate()` handles old persisted version

### Transaction slice (`src/store/txnSlice.ts`)
State + actions:
- `transactions`
- `addTransaction(t)`
- `editTransaction(id, updates)`
- `deleteTransaction(id)`
- `resetTransactions()` → restores `MOCK_TRANSACTIONS`

### UI slice (`src/store/uiSlice.ts`)
State + actions:
- `role: "Viewer" | "Admin"`
- `darkMode: boolean`
- `isAuthenticated: boolean`
- `username: string | null`
- `setRole`, `setDarkMode`, `login`, `logout`

---

## 6) Types and Data Contracts

### `src/types/index.ts`
Most important type:

- `Transaction`
  - `id`
  - `date` (ISO string `YYYY-MM-DD`)
  - `amount` (positive number)
  - `category`
  - `type` (`income | expense`)
  - `description`

Important rule:
- `amount` stays positive.
- Direction is controlled by `type` (income adds, expense subtracts).

---

## 7) Hook Layer (Derived View Data)

### `useTransactions(filters)` — `src/hooks/useTransactions.ts`
Does all page-level list logic:
- filter by type/category/search
- sort by date/amount/category
- default sort = date desc

Implementation detail:
- Uses `useShallow` from Zustand to avoid re-render/depth issues.

### `useSummaryTotals()` — `src/hooks/useSummaryTotals.ts`
- Reads transactions
- Returns `calcTotals(transactions)` memoized

### `useAnimatedCounter` / `useAnimatedCurrency` — `src/hooks/useAnimatedCounter.ts`
- Smooth number animation
- Honors reduced motion
- `useAnimatedCurrency` currently formats as INR using `Intl("en-IN", { currency: "INR" })`

---

## 8) Utility Functions (Where business logic lives)

### `src/utils/dateUtils.ts`
- `formatCurrency(amount)` → INR display (`₹`)
- `formatDate(date, formatStr)`
  - Uses `parseISO` for timezone-safe behavior
  - Returns `"Invalid date"` instead of throwing

### `src/utils/financeUtils.ts`
- `calcTotals(transactions)`
- `groupByCategory(transactions)` (expense-only aggregation)
- `formatChartData(transactions)` (monthly chart shape)

### `src/utils/insightsUtils.ts`
- `calcInsights(transactions)` returns:
  - highest spending category
  - month-over-month expense change
  - income/expense ratio

### `src/utils/transactionFormValidation.ts`
- Validates type/category/amount/date/description
- Date regex + real calendar validation

### `src/utils/exportUtils.ts`
Security-critical helpers:
- `sanitizeCsvCell()` protects CSV formula injection
- `transactionsToCsv(rows)`
- `transactionsToJson(rows)`
- `downloadTextFile()`

---

## 9) Page-by-Page Responsibilities

### `DashboardPage.tsx`
- Uses totals + transactions
- Builds chart/category/recent data with `useMemo`
- Shows KPI cards, trend/pie charts, insights panel
- Uses dark premium `finrise-*` classes

### `TransactionsPage.tsx`
- Owns filter/sort/search state
- Calls `useTransactions` to get visible rows
- Handles add/edit modal submit
- Contains:
  - `TransactionFilters`
  - `TransactionTable`
  - `TransactionExportActions`

### `InsightsPage.tsx`
- Monthly bar chart + category bars + achievements
- Currency displays in INR

### `SettingsPage.tsx`
- Dark mode toggle
- JSON/CSV export
- reset demo data (admin only + defensive runtime check)

### `LoginPage.tsx`
- Entry form and role selection
- Calls `login` and redirects

---

## 10) Transaction Module (Detailed Flow)

Files:
- `TransactionForm.tsx`
- `TransactionFilters.tsx`
- `TransactionTable.tsx`
- `TransactionExportActions.tsx`

Flow:
1. User sets filters/search/sort
2. `useTransactions` returns visible rows
3. Table renders rows/cards
4. Admin can edit (via `RoleGate`)
5. Export actions use **visible** transactions only

### Currency and date in table
- Amount format: INR via internal `Intl("en-IN", INR)` helper
- Date format: `formatDate(t.date, "MMM d, yyyy")` (timezone-safe)

---

## 11) Shared UI Primitives

### `Button.tsx`
- Variants: `primary`, `secondary`, `ghost`, `danger`, `gradient`
- Sizes: `sm`, `md`, `lg`
- Motion tap feedback unless reduced motion

### `Card.tsx`
- Variants: `default`, `glass`, `gradient`
- Uses motion presets from `motionConfig`

### `Modal.tsx`
- Headless UI Dialog + motion transitions
- Unmounts when closed

---

## 12) Theme + Styling System

### `ThemeSync.tsx`
- Syncs store `darkMode` to `document.documentElement.classList.toggle("dark")`

### `index.css`
Contains:
- Chart tokens (`--chart-color-*`)
- Recharts tick/grid variables
- Accent gradient tokens
- Custom utility surfaces:
  - `.finrise-auth-bg`
  - `.finrise-surface`
  - `.finrise-panel`
  - `.finrise-accent-gradient`
  - etc.

---

## 13) Motion System

`src/utils/motionConfig.ts` exports:
- `getSurfaceMotion(surface, reduced)`
- `staggerContainer`, `staggerItem`
- other presets

Surfaces include:
- `route`, `card`, `modal`, `chart`, `kpi`, `row`, `sidebar`, `button`

Reduced-motion path sets durations effectively to 0 and disables heavy transforms.

---

## 14) Scripts and Developer Commands

From `package.json`:
- `npm run dev`
- `npm run lint`
- `npm run build`
- `npm run preview`

Tests:
- No `npm test` script currently
- Use Vitest directly:
  - `npx vitest run`
  - `npx vitest` (watch)

---

## 15) How to Add a New Route (Step-by-step)

1. Create page in `src/pages/NewPage.tsx`
2. Add nav item in `src/components/layout/Sidebar.tsx`
3. Add `<Route path="/new" element={<NewPage />} />` in `src/App.tsx` inside protected routes
4. If role restricted, wrap controls with `RoleGate`
5. Add tests under matching `__tests__` folder

---

## 16) How to Add a New Store Action

1. Add action signature in relevant slice interface (`txnSlice` or `uiSlice`)
2. Implement action in slice creator function
3. Use action in component with `useAppStore((s) => s.actionName)`
4. Add/adjust slice tests in `src/store/__tests__/`

---

## 17) Common Pitfalls (Read Before Editing)

1. **Date parsing bug risk**
   - Avoid `new Date("YYYY-MM-DD")` in UI formatting
   - Use `formatDate()` utility

2. **Role gate vs runtime protection**
   - UI hiding is not enough
   - Keep runtime role checks in sensitive handlers (e.g., reset)

3. **Persisted state scope**
   - Only `role` + `darkMode` persist
   - Transactions are intentionally not persisted in current design

4. **CSV injection**
   - Always export via `exportUtils`

5. **Reduced motion**
   - When adding animations, use `getSurfaceMotion` or check `useReducedMotion`

---

## 18) Suggested Onboarding Task for Junior Dev

A safe first task:
- Add a new dashboard mini-card (e.g., "Average Expense")
- Use `useMemo` in `DashboardPage`
- Reuse `KpiCard`
- Add one unit test for the derived calculation

This gives practice with:
- types
- derived data
- component composition
- test setup

---

## 19) File Reference Index (Fast Jump)

- Routing: `src/App.tsx`
- Auth page: `src/pages/LoginPage.tsx`
- Layout shell: `src/components/layout/AppLayout.tsx`
- Header actions: `src/components/layout/Header.tsx`
- Navigation: `src/components/layout/Sidebar.tsx`
- Store root: `src/store/store.ts`
- Txn slice: `src/store/txnSlice.ts`
- UI slice: `src/store/uiSlice.ts`
- Transaction hook: `src/hooks/useTransactions.ts`
- Totals hook: `src/hooks/useSummaryTotals.ts`
- Currency/date utils: `src/utils/dateUtils.ts`
- Finance transforms: `src/utils/financeUtils.ts`
- Insights transforms: `src/utils/insightsUtils.ts`
- Form validation: `src/utils/transactionFormValidation.ts`
- Export helpers: `src/utils/exportUtils.ts`

---

If you share just one file with a junior developer, share this one:
`docs/JUNIOR_DEVELOPER_GUIDE.md`
