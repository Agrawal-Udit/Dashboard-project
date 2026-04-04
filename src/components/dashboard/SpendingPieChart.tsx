import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { TooltipProps } from 'recharts'
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'
import type { CategoryChartPoint } from '../../types'
import { EmptyState } from './EmptyState'

const PIE_COLORS = [
  'var(--chart-color-1)',
  'var(--chart-color-2)',
  'var(--chart-color-3)',
  'var(--chart-color-4)',
  'var(--chart-color-5)',
  'var(--chart-color-6)',
  'var(--chart-color-7)',
  'var(--chart-color-8)',
  'var(--chart-color-9)',
  'var(--chart-color-10)',
  'var(--chart-color-11)',
]

interface Props {
  data: CategoryChartPoint[]
}

function SpendingTooltip(props: TooltipProps<ValueType, NameType>) {
  const { active, payload } = props
  if (!active || !payload || payload.length === 0) return null

  const entry = payload[0]
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(entry.value))

  return (
    <div className="rounded-md border border-gray-200 bg-white px-3 py-2 shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
      <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">{entry.name}</p>
      <p className="text-sm font-medium">{formatted}</p>
    </div>
  )
}

export function SpendingPieChart({ data }: Props) {
  if (data.length === 0) return <EmptyState message="No spending data to display" />

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius="40%"
            outerRadius="70%"
            paddingAngle={2}
            label={({ name, percent }: { name: string; percent: number }) =>
              percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ''
            }
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
              <span className="text-xs text-gray-700 dark:text-gray-300">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
