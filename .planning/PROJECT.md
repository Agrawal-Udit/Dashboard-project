# Finance Dashboard

## What This Is

A clean, interactive finance dashboard UI built with React + Vite for a frontend evaluation assignment. Users can track financial activity — viewing summaries, exploring transactions, and understanding spending patterns. The interface simulates role-based access (Viewer vs Admin) entirely on the frontend.

## Core Value

Users can instantly understand their financial picture and explore transactions with filtering, all within a polished, responsive UI that demonstrates strong frontend craft.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Summary cards: Total Balance, Income, Expenses
- [ ] Time-based chart (balance trend over time)
- [ ] Categorical chart (spending breakdown by category)
- [ ] Transactions list with date, amount, category, type (income/expense)
- [ ] Filter, sort, and search on transactions
- [ ] Role-based UI: Viewer (read-only) vs Admin (add/edit transactions), switchable via dropdown/toggle
- [ ] Insights section: highest spending category, monthly comparison, key observations
- [ ] Dark mode toggle
- [ ] Local storage persistence for transactions and selected role
- [ ] Export transactions as CSV or JSON
- [ ] Smooth animations and micro-interactions on cards, charts, and navigation
- [ ] Responsive layout (mobile, tablet, desktop)
- [ ] Empty/no-data state handling

### Out of Scope

- Backend / real API — mock/static data only
- Authentication — role switching is UI-only simulation
- Real-time data feeds — static or locally mutated data

## Context

This is a frontend assignment submission evaluated on: design/creativity, responsiveness, functionality, UX, technical quality, state management, documentation, and attention to detail. The grader expects clean code, thoughtful layout choices, and small polish details that show care.

**Stack decisions:**
- React + Vite — fast setup, component ecosystem
- Styling: Tailwind CSS — utility-first, responsive-friendly
- Charts: Recharts — React-native, composable, good aesthetics
- State: Zustand — lightweight, minimal boilerplate, easy to demo
- Design aesthetic: Clean & Minimal (light base + dark mode, subtle shadows, professional finance feel)

## Constraints

- **No backend**: All data is mock/static + local storage
- **Submission quality**: Code must be clean, documented, and have a solid README
- **Framework**: React + Vite (locked)
- **Scope**: v1 must cover all core requirements + all 4 chosen optional enhancements

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Zustand for state | Lightweight, easy to show in evaluation context vs Redux boilerplate | — Pending |
| Recharts for charts | React-native API, good default aesthetics, composable | — Pending |
| Tailwind CSS | Utility-first speeds up responsive layout, pairs well with clean minimal style | — Pending |
| All 4 optional enhancements as must-haves | Evaluation criteria rewards completeness and polish | — Pending |

---
*Last updated: 2026-04-03 after initialization*
