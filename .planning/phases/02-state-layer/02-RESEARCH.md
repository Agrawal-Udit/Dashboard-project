# Phase 2: State Layer - Research

**Researched:** 2026-04-04
**Domain:** Zustand 5, persist middleware, TypeScript slice patterns, selector hooks
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FOUND-04 | Zustand store has a transactions slice with CRUD operations (add, edit, delete) and a UI slice with role and darkMode state | Slices pattern via `StateCreator` with combined store type; immer middleware handles array CRUD immutably |
| FOUND-05 | Zustand store uses persist middleware with version, migrate, and partialize configured from initialization | `persist()` wraps combined slices with `version: 1`, `partialize` excluding action functions, `migrate` function for schema evolution |
| ROLE-02 | Selected role persists across page refresh (via localStorage through Zustand persist) | `partialize` retains `role` and `darkMode` in `uiSlice`; browser-observable via localStorage key |
</phase_requirements>

---

## Summary

Phase 2 builds the single source of truth that every UI component in Phase 3–6 subscribes to. The store has two compositional slices — `txnSlice` (transactions CRUD) and `uiSlice` (role + darkMode) — combined into one Zustand store wrapped by `persist` middleware. This structure gives components a stable subscription API without importing raw store state.

The biggest technical decision for this phase is **middleware composition order**. The safe production order is `immer` → `persist` → (optionally `devtools`), applied outside-in. Using `immer` at the innermost position lets the persist middleware serialize already-immutable state. The second key decision is **type annotation for slices with middleware**: Zustand 5 requires explicit `StateCreator<CombinedState, [["zustand/immer", never], ["zustand/persist", unknown]], [], SliceType>` generics per slice to prevent type errors when middleware is composed.

Zustand 5 has one breaking change that is directly relevant here: object selectors (selectors that return a new object or array each call) without `useShallow` will cause React to throw a maximum-update-depth error. The `useTransactions` and `useSummaryTotals` hooks in the phase success criteria both return derived arrays/objects, so they must use `useShallow` or extract state with a simple selector and compute derived values outside the selector with `useMemo`.

**Primary recommendation:** Use one combined store with `immer` + `persist`. Use `useShallow` for array/object selectors. Test store actions directly via `store.getState()` without React — jsdom is not required for store unit tests, but Zustand tests need `environment: 'jsdom'` when `localStorage` is tested through the persist middleware. Keep the store file split into three files: `txnSlice.ts`, `uiSlice.ts`, `store.ts`.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `zustand` | `^5.x` (5.0.10 latest as of 2026-01) | Global state management | Already in project; official React 19 support; minimal boilerplate |
| `immer` (via `zustand/middleware/immer`) | included in zustand | Mutation-style array/object updates | Bundled with zustand; prevents spread boilerplate for array CRUD |
| `zustand/middleware` (persist) | included in zustand | localStorage persistence | Official middleware; handles version + migrate + partialize |
| `zustand/react/shallow` (useShallow) | included in zustand | Stable selectors for objects/arrays | Required in v5 — object selectors without this cause max-depth crash |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@testing-library/react` | `^16.x` (already installed) | `renderHook` for selector hooks | When testing hooks that depend on React subscription |
| `vitest-localstorage-mock` | `^2.x` | Mock localStorage in Vitest node environment | Only if switching persist tests to node env; NOT needed if tests use jsdom |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `immer` middleware | Manual spread (`{ ...state, transactions: [...] }`) | Spread is fine for flat state; becomes unreadable for array splice-by-id. Use immer for array CRUD. |
| Single combined store | Two separate stores (txnStore + uiStore) | Separate stores break `partialize` — cannot write one `persist` call that covers both slices. One store is required. |
| `useShallow` | `useMemo` with stable selector reference | Both work. `useShallow` is the canonical v5 solution. `useMemo` is acceptable when the selector also does CPU-heavy computation (e.g., `useSummaryTotals`). |

**Installation (Phase 2 only — zustand is not yet installed):**
```bash
npm install zustand immer
```

Note: `immer` must be installed separately. `zustand` bundles its own `immer` middleware bindings but does NOT bundle the `immer` package itself — it is a peer dependency.

---

## Architecture Patterns

### Recommended File Structure for Phase 2

```
src/
├── store/
│   ├── txnSlice.ts          # transactions state + CRUD actions
│   ├── uiSlice.ts           # role, darkMode state + set actions
│   ├── store.ts             # combines slices, applies persist middleware
│   └── __tests__/
│       ├── txnSlice.test.ts # tests for add, edit, delete actions
│       ├── uiSlice.test.ts  # tests for setRole, setDarkMode
│       └── store.test.ts    # integration: persist partialize, migrate
├── hooks/
│   ├── useTransactions.ts   # filtered + sorted selector hook
│   └── useSummaryTotals.ts  # aggregated totals selector hook
```

**Rule:** `store/` files may import from `types/`, `utils/`, and `data/`. They must NOT import from `components/` or any React UI layer. Hooks import from `store/` and `utils/`.

---

### Pattern 1: Slice Definition with StateCreator

**What:** Each slice is a `StateCreator` function that accepts the combined store type as its first generic, the middleware mutators array as the second, an empty array as the third, and the slice's own type as the fourth.

**When to use:** Any time the store has multiple logical domains of state.

**Example:**
```typescript
// src/store/txnSlice.ts
// Source: Zustand official slices pattern docs + Discussion #2027
import type { StateCreator } from 'zustand'
import type { Transaction } from '../types'
import { MOCK_TRANSACTIONS } from '../data/mockData'

