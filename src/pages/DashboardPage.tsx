import { useMemo, type CSSProperties } from "react";
import { motion } from "motion/react";
import {
  CalendarDays,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useSummaryTotals } from "../hooks/useSummaryTotals";
import { useTransactions } from "../hooks/useTransactions";
import { useAppStore } from "../store/store";
import { getCategoryMeta } from "../constants/categories";
import { formatCurrency, formatDate } from "../utils/dateUtils";
import { formatChartData, groupByCategory } from "../utils/financeUtils";
import { KpiCard } from "../components/dashboard/KpiCard";
import { BalanceTrendChart } from "../components/dashboard/BalanceTrendChart";
import { SpendingPieChart } from "../components/dashboard/SpendingPieChart";
import { InsightsPanel } from "../components/dashboard/InsightsPanel";
import { Card } from "../components/ui/Card";
import { staggerContainer, staggerItem } from "../utils/motionConfig";

const dashboardChartVars = {
  "--recharts-tick-color": "#d4d4d8",
  "--recharts-grid-color": "rgba(161, 161, 170, 0.34)",
} as CSSProperties;

export function DashboardPage() {
  const totals = useSummaryTotals();
  const transactions = useTransactions();
  const username = useAppStore((s) => s.username) ?? "Demo User";
  const isEmpty = transactions.length === 0;
  const chartData = useMemo(
    () => formatChartData(transactions),
    [transactions],
  );
  const categoryData = useMemo(
    () => groupByCategory(transactions),
    [transactions],
  );

  const topSpendingCategory = useMemo(
    () => [...categoryData].sort((a, b) => b.value - a.value)[0] ?? null,
    [categoryData],
  );

  const recentTransactions = useMemo(
    () => transactions.slice(0, 6),
    [transactions],
  );

  const currentMonthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        month: "long",
        year: "numeric",
      }).format(new Date()),
    [],
  );

  return (
    <motion.div
      className="finrise-auth-bg finrise-auth-grid relative isolate space-y-6 overflow-hidden rounded-3xl border border-white/12 p-5 sm:p-6 lg:p-7"
      initial="hidden"
      animate="show"
      variants={staggerContainer}
      style={dashboardChartVars}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[-10%] top-[-15%] h-80 w-80 rounded-full bg-indigo-500/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-24%] right-[-12%] h-88 w-88 rounded-full bg-cyan-500/20 blur-3xl"
      />

      <div className="relative z-10 space-y-6">
        <motion.div className="finrise-surface rounded-2xl p-6 sm:p-8" variants={staggerItem}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-zinc-300">
                Overview
              </p>
              <h1 className="mt-1 text-2xl font-semibold text-white sm:text-3xl">
                Dashboard
              </h1>
              <p className="mt-1 text-sm text-zinc-200 sm:text-base">
                Welcome back, {username}. Here is your financial summary.
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-zinc-100">
              <CalendarDays size={14} />
              {currentMonthLabel}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-zinc-100">
              Top spending: {topSpendingCategory ? `${topSpendingCategory.name} (${formatCurrency(topSpendingCategory.value)})` : "No expense data"}
            </span>
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-zinc-100">
              {transactions.length} transactions
            </span>
          </div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          variants={staggerItem}
        >
          <KpiCard
            label="Total Balance"
            value={totals.balance}
            icon={<Wallet size={20} />}
            colorClass="text-indigo-200"
            emptyMessage={isEmpty ? "No transaction data yet" : undefined}
            index={0}
          />
          <KpiCard
            label="Total Income"
            value={totals.income}
            icon={<TrendingUp size={20} />}
            colorClass="text-emerald-200"
            emptyMessage={isEmpty ? "No income data yet" : undefined}
            index={1}
          />
          <KpiCard
            label="Total Expenses"
            value={totals.expenses}
            icon={<TrendingDown size={20} />}
            colorClass="text-rose-200"
            emptyMessage={isEmpty ? "No expense data yet" : undefined}
            index={2}
          />
        </motion.div>

        <motion.div
          className="grid grid-cols-1 gap-6 lg:grid-cols-2"
          variants={staggerItem}
        >
          <Card
            variant="glass"
            className="overflow-hidden border-white/16 bg-white/6 shadow-[0_18px_40px_rgba(2,6,23,0.35)] backdrop-blur-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">Balance Trend</h2>
              <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-xs font-medium text-zinc-100">
                Monthly
              </span>
            </div>
            <BalanceTrendChart data={chartData} />
          </Card>

          <Card
            variant="glass"
            className="overflow-hidden border-white/16 bg-white/6 shadow-[0_18px_40px_rgba(2,6,23,0.35)] backdrop-blur-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">
                Spending by Category
              </h2>
              <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-xs font-medium text-zinc-100">
                All Time
              </span>
            </div>
            <SpendingPieChart data={categoryData} />
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <motion.div variants={staggerItem}>
            <h2 className="mb-4 text-lg font-semibold text-white">Insights</h2>
            <InsightsPanel transactions={transactions} />
          </motion.div>

          <motion.div variants={staggerItem}>
            <Card
              variant="glass"
              className="border-white/16 bg-white/6 shadow-[0_18px_40px_rgba(2,6,23,0.35)] backdrop-blur-xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-white">
                  Recent Transactions
                </h2>
                <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-xs text-zinc-100">
                  Latest {recentTransactions.length}
                </span>
              </div>

              {isEmpty ? (
                <p className="text-sm text-zinc-200">
                  No transactions yet. Add one to get started.
                </p>
              ) : (
                <ul className="space-y-3">
                  {recentTransactions.map((transaction) => {
                    const categoryMeta = getCategoryMeta(transaction.category);
                    const amountLabel = `${transaction.type === "income" ? "+" : "-"}${formatCurrency(transaction.amount)}`;

                    return (
                      <li
                        key={transaction.id}
                        className="flex items-center justify-between rounded-xl border border-white/14 bg-white/5 px-3 py-2.5"
                      >
                        <div>
                          <p className="text-sm font-medium text-white">
                            {transaction.description}
                          </p>
                          <p className="text-xs text-zinc-300">
                            {categoryMeta.label} •{" "}
                            {formatDate(transaction.date, "MMM d, yyyy")}
                          </p>
                        </div>

                        <span
                          className={`text-sm font-semibold ${
                            transaction.type === "income"
                              ? "text-emerald-300"
                              : "text-rose-300"
                          }`}
                        >
                          {amountLabel}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
