import { useMemo } from 'react'
import { calcInsights } from '../../utils/insightsUtils'
import type { Transaction } from '../../types'
import { Card } from '../ui/Card'

interface InsightsPanelProps {
  transactions: Transaction[]
}

const usdFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

function formatMonthLabel(yyyyMM: string): string {
  const [year, month] = yyyyMM.split('-')
  return new Date(Number(year), Number(month) - 1, 1).toLocaleString('en-US', {
    month: 'short',
    year: 'numeric',
  })
}

export function InsightsPanel({ transactions }: InsightsPanelProps) {
  const insights = useMemo(() => calcInsights(transactions), [transactions])

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {/* Tile 1: Highest Spending Category */}
      <Card>
        <p className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
          Top Spending Category
        </p>
        {insights.highestCategory === null ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">No expense data</p>
        ) : (
          <>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100 capitalize">
              {insights.highestCategory.name}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {usdFormatter.format(insights.highestCategory.amount)}
            </p>
          </>
        )}
      </Card>

      {/* Tile 2: Month-over-Month */}
      <Card>
        <p className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
          Month vs Last Month
        </p>
        {insights.monthOverMonth === null ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">Not enough data for comparison</p>
        ) : (
          <>
            <div className="flex items-baseline gap-1">
              {insights.monthOverMonth.changePercent >= 0 ? (
                <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                  &uarr; {Math.abs(insights.monthOverMonth.changePercent).toFixed(1)}%
                </span>
              ) : (
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                  &darr; {Math.abs(insights.monthOverMonth.changePercent).toFixed(1)}%
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {formatMonthLabel(insights.monthOverMonth.currentMonth)} vs{' '}
              {formatMonthLabel(insights.monthOverMonth.previousMonth)}
            </p>
          </>
        )}
      </Card>

      {/* Tile 3: Income/Expense Ratio */}
      <Card>
        <p className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
          Income vs Expenses
        </p>
        {insights.incomeExpenseRatio === null ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">No expenses to compare</p>
        ) : (
          <>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {insights.incomeExpenseRatio.toFixed(2)}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">earned per $1 spent</p>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              ratio &gt; 1 means income exceeds expenses
            </p>
          </>
        )}
      </Card>
    </div>
  )
}