export interface TxnSlice {
  transactions: Transaction[]
  addTransaction: (t: Transaction) => void
  editTransaction: (id: string, updates: Partial<Omit<Transaction, 'id'>>) => void
  deleteTransaction: (id: string) => void
}

// Middleware mutators tuple: immer first, persist second
type Mutators = [['zustand/immer', never], ['zustand/persist', unknown]]

export const createTxnSlice: StateCreator<
  TxnSlice & UiSlice,  // combined store type
  Mutators,
  [],
  TxnSlice
> = (set) => ({
  transactions: MOCK_TRANSACTIONS,

  addTransaction: (t) =>
    set((state) => {
      state.transactions.push(t)  // immer: direct mutation OK
    }),

  editTransaction: (id, updates) =>
    set((state) => {
      const idx = state.transactions.findIndex((t) => t.id === id)
      if (idx !== -1) {
        state.transactions[idx] = { ...state.transactions[idx], ...updates }
      }
    }),

  deleteTransaction: (id) =>
    set((state) => {
      state.transactions = state.transactions.filter((t) => t.id !== id)
    }),
})
```

**CRITICAL IMPORT NOTE:** `UiSlice` is the type from `uiSlice.ts`. To avoid circular imports, export only types from each slice file and import them in `store.ts` for the combined type. In practice, define a shared `AppState = TxnSlice & UiSlice` type in `store.ts` and import it into both slice files, or accept the cross-import (TypeScript handles type-only circular imports without runtime issues).

---

### Pattern 2: UI Slice Definition

**What:** State for role and darkMode — simple scalar values with setter actions.

**Example:**
```typescript
// src/store/uiSlice.ts
import type { StateCreator } from 'zustand'

export type Role = 'Viewer' | 'Admin'

export interface UiSlice {
  role: Role
  darkMode: boolean
  setRole: (role: Role) => void
  setDarkMode: (dark: boolean) => void
}

type Mutators = [['zustand/immer', never], ['zustand/persist', unknown]]

export const createUiSlice: StateCreator<
  TxnSlice & UiSlice,
  Mutators,
  [],
  UiSlice
> = (set) => ({
  role: 'Viewer',
  darkMode: false,

  setRole: (role) =>
    set((state) => {
      state.role = role
    }),

  setDarkMode: (dark) =>
    set((state) => {
      state.darkMode = dark
    }),
})
```

---

### Pattern 3: Combined Store with Persist Middleware

**What:** The `create()` call combines slices and wraps with `immer` → `persist`. Middleware is applied inside-out: `immer` innermost, `persist` outer, optional `devtools` outermost.

**When to use:** All application state must flow through this single entry point.

**Example:**
```typescript
// src/store/store.ts
// Source: Zustand middleware composition — Medium/@skyshots article verified
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { persist } from 'zustand/middleware'
import { createTxnSlice, type TxnSlice } from './txnSlice'
import { createUiSlice, type UiSlice } from './uiSlice'

export type AppState = TxnSlice & UiSlice

