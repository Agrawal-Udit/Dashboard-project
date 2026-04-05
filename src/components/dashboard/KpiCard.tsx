import type { ReactNode } from "react";
import { motion } from "motion/react";
import { useAnimatedCurrency } from "../../hooks/useAnimatedCounter";

interface KpiCardProps {
  label: string;
  value: number;
  icon: ReactNode;
  colorClass?: string;
  emptyMessage?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  index?: number;
}

export function KpiCard({
  label,
  value,
  icon,
  colorClass = "text-zinc-100",
  emptyMessage,
  trend,
  index = 0,
}: KpiCardProps) {
  const animatedValue = useAnimatedCurrency(emptyMessage ? 0 : value);

  return (
    <motion.div
      className="group relative overflow-hidden rounded-xl border border-white/16 bg-white/[0.07] p-6 shadow-[0_14px_36px_rgba(2,6,23,0.32)] transition-all hover:border-white/25"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-zinc-200">
            {label}
          </p>
          {emptyMessage ? (
            <p className="text-sm font-medium text-zinc-300">
              {emptyMessage}
            </p>
          ) : (
            <>
              <p className="text-3xl font-semibold text-white">
                {animatedValue}
              </p>
              {trend && (
                <div
                  className={`flex items-center gap-1 text-sm font-medium ${
                    trend.isPositive
                      ? "text-zinc-300"
                      : "text-zinc-300"
                  }`}
                >
                  <span>{trend.isPositive ? "↑" : "↓"}</span>
                  <span>{Math.abs(trend.value)}% from last month</span>
                </div>
              )}
            </>
          )}
        </div>

        <div
          className={`rounded-lg border border-white/18 bg-white/12 p-2.5 ${colorClass}`}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
