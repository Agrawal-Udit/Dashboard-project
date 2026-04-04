# Phase 5: Transactions - Research

**Researched:** 2026-04-04
**Domain:** React 19 transaction list UI, filter/sort/search patterns, form validation, role-gated rendering, Tailwind v4 table styling
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| TXN-01 | User can view a list of all transactions with date, amount, category, type, and description | `useTransactions()` returns sorted Transaction[] from store; table layout with Tailwind; `Badge` for type/category display |
| TXN-02 | User can filter transactions by type (income / expense / all) | `useTransactions({ type })` already implements this; segmented control or radio buttons drive local state that feeds the hook |
| TXN-03 | User can filter transactions by category (single dropdown) | `useTransactions({ category })` already implements this; `<Select>` primitive with CATEGORIES options; `'all'` sentinel value clears filter |
| TXN-04 | User can search transactions by description text | `useTransactions({ search })` already implements case-insensitive substring match; local `useState` drives input; no debounce needed at this data volume |
| TXN-05 | User can sort transactions by date, amount, or category | `useTransactions({ sortBy, sortOrder })` already implements all three columns; column header click toggles `sortOrder`; chevron icon from lucide-react shows direction |
| TXN-06 | Admin user can add a new transaction via a form | Modal + controlled form with manual validation; `addTransaction` action from store; `crypto.randomUUID()` for ID generation |
| TXN-07 | Admin user can edit an existing transaction | Same form component as TXN-06 with `initialData` prop; `editTransaction(id, updates)` action from store |
| TXN-08 | Viewer user cannot see add/edit controls | New `RoleGate` component reads `useAppStore(s => s.role)`; renders children only when `role === 'Admin'` |
</phase_requirements>

---

## Summary

Phase 5 builds the transactions page on top of infrastructure that is largely already in place. The `useTransactions` hook in `src/hooks/useTransactions.ts` is **complete and correct** for all filter, sort, and search requirements — the hook accepts `type`, `category`, `search`, `sortBy`, and `sortOrder` parameters, all working. Phase 5 only needs to wire those parameters to UI controls via local `useState` in `TransactionsPage`.

The two remaining implementation domains are the add/edit form (TXN-06, TXN-07) and the `RoleGate` component (TXN-08). The form should be a single controlled component rendered inside the existing `Modal` primitive, supporting both add and edit modes based on whether an `initialData` prop is present. Validation should be manual (pure function `validateTransactionForm`) with no new library required — the `Input` and `Select` primitives already accept `error` props.

`RoleGate` is a simple wrapper component that reads `role` from the Zustand store and either renders `children` (Admin) or `null` (Viewer). It belongs in `src/components/auth/` to signal its access-control purpose clearly.

**Primary recommendation:** Wire `useTransactions` to local `useState` filter controls, build `TransactionForm` as a single dual-mode component inside `Modal`, create `RoleGate` in `src/components/auth/`, and write validation as a pure function testable without React.

---

## Standard Stack

### Core (all already installed — no new packages needed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `zustand` | `^5.0.12` | `useTransactions` hook, `addTransaction`/`editTransaction` actions, `role` for RoleGate | Already wired — store slice is complete |
| `@headlessui/react` | `^2.2.9` | `Modal` primitive uses `Dialog` — focus trap, `aria-modal`, `Escape` close | Already installed; `Modal` component is complete |
| `lucide-react` | `^1.7.0` | Sort direction chevrons (`ChevronUp`, `ChevronDown`), edit/add icons (`Plus`, `Pencil`) | Already installed |
| `tailwindcss` | `^4.2.2` | Table layout, dark mode variants | Already configured |
| React 19 `useState` | built-in | Local filter/sort state in `TransactionsPage` | Correct scope — not global state |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `crypto.randomUUID()` | Browser built-in (no install) | Generate unique IDs for new transactions | Use in `TransactionsPage` before calling `addTransaction` — available in all modern browsers and Node 20+ |
| `date-fns` | `^4.1.0` (already installed) | Parse/validate date strings in form validation | `isValid(parseISO(value))` is the canonical pattern |

### Alternatives NOT used

