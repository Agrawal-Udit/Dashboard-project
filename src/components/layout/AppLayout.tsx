import { useState } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar: fixed on mobile (slides in), static on md+ */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 flex-col border-r border-gray-200 bg-white transition-transform dark:border-gray-700 dark:bg-gray-900 md:static md:flex md:translate-x-0 ${
          sidebarOpen ? 'flex translate-x-0' : '-translate-x-full hidden md:flex'
        }`}
      >
        <div className="flex h-16 items-center border-b border-gray-200 px-4 dark:border-gray-700">
          <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">Finance</span>
        </div>
        <Sidebar onNavigate={() => setSidebarOpen(false)} />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main area: header + page content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen((prev) => !prev)} />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
