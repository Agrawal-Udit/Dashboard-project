import { motion, useReducedMotion } from "motion/react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { TooltipContentProps } from "recharts";
import type {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import type { CategoryChartPoint } from "../../types";
import { getSurfaceMotion } from "../../utils/motionConfig";
import { EmptyState } from "./EmptyState";

const PIE_COLORS = [
  "var(--chart-color-1)",
  "var(--chart-color-2)",
  "var(--chart-color-3)",
  "var(--chart-color-4)",
  "var(--chart-color-5)",
  "var(--chart-color-6)",
  "var(--chart-color-7)",
  "var(--chart-color-8)",
  "var(--chart-color-9)",
  "var(--chart-color-10)",
  "var(--chart-color-11)",
];

interface Props {
  data: CategoryChartPoint[];
}

function SpendingTooltip(
  props: Partial<TooltipContentProps<ValueType, NameType>>,
) {
  const { active, payload } = props;
  if (!active || !payload || payload.length === 0) return null;

  const entry = payload[0];
  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(entry.value));

  return (
    <div className="rounded-md border border-white/18 bg-zinc-950/90 px-3 py-2 text-zinc-100 shadow-xl backdrop-blur">
      <p className="mb-1 text-xs text-zinc-300">{entry.name}</p>
      <p className="text-sm font-medium">{formatted}</p>
    </div>
  );
}

export function SpendingPieChart({ data }: Props) {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const chartMotion = getSurfaceMotion("chart", shouldReduceMotion);

  if (data.length === 0)
    return <EmptyState message="No spending data to display" />;

  return (
    <motion.div
      className="h-75 w-full"
      initial={chartMotion.initial}
      animate={chartMotion.animate}
      transition={chartMotion.transition}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            isAnimationActive={!shouldReduceMotion}
            cx="50%"
            cy="50%"
            innerRadius="40%"
            outerRadius="70%"
            paddingAngle={2}
            label={(labelProps) => {
              const { name, percent, x, y } = labelProps;

              if (
                typeof percent !== "number" ||
                percent <= 0.05 ||
                typeof x !== "number" ||
                typeof y !== "number"
              ) {
                return null;
              }

              return (
                <text
                  x={x}
                  y={y}
                  fill="var(--recharts-tick-color)"
                  fontSize={12}
                  textAnchor="middle"
                  dominantBaseline="central"
                >
                  {`${String(name ?? "")} ${(percent * 100).toFixed(0)}%`}
                </text>
              );
            }}
            labelLine={false}
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={PIE_COLORS[index % PIE_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<SpendingTooltip />} />
          <Legend
            formatter={(value) => (
              <span className="text-xs text-zinc-200">
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
