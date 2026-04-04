import { renderHook } from '@testing-library/react'
import { beforeEach, describe, it, expect } from 'vitest'
import { useAppStore } from '../../store/store'
import { useTransactions } from '../useTransactions'
import { MOCK_TRANSACTIONS } from '../../data/mockData'

describe('useTransactions — no filters', () => {
  beforeEach(() => {
    useAppStore.setState(useAppStore.getInitialState(), true)
  })

  it('returns all transactions when no filters provided', () => {
    const { result } = renderHook(() => useTransactions())
    expect(result.current.length).toBe(MOCK_TRANSACTIONS.length)
  })

  it('default sort is newest-first (descending by date)', () => {
    const { result } = renderHook(() => useTransactions())
    const dates = result.current.map((t) => t.date)
    const sorted = [...dates].sort((a, b) => b.localeCompare(a))
    expect(dates).toEqual(sorted)
  })
})

describe('useTransactions — type filter', () => {
  beforeEach(() => {
    useAppStore.setState(useAppStore.getInitialState(), true)
  })

  it('filters by type=expense', () => {
    const { result } = renderHook(() => useTransactions({ type: 'expense' }))
    expect(result.current.every((t) => t.type === 'expense')).toBe(true)
    expect(result.current.length).toBeGreaterThan(0)
  })

  it('filters by type=income', () => {
    const { result } = renderHook(() => useTransactions({ type: 'income' }))
    expect(result.current.every((t) => t.type === 'income')).toBe(true)
    expect(result.current.length).toBeGreaterThan(0)
  })

  it('type=all returns all transactions', () => {
    const { result } = renderHook(() => useTransactions({ type: 'all' }))
    expect(result.current.length).toBe(MOCK_TRANSACTIONS.length)
  })
})

describe('useTransactions — category filter', () => {
  beforeEach(() => {
    useAppStore.setState(useAppStore.getInitialState(), true)
  })

  it('filters by category=food', () => {
    const { result } = renderHook(() => useTransactions({ category: 'food' }))
    expect(result.current.every((t) => t.category === 'food')).toBe(true)
    expect(result.current.length).toBeGreaterThan(0)
  })
})

describe('useTransactions — search filter', () => {
  beforeEach(() => {
    useAppStore.setState(useAppStore.getInitialState(), true)
  })

  it('matches description substring case-insensitively', () => {
    // Use the first MOCK_TRANSACTION description and search for a substring
    const firstDesc = MOCK_TRANSACTIONS[0].description
    const searchTerm = firstDesc.slice(0, 4).toLowerCase()
    const { result } = renderHook(() => useTransactions({ search: searchTerm }))
    expect(result.current.every((t) => t.description.toLowerCase().includes(searchTerm))).toBe(true)
  })
})

describe('useTransactions — sort', () => {
  beforeEach(() => {
    useAppStore.setState(useAppStore.getInitialState(), true)
  })

  it('sortBy=amount sortOrder=asc sorts low-to-high', () => {
    const { result } = renderHook(() =>
      useTransactions({ sortBy: 'amount', sortOrder: 'asc' })
    )
    const amounts = result.current.map((t) => t.amount)
    const sorted = [...amounts].sort((a, b) => a - b)
    expect(amounts).toEqual(sorted)
  })

  it('sortBy=amount sortOrder=desc sorts high-to-low', () => {
    const { result } = renderHook(() =>
      useTransactions({ sortBy: 'amount', sortOrder: 'desc' })
    )
    const amounts = result.current.map((t) => t.amount)
    const sorted = [...amounts].sort((a, b) => b - a)
    expect(amounts).toEqual(sorted)
  })
})
