---
phase: 2
slug: state-layer
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-04
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.x |
| **Config file** | `vitest.config.ts` (Wave 0 updates `environment` to `'jsdom'`) |
| **Quick run command** | `npx vitest run src/store src/hooks` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~2-3 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/store src/hooks`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 3 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 2-01-01 | 01 | 0 | FOUND-04 | unit | `npx vitest run src/store/__tests__/txnSlice.test.ts` | ❌ W0 | ⬜ pending |
| 2-01-02 | 01 | 0 | FOUND-04 | unit | `npx vitest run src/store/__tests__/uiSlice.test.ts` | ❌ W0 | ⬜ pending |
| 2-01-03 | 01 | 0 | FOUND-05 | unit | `npx vitest run src/store/__tests__/store.test.ts` | ❌ W0 | ⬜ pending |
| 2-01-04 | 01 | 0 | FOUND-04 | unit | `npx vitest run src/hooks/__tests__/useTransactions.test.ts` | ❌ W0 | ⬜ pending |
| 2-01-05 | 01 | 0 | FOUND-04 | unit | `npx vitest run src/hooks/__tests__/useSummaryTotals.test.ts` | ❌ W0 | ⬜ pending |
| 2-01-06 | 01 | 1 | FOUND-04 | unit | `npx vitest run src/store/__tests__/txnSlice.test.ts` | ❌ W0 | ⬜ pending |
| 2-01-07 | 01 | 1 | FOUND-04 | unit | `npx vitest run src/store/__tests__/uiSlice.test.ts` | ❌ W0 | ⬜ pending |
| 2-01-08 | 01 | 2 | FOUND-05 | unit | `npx vitest run src/store/__tests__/store.test.ts` | ❌ W0 | ⬜ pending |
| 2-01-09 | 01 | 2 | FOUND-04 | unit | `npx vitest run src/hooks/__tests__/useTransactions.test.ts` | ❌ W0 | ⬜ pending |
| 2-01-10 | 01 | 2 | FOUND-04 | unit | `npx vitest run src/hooks/__tests__/useSummaryTotals.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest.config.ts` — update `environment` from `'node'` to `'jsdom'` (required for persist + hooks tests)
- [ ] `src/store/__tests__/txnSlice.test.ts` — failing test stubs for addTransaction, editTransaction, deleteTransaction, edge cases
- [ ] `src/store/__tests__/uiSlice.test.ts` — failing test stubs for setRole, setDarkMode, initial values
- [ ] `src/store/__tests__/store.test.ts` — failing test stubs for partialize shape, migrate function, localStorage key
- [ ] `src/hooks/__tests__/useTransactions.test.ts` — failing test stubs for filtering, sorting selector
- [ ] `src/hooks/__tests__/useSummaryTotals.test.ts` — failing test stubs for totals aggregation
- [ ] Install: `npm install zustand immer` (immer is a required peer dependency for zustand/immer middleware)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Role persists across page refresh | ROLE-02 | Zustand persist hydration cycle requires real localStorage + browser reload | Open `http://localhost:5173`, use `setRole('Admin')` via store, press F5, verify role still shows Admin in UI |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 3s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
