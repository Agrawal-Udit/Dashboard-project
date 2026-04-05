import { useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { TooltipContentProps } from "recharts";
import type {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import type { ChartDataPoint } from "../../types";
import { getSurfaceMotion } from "../../utils/motionConfig";
import { EmptyState } from "./EmptyState";

interface Props {
  data: ChartDataPoint[];
}

function BalanceTrendTooltip(
  props: Partial<TooltipContentProps<ValueType, NameType>>,
) {
  const { active, payload, label } = props;
  if (!active || !payload || payload.length === 0) return null;

  const [year, month] = String(label).split("-");
  const display = new Date(Number(year), Number(month) - 1, 1).toLocaleString(
    "en-US",
    {
      month: "long",
      year: "numeric",
    },
  );

  const value = payload[0]?.value;
  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(value));

  return (
    <div className="rounded-md border border-white/18 bg-zinc-950/90 px-3 py-2 text-zinc-100 shadow-xl backdrop-blur">
      <p className="mb-1 text-xs text-zinc-300">{display}</p>
      <p className="text-sm font-medium">{formatted}</p>
    </div>
  );
}

export function BalanceTrendChart({ data }: Props) {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const chartMotion = getSurfaceMotion("chart", shouldReduceMotion);

  const chartData = useMemo(
    () =>
      data.reduce<{
        runningBalance: number;
        points: Array<ChartDataPoint & { cumulativeBalance: number }>;
      }>(
        (acc, point) => {
          const nextBalance = acc.runningBalance + point.balance;

          return {
            runningBalance: nextBalance,
            points: [
              ...acc.points,
              { ...point, cumulativeBalance: nextBalance },
            ],
          };
        },
        { runningBalance: 0, points: [] },
      ).points,
    [data],
  );

  if (chartData.length === 0)
    return <EmptyState message="No transaction data to display" />;

  const yAxisFormatter = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);

  const xAxisTickFormatter = (value: string) => {
    const [year, month] = String(value).split("-");
    return new Date(Number(year), Number(month) - 1, 1).toLocaleString(
      "en-US",
      {
        month: "short",
        year: "numeric",
      },
    );
  };

  return (
    <motion.div
      className="h-75 w-full"
      initial={chartMotion.initial}
      animate={chartMotion.animate}
      transition={chartMotion.transition}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="balanceTrendGrad" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--chart-color-4)"
                stopOpacity={0.25}
              />
              <stop
                offset="95%"
                stopColor="var(--chart-color-4)"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--recharts-grid-color)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tickFormatter={xAxisTickFormatter}
            tick={{ fill: "var(--recharts-tick-color)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={yAxisFormatter}
            tick={{ fill: "var(--recharts-tick-color)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={60}
          />
          <Tooltip content={<BalanceTrendTooltip />} />
          <Area
            type="monotone"
            dataKey="cumulativeBalance"
            isAnimationActive={!shouldReduceMotion}
            stroke="var(--chart-color-4)"
            strokeWidth={2}
            fill="url(#balanceTrendGrad)"
            dot={false}
            activeDot={{ r: 4, fill: "var(--chart-color-4)" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
