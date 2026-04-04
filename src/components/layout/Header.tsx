import { Sun, Moon, Menu } from 'lucide-react'
import { useAppStore } from '../../store/store'
import type { Role } from '../../store/uiSlice'

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const role = useAppStore((s) => s.role)
  const darkMode = useAppStore((s) => s.darkMode)
  const setRole = useAppStore((s) => s.setRole)
  const setDarkMode = useAppStore((s) => s.setDarkMode)

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-700 dark:bg-gray-900">
      {/* Mobile hamburger */}
      <button
        onClick={onMenuClick}
        aria-label="Open menu"
        className="rounded-md p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 md:hidden"
      >
        <Menu size={20} />
      </button>

      {/* Logo / brand */}
      <span className="hidden text-lg font-semibold text-gray-900 dark:text-gray-100 md:block">
        Finance Dashboard
      </span>

      {/* Right side controls */}
      <div className="ml-auto flex items-center gap-4">
        {/* Role switcher + disclaimer */}
        <div className="flex flex-col items-end gap-0.5">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            aria-label="Switch role"
            className="rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          >
            <option value="Viewer">Viewer</option>
            <option value="Admin">Admin</option>
          </select>
          <span className="text-xs text-yellow-600 dark:text-yellow-400">
            UI simulation — no backend authentication
          </span>
        </div>

        {/* Dark mode toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          className="rounded-md p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  )
}
