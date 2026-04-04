import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ArrowLeftRight } from 'lucide-react'

interface SidebarProps {
  onNavigate?: () => void
}

const navItems = [
  { to: '/',             label: 'Dashboard',    Icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', Icon: ArrowLeftRight },
]

export function Sidebar({ onNavigate }: SidebarProps) {
  return (
    <nav className="flex flex-col gap-1 p-4">
      <p className="mb-4 px-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
        Navigation
      </p>
      {navItems.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
            }`
          }
        >
          <Icon size={16} />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
