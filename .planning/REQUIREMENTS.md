# Requirements: Finance Dashboard

**Defined:** 2026-04-03
**Core Value:** Users can instantly understand their financial picture and explore transactions with filtering, all within a polished, responsive UI that demonstrates strong frontend craft.

## v1 Requirements

### Foundation

- [x] **FOUND-01**: Application has a TypeScript Transaction type with fields: id, date, amount, category, type (income|expense), description
- [x] **FOUND-02**: Application ships with 25-30 mock seed transactions spanning at least 3 months, covering multiple categories and both income/expense types
- [x] **FOUND-03**: Utility functions exist for formatCurrency, formatDate, groupByCategory, and calcTotals (balance, income, expenses)
- [x] **FOUND-04**: Zustand store has a transactions slice with CRUD operations (add, edit, delete) and a UI slice with role and darkMode state
- [x] **FOUND-05**: Zustand store uses persist middleware with version, migrate, and partialize configured from initialization

### Dashboard

- [ ] **DASH-01**: User can see a summary panel with Total Balance, Total Income, and Total Expenses as KPI cards
- [ ] **DASH-02**: User can see a time-series chart showing balance trend over time (at least 2 months of data visible)
- [ ] **DASH-03**: User can see a categorical chart showing spending breakdown by category (pie or bar)
- [ ] **DASH-04**: User can see an insights section showing: highest spending category, month-over-month comparison, and at least one additional observation

### Transactions

- [ ] **TXN-01**: User can view a list of all transactions with date, amount, category, type (income/expense), and description
- [ ] **TXN-02**: User can filter transactions by type (income / expense / all)
- [ ] **TXN-03**: User can filter transactions by category (multi-select or single dropdown)
- [ ] **TXN-04**: User can search transactions by description text
- [ ] **TXN-05**: User can sort transactions by date, amount, or category
- [ ] **TXN-06**: Admin user can add a new transaction via a form (date, amount, category, type, description)
- [ ] **TXN-07**: Admin user can edit an existing transaction
- [ ] **TXN-08**: Viewer user cannot see add/edit controls (role-gated UI)

### Roles

- [ ] **ROLE-01**: User can switch between Viewer and Admin roles via a dropdown or toggle in the header/navbar
- [x] **ROLE-02**: Selected role persists across page refresh (via localStorage through Zustand persist)

### Polish & UX

- [ ] **UX-01**: User can toggle between light and dark mode; preference persists across refresh
- [ ] **UX-02**: Dark mode correctly themes all chart colors (via CSS variables, not hardcoded hex)
- [ ] **UX-03**: User can export visible/filtered transactions as CSV
- [ ] **UX-04**: User can export visible/filtered transactions as JSON
- [ ] **UX-05**: UI has smooth animations/transitions on: card entrance, page navigation, modal open/close, and chart load
- [ ] **UX-06**: All list/chart/card views show a meaningful empty state when no data matches filters
- [ ] **UX-07**: Layout is responsive and usable on mobile (375px), tablet (768px), and desktop (1280px+)

## v2 Requirements

### Notifications

- **NOTF-01**: In-app notification when a budget threshold is exceeded
- **NOTF-02**: Weekly summary email simulation

### Advanced Analytics

- **ANLX-01**: Budget vs actual comparison chart
- **ANLX-02**: Savings rate over time visualization
- **ANLX-03**: Recurring transactions detection

### Data Management

- **DATA-01**: Import transactions from CSV file
- **DATA-02**: Bulk delete or edit selected transactions
- **DATA-03**: Transaction tags/labels beyond category

## Out of Scope

| Feature | Reason |
|---------|--------|
| Backend / real API | Assignment is frontend-only; mock data sufficient |
| Authentication (login/logout) | Role switching is UI simulation only, not real auth |
| Real-time data feeds / WebSocket | No backend; static + locally mutated data |
| Mobile native app | Web-first only |
| 3D chart effects | Signals poor data visualization judgment; adds no informational value |
| Multi-user support | Single-user dashboard simulation |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 1 | Complete |
| FOUND-02 | Phase 1 | Complete |
| FOUND-03 | Phase 1 | Complete |
| FOUND-04 | Phase 2 | Complete |
| FOUND-05 | Phase 2 | Complete |
| DASH-01 | Phase 4 | Pending |
| DASH-02 | Phase 4 | Pending |
| DASH-03 | Phase 4 | Pending |
| DASH-04 | Phase 4 | Pending |
| TXN-01 | Phase 5 | Pending |
| TXN-02 | Phase 5 | Pending |
| TXN-03 | Phase 5 | Pending |
| TXN-04 | Phase 5 | Pending |
| TXN-05 | Phase 5 | Pending |
| TXN-06 | Phase 5 | Pending |
| TXN-07 | Phase 5 | Pending |
| TXN-08 | Phase 5 | Pending |
| ROLE-01 | Phase 3 | Pending |
| ROLE-02 | Phase 2 | Complete |
| UX-01 | Phase 3 | Pending |
| UX-02 | Phase 3 | Pending |
| UX-03 | Phase 6 | Pending |
| UX-04 | Phase 6 | Pending |
| UX-05 | Phase 6 | Pending |
| UX-06 | Phase 6 | Pending |
| UX-07 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 26 total
- Mapped to phases: 26
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-03*
*Last updated: 2026-04-03 after roadmap creation — traceability confirmed*
