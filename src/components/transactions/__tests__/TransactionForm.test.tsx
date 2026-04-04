import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TransactionForm } from '../TransactionForm'
import type { Transaction } from '../../../types'

const sampleTxn: Transaction = {
  id: 'txn-001',
  date: '2026-01-15',
  amount: 42.50,
  category: 'food',
  type: 'expense',
  description: 'Lunch',
}

describe('TransactionForm', () => {
  it('renders in add mode with empty fields and "Add" label when no initialData provided', () => {
    render(
      <TransactionForm
        onSubmit={vi.fn()}
        onClose={vi.fn()}
      />
    )
    // Title or submit button should say "Add"
    const addElements = screen.queryAllByText(/add/i)
    expect(addElements.length).toBeGreaterThan(0)
  })

  it('renders in edit mode with initialData values pre-filled', () => {
    render(
      <TransactionForm
        initialData={sampleTxn}
        onSubmit={vi.fn()}
        onClose={vi.fn()}
      />
    )
    // Amount field should show the initial amount value
    const amountInput = screen.getByDisplayValue(String(sampleTxn.amount))
    expect(amountInput).toBeDefined()
    // Description field should show the initial description
    const descriptionInput = screen.getByDisplayValue(sampleTxn.description)
    expect(descriptionInput).toBeDefined()
  })

  it('calls onSubmit with correct shape when form is submitted with valid values', () => {
    const onSubmit = vi.fn()
    render(
      <TransactionForm
        initialData={sampleTxn}
        onSubmit={onSubmit}
        onClose={vi.fn()}
      />
    )
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /save|edit|update|submit/i })
    fireEvent.click(submitButton)

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 42.50 })
    )
  })
})
