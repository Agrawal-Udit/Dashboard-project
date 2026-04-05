import { Sun, Moon, Menu, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { useAppStore } from "../../store/store";
import type { Role } from "../../store/uiSlice";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate();
  const role = useAppStore((s) => s.role);
  const darkMode = useAppStore((s) => s.darkMode);
  const username = useAppStore((s) => s.username);
  const setRole = useAppStore((s) => s.setRole);
  const setDarkMode = useAppStore((s) => s.setDarkMode);
  const logout = useAppStore((s) => s.logout);
  const shouldReduceMotion = useReducedMotion() ?? false;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-950">
      {/* Mobile hamburger */}
      <motion.button
        onClick={onMenuClick}
        aria-label="Open menu"
        className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 md:hidden"
        whileTap={!shouldReduceMotion ? { scale: 0.95 } : undefined}
      >
        <Menu size={20} />
      </motion.button>

      {/* Logo - desktop */}
      <div className="hidden items-center gap-3 md:flex">
        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Finance
        </span>
        {username && (
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            • {username}
          </span>
        )}
      </div>

      {/* Right side controls */}
      <div className="ml-auto flex items-center gap-2">
        {/* Role switcher */}
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          aria-label="Switch role"
          className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:focus:ring-zinc-100"
        >
          <option value="Viewer">Viewer</option>
          <option value="Admin">Admin</option>
        </select>

        <p className="hidden text-xs text-zinc-400 lg:block dark:text-zinc-500">
          UI simulation — no backend authentication
        </p>

        {/* Dark mode toggle */}
        <motion.button
          onClick={() => setDarkMode(!darkMode)}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          whileTap={!shouldReduceMotion ? { scale: 0.95 } : undefined}
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </motion.button>

        {/* Logout button */}
        <motion.button
          onClick={handleLogout}
          aria-label="Logout"
          className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-red-400"
          whileTap={!shouldReduceMotion ? { scale: 0.95 } : undefined}
        >
          <LogOut size={18} />
        </motion.button>
      </div>
    </header>
  );
}
