import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Transaction, TransactionType, Category } from '../../types'
import type { TransactionFormValues, FormErrors } from '../../utils/transactionFormValidation'
import { validateTransactionForm } from '../../utils/transactionFormValidation'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { CATEGORIES } from '../../constants/categories'

interface TransactionFormProps {
  initialData?: Transaction
  onSubmit: (data: Omit<Transaction, 'id'>) => void
  onClose: () => void
}

export function TransactionForm({ initialData, onSubmit, onClose }: TransactionFormProps) {
  const [values, setValues] = useState<TransactionFormValues>(() => ({
    type: initialData?.type ?? '',
    category: initialData?.category ?? '',
    amount: initialData ? String(initialData.amount) : '',
    date: initialData?.date ?? '',
    description: initialData?.description ?? '',
  }))
  const [errors, setErrors] = useState<FormErrors>({})

  const update = (field: keyof TransactionFormValues, value: string) =>
    setValues((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const errs = validateTransactionForm(values)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    onSubmit({
      type: values.type as TransactionType,
      category: values.category as Category,
      amount: parseFloat(values.amount),
      date: values.date,
      description: values.description,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="Type"
        id="txn-type"
        value={values.type}
        onChange={(e) => update('type', e.target.value)}
        error={errors.type}
      >
        <option value="">Select type</option>
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </Select>

      <Select
        label="Category"
        id="txn-category"
        value={values.category}
        onChange={(e) => update('category', e.target.value)}
        error={errors.category}
      >
        <option value="">Select category</option>
        {CATEGORIES.map((c) => (
          <option key={c.id} value={c.id}>{c.label}</option>
        ))}
      </Select>

      <Input
        label="Amount"
        id="txn-amount"
        type="number"
        min="0.01"
        step="0.01"
        value={values.amount}
        onChange={(e) => update('amount', e.target.value)}
        error={errors.amount}
      />

      <Input
        label="Date"
        id="txn-date"
        type="date"
        value={values.date}
        onChange={(e) => update('date', e.target.value)}
        error={errors.date}
      />

      <Input
        label="Description"
        id="txn-description"
        type="text"
        maxLength={100}
        value={values.description}
        onChange={(e) => update('description', e.target.value)}
        error={errors.description}
      />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          {initialData ? 'Save changes' : 'Add transaction'}
        </Button>
      </div>
    </form>
  )
}