export const useAppStore = create<AppState>()(
  immer(
    persist(
      (...args) => ({
        ...createTxnSlice(...args),
        ...createUiSlice(...args),
      }),
      {
        name: 'finance-dashboard-store',  // localStorage key
        version: 1,

        // ONLY persist scalar UI preferences and never action functions.
        // Transactions are intentionally excluded — they are re-seeded from
        // MOCK_TRANSACTIONS at runtime. This keeps localStorage small and
        // prevents stale transaction data from persisting across deploys.
        partialize: (state): Pick<AppState, 'role' | 'darkMode'> => ({
          role: state.role,
          darkMode: state.darkMode,
        }),

        // Required even with version:1. When version bumps from 1→2, this
        // function receives the old persisted state and must return a
        // version-2-compatible object.
        migrate: (persistedState: unknown, version: number) => {
          if (version === 0) {
            // v0 had no role field — default to 'Viewer'
            return { role: 'Viewer', darkMode: false }
          }
          return persistedState as Pick<AppState, 'role' | 'darkMode'>
        },
      }
    )
  )
)
```

**Middleware order rationale:**
- `immer` innermost — transforms `set(draft => ...)` calls into immutable state before persist sees it
- `persist` outer — receives the already-immutable final state and writes it to localStorage
- Optional `devtools` would be outermost — wraps everything to log all state transitions

---

### Pattern 4: Selector Hooks with useShallow and useMemo

**What:** Custom hooks that subscribe to the store and return derived data. The Zustand v5 rule: if a selector returns a new reference (object, array) on every call, wrap it with `useShallow`. For CPU-intensive derivation (e.g., sorting + filtering a large array), combine a simple `useShallow` store subscription with `useMemo` for the computation.

**When to use:** Any time a component needs filtered, sorted, or aggregated data.

**Example — useTransactions (filtered + sorted):**
```typescript
// src/hooks/useTransactions.ts
// Source: Zustand v5 selector best practices — Discussion #2867
import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useAppStore } from '../store/store'
import type { Transaction, TransactionType, Category } from '../types'

export interface TransactionFilters {
  type?: TransactionType | 'all'
  category?: Category | 'all'
  search?: string
  sortBy?: 'date' | 'amount' | 'category'
  sortOrder?: 'asc' | 'desc'
}

export function useTransactions(filters: TransactionFilters = {}): Transaction[] {
  // Simple selector — useShallow because we're picking an array reference
  const transactions = useAppStore(useShallow((state) => state.transactions))

  return useMemo(() => {
    let result = [...transactions]

    if (filters.type && filters.type !== 'all') {
      result = result.filter((t) => t.type === filters.type)
    }
    if (filters.category && filters.category !== 'all') {
      result = result.filter((t) => t.category === filters.category)
    }
    if (filters.search) {
      const q = filters.search.toLowerCase()
      result = result.filter((t) => t.description.toLowerCase().includes(q))
    }

    const { sortBy = 'date', sortOrder = 'desc' } = filters
    result.sort((a, b) => {
      let cmp = 0
      if (sortBy === 'date') cmp = a.date.localeCompare(b.date)
      else if (sortBy === 'amount') cmp = a.amount - b.amount
      else if (sortBy === 'category') cmp = a.category.localeCompare(b.category)
      return sortOrder === 'asc' ? cmp : -cmp
    })

    return result
  }, [transactions, filters.type, filters.category, filters.search, filters.sortBy, filters.sortOrder])
}
```

**Example — useSummaryTotals (aggregated):**
```typescript
// src/hooks/useSummaryTotals.ts
import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useAppStore } from '../store/store'
import { calcTotals } from '../utils/financeUtils'
import type { SummaryTotals } from '../types'

export function useSummaryTotals(): SummaryTotals {
  const transactions = useAppStore(useShallow((state) => state.transactions))
  return useMemo(() => calcTotals(transactions), [transactions])
}
```

**Why useMemo here:** `calcTotals` performs a linear scan through all transactions. With 28+ entries it is cheap, but as the transaction list grows the memoization prevents recalculation on every unrelated re-render. The pattern is future-safe.

---

### Pattern 5: Testing Store Actions Without React

**What:** Zustand stores are plain JavaScript objects — `store.getState()` and `store.setState()` work outside React. Tests for actions do not need `renderHook` or `act()`.

**When to use:** Unit tests for CRUD actions, state shape validation, migrate function.

**Example:**
```typescript
// src/store/__tests__/txnSlice.test.ts
import { beforeEach, describe, it, expect } from 'vitest'
import { useAppStore } from '../store'
import type { Transaction } from '../../types'

const newTxn: Transaction = {
  id: 'test-001',
  date: '2026-04-01',
  amount: 500,
  category: 'food',
  type: 'expense',
  description: 'Test',
}