| Instead of | Could Use | Why we reject |
|------------|-----------|---------------|
| `react-hook-form` | Manual `useState` validation | No new dependency for a 5-field form; primitives already have `error` prop |
| `zod` | Manual validation function | Same reason — overkill for this form size |
| URL params for filter state | Local `useState` | Simpler, sufficient; no need to persist filter state across navigation |
| Debounce hook for search | Immediate filter | 28 mock transactions — sub-millisecond filter; no perceptible lag |

**Installation:** No new packages required. All dependencies already present.

---

## Architecture Patterns

### Recommended File Structure for Phase 5

```
src/
├── components/
│   ├── auth/
│   │   ├── RoleGate.tsx                 # Conditionally renders children by role
│   │   └── __tests__/
│   │       └── RoleGate.test.tsx        # show/hide tests
│   ├── transactions/
│   │   ├── TransactionTable.tsx         # Table with sort headers
│   │   ├── TransactionFilters.tsx       # Type/category/search controls
│   │   ├── TransactionForm.tsx          # Dual-mode add/edit form
│   │   └── __tests__/
│   │       ├── TransactionTable.test.tsx
│   │       └── TransactionForm.test.tsx
│   └── ui/                              # No changes needed
├── utils/
│   ├── transactionFormValidation.ts     # Pure validation function
│   └── __tests__/
│       └── transactionFormValidation.test.ts
└── pages/
    └── TransactionsPage.tsx             # Replaces placeholder; owns all local state
```

**Rule:** `TransactionsPage` owns all local state (`filters`, `sortBy`, `sortOrder`, `modalOpen`, `editingTransaction`). Child components receive props. No component imports store directly except `RoleGate` and `TransactionsPage`.

---

### Pattern 1: Filter State in TransactionsPage

**What:** All filter, sort, and modal state lives in `TransactionsPage` as individual `useState` calls. `useTransactions` is called with the assembled filter object.

**When to use:** State is ephemeral UI state with no persistence requirement, used only in one page.

**Example:**
```typescript
// src/pages/TransactionsPage.tsx
const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all')
const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all')
const [search, setSearch] = useState('')
const [sortBy, setSortBy] = useState<'date' | 'amount' | 'category'>('date')
const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

const transactions = useTransactions({
  type: typeFilter,
  category: categoryFilter,
  search,
  sortBy,
  sortOrder,
})
```

---

### Pattern 2: Dual-Mode TransactionForm

**What:** A single controlled form component handles both add and edit. When `initialData` is `undefined`, the form is in add mode (empty fields, title "Add Transaction"). When `initialData` is a `Transaction`, it is in edit mode (pre-populated fields, title "Edit Transaction").

**When to use:** Add and edit share identical fields and validation rules — one component prevents duplication.

**Example:**
```typescript
// src/components/transactions/TransactionForm.tsx
interface TransactionFormProps {
  initialData?: Transaction        // undefined = add mode, Transaction = edit mode
  onSubmit: (data: Omit<Transaction, 'id'>) => void
  onClose: () => void
}
```

Modal wiring in TransactionsPage:
```typescript
// Add button (Admin only, inside RoleGate)
const [modalOpen, setModalOpen] = useState(false)
const [editingTxn, setEditingTxn] = useState<Transaction | undefined>(undefined)

// In JSX:
<Modal open={modalOpen} onClose={handleClose} title={editingTxn ? 'Edit Transaction' : 'Add Transaction'}>
  <TransactionForm
    initialData={editingTxn}
    onSubmit={handleFormSubmit}
    onClose={handleClose}
  />
</Modal>
```

On submit:
```typescript
const handleFormSubmit = (data: Omit<Transaction, 'id'>) => {
  if (editingTxn) {
    editTransaction(editingTxn.id, data)
  } else {
    addTransaction({ id: crypto.randomUUID(), ...data })
  }
  handleClose()
}
```

---

### Pattern 3: RoleGate Component

**What:** A wrapper component that reads `role` from the Zustand store and renders `children` only when role satisfies `allowedRoles`.

**When to use:** Any UI element that must be hidden from Viewer users.

