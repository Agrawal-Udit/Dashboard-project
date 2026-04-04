import type { TransactionType, Category } from '../types'

export interface TransactionFormValues {
  type: TransactionType | ''
  category: Category | ''
  amount: string      // string from <input type="number">; parse to float on validate
  date: string        // expected: "YYYY-MM-DD"
  description: string
}

export type FormErrors = Partial<Record<keyof TransactionFormValues, string>>

export function validateTransactionForm(values: TransactionFormValues): FormErrors {
  const errors: FormErrors = {}

  if (!values.type) {
    errors.type = 'Type is required'
  }

  if (!values.category) {
    errors.category = 'Category is required'
  }

  const amt = parseFloat(values.amount)
  if (!values.amount || isNaN(amt) || amt <= 0) {
    errors.amount = 'Amount must be a positive number'
  }

  const dateFormatValid = /^\d{4}-\d{2}-\d{2}$/.test(values.date)
  if (!values.date || !dateFormatValid) {
    errors.date = 'Date must be in YYYY-MM-DD format'
  } else {
    // Validate that the date is a real calendar date (e.g. reject month 13)
    const parsed = new Date(values.date)
    if (isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== values.date) {
      errors.date = 'Date must be in YYYY-MM-DD format'
    }
  }

  if (!values.description.trim()) {
    errors.description = 'Description is required'
  }

  return errors
}
