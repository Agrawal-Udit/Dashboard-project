---
phase: 4
slug: dashboard
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-04
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.x + @testing-library/react |
| **Config file** | `vitest.config.ts` (exists, `environment: 'jsdom'`) |
| **Quick run command** | `npx vitest run src/utils/insightsUtils.test.ts` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~3 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/utils/insightsUtils.test.ts`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 3 seconds

---

## Realistic Assessment: What Can and Cannot Be Automated

Recharts SVG rendering in jsdom is non-functional — `ResponsiveContainer` cannot measure its parent (no layout engine), SVG elements render as empty nodes. Do not assert on Recharts internals in Vitest.

| What Can Be Automated (Vitest) | What Requires Browser/Manual |
|-------------------------------|------------------------------|
| `calcInsights()` — all edge cases (empty, no expenses, single month, zero denominator) | Chart visual appearance (gradient fills, curve shape, pie segments) |
| `calcInsights()` — NaN/Infinity-free output | Dark mode chart colors switching on `html.dark` toggle |
| Cumulative balance reducer producing correct running totals | ResponsiveContainer height = 300px in real browser |
| Empty state: component renders "No data" text when passed empty array | Tooltip appearance and content on hover |
| KpiCard renders `formatCurrency(0)` for zero values | Pie label truncation at <5% threshold |
| `DashboardPage` smoke render without crash when store empty | Responsive dashboard layout at 375px / 768px / 1280px |

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 4-01-01 | 01 | 0 | DASH-04 | unit stub | `npx vitest run src/utils/insightsUtils.test.ts` | ❌ W0 | ⬜ pending |
| 4-01-02 | 01 | 0 | DASH-01 | unit stub | `npx vitest run src/components/dashboard/__tests__/KpiCard.test.tsx` | ❌ W0 | ⬜ pending |
| 4-01-03 | 01 | 0 | DASH-02 | unit stub | `npx vitest run src/components/dashboard/__tests__/BalanceTrendChart.test.tsx` | ❌ W0 | ⬜ pending |
| 4-01-04 | 01 | 0 | DASH-03 | unit stub | `npx vitest run src/components/dashboard/__tests__/SpendingPieChart.test.tsx` | ❌ W0 | ⬜ pending |
| 4-02-01 | 02 | 1 | DASH-04 | unit | `npx vitest run src/utils/insightsUtils.test.ts` | ❌ W0 | ⬜ pending |
| 4-02-02 | 02 | 1 | DASH-01 | unit | `npx vitest run src/components/dashboard/__tests__/KpiCard.test.tsx` | ❌ W0 | ⬜ pending |
| 4-03-01 | 03 | 2 | DASH-02 | unit | `npx vitest run src/components/dashboard/__tests__/BalanceTrendChart.test.tsx` | ❌ W0 | ⬜ pending |
| 4-03-02 | 03 | 2 | DASH-03 | unit | `npx vitest run src/components/dashboard/__tests__/SpendingPieChart.test.tsx` | ❌ W0 | ⬜ pending |
| 4-04-01 | 04 | 3 | DASH-04 | unit | `npx vitest run src/utils/insightsUtils.test.ts` | ❌ W0 | ⬜ pending |
| 4-04-02 | 04 | 3 | DASH-01–04 | manual | Browser: dashboard renders correctly with seed data | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/utils/__tests__/insightsUtils.test.ts` — failing stubs: `calcInsights` edge cases (empty, NaN-free, single month, zero denominator, month-over-month null)
- [ ] `src/components/dashboard/__tests__/KpiCard.test.tsx` — failing stub: renders formatted value, zero value renders "$0.00", empty state
- [ ] `src/components/dashboard/__tests__/BalanceTrendChart.test.tsx` — failing stub: renders empty state text when `data=[]`
- [ ] `src/components/dashboard/__tests__/SpendingPieChart.test.tsx` — failing stub: renders empty state text when `data=[]`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Time-series chart renders with correct curve at 300px height | DASH-02 | Recharts SVG not emulated in jsdom | Open dashboard, confirm AreaChart visible and correctly sized |
| Categorical pie chart shows labeled segments with correct proportions | DASH-03 | SVG rendering not testable in jsdom | Open dashboard, hover pie segments, confirm labels and tooltips |
| Chart colors update in dark mode via CSS variables | DASH-02, DASH-03 | SVG paint resolution not emulated | Toggle dark mode, confirm chart colors shift to lighter palette |
| Dashboard layout at 375px / 768px / 1280px | DASH-01–04 | jsdom has no media query support | DevTools responsive mode at each breakpoint |
| Empty state visual appearance when store cleared | DASH-01–04 | Visual, not logic | Clear localStorage, hard refresh, confirm meaningful empty states |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 3s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
