import { NavLink, useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Settings,
  Lightbulb,
  Wallet,
} from "lucide-react";

interface SidebarProps {
  onNavigate?: () => void;
}

const navItems = [
  { to: "/", label: "Dashboard", Icon: LayoutDashboard },
  { to: "/transactions", label: "Transactions", Icon: ArrowLeftRight },
  { to: "/insights", label: "Insights", Icon: Lightbulb },
  { to: "/settings", label: "Settings", Icon: Settings },
];

export function Sidebar({ onNavigate }: SidebarProps) {
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion() ?? false;

  return (
    <nav className="flex flex-col gap-2 p-4">
      {/* Logo section */}
      <div className="mb-6 flex items-center gap-3 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-100">
          <Wallet className="h-4 w-4 text-white dark:text-zinc-900" />
        </div>
        <div>
          <h1 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Finance
          </h1>
        </div>
      </div>

      <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
        Navigation
      </p>

      <div className="space-y-0.5">
        {navItems.map(({ to, label, Icon }) => {
          const isActive =
            location.pathname === to ||
            (to !== "/" && location.pathname.startsWith(to));

          return (
            <div key={to}>
              <NavLink
                to={to}
                end={to === "/"}
                onClick={onNavigate}
                className="group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
              >
                {/* Active background indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 rounded-lg bg-zinc-100 dark:bg-zinc-800"
                    transition={
                      shouldReduceMotion
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 300, damping: 30 }
                    }
                  />
                )}

                {/* Active side indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeSide"
                    className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r bg-zinc-900 dark:bg-zinc-100"
                    transition={
                      shouldReduceMotion
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 300, damping: 30 }
                    }
                  />
                )}

                <div
                  className={`relative z-10 transition-colors ${
                    isActive
                      ? "text-zinc-900 dark:text-zinc-100"
                      : "text-zinc-500 group-hover:text-zinc-700 dark:text-zinc-400 dark:group-hover:text-zinc-300"
                  }`}
                >
                  <Icon size={18} />
                </div>

                <span
                  className={`relative z-10 transition-colors ${
                    isActive
                      ? "text-zinc-900 dark:text-zinc-100"
                      : "text-zinc-700 group-hover:text-zinc-900 dark:text-zinc-300 dark:group-hover:text-zinc-100"
                  }`}
                >
                  {label}
                </span>

                {/* Hover indicator */}
                {!isActive && (
                  <div className="absolute inset-0 rounded-lg bg-zinc-100 opacity-0 transition-opacity group-hover:opacity-100 dark:bg-zinc-800/50" />
                )}
              </NavLink>
            </div>
          );
        })}
      </div>

      {/* Bottom section */}
      <div className="mt-auto pt-6">
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
            Quick Tip
          </p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Switch to Admin role to add and edit transactions
          </p>
        </div>
      </div>
    </nav>
  );
}
