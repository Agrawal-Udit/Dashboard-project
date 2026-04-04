type BadgeVariant = 'income' | 'expense' | 'default' | string

interface BadgeProps {
  label: string
  variant?: BadgeVariant
  className?: string
}

const variantClasses: Record<string, string> = {
  income:  'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  expense: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  default: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
}

export function Badge({ label, variant = 'default', className = '' }: BadgeProps) {
  const classes = variantClasses[variant] ?? variantClasses.default
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${classes} ${className}`}
    >
      {label}
    </span>
  )
}
