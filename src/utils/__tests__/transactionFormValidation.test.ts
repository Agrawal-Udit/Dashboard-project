import { describe, it, expect } from 'vitest'
import { validateTransactionForm } from '../transactionFormValidation'
import type { TransactionFormValues } from '../transactionFormValidation'

const valid: TransactionFormValues = {
  type: 'income',
  category: 'food',
  amount: '50.00',
  date: '2026-01-15',
  description: 'Lunch',
}

describe('validateTransactionForm', () => {
  it('returns errors for all empty fields', () => {
    const errors = validateTransactionForm({
      type: '',
      category: '',
      amount: '',
      date: '',
      description: '',
    })
    expect(errors).toHaveProperty('type')
    expect(errors).toHaveProperty('category')
    expect(errors).toHaveProperty('amount')
    expect(errors).toHaveProperty('date')
    expect(errors).toHaveProperty('description')
  })

  it('returns errors.amount when amount is "0" (zero)', () => {
    const errors = validateTransactionForm({ ...valid, amount: '0' })
    expect(errors).toHaveProperty('amount')
    expect(errors.amount).toMatch(/positive/i)
  })

  it('returns errors.amount when amount is negative ("-5")', () => {
    const errors = validateTransactionForm({ ...valid, amount: '-5' })
    expect(errors).toHaveProperty('amount')
  })

  it('returns errors.amount when amount is non-numeric ("abc")', () => {
    const errors = validateTransactionForm({ ...valid, amount: 'abc' })
    expect(errors).toHaveProperty('amount')
  })

  it('returns errors.date when date has an invalid month ("2026-13-01")', () => {
    const errors = validateTransactionForm({ ...valid, date: '2026-13-01' })
    expect(errors).toHaveProperty('date')
  })

  it('returns errors.date when date is not a date string ("not-a-date")', () => {
    const errors = validateTransactionForm({ ...valid, date: 'not-a-date' })
    expect(errors).toHaveProperty('date')
  })

  it('returns an empty object for fully valid input', () => {
    const errors = validateTransactionForm(valid)
    expect(errors).toEqual({})
  })

  it('returns errors.description when description is whitespace only', () => {
    const errors = validateTransactionForm({ ...valid, description: '   ' })
    expect(errors).toHaveProperty('description')
  })
})
