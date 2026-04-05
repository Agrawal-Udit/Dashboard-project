import { useMemo } from "react";
import { motion } from "motion/react";
import {
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  Calendar,
  Award,
  Target,
  Zap,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTransactions } from "../hooks/useTransactions";
import { Card } from "../components/ui/Card";
import { staggerContainer, staggerItem } from "../utils/motionConfig";
import type { Transaction } from "../types";

const COLORS = [
  "#6366f1",
  "#4f46e5",
  "#4338ca",
  "#3b82f6",
  "#2563eb",
  "#1d4ed8",
  "#0ea5e9",
  "#0284c7",
  "#06b6d4",
  "#0891b2",
];

function getMonthlyData(transactions: Transaction[]) {
  const monthlyMap = new Map<string, { income: number; expenses: number }>();

  transactions.forEach((t) => {
    const month = t.date.substring(0, 7);
    const current = monthlyMap.get(month) || { income: 0, expenses: 0 };

    if (t.type === "income") {
      current.income += t.amount;
    } else {
      current.expenses += t.amount;
    }

    monthlyMap.set(month, current);
  });

  return Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month: new Date(month + "-01").toLocaleDateString("en-US", {
        month: "short",
      }),
      ...data,
      net: data.income - data.expenses,
    }));
}

function getCategoryTotals(transactions: Transaction[]) {
  const categoryMap = new Map<string, number>();

  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      const current = categoryMap.get(t.category) || 0;
      categoryMap.set(t.category, current + t.amount);
    });

  return Array.from(categoryMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

function getAchievements(transactions: Transaction[]) {
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const achievements = [];

  if (totalIncome > totalExpenses) {
    achievements.push({
      icon: Award,
      title: "Budget Master",
      description: "Income exceeds expenses!",
      color: "text-indigo-600 dark:text-indigo-300",
      bg: "bg-indigo-100 dark:bg-indigo-900/40",
    });
  }

  if (transactions.length >= 20) {
    achievements.push({
      icon: Target,
      title: "Consistent Tracker",
      description: "20+ transactions logged",
      color: "text-indigo-600 dark:text-indigo-300",
      bg: "bg-indigo-100 dark:bg-indigo-900/40",
    });
  }

  if (totalIncome >= 10000) {
    achievements.push({
      icon: Zap,
      title: "High Earner",
      description: "Earned ₹10,000+",
      color: "text-indigo-600 dark:text-indigo-300",
      bg: "bg-indigo-100 dark:bg-indigo-900/40",
    });
  }

  return achievements;
}

export function InsightsPage() {
  const transactions = useTransactions();

  const monthlyData = useMemo(
    () => getMonthlyData(transactions),
    [transactions],
  );
  const categoryData = useMemo(
    () => getCategoryTotals(transactions),
    [transactions],
  );
  const achievements = useMemo(
    () => getAchievements(transactions),
    [transactions],
  );

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const savingsRate =
    totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  const inrFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  });

  return (
    <motion.div
      className="space-y-8"
      initial="hidden"
      animate="show"
      variants={staggerContainer}
    >
      {/* Page header */}
      <motion.div variants={staggerItem}>
        <div className="flex items-center gap-3">
          <div className="finrise-accent-gradient rounded-xl p-3 shadow-lg">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
              Financial Insights
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Deep dive into your spending patterns and trends
            </p>
          </div>
        </div>
      </motion.div>

      {/* Quick stats row */}
      <motion.div
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
        variants={staggerItem}
      >
        <Card variant="gradient" className="text-center">
          <div className="mb-2 inline-flex rounded-lg bg-indigo-100 p-2 dark:bg-indigo-900/50">
            <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {inrFormatter.format(totalIncome)}
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Total Income
          </p>
        </Card>

        <Card variant="gradient" className="text-center">
          <div className="mb-2 inline-flex rounded-lg bg-indigo-100 p-2 dark:bg-indigo-900/50">
            <TrendingDown className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {inrFormatter.format(totalExpenses)}
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Total Expenses
          </p>
        </Card>

        <Card variant="gradient" className="text-center">
          <div className="mb-2 inline-flex rounded-lg bg-indigo-100 p-2 dark:bg-indigo-900/50">
            <PieChart className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {savingsRate.toFixed(1)}%
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Savings Rate
          </p>
        </Card>

        <Card variant="gradient" className="text-center">
          <div className="mb-2 inline-flex rounded-lg bg-indigo-100 p-2 dark:bg-indigo-900/50">
            <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {transactions.length}
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Transactions
          </p>
        </Card>
      </motion.div>

      {/* Monthly comparison chart */}
      <motion.div variants={staggerItem}>
        <Card variant="glass">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Monthly Income vs Expenses
            </h2>
            <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
              Trend Analysis
            </span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--recharts-grid-color)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "var(--recharts-tick-color)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "var(--recharts-tick-color)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) =>
                    new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "INR",
                      notation: "compact",
                    }).format(value)
                  }
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--glass-bg)",
                    border: "1px solid var(--glass-border)",
                    borderRadius: "12px",
                    backdropFilter: "blur(12px)",
                  }}
                  formatter={(value) => inrFormatter.format(Number(value ?? 0))}
                />
                <Bar
                  dataKey="income"
                  name="Income"
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="expenses"
                  name="Expenses"
                  fill="#06b6d4"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>

      {/* Category breakdown & Achievements */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Category breakdown */}
        <motion.div variants={staggerItem}>
          <Card variant="glass">
            <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-200">
              Spending by Category
            </h2>
            <div className="space-y-3">
              {categoryData.slice(0, 6).map((cat, index) => (
                <motion.div
                  key={cat.name}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div className="flex-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium capitalize text-gray-700 dark:text-gray-300">
                        {cat.name}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {inrFormatter.format(cat.value)}
                      </span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(cat.value / (categoryData[0]?.value || 1)) * 100}%`,
                        }}
                        transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Achievements */}
        <motion.div variants={staggerItem}>
          <Card variant="glass">
            <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-200">
              Achievements
            </h2>
            {achievements.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Keep tracking to unlock achievements!
              </p>
            ) : (
              <div className="space-y-3">
                {achievements.map((achievement, index) => {
                  const Icon = achievement.icon;
                  return (
                    <motion.div
                      key={achievement.title}
                      className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 dark:bg-gray-800/50"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.15 }}
                    >
                      <div className={`rounded-lg p-2 ${achievement.bg}`}>
                        <Icon className={`h-5 w-5 ${achievement.color}`} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {achievement.title}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {achievement.description}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