describe('txnSlice actions', () => {
  beforeEach(() => {
    // Reset to initial state between tests
    useAppStore.setState(useAppStore.getInitialState(), true)
  })

  it('addTransaction appends to transactions array', () => {
    useAppStore.getState().addTransaction(newTxn)
    const { transactions } = useAppStore.getState()
    expect(transactions.some((t) => t.id === 'test-001')).toBe(true)
  })

  it('editTransaction updates matching transaction immutably', () => {
    useAppStore.getState().addTransaction(newTxn)
    useAppStore.getState().editTransaction('test-001', { amount: 999 })
    const { transactions } = useAppStore.getState()
    const updated = transactions.find((t) => t.id === 'test-001')
    expect(updated?.amount).toBe(999)
    expect(updated?.description).toBe('Test') // other fields preserved
  })

  it('deleteTransaction removes the matching transaction', () => {
    useAppStore.getState().addTransaction(newTxn)
    useAppStore.getState().deleteTransaction('test-001')
    const { transactions } = useAppStore.getState()
    expect(transactions.every((t) => t.id !== 'test-001')).toBe(true)
  })

  it('deleteTransaction on unknown id does not modify array', () => {
    const before = useAppStore.getState().transactions.length
    useAppStore.getState().deleteTransaction('does-not-exist')
    const after = useAppStore.getState().transactions.length
    expect(after).toBe(before)
  })
})
```

**No React / no jsdom required for action tests.** The store operates as a vanilla JS module.

**IMPORTANT — Vitest environment for store tests:** Store action tests work in `environment: 'node'`. However, tests that exercise the `persist` middleware's `localStorage` reads and writes require `environment: 'jsdom'` because `localStorage` is a browser API. Use a per-file override comment or a separate vitest project config to handle this. See the Vitest config pattern in the Code Examples section.

---

### Anti-Patterns to Avoid

- **Returning new objects in selectors without useShallow:** In Zustand v5, `useStore(s => ({ role: s.role, darkMode: s.darkMode }))` will cause a maximum update depth error because a new object reference is returned on every render. Use `useShallow` or select primitive values individually.
- **Persisting action functions:** `partialize` must exclude all functions. Serializing functions to JSON produces `undefined` entries that corrupt the persisted state on restore. Always `partialize` to only scalar/data fields.
- **Persisting transactions:** Transaction data can grow large and becomes stale across deploys. Persist only UI preferences (`role`, `darkMode`). Transactions are seeded from `MOCK_TRANSACTIONS` on every fresh load.
- **Using `create` inside a test:** Creates a new store per test but requires manual cleanup. Prefer importing the singleton store and resetting with `store.setState(store.getInitialState(), true)` in `beforeEach`.
- **Calling `store.setState({}, true)` with empty object:** In Zustand v5, passing `true` as the replace flag requires the object to be a complete state — passing an empty object produces invalid state. Always use `store.getInitialState()` as the reset value.
- **Immer and persist order reversal:** Putting `persist` inside `immer` (i.e., `immer(persist(...))`) breaks the middleware type system in Zustand 5 and produces TypeScript errors. Always: `immer(persist(...))` — immer outer, persist inner — wait, see correct order below.

**Correct middleware order (important to get right):**

The safe production order confirmed by the Zustand community is:

```
create()(
  immer(        // innermost: mutation syntax
    persist(    // middle: save to localStorage
      stateCreator
    )
  )
)
```

Devtools, if added in Phase 3+, wraps everything outermost:
```
create()(
  devtools(
    immer(
      persist(stateCreator)
    )
  )
)
```

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Array CRUD immutability | Manual `map/filter/spread` chains for edit-by-id | `immer` middleware | Immer handles splice-by-index, find-and-update, push cleanly; spread chains become unreadable and error-prone with nested objects |
| localStorage persistence | Custom `useEffect` + `localStorage.setItem` | `persist` middleware | Custom persistence misses: rehydration on mount, version migration, storage failure handling, cross-tab sync hooks |
| State version migration | Custom migration in useEffect | `persist({ version, migrate })` | Built-in migrate fires exactly once on version mismatch; hooks-based migration fires on every render cycle |
| Shallow comparison | Custom equality function in `create()` | `useShallow` hook | Zustand v5 removed equality function support from `create()` — use `useShallow` or face the max-depth error |
| UUID for new transactions | `Math.random()` string | `crypto.randomUUID()` | Cryptographically unique; already available in all modern browsers and Node 20+ without import |

**Key insight:** Zustand's middleware system is specifically designed for the compose-once pattern. Any hand-rolled solution duplicates logic that persist and immer already handle correctly — and misses edge cases like storage quota errors, SSR hydration, and cross-tab state sync.

---

## Common Pitfalls

### Pitfall 1: Object Selector Maximum Update Depth (Zustand v5 Breaking Change)

**What goes wrong:** A component renders infinitely until React unmounts it with a "maximum update depth exceeded" error.

**Why it happens:** Zustand v5 uses strict equality (`===`) for selector output comparison. If the selector returns `{ role: state.role, darkMode: state.darkMode }`, a new object is allocated on every render. The reference is never `===` to the previous reference even if the values are identical, so Zustand always considers the state "changed" and triggers a re-render.

**How to avoid:** Wrap object/array selectors with `useShallow`:
```typescript
// WRONG (causes max-depth error in v5):
const { role, darkMode } = useAppStore((s) => ({ role: s.role, darkMode: s.darkMode }))

