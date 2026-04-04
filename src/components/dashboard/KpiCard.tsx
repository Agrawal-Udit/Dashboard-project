import type { ReactNode } from 'react'
import { Card } from '../ui/Card'

interface KpiCardProps {
  label: string
  value: number
  icon: ReactNode
  colorClass?: string
}

export function KpiCard({ label, value, icon, colorClass = 'text-blue-500' }: KpiCardProps) {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value)

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{formatted}</p>
        </div>
        <div className={`rounded-full p-3 ${colorClass} bg-opacity-10`}>
          {icon}
        </div>
      </div>
    </Card>
  )
}
