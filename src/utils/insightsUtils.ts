import { format, parseISO } from 'date-fns'
import type { Transaction, Category } from '../types'

export interface DashboardInsights {
  highestCategory: { name: string; amount: number } | null
  monthOverMonth: {
    currentMonth: string
    previousMonth: string
    changePercent: number
    currentExpenses: number
    previousExpenses: number
  } | null
  incomeExpenseRatio: number | null
}

export function calcInsights(transactions: Transaction[]): DashboardInsights {
  if (transactions.length === 0) {
    return { highestCategory: null, monthOverMonth: null, incomeExpenseRatio: null }
  }

  const expenses = transactions.filter((t) => t.type === 'expense')

  // Highest spending category
  const categoryTotals = expenses.reduce<Map<Category, number>>((acc, t) => {
    const current = acc.get(t.category) ?? 0
    return new Map(acc).set(t.category, current + t.amount)
  }, new Map())

  const highestCategory =
    categoryTotals.size === 0
      ? null
      : (() => {
          let topCat: Category | null = null
          let topAmount = 0
          for (const [cat, amount] of categoryTotals) {
            if (amount > topAmount) {
              topCat = cat
              topAmount = amount
            }
          }
          return topCat !== null ? { name: topCat, amount: topAmount } : null
        })()

  // Month-over-month
  const monthTotals = expenses.reduce<Map<string, number>>((acc, t) => {
    const key = format(parseISO(t.date), 'yyyy-MM')
    const current = acc.get(key) ?? 0
    return new Map(acc).set(key, current + t.amount)
  }, new Map())

  const sortedMonths = Array.from(monthTotals.keys()).sort()

  const monthOverMonth =
    sortedMonths.length < 2
      ? null
      : (() => {
          const previousMonth = sortedMonths[sortedMonths.length - 2]
          const currentMonth = sortedMonths[sortedMonths.length - 1]
          const previousExpenses = monthTotals.get(previousMonth) ?? 0
          const currentExpenses = monthTotals.get(currentMonth) ?? 0
          const changePercent =
            previousExpenses > 0
              ? ((currentExpenses - previousExpenses) / previousExpenses) * 100
              : 0
          return { currentMonth, previousMonth, changePercent, currentExpenses, previousExpenses }
        })()

  // Income-to-expense ratio
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0)

  const totalExpenses = expenses.reduce((acc, t) => acc + t.amount, 0)

  const incomeExpenseRatio = totalExpenses > 0 ? totalIncome / totalExpenses : null

  return { highestCategory, monthOverMonth, incomeExpenseRatio }
}
