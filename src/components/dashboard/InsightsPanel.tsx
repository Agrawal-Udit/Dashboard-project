import { useMemo } from "react";
import { motion } from "motion/react";
import {
  TrendingUp,
  TrendingDown,
  IndianRupee,
  PieChart,
  Target,
  Sparkles,
} from "lucide-react";
import { calcInsights } from "../../utils/insightsUtils";
import type { Transaction } from "../../types";

interface InsightsPanelProps {
  transactions: Transaction[];
}

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
});

function formatMonthLabel(yyyyMM: string): string {
  const [year, month] = yyyyMM.split("-");
  return new Date(Number(year), Number(month) - 1, 1).toLocaleString("en-US", {
    month: "short",
    year: "numeric",
  });
}

interface InsightCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  index: number;
}

function InsightCard({ title, icon, children, index }: InsightCardProps) {
  return (
    <motion.div
      className="rounded-xl border border-white/16 bg-white/[0.07] p-5 shadow-[0_14px_36px_rgba(2,6,23,0.32)] transition-colors hover:border-white/25"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      <div className="mb-3 flex items-center gap-2.5">
        <div className="rounded-lg border border-white/18 bg-white/12 p-2">
          {icon}
        </div>
        <p className="text-sm font-medium text-zinc-100">{title}</p>
      </div>
      {children}
    </motion.div>
  );
}

export function InsightsPanel({ transactions }: InsightsPanelProps) {
  const insights = useMemo(() => calcInsights(transactions), [transactions]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* Tile 1: Highest Spending Category */}
      <InsightCard
        title="Top Spending Category"
        icon={<PieChart size={18} className="text-indigo-200" />}
        index={0}
      >
        {insights.highestCategory === null ? (
          <p className="text-sm text-zinc-300">No expense data</p>
        ) : (
          <div className="space-y-1">
            <p className="text-2xl font-semibold capitalize text-white">
              {insights.highestCategory.name}
            </p>
            <div className="flex items-center gap-2">
              <IndianRupee size={14} className="text-cyan-200" />
              <span className="text-sm font-medium text-zinc-200">
                {inrFormatter.format(insights.highestCategory.amount)}
              </span>
            </div>
          </div>
        )}
      </InsightCard>

      {/* Tile 2: Month-over-Month */}
      <InsightCard
        title="Monthly Comparison"
        icon={<Target size={18} className="text-indigo-200" />}
        index={1}
      >
        {insights.monthOverMonth === null ? (
          <p className="text-sm text-zinc-300">Not enough data for comparison</p>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {insights.monthOverMonth.changePercent >= 0 ? (
                <>
                  <div className="rounded-lg border border-white/18 bg-white/12 p-1.5">
                    <TrendingUp size={16} className="text-rose-200" />
                  </div>
                  <span className="text-2xl font-semibold text-white">
                    +
                    {Math.abs(insights.monthOverMonth.changePercent).toFixed(1)}
                    %
                  </span>
                </>
              ) : (
                <>
                  <div className="rounded-lg border border-white/18 bg-white/12 p-1.5">
                    <TrendingDown size={16} className="text-emerald-200" />
                  </div>
                  <span className="text-2xl font-semibold text-white">
                    -
                    {Math.abs(insights.monthOverMonth.changePercent).toFixed(1)}
                    %
                  </span>
                </>
              )}
            </div>
            <p className="text-xs text-zinc-300">
              {formatMonthLabel(insights.monthOverMonth.currentMonth)} vs{" "}
              {formatMonthLabel(insights.monthOverMonth.previousMonth)}
            </p>
          </div>
        )}
      </InsightCard>

      {/* Tile 3: Income/Expense Ratio */}
      <InsightCard
        title="Savings Rate"
        icon={<Sparkles size={18} className="text-cyan-200" />}
        index={2}
      >
        {insights.incomeExpenseRatio === null ? (
          <p className="text-sm text-zinc-300">No expenses to compare</p>
        ) : (
          <div className="space-y-2">
            <p className="text-2xl font-semibold text-white">
              {insights.incomeExpenseRatio.toFixed(2)}x
            </p>
            <div className="space-y-1">
              <p className="text-sm text-zinc-200">
                {insights.incomeExpenseRatio >= 1
                  ? "You're saving money"
                  : "Spending exceeds income"}
              </p>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/15">
                <motion.div
                  className="finrise-accent-gradient h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(insights.incomeExpenseRatio * 50, 100)}%`,
                  }}
                  transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>
        )}
      </InsightCard>
    </div>
  );
}
