# Phase 6: Polish - Research

**Researched:** 2026-04-05  
**Domain:** secure export workflows, reduced-motion animation polish, empty-state consistency, responsive hardening  
**Confidence:** HIGH

---

<phase_requirements>

## Phase Requirements

| ID    | Description                                                               | Research Support                                                                                                 |
| ----- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| UX-03 | Export currently visible/filtered transactions as CSV                     | `TransactionsPage` already computes visible rows via `useTransactions(...)`; export must consume this array only |
| UX-04 | Export currently visible/filtered transactions as JSON                    | Same visible array can be serialized directly; no reshaping needed                                               |
| UX-05 | Smooth animations for cards/page/modal/charts with reduced-motion support | `motion` package is installed but currently unused; Recharts animation can be toggled with `isAnimationActive`   |
| UX-06 | Meaningful empty states for list/chart/card surfaces                      | List/chart empty states exist; KPI card-level no-data messaging needs explicit contract                          |
| UX-07 | Responsive usability at 375/768/1280+ without overlap/horizontal scroll   | Current table/filter/header action density at 375px is a risk area                                               |

</phase_requirements>

---

## Gap Analysis

### Already in place

- Filtered + sorted visible transaction array is already available in `TransactionsPage`.
- `TransactionTable`, `BalanceTrendChart`, and `SpendingPieChart` already render meaningful empty states.
- Layout shell and dark mode are stable across prior phases.

### Missing or incomplete

1. No CSV/JSON export utility or export action UI exists.
2. No formula-injection hardening exists for CSV output.
3. No explicit reduced-motion integration exists across route/card/modal/chart surfaces.
4. KPI cards do not currently render explicit no-data helper messaging.
5. Responsive behavior for transaction action row and table at 375px is not guaranteed.

---

## Recommended Plan Decomposition

1. `06-01-PLAN.md` — Wave 0 RED tests + contracts for export/motion/card-empty behavior
2. `06-02-PLAN.md` — Implement export pipeline (CSV + JSON + safe download) wired to visible rows
3. `06-03-PLAN.md` — Implement reduced-motion-aware animation system + KPI card empty messaging
4. `06-04-PLAN.md` — Responsive hardening (including header action row) + final QA checkpoint

Reasoning: this keeps TDD discipline, isolates risk-heavy export security work early, and defers responsive QA gate until all Phase 6 features are present.

---

## Architecture Decisions for Phase 6

### 1) Export source of truth

- **Rule:** export data comes from `transactions` in `TransactionsPage` (filtered + sorted visible list).
- **Do not:** export directly from store raw transactions.

### 2) CSV hardening

- Escape spreadsheet formulas by prefixing apostrophe `'` for leading `=`, `+`, `-`, `@`, tab, or carriage-return values.
- Keep amount as raw numeric value in CSV (no currency formatting).

### 3) JSON fidelity

- Serialize visible rows in existing order using `JSON.stringify(rows, null, 2)`.
- Preserve field types (`amount` number, `date` string).

### 4) Motion strategy

- Use existing `motion` dependency (no new animation library).
- Centralize presets in one utility to avoid drift.
- Reduced-motion branch should remove movement-heavy transforms and use near-zero duration.

### 5) Responsive strategy for 375px

- Handle action-row density in `TransactionsPage` (title + export + add).
- Provide mobile-friendly transaction rendering to avoid horizontal table scrolling.
- Fix root-cause layout issues rather than masking with global overflow clipping.

---

## Risks and Mitigations

| Risk                                                   | Impact              | Mitigation                                                            |
| ------------------------------------------------------ | ------------------- | --------------------------------------------------------------------- |
| Exporting full store instead of visible rows           | UX-03/04 failure    | Prop-driven `visibleTransactions` contract and tests                  |
| Partial CSV escaping only                              | Security/QA failure | Unit tests for dangerous prefixes + quote escaping                    |
| Reduced-motion applied to only some surfaces           | UX-05 failure       | Central motion preset + integration checks on route/card/modal/charts |
| 375px overlap from added export controls               | UX-07 failure       | Include `TransactionsPage` action-row responsive task in Plan 04      |
| Mobile table + desktop table duplicate test collisions | Test fragility      | Plan for conditional rendering strategy or test updates               |

---

## Validation Architecture (high level)

- Add targeted unit/component tests first (Wave 0).
- Use focused test runs after each task, then full suite at plan boundaries.
- Manual browser verification required for spreadsheet behavior, reduced-motion UX, and viewport layout.

---

## Open Questions (resolved defaults)

1. **Should Viewer be allowed to export?** → Yes (read-only capability).
2. **When no rows are visible, should export be disabled?** → No; export header-only CSV and `[]` JSON.
3. **CSV schema for amounts** → Keep numeric amount + separate `type` column.
4. **Responsive table behavior at 375px** → Prefer mobile card rendering with parity actions.

---

## Sources

### Primary

- `src/pages/TransactionsPage.tsx`
- `src/hooks/useTransactions.ts`
- `src/components/transactions/TransactionTable.tsx`
- `src/components/transactions/TransactionFilters.tsx`
- `src/components/dashboard/KpiCard.tsx`
- `src/components/ui/Modal.tsx`
- `src/App.tsx`
- `package.json`

### Secondary

- Spreadsheet formula-injection hardening conventions (`'` prefix for dangerous-leading cells)

---

**Research validity window:** through next structural UI refactor or dependency changes affecting routing/motion/export behavior.
