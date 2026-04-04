// src/hooks/useTransactions.ts
import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useAppStore } from '../store/store'
import type { Transaction, TransactionType, Category } from '../types'

export interface TransactionFilters {
  type?: TransactionType | 'all'
  category?: Category | 'all'
  search?: string
  sortBy?: 'date' | 'amount' | 'category'
  sortOrder?: 'asc' | 'desc'
}

export function useTransactions(filters: TransactionFilters = {}): Transaction[] {
  // useShallow prevents max-update-depth crash in Zustand v5 + React 19 when selecting arrays
  const transactions = useAppStore(useShallow((state) => state.transactions))

  return useMemo(() => {
    let result = [...transactions]

    if (filters.type && filters.type !== 'all') {
      result = result.filter((t) => t.type === filters.type)
    }
    if (filters.category && filters.category !== 'all') {
      result = result.filter((t) => t.category === filters.category)
    }
    if (filters.search) {
      const q = filters.search.toLowerCase()
      result = result.filter((t) => t.description.toLowerCase().includes(q))
    }

    const { sortBy = 'date', sortOrder = 'desc' } = filters
    result.sort((a, b) => {
      let cmp = 0
      if (sortBy === 'date') cmp = a.date.localeCompare(b.date)
      else if (sortBy === 'amount') cmp = a.amount - b.amount
      else if (sortBy === 'category') cmp = a.category.localeCompare(b.category)
      return sortOrder === 'asc' ? cmp : -cmp
    })

    return result
  }, [transactions, filters.type, filters.category, filters.search, filters.sortBy, filters.sortOrder])
}
