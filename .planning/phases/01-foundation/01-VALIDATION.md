---
phase: 1
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-03
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.x |
| **Config file** | `vitest.config.ts` (Wave 0 installs) |
| **Quick run command** | `npx vitest run src/utils` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/utils`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 0 | FOUND-01 | type-check | `npx tsc --noEmit` | ❌ W0 | ⬜ pending |
| 1-01-02 | 01 | 0 | FOUND-02 | unit | `npx vitest run src/data` | ❌ W0 | ⬜ pending |
| 1-01-03 | 01 | 1 | FOUND-03 | unit | `npx vitest run src/utils/formatCurrency` | ❌ W0 | ⬜ pending |
| 1-01-04 | 01 | 1 | FOUND-03 | unit | `npx vitest run src/utils/formatDate` | ❌ W0 | ⬜ pending |
| 1-01-05 | 01 | 1 | FOUND-03 | unit | `npx vitest run src/utils/groupByCategory` | ❌ W0 | ⬜ pending |
| 1-01-06 | 01 | 1 | FOUND-03 | unit | `npx vitest run src/utils/calcTotals` | ❌ W0 | ⬜ pending |
| 1-01-07 | 01 | 1 | FOUND-03 | unit | `npx vitest run src/utils/formatChartData` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/types/index.ts` — Transaction type stub for FOUND-01
- [ ] `src/data/mockData.ts` — seed data stub for FOUND-02
- [ ] `src/utils/__tests__/formatCurrency.test.ts` — test stubs for formatCurrency edge cases
- [ ] `src/utils/__tests__/formatDate.test.ts` — test stubs for formatDate edge cases
- [ ] `src/utils/__tests__/groupByCategory.test.ts` — test stubs for groupByCategory
- [ ] `src/utils/__tests__/calcTotals.test.ts` — test stubs for calcTotals
- [ ] `src/utils/__tests__/formatChartData.test.ts` — test stubs for formatChartData (Recharts crash prevention)
- [ ] `vitest.config.ts` — Vitest config with jsdom environment
- [ ] Install: `npm install vitest @vitest/ui @testing-library/jest-dom date-fns`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Vite scaffold compiles without errors | FOUND-01 | Build output requires browser/Vite to render | Run `npm run build` — confirm zero errors in output |
| mockData.ts seed transactions look realistic | FOUND-02 | Aesthetic/realism judgment | Review data in browser console — dates span 3+ months, categories are varied |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