**Example:**
```typescript
// src/components/auth/RoleGate.tsx
import { useAppStore } from '../../store/store'
import type { Role } from '../../store/uiSlice'

interface RoleGateProps {
  allowedRoles: Role[]
  children: React.ReactNode
}

export function RoleGate({ allowedRoles, children }: RoleGateProps) {
  const role = useAppStore((s) => s.role)
  if (!allowedRoles.includes(role)) return null
  return <>{children}</>
}
```

Usage:
```typescript
<RoleGate allowedRoles={['Admin']}>
  <Button onClick={() => setModalOpen(true)}>
    <Plus size={16} /> Add Transaction
  </Button>
</RoleGate>
```

---

### Pattern 4: Sort Header Click Toggle

**What:** Clicking a column header that is already the active `sortBy` column toggles `sortOrder` between `'asc'` and `'desc'`. Clicking a different column sets it as `sortBy` and resets `sortOrder` to `'desc'`.

**When to use:** Standard table sort UX.

**Example:**
```typescript
const handleSort = (column: 'date' | 'amount' | 'category') => {
  if (sortBy === column) {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
  } else {
    setSortBy(column)
    setSortOrder('desc')
  }
}
```

Sort indicator (in table header cell):
```typescript
{sortBy === 'date' ? (
  sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
) : (
  <ChevronsUpDown size={14} className="text-gray-400" />
)}
```

---

### Pattern 5: Pure Form Validation Function

**What:** Validation logic extracted to a pure function returning a `Record<string, string>` error map. Zero dependencies on React state.

**When to use:** Any form validation that can be unit-tested in isolation.

**Example:**
```typescript
// src/utils/transactionFormValidation.ts
export interface TransactionFormValues {
  type: TransactionType | ''
  category: Category | ''
  amount: string        // string from input; parse to number on validate
  date: string          // ISO 8601 "YYYY-MM-DD"
  description: string
}

export type FormErrors = Partial<Record<keyof TransactionFormValues, string>>

export function validateTransactionForm(values: TransactionFormValues): FormErrors {
  const errors: FormErrors = {}
  if (!values.type) errors.type = 'Type is required'
  if (!values.category) errors.category = 'Category is required'
  const amt = parseFloat(values.amount)
  if (!values.amount || isNaN(amt) || amt <= 0) {
    errors.amount = 'Amount must be a positive number'
  }
  if (!values.date || !/^\d{4}-\d{2}-\d{2}$/.test(values.date)) {
    errors.date = 'Date must be in YYYY-MM-DD format'
  }
  if (!values.description.trim()) errors.description = 'Description is required'
  return errors
}
```

---

### Anti-Patterns to Avoid

- **Global state for filter values:** Type/category/search are ephemeral UI state — they belong in `useState`, not the Zustand store. The store owns persistent data (transactions, role, darkMode).
- **Separate add and edit form components:** Duplicates field layout and validation logic. One dual-mode component is correct.
- **Mutating `editingTxn` directly:** Always pass the full `Partial<Omit<Transaction, 'id'>>` update object to `editTransaction` — the immer middleware handles immutability in the store.
- **Calling `addTransaction` without a pre-generated ID:** The `Transaction` type requires `id: string`. Generate with `crypto.randomUUID()` in the page handler before dispatching.
- **Importing store in `TransactionTable` or `TransactionFilters`:** These are pure presentational components. They receive data and callbacks as props. Only `TransactionsPage` and `RoleGate` should import `useAppStore`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Focus trap in modal | Custom focus management | `@headlessui/react Dialog` (already in `Modal.tsx`) | WCAG 2.1 AA, keyboard accessibility, `Escape` handling — dozens of edge cases |
| Filter/sort logic | Custom sort/filter | `useTransactions` hook (already implemented) | Already tested; all five filter/sort combinations work |
| Unique ID generation | Timestamp or Math.random | `crypto.randomUUID()` | Cryptographically random; no collision risk; no import needed |
| Type badge styling | Custom inline styles | Existing `Badge` component with `variant="income"/"expense"` | Already has dark mode variants |

**Key insight:** The hook layer is already complete. Phase 5 is almost entirely UI composition work — wiring existing hooks and primitives together rather than building new logic.

---

## Common Pitfalls

