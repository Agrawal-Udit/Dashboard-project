// src/hooks/useSummaryTotals.ts
import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useAppStore } from '../store/store'
import { calcTotals } from '../utils/financeUtils'
import type { SummaryTotals } from '../types'

export function useSummaryTotals(): SummaryTotals {
  // useShallow prevents max-update-depth in Zustand v5 + React 19 when selecting arrays
  const transactions = useAppStore(useShallow((state) => state.transactions))
  return useMemo(() => calcTotals(transactions), [transactions])
}