// CORRECT:
import { useShallow } from 'zustand/react/shallow'
const { role, darkMode } = useAppStore(useShallow((s) => ({ role: s.role, darkMode: s.darkMode })))

// ALSO CORRECT (atomic selects, no useShallow needed):
const role = useAppStore((s) => s.role)
const darkMode = useAppStore((s) => s.darkMode)
```

**Warning signs:** Component flickers or crashes immediately after mounting; React DevTools shows the component in an update loop.

---

### Pitfall 2: Persist Middleware Storing Initial State on Store Creation (v4.5.5 / v5 Change)

**What goes wrong:** On first page load, `localStorage` already has the initial state (not just persisted preferences). After a `partialize` fix, the old full state remains in localStorage from a previous version.

**Why it happens:** Zustand v4.5.5 removed the behavior where persist stored initial state on store creation. In v5 this is not done automatically. However, any data written by an older version of the store stays in localStorage under the same key.

**How to avoid:** Set `version: 1` from day one and keep it. Write a `migrate` function now (even trivially) to establish the pattern. If the key name changes, old data is abandoned automatically.

**Warning signs:** After changing `partialize` logic, the UI reflects stale values on first load.

---

### Pitfall 3: Immer Peer Dependency Not Installed

**What goes wrong:** `TypeError: Cannot read properties of undefined (reading 'produce')` at runtime, or TypeScript cannot find module `zustand/middleware/immer`.

**Why it happens:** Zustand's immer middleware bindings are included in the `zustand` package, but `immer` itself is a **peer dependency** — it is not auto-installed.

**How to avoid:** Run `npm install immer` explicitly. Verify `immer` appears in `dependencies` in `package.json`.

**Warning signs:** TypeScript import works but runtime crashes; or `npm ls immer` shows no result.

---

### Pitfall 4: Partialize Returning Action Functions

**What goes wrong:** After page refresh, action functions are `undefined`. The store has state but calling `addTransaction()` throws "not a function".

**Why it happens:** `JSON.stringify` silently drops function properties. The persisted state has `{ role: "Admin", addTransaction: undefined }`. When Zustand merges the persisted state with the initial state, the function key from the initial state is not overwritten (merge behavior) — but if `replace: true` is accidentally set, it is.

**How to avoid:** The `partialize` function must return only data fields:
```typescript
partialize: (state) => ({
  role: state.role,
  darkMode: state.darkMode,
  // DO NOT include: addTransaction, editTransaction, deleteTransaction, setRole, setDarkMode
})
```

**Warning signs:** `store.getState().addTransaction` is `undefined` after reload.

---

### Pitfall 5: Testing Persist Middleware Requires jsdom

**What goes wrong:** Tests that call `useAppStore.getState().setRole('Admin')` and then check `localStorage.getItem('finance-dashboard-store')` fail with `ReferenceError: localStorage is not defined`.

**Why it happens:** Zustand's persist middleware writes to `localStorage` which is a browser API. Vitest's `environment: 'node'` does not provide `localStorage`.

**How to avoid:** Tests that assert on localStorage persistence must use `environment: 'jsdom'`. Add a per-file Vitest environment override:
```typescript
// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest'
// ... rest of persist test
```

Store action tests (CRUD) do NOT need jsdom — they test state in memory only.

**Warning signs:** `ReferenceError: localStorage is not defined` in test output.

---

## Code Examples

Verified patterns from research sources:

### Vitest Config Update for Phase 2 (jsdom required)

```typescript
// vitest.config.ts — updated for Phase 2
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',   // Changed from 'node' — needed for persist middleware tests
    globals: true,
    setupFiles: ['./src/setupTests.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/store/**', 'src/hooks/**', 'src/utils/**', 'src/data/**'],
    },
  },
})
```

**Note:** Switching the global environment from `node` to `jsdom` does not break Phase 1 pure utility tests. The `jsdom` environment is a superset — it provides all Node globals plus browser APIs. Phase 1 tests remain GREEN.

### Store Reset Pattern for Tests

```typescript
// Pattern: reset store before each test
// Source: Zustand official testing guide
import { beforeEach } from 'vitest'
import { useAppStore } from '../store'

