---
phase: 5
slug: transactions
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-05
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.x + @testing-library/react |
| **Config file** | `vitest.config.ts` (exists, `environment: 'jsdom'`) |
| **Quick run command** | `npx vitest run src/utils/__tests__/transactionFormValidation.test.ts src/components/auth/__tests__/RoleGate.test.tsx` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~4 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/utils/__tests__/transactionFormValidation.test.ts src/components/auth/__tests__/RoleGate.test.tsx`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 4 seconds

---

## Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TXN-01 | All transactions visible in table | Manual (visual) | n/a — table layout not unit-testable | n/a |
| TXN-02 | Type filter narrows list | Automated (hook) | `npx vitest run src/hooks/__tests__/useTransactions.test.ts` | EXISTS ✅ |
| TXN-03 | Category filter narrows list | Automated (hook) | `npx vitest run src/hooks/__tests__/useTransactions.test.ts` | EXISTS ✅ |
| TXN-04 | Search filter by description | Automated (hook) | `npx vitest run src/hooks/__tests__/useTransactions.test.ts` | EXISTS ✅ |
| TXN-05 | Sort by date/amount/category | Automated (hook) | `npx vitest run src/hooks/__tests__/useTransactions.test.ts` | EXISTS ✅ |
| TXN-06 | Form validation rejects invalid input | Automated (pure fn) | `npx vitest run src/utils/__tests__/transactionFormValidation.test.ts` | ❌ W0 |
| TXN-06 | Add transaction appears in store | Automated (store) | `npx vitest run src/store/__tests__/txnSlice.test.ts` | EXISTS ✅ |
| TXN-07 | Edit transaction updates store | Automated (store) | `npx vitest run src/store/__tests__/txnSlice.test.ts` | EXISTS ✅ |
| TXN-08 | Viewer sees no add/edit controls | Automated (component) | `npx vitest run src/components/auth/__tests__/RoleGate.test.tsx` | ❌ W0 |

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 5-01-01 | 01 | 0 | TXN-06, TXN-08 | unit stub | `npx vitest run src/utils/__tests__/transactionFormValidation.test.ts` | ❌ W0 | ⬜ pending |
| 5-01-02 | 01 | 0 | TXN-08 | unit stub | `npx vitest run src/components/auth/__tests__/RoleGate.test.tsx` | ❌ W0 | ⬜ pending |
| 5-01-03 | 01 | 0 | TXN-01, TXN-06, TXN-07 | unit stub | `npx vitest run src/components/transactions/__tests__/` | ❌ W0 | ⬜ pending |
| 5-02-01 | 02 | 1 | TXN-06 | unit | `npx vitest run src/utils/__tests__/transactionFormValidation.test.ts` | ❌ W0 | ⬜ pending |
| 5-02-02 | 02 | 1 | TXN-08 | unit | `npx vitest run src/components/auth/__tests__/RoleGate.test.tsx` | ❌ W0 | ⬜ pending |
| 5-03-01 | 03 | 2 | TXN-01, TXN-02, TXN-03, TXN-04, TXN-05 | unit | `npx vitest run src/components/transactions/__tests__/TransactionTable.test.tsx` | ❌ W0 | ⬜ pending |
| 5-03-02 | 03 | 2 | TXN-06, TXN-07 | unit | `npx vitest run src/components/transactions/__tests__/TransactionForm.test.tsx` | ❌ W0 | ⬜ pending |
| 5-04-01 | 04 | 3 | TXN-01–08 | manual | Browser: full transactions page end-to-end | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/utils/__tests__/transactionFormValidation.test.ts` — stubs: empty fields, negative amount, invalid date, valid data passes (6-8 cases)
- [ ] `src/components/auth/__tests__/RoleGate.test.tsx` — stubs: renders children when Admin, null when Viewer, responds to role change (3 cases)
- [ ] `src/components/transactions/__tests__/TransactionForm.test.tsx` — stubs: renders empty in add mode, pre-populates in edit mode, calls onSubmit with correct shape (3 cases)
- [ ] `src/components/transactions/__tests__/TransactionTable.test.tsx` — stubs: renders transaction rows, shows EmptyState when empty array (2 cases)

**No new package installs needed** — all deps installed (headlessui, lucide-react, zustand, tailwindcss).

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Table visual layout: columns, formatting, Badge colors | TXN-01 | Table layout not unit-testable in jsdom | Open /transactions, confirm Date/Description/Category/Type/Amount columns |
| Filter controls update list in real-time | TXN-02, TXN-03, TXN-04 | Visual interactivity | Use type radio, category dropdown, search box — confirm list filters |
| Column header click toggles sort + shows indicator | TXN-05 | DOM click interaction + visual | Click Date/Amount/Category headers, confirm sort icon shows and list reorders |
| Add form: fill fields, submit, appears in list | TXN-06 | Form interaction flow | Click Add, fill all fields, submit — new row appears at top |
| Edit form: pre-populated, change, save | TXN-07 | Form interaction flow | Click edit on a row, modify amount, save — row reflects new value |
| Viewer role hides Add button and Edit column | TXN-08 | Role-gated UI visual | Switch to Viewer in header — Add button gone, no edit icons in rows |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 4s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
