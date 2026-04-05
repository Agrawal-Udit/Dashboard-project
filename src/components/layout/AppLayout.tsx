import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion() ?? false;

  return (
    <div className="flex min-h-screen min-w-0 bg-white dark:bg-zinc-950">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 flex-col border-r border-zinc-200 bg-white transition-transform dark:border-zinc-800 dark:bg-zinc-950 md:static md:flex md:translate-x-0 ${
          sidebarOpen
            ? "flex translate-x-0"
            : "-translate-x-full hidden md:flex"
        }`}
      >
        <Sidebar onNavigate={() => setSidebarOpen(false)} />
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 z-30 bg-black/20 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={
              shouldReduceMotion ? { duration: 0 } : { duration: 0.2 }
            }
          />
        )}
      </AnimatePresence>

      {/* Main area */}
      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen((prev) => !prev)} />
        <main className="min-w-0 flex-1 overflow-auto bg-zinc-50 p-6 dark:bg-zinc-900 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