beforeEach(() => {
  useAppStore.setState(useAppStore.getInitialState(), true)
})
```

### Persist Partialize with TypeScript (type-safe)

```typescript
// Ensures partialize return type is type-checked by TypeScript
partialize: (state: AppState): Pick<AppState, 'role' | 'darkMode'> => ({
  role: state.role,
  darkMode: state.darkMode,
})
```

### Migrate Function for Version 1 (initial version)

```typescript
// Even at version: 1, write migrate to handle v0 data from any pre-version state
migrate: (persistedState: unknown, version: number): Pick<AppState, 'role' | 'darkMode'> => {
  if (version === 0 || version === undefined) {
    // No prior state or unversioned state — return safe defaults
    return { role: 'Viewer', darkMode: false }
  }
  // Version 1 state is already correct shape
  return persistedState as Pick<AppState, 'role' | 'darkMode'>
},
```

### useShallow Import Path (Zustand v5)

```typescript
// Correct v5 import path — 'zustand/shallow' was the v4 path
import { useShallow } from 'zustand/react/shallow'
```

### crypto.randomUUID() for New Transaction IDs

```typescript
// Use when creating new transactions at runtime (not seed data)
const newTransaction: Transaction = {
  id: crypto.randomUUID(),   // Available natively in Node 20+ and all modern browsers
  date: new Date().toISOString().slice(0, 10),  // "YYYY-MM-DD"
  amount,
  category,
  type,
  description,
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `create(store, (a, b) => shallow(a, b))` second arg equality fn | `useShallow` hook wrapping selector | Zustand v5 (Oct 2024) | Breaking change — old approach crashes with max-depth error in v5 |
| `import { shallow } from 'zustand/shallow'` | `import { useShallow } from 'zustand/react/shallow'` | Zustand v5 | Different symbol — old import still works but is the equality-fn form, not hook form |
| `create(middleware(...))` single-call syntax | `create<T>()(middleware(...))` curried syntax | Zustand v4.x | Required for TypeScript middleware type inference — do NOT skip the currying |
| Initial state written to localStorage on store init | Initial state NOT written automatically | v4.5.5 / v5 | Explicit `partialize` controls exactly what is persisted |
| `devtools` imported from `'zustand/middleware/devtools'` | `devtools` from `'zustand/middleware'` | Zustand v5 | Import path consolidated |
| Spreading slices with `combine()` helper | Spreading slices manually in `create()` callback | Current best practice | `combine()` loses TypeScript inference across slices; manual spread is preferred |

**Deprecated/outdated:**
- `create(fn, equalityFn)` with second argument: Removed in v5. Use `createWithEqualityFn` from `zustand/traditional` if you genuinely need custom equality, or `useShallow` for the common case.
- `shallow` imported directly as equality function argument: v5 removed this usage pattern. `useShallow` is the replacement.

---

## Open Questions

1. **immer + persist TypeScript mutators tuple**
   - What we know: The `StateCreator` mutators tuple `[['zustand/immer', never], ['zustand/persist', unknown]]` is the pattern documented in community examples for combining these middlewares. The official Zustand docs show each middleware separately, not combined.
   - What's unclear: Whether the mutators tuple order must match the runtime composition order exactly (immer first in tuple = immer innermost in `create()`).
   - Recommendation: Follow the community-verified pattern. If TypeScript complains, try `[['zustand/persist', unknown], ['zustand/immer', never]]` as the mutators tuple (outer middleware listed first). Fall back to casting `createTxnSlice as StateCreator<AppState>` if type errors persist — correctness of the runtime behavior is not affected by the type annotation.

2. **Transactions persistence decision**
   - What we know: Phase success criteria (item 4) says "Selected role persists correctly across a full page refresh." Transactions are NOT in the success criteria for persistence.
   - What's unclear: Whether excluding transactions from `partialize` is a final decision or an open choice.
   - Recommendation: Exclude transactions from persist. The seed data (`MOCK_TRANSACTIONS`) fills the store on every fresh load. This prevents localStorage from growing unbounded and avoids stale data issues. Later phases (Phase 5) that add real transactions via Admin forms would revisit this if needed.

3. **vitest.config.ts environment: node vs jsdom**
   - What we know: Phase 1 tests work with `environment: 'node'`. Persist middleware tests need `jsdom`. Switching globally to `jsdom` is backward-compatible.
   - What's unclear: Whether there are any pure utility tests that would behave differently under jsdom (e.g., due to browser globals leaking into test scope).
   - Recommendation: Change `vitest.config.ts` to `environment: 'jsdom'` as part of Phase 2 Wave 0. Phase 1 tests will remain GREEN — jsdom provides all Node APIs plus browser APIs.

---

## Validation Architecture

> `nyquist_validation` is `true` in `.planning/config.json` — this section is required.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.x (already installed as `^4.1.2`) |
| Config file | `vitest.config.ts` (exists — update `environment` to `'jsdom'`) |
| Quick run command | `npx vitest run src/store src/hooks` |
| Full suite command | `npx vitest run --coverage` |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FOUND-04 | `addTransaction` appends to `transactions` array | Unit (no jsdom) | `npx vitest run src/store/__tests__/txnSlice.test.ts` | Wave 0 |
| FOUND-04 | `editTransaction` updates matching entry, preserves other fields | Unit (no jsdom) | `npx vitest run src/store/__tests__/txnSlice.test.ts` | Wave 0 |
| FOUND-04 | `deleteTransaction` removes matching entry | Unit (no jsdom) | `npx vitest run src/store/__tests__/txnSlice.test.ts` | Wave 0 |
| FOUND-04 | `deleteTransaction` on unknown id does not modify array | Unit (no jsdom) | `npx vitest run src/store/__tests__/txnSlice.test.ts` | Wave 0 |
| FOUND-04 | `setRole` updates `role` field | Unit (no jsdom) | `npx vitest run src/store/__tests__/uiSlice.test.ts` | Wave 0 |
| FOUND-04 | `setDarkMode` updates `darkMode` field | Unit (no jsdom) | `npx vitest run src/store/__tests__/uiSlice.test.ts` | Wave 0 |
| FOUND-04 | Initial `role` is `'Viewer'`, initial `darkMode` is `false` | Unit (no jsdom) | `npx vitest run src/store/__tests__/uiSlice.test.ts` | Wave 0 |
| FOUND-05 | `partialize` returns only `{ role, darkMode }` (no action functions) | Unit (jsdom) | `npx vitest run src/store/__tests__/store.test.ts` | Wave 0 |
| FOUND-05 | `migrate` called with version 0 returns `{ role: 'Viewer', darkMode: false }` | Unit (no jsdom) | `npx vitest run src/store/__tests__/store.test.ts` | Wave 0 |
| FOUND-05 | `persist` storage key is `'finance-dashboard-store'` | Unit (jsdom) | `npx vitest run src/store/__tests__/store.test.ts` | Wave 0 |
| ROLE-02 | Selected role persists across page refresh (localStorage survives) | Manual/browser | Browser DevTools — see note below | N/A |
| Phase-wide | `useTransactions()` with no filters returns all transactions sorted newest-first | Unit (jsdom) | `npx vitest run src/hooks/__tests__/useTransactions.test.ts` | Wave 0 |
| Phase-wide | `useTransactions({ type: 'expense' })` excludes income transactions | Unit (jsdom) | `npx vitest run src/hooks/__tests__/useTransactions.test.ts` | Wave 0 |
| Phase-wide | `useSummaryTotals()` returns correct balance/income/expenses | Unit (jsdom) | `npx vitest run src/hooks/__tests__/useSummaryTotals.test.ts` | Wave 0 |

**ROLE-02 browser verification procedure:** After Phase 2 implementation, open `http://localhost:5173` in a browser, use the store's `setRole` action (via React DevTools or a temporary button), refresh the page with F5, and verify `localStorage.getItem('finance-dashboard-store')` still contains the selected role. This cannot be automated as a Vitest unit test because Zustand's persist middleware reads from a real localStorage on hydration — mocking localStorage in tests verifies the write but not the full hydration cycle.

### Sampling Rate

- **Per task commit:** `npx vitest run src/store src/hooks`
- **Per wave merge:** `npx vitest run --coverage`
- **Phase gate:** `npx tsc --noEmit && npx vitest run --coverage` must be fully GREEN before Phase 3 begins

### Wave 0 Gaps (must be created before implementation tasks run)

- [ ] `vitest.config.ts` — update `environment` from `'node'` to `'jsdom'` (required for persist + hooks tests)
- [ ] `src/store/__tests__/txnSlice.test.ts` — covers FOUND-04 transaction CRUD actions
- [ ] `src/store/__tests__/uiSlice.test.ts` — covers FOUND-04 role and darkMode setters + initial values
- [ ] `src/store/__tests__/store.test.ts` — covers FOUND-05 partialize shape, migrate function, localStorage key name
- [ ] `src/hooks/__tests__/useTransactions.test.ts` — covers filtered/sorted selector behavior
- [ ] `src/hooks/__tests__/useSummaryTotals.test.ts` — covers aggregated totals correctness

**Estimated test runtime:** All Phase 2 tests should complete in under 3 seconds on this machine. Store action tests run in under 100ms each (no async, no DOM rendering). Hook tests using `renderHook` add ~200ms per suite for jsdom initialization. Total estimated: ~1.5–2.5 seconds for `npx vitest run src/store src/hooks`.

---

## Sources

### Primary (HIGH confidence)

- [Zustand GitHub — Discussion #2027](https://github.com/pmndrs/zustand/discussions/2027) — TypeScript slices pattern with persist middleware, StateCreator type signature
- [Zustand GitHub — Discussion #2867](https://github.com/pmndrs/zustand/discussions/2867) — Maintainer-confirmed best practices for selectors in v5 (keep selectors simple, use useShallow)
- [Zustand useShallow official docs](https://zustand.docs.pmnd.rs/reference/hooks/use-shallow) — API, usage examples, TypeScript type signature
- [Announcing Zustand v5 — pmnd.rs](https://pmnd.rs/blog/announcing-zustand-v5) — Official v5 announcement with breaking changes
- [Zustand migration guide v4→v5](https://zustand.docs.pmnd.rs/reference/migrations/migrating-to-v5) — Breaking changes: equality fn removed, useShallow required, setState replace semantics

### Secondary (MEDIUM confidence)

- [Zustand middleware composition — Medium/@skyshots](https://medium.com/@skyshots/taking-zustand-further-persist-immer-and-devtools-explained-ab4493083ca1) — Verified middleware order `immer → persist → devtools` with complete TypeScript example
- [Zustand testing guide](https://zustand.docs.pmnd.rs/guides/testing) — Official store reset pattern using `store.setState(initialState, true)`
- [Zustand persist official reference](https://zustand.docs.pmnd.rs/reference/integrations/persisting-store-data) — `name`, `version`, `migrate`, `partialize` API reference
- [Zustand Discussion #2491](https://github.com/pmndrs/zustand/discussions/2491) — StateCreator mutators tuple for combined immer+persist middleware
- [DEV.io — Zustand persist migration](https://dev.to/diballesteros/how-to-migrate-zustand-local-storage-store-to-a-new-version-njp) — `migrate` function implementation patterns

### Tertiary (LOW confidence — verify if implementation differs)

- [Zustand DEV Community v4/v5 guide](https://dev.to/vishwark/mastering-zustand-the-modern-react-state-manager-v4-v5-guide-8mm) — General v5 overview; some examples may be v4 syntax
- [Zustand testing Gist — mustafadalga](https://gist.github.com/mustafadalga/475769fcb77b08a813bf5dae0a145027) — `renderHook` + `act` pattern for Zustand with Vitest; community example

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Zustand 5 is already in the project's locked stack; immer middleware pattern verified against official docs and multiple community sources
- Architecture (slices pattern): HIGH — StateCreator typing for slices with middleware confirmed via official GitHub discussions; maintainer-answered
- Persist middleware API: HIGH — `version`, `migrate`, `partialize` options verified via official Zustand docs URL
- Selector patterns (useShallow): HIGH — Confirmed breaking change from official v5 announcement; useShallow import path verified
- Testing patterns: MEDIUM — Official testing docs confirmed; per-file jsdom environment override confirmed via Vitest docs; some edge cases around mock setup are community-verified only
- Pitfalls: HIGH — v5 breaking changes sourced from official migration guide; immer peer dep from official docs

**Research date:** 2026-04-04
**Valid until:** 2026-07-04 (90 days — Zustand 5.x is stable; middleware API is not fast-moving)