### Pitfall 1: TransactionFilters object identity causes useMemo cache miss

**What goes wrong:** If the `filters` argument to `useTransactions` is created inline in JSX (e.g., `useTransactions({ type: typeFilter })`), a new object reference is created every render. The `useMemo` inside the hook depends on individual primitive values (`filters.type`, `filters.search`, etc.) not the object reference — so this is actually fine as implemented.

**Why it's fine:** The hook's `useMemo` dependency array is:
```
[transactions, filters.type, filters.category, filters.search, filters.sortBy, filters.sortOrder]
```
Individual primitive values, not the object itself. Passing an inline object is safe.

**Warning sign:** If someone changes the dependency to `[transactions, filters]` — that would cause the cache miss problem.

---

### Pitfall 2: Form submission with empty string amount

**What goes wrong:** `<input type="number">` returns `""` when empty, not `0`. `parseFloat("")` returns `NaN`. If validation is skipped or incomplete, `addTransaction` gets called with `amount: NaN` which corrupts the store.

**How to avoid:** The pure `validateTransactionForm` function should explicitly check `parseFloat(values.amount) > 0` and reject NaN. Call validation before dispatching. Never cast without validation.

**Warning signs:** Transactions appearing in the list with `NaN` as their amount.

---

### Pitfall 3: Edit form pre-population breaks for numeric input

**What goes wrong:** `<input type="number" value={transaction.amount}>` receives a `number` but the controlled form state is `string`. TypeScript will warn; more importantly, an uncontrolled input may flash between controlled/uncontrolled states.

**How to avoid:** Form state for `amount` should always be `string`. Initialize in edit mode with `String(initialData.amount)`. Convert back to `number` only on submit.

---

### Pitfall 4: RoleGate test mock — store state not reset between tests

**What goes wrong:** Tests that set Zustand store role to `'Admin'` in one test will leak that state into the next test if `beforeEach` doesn't reset.

**How to avoid:** Use the established pattern:
```typescript
beforeEach(() => {
  useAppStore.setState(useAppStore.getInitialState(), true)
})
```
This resets `role` to `'Viewer'` (the default in `uiSlice.ts`).

---

### Pitfall 5: Modal remains mounted with stale form state after close

**What goes wrong:** If `TransactionForm` is always mounted and just hidden (Modal `open={false}`), form fields retain values from a previous edit. Opening the modal for a different transaction shows old data.

**How to avoid:** Reset form state to `initialData` (or empty) whenever `initialData` changes. Use a `useEffect` with `initialData` as a dependency, or key the form component: `<TransactionForm key={editingTxn?.id ?? 'new'} />`. The `key` approach is simpler and guaranteed to remount with fresh state.

---

## Code Examples

Verified patterns from existing codebase:

### Reading role from store (for RoleGate)
```typescript
// Pattern from src/components/layout/Header.tsx — single selector per call
const role = useAppStore((s) => s.role)
```

### Calling store actions (for form submit handler)
```typescript
// Pattern from src/store/txnSlice.ts API
const addTransaction = useAppStore((s) => s.addTransaction)
const editTransaction = useAppStore((s) => s.editTransaction)
// In handler:
addTransaction({ id: crypto.randomUUID(), type, category, amount, date, description })
editTransaction(existingId, { type, category, amount, date, description })
```

### Input with validation error display
```typescript
// src/components/ui/Input.tsx already supports error prop
<Input
  label="Amount"
  id="amount"
  type="number"
  min="0.01"
  step="0.01"
  value={formValues.amount}
  onChange={(e) => setFormValues(prev => ({ ...prev, amount: e.target.value }))}
  error={errors.amount}
/>
```

### Select with CATEGORIES options
```typescript
// src/constants/categories.ts exports CATEGORIES array
import { CATEGORIES } from '../../constants/categories'
<Select label="Category" id="category" value={formValues.category} onChange={...} error={errors.category}>
  <option value="">Select a category</option>
  {CATEGORIES.map((c) => (
    <option key={c.id} value={c.id}>{c.label}</option>
  ))}
</Select>
```

