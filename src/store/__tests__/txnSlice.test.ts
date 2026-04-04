import { beforeEach, describe, it, expect } from 'vitest'
import { useAppStore } from '../store'
import type { Transaction } from '../../types'

const TEST_TXN: Transaction = {
  id: 'test-001',
  date: '2026-04-01',
  amount: 500,
  category: 'food',
  type: 'expense',
  description: 'Test transaction',
}

describe('txnSlice — addTransaction', () => {
  beforeEach(() => {
    useAppStore.setState(useAppStore.getInitialState(), true)
  })

  it('appends transaction to state.transactions', () => {
    useAppStore.getState().addTransaction(TEST_TXN)
    const { transactions } = useAppStore.getState()
    expect(transactions.some((t) => t.id === 'test-001')).toBe(true)
  })

  it('does not mutate the existing array reference (immer immutability)', () => {
    const before = useAppStore.getState().transactions
    useAppStore.getState().addTransaction(TEST_TXN)
    const after = useAppStore.getState().transactions
    expect(after).not.toBe(before)
  })
})

describe('txnSlice — editTransaction', () => {
  beforeEach(() => {
    useAppStore.setState(useAppStore.getInitialState(), true)
    useAppStore.getState().addTransaction(TEST_TXN)
  })

  it('updates the matching transaction amount; other fields preserved', () => {
    useAppStore.getState().editTransaction('test-001', { amount: 999 })
    const updated = useAppStore.getState().transactions.find((t) => t.id === 'test-001')
    expect(updated?.amount).toBe(999)
    expect(updated?.description).toBe('Test transaction')
  })

  it('does not change array length for a non-existent id', () => {
    const before = useAppStore.getState().transactions.length
    useAppStore.getState().editTransaction('does-not-exist', { amount: 1 })
    expect(useAppStore.getState().transactions.length).toBe(before)
  })
})

describe('txnSlice — deleteTransaction', () => {
  beforeEach(() => {
    useAppStore.setState(useAppStore.getInitialState(), true)
    useAppStore.getState().addTransaction(TEST_TXN)
  })

  it('removes the matching transaction from state', () => {
    useAppStore.getState().deleteTransaction('test-001')
    expect(useAppStore.getState().transactions.every((t) => t.id !== 'test-001')).toBe(true)
  })

  it('does not change array length for a non-existent id', () => {
    const before = useAppStore.getState().transactions.length
    useAppStore.getState().deleteTransaction('does-not-exist')
    expect(useAppStore.getState().transactions.length).toBe(before)
  })
})
