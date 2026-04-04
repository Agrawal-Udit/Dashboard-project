import { describe, it, expect } from 'vitest'
import { calcTotals, groupByCategory, formatChartData } from '../financeUtils'
import { MOCK_TRANSACTIONS } from '../../data/mockData'

describe('calcTotals', () => {
  it('returns {balance:0, income:0, expenses:0} for empty array', () => {
    const result = calcTotals([])
    expect(result).toEqual({ balance: 0, income: 0, expenses: 0 })
  })

  it('balance equals income minus expenses for MOCK_TRANSACTIONS', () => {
    const result = calcTotals(MOCK_TRANSACTIONS)
    expect(result.balance).toBe(result.income - result.expenses)
  })

  it('only counts income transactions for income total', () => {
    const transactions = [
      { id: '1', date: '2026-01-01', amount: 1000, category: 'salary', type: 'income' as const, description: 'Salary' },
      { id: '2', date: '2026-01-02', amount: 200, category: 'food', type: 'expense' as const, description: 'Groceries' },
    ]
    const result = calcTotals(transactions)
    expect(result.income).toBe(1000)
  })

  it('only counts expense transactions for expenses total', () => {
    const transactions = [
      { id: '1', date: '2026-01-01', amount: 1000, category: 'salary', type: 'income' as const, description: 'Salary' },
      { id: '2', date: '2026-01-02', amount: 200, category: 'food', type: 'expense' as const, description: 'Groceries' },
    ]
    const result = calcTotals(transactions)
    expect(result.expenses).toBe(200)
  })
})

describe('groupByCategory', () => {
  it('returns only expense transactions (income entries excluded)', () => {
    const transactions = [
      { id: '1', date: '2026-01-01', amount: 1000, category: 'salary', type: 'income' as const, description: 'Salary' },
      { id: '2', date: '2026-01-02', amount: 200, category: 'food', type: 'expense' as const, description: 'Groceries' },
    ]
    const result = groupByCategory(transactions)
    expect(result.every((item) => item.name !== 'salary')).toBe(true)
  })

  it('every item has name, value, color keys', () => {
    const result = groupByCategory(MOCK_TRANSACTIONS)
    for (const item of result) {
      expect(item).toHaveProperty('name')
      expect(item).toHaveProperty('value')
      expect(item).toHaveProperty('color')
    }
  })

  it('returns [] for empty array', () => {
    expect(groupByCategory([])).toEqual([])
  })
})

describe('formatChartData', () => {
  it('returns [] for empty array', () => {
    expect(formatChartData([])).toEqual([])
  })

  it('every item has date, income, expenses, balance keys', () => {
    const result = formatChartData(MOCK_TRANSACTIONS)
    for (const item of result) {
      expect(item).toHaveProperty('date')
      expect(item).toHaveProperty('income')
      expect(item).toHaveProperty('expenses')
      expect(item).toHaveProperty('balance')
    }
  })

  it('no item has NaN or undefined values', () => {
    const result = formatChartData(MOCK_TRANSACTIONS)
    for (const item of result) {
      expect(typeof item.income).toBe('number')
      expect(typeof item.expenses).toBe('number')
      expect(typeof item.balance).toBe('number')
      expect(isNaN(item.income)).toBe(false)
      expect(isNaN(item.expenses)).toBe(false)
      expect(isNaN(item.balance)).toBe(false)
    }
  })

  it('items are sorted chronologically (earliest date first)', () => {
    const result = formatChartData(MOCK_TRANSACTIONS)
    for (let i = 1; i < result.length; i++) {
      expect(result[i].date >= result[i - 1].date).toBe(true)
    }
  })
})