### Tailwind table with dark mode
```typescript
// Standard Tailwind v4 table — no config needed
<table className="w-full text-sm">
  <thead>
    <tr className="border-b border-gray-200 dark:border-gray-700">
      <th className="py-3 px-4 text-left font-medium text-gray-500 dark:text-gray-400">Date</th>
    </tr>
  </thead>
  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
    {transactions.map((t) => (
      <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
        {/* cells */}
      </tr>
    ))}
  </tbody>
</table>
```

### getCategoryMeta for display label and color
```typescript
// src/constants/categories.ts exports getCategoryMeta
import { getCategoryMeta } from '../../constants/categories'
const meta = getCategoryMeta(transaction.category)
// meta.label -> 'Food & Dining'
// meta.color -> '#f59e0b'
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Controlled forms with `react-hook-form` for small forms | Manual `useState` + pure validation function | N/A — project decision | Avoids adding a dependency for a 5-field form |
| `useSelector` (Redux) pattern | `useAppStore((s) => s.field)` single selector calls | Phase 2 established | Consistent with Header.tsx pattern; avoids `useShallow` where not needed |
| Enum-based roles | `'Viewer' | 'Admin'` string literal union | Phase 2 established | JSON round-trip safe; no enum import needed in RoleGate |

**Deprecated/outdated in this project:**
- `useShallow` is only required for selectors that return new objects/arrays every call. A scalar `role` selector does NOT need `useShallow`. RoleGate uses a simple scalar selector — no `useShallow` needed.

---

## Open Questions

1. **Should `TransactionTable` receive filtered transactions as props or call `useTransactions` itself?**
   - What we know: `DashboardPage` calls `useTransactions()` and passes data as props to chart components — keeps components pure and testable.
   - Recommendation: Pass `Transaction[]` as a prop to `TransactionTable`. `TransactionsPage` calls `useTransactions` and passes the result down. This matches the dashboard pattern.

2. **Delete transaction button — in scope for Phase 5?**
   - What we know: `TXN-07` specifies "edit existing transaction" but does not mention delete. `deleteTransaction` exists in the store. REQUIREMENTS.md does not include a delete requirement in v1.
   - Recommendation: Do NOT add delete UI in Phase 5. It is not in scope. Adding it risks scope creep and extends testing surface. It can be added in Phase 6 or v2.

3. **Empty state for filtered results that return zero transactions?**
   - What we know: `EmptyState` component exists in `src/components/dashboard/EmptyState.tsx`. UX-06 (empty states) is assigned to Phase 6, but showing zero results gracefully is implicit in TXN-01.
   - Recommendation: Reuse `EmptyState` with a message like "No transactions match your filters." when the filtered list is empty. This is low-effort and avoids a blank table body.

---

## Validation Architecture

> `workflow.nyquist_validation` is `true` in `.planning/config.json` — this section is required.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.2 + @testing-library/react 16.3.2 |
| Config file | `vitest.config.ts` (environment: jsdom, globals: true) |
| Setup file | `src/setupTests.ts` (imports @testing-library/jest-dom) |
| Quick run command | `npx vitest run --reporter=verbose src/utils/__tests__/transactionFormValidation.test.ts src/components/auth/__tests__/RoleGate.test.tsx` |
| Full suite command | `npx vitest run` |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TXN-01 | All transactions visible in table | Manual (visual) | n/a — table layout not unit-testable | n/a |
| TXN-02 | Type filter narrows list | Automated (hook) | `npx vitest run src/hooks/__tests__/useTransactions.test.ts` | EXISTS |
| TXN-03 | Category filter narrows list | Automated (hook) | `npx vitest run src/hooks/__tests__/useTransactions.test.ts` | EXISTS |
| TXN-04 | Search filter by description | Automated (hook) | `npx vitest run src/hooks/__tests__/useTransactions.test.ts` | EXISTS |
| TXN-05 | Sort by date/amount/category | Automated (hook) | `npx vitest run src/hooks/__tests__/useTransactions.test.ts` | EXISTS |
| TXN-06 | Form validation rejects invalid input | Automated (pure fn) | `npx vitest run src/utils/__tests__/transactionFormValidation.test.ts` | Wave 0 gap |
| TXN-06 | Add transaction appears in store | Automated (store) | `npx vitest run src/store/__tests__/txnSlice.test.ts` | EXISTS |
| TXN-07 | Edit transaction updates store | Automated (store) | `npx vitest run src/store/__tests__/txnSlice.test.ts` | EXISTS |
| TXN-08 | Viewer sees no add/edit controls | Automated (component) | `npx vitest run src/components/auth/__tests__/RoleGate.test.tsx` | Wave 0 gap |

**Manual verification required (cannot be automated meaningfully):**
- TXN-01: Table visual layout, column alignment, amount/date formatting, Badge colors
- TXN-02/03/04: Filter controls update list visually in the browser
- TXN-05: Column header click toggles sort indicator icon
- TXN-06/07: Form interaction — open modal, fill fields, see validation messages, submit, see result in table
- TXN-08: Role switcher in header hides/shows add button and edit column in real browser

### Sampling Rate

- **Per task commit:** `npx vitest run src/utils/__tests__/transactionFormValidation.test.ts src/components/auth/__tests__/RoleGate.test.tsx`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps (test stubs needed before implementation)

- [ ] `src/utils/__tests__/transactionFormValidation.test.ts` — covers TXN-06 validation logic (6-8 cases: empty fields, negative amount, invalid date format, valid data passes)
- [ ] `src/components/auth/__tests__/RoleGate.test.tsx` — covers TXN-08 (3 cases: renders children when Admin, renders null when Viewer, responds to role change)
- [ ] `src/components/transactions/__tests__/TransactionForm.test.tsx` — covers TXN-06/TXN-07 form rendering (3 cases: renders empty in add mode, pre-populates in edit mode, calls onSubmit with correct shape)
- [ ] `src/components/transactions/__tests__/TransactionTable.test.tsx` — covers TXN-01 rendering (2 cases: renders transaction rows, shows EmptyState when empty array)

**Estimated full suite runtime:** < 5 seconds (existing suite runs in ~3 seconds; 4 new test files add ~1 second)

**No new framework install needed** — Vitest + @testing-library/react + jsdom are already installed and configured.

---

## Sources

### Primary (HIGH confidence)

- Direct file read: `src/hooks/useTransactions.ts` — TransactionFilters interface is confirmed complete (type, category, search, sortBy, sortOrder all implemented)
- Direct file read: `src/store/txnSlice.ts` — addTransaction, editTransaction, deleteTransaction signatures confirmed
- Direct file read: `src/store/uiSlice.ts` — Role type is `'Viewer' | 'Admin'`, default is `'Viewer'`
- Direct file read: `src/components/ui/Modal.tsx` — @headlessui/react Dialog, accepts open/onClose/title/children
- Direct file read: `src/components/ui/Input.tsx` — has `error?: string` prop wiring
- Direct file read: `src/components/ui/Select.tsx` — has `error?: string` prop wiring
- Direct file read: `src/components/ui/Badge.tsx` — has `income` and `expense` variants
- Direct file read: `src/constants/categories.ts` — CATEGORIES array with 11 entries, getCategoryMeta helper
- Direct file read: `src/hooks/__tests__/useTransactions.test.ts` — all filter/sort tests already pass (GREEN)
- Direct file read: `vitest.config.ts` — environment is jsdom, globals true, setupFiles present
- Direct file read: `package.json` — confirmed: no new packages needed; all dependencies present

### Secondary (MEDIUM confidence)

- `crypto.randomUUID()` browser support: MDN confirms available in all modern browsers (Chrome 92+, Firefox 95+, Safari 15.4+) and Node 14.17+; project uses Node 20+ per STATE.md decision.

### Tertiary (LOW confidence)

- None — all claims verified directly from codebase files.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified from package.json and existing source files
- Architecture patterns: HIGH — derived from existing patterns in DashboardPage, Header, store slices
- Pitfalls: HIGH — derived from existing code analysis (form type handling, store reset patterns)
- useTransactions completeness: HIGH — read the actual implementation; all five filter/sort parameters confirmed working

**Research date:** 2026-04-04
**Valid until:** 2026-05-04 (stable stack — no fast-moving libraries involved beyond what is already locked)
