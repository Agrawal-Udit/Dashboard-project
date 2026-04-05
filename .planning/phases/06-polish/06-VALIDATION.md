---
phase: 6
slug: polish
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-05
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for execution feedback loops.

---

## Test Infrastructure

| Property               | Value                                                                                                                                                                                                                                    |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Framework**          | Vitest 4.x + @testing-library/react                                                                                                                                                                                                      |
| **Config file**        | `vitest.config.ts` (`environment: 'jsdom'`)                                                                                                                                                                                              |
| **Quick run command**  | `npx vitest run src/utils/__tests__/exportUtils.test.ts src/utils/__tests__/motionConfig.test.ts src/components/transactions/__tests__/TransactionExportActions.test.tsx src/components/dashboard/__tests__/KpiCard.emptyState.test.tsx` |
| **Full suite command** | `npx vitest run`                                                                                                                                                                                                                         |
| **Type check command** | `npx tsc --noEmit`                                                                                                                                                                                                                       |

---

## Sampling Rate

- **After every task commit:** targeted test command for touched files
- **After every plan wave:** `npx vitest run`
- **Before `/gsd:verify-work`:**
  - `npx vitest run`
  - `npx tsc --noEmit`
  - `npm run build`

---

## Requirements-to-Verification Map

| Req ID | Behavior                                               | Test Type          | Automated Command                                                                                                                                                                                                                                                          | File Exists? |
| ------ | ------------------------------------------------------ | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| UX-03  | CSV export uses visible filtered rows only             | Automated + Manual | `npx vitest run src/utils/__tests__/exportUtils.test.ts src/components/transactions/__tests__/TransactionExportActions.test.tsx`                                                                                                                                           | ❌ W0        |
| UX-03  | CSV formula-injection mitigation works                 | Automated + Manual | `npx vitest run src/utils/__tests__/exportUtils.test.ts`                                                                                                                                                                                                                   | ❌ W0        |
| UX-04  | JSON export preserves order and data types             | Automated + Manual | `npx vitest run src/utils/__tests__/exportUtils.test.ts src/components/transactions/__tests__/TransactionExportActions.test.tsx`                                                                                                                                           | ❌ W0        |
| UX-05  | Route/card/modal/chart motion respects reduced-motion  | Automated + Manual | `npx vitest run src/utils/__tests__/motionConfig.test.ts` (+ integration tests updated in Plan 03)                                                                                                                                                                         | ❌ W0        |
| UX-06  | Meaningful empty states for list/chart/card views      | Automated + Manual | `npx vitest run src/components/dashboard/__tests__/KpiCard.emptyState.test.tsx src/components/dashboard/__tests__/BalanceTrendChart.test.tsx src/components/dashboard/__tests__/SpendingPieChart.test.tsx src/components/transactions/__tests__/TransactionTable.test.tsx` | Partial      |
| UX-07  | 375/768/1280 responsive usability, no overlap/overflow | Manual             | n/a                                                                                                                                                                                                                                                                        | n/a          |

---

## Per-Task Verification Map

| Task ID | Plan  | Requirement  | Verification                                                    |
| ------- | ----- | ------------ | --------------------------------------------------------------- |
| 6-01-01 | 06-01 | UX-03, UX-04 | RED stubs: export serializer + export actions                   |
| 6-01-02 | 06-01 | UX-05, UX-06 | RED stubs: motion config + KPI card empty message               |
| 6-02-01 | 06-02 | UX-03, UX-04 | Export utility tests green                                      |
| 6-02-02 | 06-02 | UX-03, UX-04 | Export action component tests green                             |
| 6-03-01 | 06-03 | UX-05        | Motion config + chart/modal/route integration checks            |
| 6-03-02 | 06-03 | UX-06        | KPI card empty-state tests green                                |
| 6-04-01 | 06-04 | UX-07        | Responsive hardening + table/filter/action-row regression tests |
| 6-04-02 | 06-04 | UX-03..UX-07 | Manual blocking checkpoint                                      |

---

## Wave 0 Requirements

- [ ] `src/utils/__tests__/exportUtils.test.ts`
- [ ] `src/components/transactions/__tests__/TransactionExportActions.test.tsx`
- [ ] `src/utils/__tests__/motionConfig.test.ts`
- [ ] `src/components/dashboard/__tests__/KpiCard.emptyState.test.tsx`

No new dependency install is expected.

---

## Manual-Only Verification Checklist

### UX-03 (CSV)

1. Apply filters/search/sort in Transactions page.
2. Export CSV.
3. Confirm exported rows exactly match visible rows.
4. Confirm dangerous-leading description values are prefixed safely.

### UX-04 (JSON)

1. Keep same filtered/sorted table.
2. Export JSON.
3. Confirm first/last items match current visible order.
4. Confirm `amount` remains numeric.

### UX-05 (motion + reduced motion)

1. Verify normal mode animations on route/card/modal/chart.
2. Emulate `prefers-reduced-motion: reduce` and verify reduced/disabled movement.

### UX-06 (empty states)

1. Force no-match transaction filter and verify list empty message.
2. Verify chart and KPI card empty messaging remains meaningful.

### UX-07 (responsive)

1. Test widths 375, 768, 1280.
2. Verify no overlapping controls.
3. Verify no horizontal scrolling is needed for core interaction surfaces.
4. Verify transaction actions (including edit/export/add) remain reachable.

---

## Validation Sign-off Gates

- [ ] All Wave 0 files exist and fail RED by design
- [ ] No three consecutive implementation tasks without an automated check
- [ ] Full suite and TypeScript checks green before manual QA gate
- [ ] Manual QA checklist approved
- [ ] `nyquist_compliant` flipped to `true` at phase close

**Approval:** pending
