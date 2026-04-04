import { describe, it, expect } from 'vitest'
import { MOCK_TRANSACTIONS } from '../mockData'

describe('MOCK_TRANSACTIONS', () => {
  it('length is between 25 and 30 (inclusive)', () => {
    expect(MOCK_TRANSACTIONS.length).toBeGreaterThanOrEqual(25)
    expect(MOCK_TRANSACTIONS.length).toBeLessThanOrEqual(30)
  })

  it('every transaction has id, date, amount, category, type, description fields', () => {
    for (const tx of MOCK_TRANSACTIONS) {
      expect(tx).toHaveProperty('id')
      expect(tx).toHaveProperty('date')
      expect(tx).toHaveProperty('amount')
      expect(tx).toHaveProperty('category')
      expect(tx).toHaveProperty('type')
      expect(tx).toHaveProperty('description')
    }
  })

  it('every transaction has amount > 0 (no negative amounts)', () => {
    for (const tx of MOCK_TRANSACTIONS) {
      expect(tx.amount).toBeGreaterThan(0)
    }
  })

  it('at least 3 distinct months exist across all transaction dates', () => {
    const months = new Set(MOCK_TRANSACTIONS.map((tx) => tx.date.slice(0, 7)))
    expect(months.size).toBeGreaterThanOrEqual(3)
  })

  it('both income and expense types are present', () => {
    const types = new Set(MOCK_TRANSACTIONS.map((tx) => tx.type))
    expect(types.has('income')).toBe(true)
    expect(types.has('expense')).toBe(true)
  })

  it('at least 3 income transactions exist (salary, freelance, or investment)', () => {
    const incomeTransactions = MOCK_TRANSACTIONS.filter((tx) => tx.type === 'income')
    expect(incomeTransactions.length).toBeGreaterThanOrEqual(3)
  })

  it('all 11 category ids appear at least once', () => {
    const ids = MOCK_TRANSACTIONS.map((tx) => tx.category)
    const requiredCategories = [
      'housing',
      'food',
      'transport',
      'utilities',
      'entertainment',
      'healthcare',
      'education',
      'salary',
      'freelance',
      'investment',
      'other',
    ]
    for (const category of requiredCategories) {
      expect(ids).toContain(category)
    }
  })
})
