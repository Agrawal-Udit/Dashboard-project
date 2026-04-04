import { describe, it, expect } from 'vitest'
import { calcInsights } from '../insightsUtils'
import type { Transaction } from '../../types'

function txn(overrides: Partial<Transaction> & { type: Transaction['type'] }): Transaction {
  return {
    id: 'test-1',
    date: '2026-01-15',
    amount: 100,
    category: 'food',
    description: 'test',
    ...overrides,
  }
}

describe('calcInsights', () => {
  it('returns all three fields as null for empty array', () => {
    const result = calcInsights([])
    expect(result.highestCategory).toBeNull()
    expect(result.monthOverMonth).toBeNull()
    expect(result.incomeExpenseRatio).toBeNull()
  })

  it('returns highestCategory null and incomeExpenseRatio null when all transactions are income', () => {
    const transactions = [
      txn({ type: 'income', category: 'salary', amount: 3000 }),
      txn({ type: 'income', category: 'freelance', amount: 500 }),
    ]
    const result = calcInsights(transactions)
    expect(result.highestCategory).toBeNull()
    expect(result.incomeExpenseRatio).toBeNull()
  })

  it('returns monthOverMonth null when there is only a single month of data', () => {
    const transactions = [
      txn({ type: 'expense', category: 'food', amount: 200, date: '2026-01-10' }),
      txn({ type: 'expense', category: 'transport', amount: 100, date: '2026-01-20' }),
    ]
    const result = calcInsights(transactions)
    expect(result.monthOverMonth).toBeNull()
  })

  it('returns changePercent as 0 (not Infinity or NaN) when previousExpenses is 0', () => {
    const transactions = [
      txn({ type: 'income', category: 'salary', amount: 3000, date: '2025-12-01' }),
      txn({ type: 'expense', category: 'food', amount: 200, date: '2026-01-10' }),
    ]
    const result = calcInsights(transactions)
    if (result.monthOverMonth !== null) {
      expect(result.monthOverMonth.changePercent).toBe(0)
    }
  })

  it('returns correct highestCategory name and amount from known expense data', () => {
    const transactions = [
      txn({ type: 'expense', category: 'housing', amount: 1200, date: '2026-01-05' }),
      txn({ type: 'expense', category: 'food', amount: 400, date: '2026-01-10' }),
      txn({ type: 'expense', category: 'food', amount: 150, date: '2026-01-15' }),
      txn({ type: 'expense', category: 'transport', amount: 300, date: '2026-01-20' }),
    ]
    const result = calcInsights(transactions)
    expect(result.highestCategory).not.toBeNull()
    expect(result.highestCategory!.name).toBe('housing')
    expect(result.highestCategory!.amount).toBe(1200)
  })

  it('returns a finite changePercent for two months of expenses', () => {
    const transactions = [
      txn({ type: 'expense', category: 'food', amount: 300, date: '2025-12-10' }),
      txn({ type: 'expense', category: 'food', amount: 450, date: '2026-01-10' }),
    ]
    const result = calcInsights(transactions)
    expect(result.monthOverMonth).not.toBeNull()
    expect(isFinite(result.monthOverMonth!.changePercent)).toBe(true)
    expect(isNaN(result.monthOverMonth!.changePercent)).toBe(false)
  })

  it('returns a finite positive incomeExpenseRatio when expenses > 0', () => {
    const transactions = [
      txn({ type: 'income', category: 'salary', amount: 3000, date: '2026-01-01' }),
      txn({ type: 'expense', category: 'food', amount: 500, date: '2026-01-10' }),
    ]
    const result = calcInsights(transactions)
    expect(result.incomeExpenseRatio).not.toBeNull()
    expect(isFinite(result.incomeExpenseRatio!)).toBe(true)
    expect(isNaN(result.incomeExpenseRatio!)).toBe(false)
    expect(result.incomeExpenseRatio!).toBeGreaterThan(0)
  })
})
