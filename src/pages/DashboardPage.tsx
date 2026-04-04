import { useMemo } from 'react'
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react'
import { useSummaryTotals } from '../hooks/useSummaryTotals'
import { useTransactions } from '../hooks/useTransactions'
import { formatChartData, groupByCategory } from '../utils/financeUtils'
import { KpiCard } from '../components/dashboard/KpiCard'
import { BalanceTrendChart } from '../components/dashboard/BalanceTrendChart'
import { SpendingPieChart } from '../components/dashboard/SpendingPieChart'
import { InsightsPanel } from '../components/dashboard/InsightsPanel'
import { Card } from '../components/ui/Card'

export function DashboardPage() {
  const totals = useSummaryTotals()
  const transactions = useTransactions()
  const chartData = useMemo(() => formatChartData(transactions), [transactions])
  const categoryData = useMemo(() => groupByCategory(transactions), [transactions])

  return (
    <div className="space-y-6 p-6">
      {/* Row 1: Page heading */}
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>

      {/* Row 2: KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          label="Total Balance"
          value={totals.balance}
          icon={<Wallet size={20} />}
          colorClass="text-blue-500"
        />
        <KpiCard
          label="Total Income"
          value={totals.income}
          icon={<TrendingUp size={20} />}
          colorClass="text-green-500"
        />
        <KpiCard
          label="Total Expenses"
          value={totals.expenses}
          icon={<TrendingDown size={20} />}
          colorClass="text-red-500"
        />
      </div>

      {/* Row 3: Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
            Balance Trend
          </h2>
          <BalanceTrendChart data={chartData} />
        </Card>
        <Card>
          <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
            Spending by Category
          </h2>
          <SpendingPieChart data={categoryData} />
        </Card>
      </div>

      {/* Row 4: Insights */}
      <div>
        <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Insights</h2>
        <InsightsPanel transactions={transactions} />
      </div>
    </div>
  )
}
