import { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { TooltipProps } from 'recharts'
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'
import type { ChartDataPoint } from '../../types'
import { EmptyState } from './EmptyState'

interface Props {
  data: ChartDataPoint[]
}

function BalanceTrendTooltip(props: TooltipProps<ValueType, NameType>) {
  const { active, payload, label } = props
  if (!active || !payload || payload.length === 0) return null

  const [year, month] = String(label).split('-')
  const display = new Date(Number(year), Number(month) - 1, 1).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  const value = payload[0]?.value
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(value))

  return (
    <div className="rounded-md border border-gray-200 bg-white px-3 py-2 shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
      <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">{display}</p>
      <p className="text-sm font-medium">{formatted}</p>
    </div>
  )
}

export function BalanceTrendChart({ data }: Props) {
  if (data.length === 0) return <EmptyState message="No transaction data to display" />

  const chartData = useMemo(() => {
    let running = 0
    return data.map((point) => {
      running += point.balance
      return { ...point, cumulativeBalance: running }
    })
  }, [data])

  const yAxisFormatter = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value)

  const xAxisTickFormatter = (value: string) => {
    const [year, month] = String(value).split('-')
    return new Date(Number(year), Number(month) - 1, 1).toLocaleString('en-US', {
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="balanceTrendGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--chart-color-4)" stopOpacity={0.25} />
              <stop offset="95%" stopColor="var(--chart-color-4)" stopOpacity={0} />
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
            tick={{ fill: 'var(--recharts-tick-color)', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={yAxisFormatter}
            tick={{ fill: 'var(--recharts-tick-color)', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={60}
          />
          <Tooltip content={<BalanceTrendTooltip />} />
          <Area
            type="monotone"
            dataKey="cumulativeBalance"
            stroke="var(--chart-color-4)"
            strokeWidth={2}
            fill="url(#balanceTrendGrad)"
            dot={false}
            activeDot={{ r: 4, fill: 'var(--chart-color-4)' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
