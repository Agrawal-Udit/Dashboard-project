import type { Transaction } from '../types';

export const MOCK_TRANSACTIONS: Transaction[] = [
  // January 2026 — 10 transactions
  { id: 'txn-001', date: '2026-01-05', amount: 4500, category: 'salary',        type: 'income',  description: 'Monthly salary — January' },
  { id: 'txn-002', date: '2026-01-08', amount: 1200, category: 'housing',       type: 'expense', description: 'Rent payment' },
  { id: 'txn-003', date: '2026-01-10', amount: 85,   category: 'food',          type: 'expense', description: 'Grocery shopping' },
  { id: 'txn-004', date: '2026-01-12', amount: 45,   category: 'transport',     type: 'expense', description: 'Monthly bus pass' },
  { id: 'txn-005', date: '2026-01-14', amount: 120,  category: 'utilities',     type: 'expense', description: 'Electricity bill' },
  { id: 'txn-006', date: '2026-01-16', amount: 600,  category: 'freelance',     type: 'income',  description: 'Web design project — client A' },
  { id: 'txn-007', date: '2026-01-18', amount: 55,   category: 'entertainment', type: 'expense', description: 'Streaming subscriptions' },
  { id: 'txn-008', date: '2026-01-22', amount: 95,   category: 'healthcare',    type: 'expense', description: 'GP consultation' },
  { id: 'txn-009', date: '2026-01-25', amount: 200,  category: 'education',     type: 'expense', description: 'Online course — React advanced' },
  { id: 'txn-010', date: '2026-01-28', amount: 38,   category: 'other',         type: 'expense', description: 'Miscellaneous household items' },

  // February 2026 — 9 transactions
  { id: 'txn-011', date: '2026-02-03', amount: 4500, category: 'salary',        type: 'income',  description: 'Monthly salary — February' },
  { id: 'txn-012', date: '2026-02-05', amount: 1200, category: 'housing',       type: 'expense', description: 'Rent payment' },
  { id: 'txn-013', date: '2026-02-07', amount: 110,  category: 'food',          type: 'expense', description: 'Grocery shopping' },
  { id: 'txn-014', date: '2026-02-10', amount: 250,  category: 'investment',    type: 'income',  description: 'Dividend payout — index fund' },
  { id: 'txn-015', date: '2026-02-12', amount: 65,   category: 'transport',     type: 'expense', description: 'Fuel refill' },
  { id: 'txn-016', date: '2026-02-14', amount: 80,   category: 'entertainment', type: 'expense', description: 'Cinema tickets' },
  { id: 'txn-017', date: '2026-02-18', amount: 12,   category: 'utilities',     type: 'expense', description: 'Mobile data top-up' },
  { id: 'txn-018', date: '2026-02-22', amount: 750,  category: 'freelance',     type: 'income',  description: 'API integration project — client B' },
  { id: 'txn-019', date: '2026-02-25', amount: 145,  category: 'healthcare',    type: 'expense', description: 'Prescription medicines' },

  // March 2026 — 9 transactions
  { id: 'txn-020', date: '2026-03-03', amount: 4500, category: 'salary',        type: 'income',  description: 'Monthly salary — March' },
  { id: 'txn-021', date: '2026-03-05', amount: 1200, category: 'housing',       type: 'expense', description: 'Rent payment' },
  { id: 'txn-022', date: '2026-03-08', amount: 95,   category: 'food',          type: 'expense', description: 'Grocery shopping' },
  { id: 'txn-023', date: '2026-03-10', amount: 30,   category: 'transport',     type: 'expense', description: 'Taxi ride' },
  { id: 'txn-024', date: '2026-03-13', amount: 480,  category: 'investment',    type: 'income',  description: 'Stock sale — partial position' },
  { id: 'txn-025', date: '2026-03-15', amount: 135,  category: 'utilities',     type: 'expense', description: 'Internet and phone bill' },
  { id: 'txn-026', date: '2026-03-18', amount: 320,  category: 'freelance',     type: 'income',  description: 'Logo design project — client C' },
  { id: 'txn-027', date: '2026-03-22', amount: 180,  category: 'education',     type: 'expense', description: 'Technical book bundle' },
  { id: 'txn-028', date: '2026-03-28', amount: 42,   category: 'other',         type: 'expense', description: 'Office supplies' },
];
