import { renderHook } from '@testing-library/react'
import { beforeEach, describe, it, expect } from 'vitest'
import { useAppStore } from '../../store/store'
import { useSummaryTotals } from '../useSummaryTotals'
import { MOCK_TRANSACTIONS } from '../../data/mockData'

describe('useSummaryTotals — with MOCK_TRANSACTIONS', () => {
  beforeEach(() => {
    useAppStore.setState(useAppStore.getInitialState(), true)
  })

  it('income is greater than 0', () => {
    const { result } = renderHook(() => useSummaryTotals())
    expect(result.current.income).toBeGreaterThan(0)
  })

  it('expenses is greater than 0', () => {
    const { result } = renderHook(() => useSummaryTotals())
    expect(result.current.expenses).toBeGreaterThan(0)
  })

  it('balance equals income minus expenses', () => {
    const { result } = renderHook(() => useSummaryTotals())
    const { income, expenses, balance } = result.current
    expect(balance).toBeCloseTo(income - expenses, 2)
  })
})

describe('useSummaryTotals — empty store', () => {
  beforeEach(() => {
    // Manually set transactions to empty array
    useAppStore.setState({ transactions: [] }, false)
  })

  it('returns zero totals for empty transactions array', () => {
    const { result } = renderHook(() => useSummaryTotals())
    expect(result.current).toEqual({ income: 0, expenses: 0, balance: 0 })
  })
})

// Suppress unused import warning — MOCK_TRANSACTIONS is used implicitly via
// useAppStore initial state seeded with it in Plan 02-02
void MOCK_TRANSACTIONS
