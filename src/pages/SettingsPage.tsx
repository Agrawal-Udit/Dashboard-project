import { motion } from "motion/react";
import {
  Settings,
  User,
  Palette,
  Download,
  Trash2,
  Moon,
  Sun,
  Database,
  Shield,
} from "lucide-react";
import { useAppStore } from "../store/store";
import { Button } from "../components/ui/Button";
import { RoleGate } from "../components/auth/RoleGate";
import { Card } from "../components/ui/Card";
import { staggerContainer, staggerItem } from "../utils/motionConfig";
import {
  downloadTextFile,
  transactionsToCsv,
  transactionsToJson,
} from "../utils/exportUtils";
import { MOCK_TRANSACTIONS } from "../data/mockData";

export function SettingsPage() {
  const role = useAppStore((s) => s.role);
  const darkMode = useAppStore((s) => s.darkMode);
  const setDarkMode = useAppStore((s) => s.setDarkMode);
  const transactions = useAppStore((s) => s.transactions);
  const resetTransactions = useAppStore((s) => s.resetTransactions);

  const getExportDateSuffix = () => new Date().toISOString().split("T")[0];

  const handleExportJSON = () => {
    downloadTextFile(
      `finance-data-${getExportDateSuffix()}.json`,
      transactionsToJson(transactions),
      "application/json",
    );
  };

  const handleExportCSV = () => {
    downloadTextFile(
      `finance-data-${getExportDateSuffix()}.csv`,
      transactionsToCsv(transactions),
      "text/csv;charset=utf-8",
    );
  };

  const handleResetData = () => {
    if (role !== "Admin") {
      return;
    }

    if (
      window.confirm(
        "Are you sure you want to reset all data to demo transactions? This cannot be undone.",
      )
    ) {
      resetTransactions();
    }
  };

  return (
    <motion.div
      className="mx-auto max-w-4xl space-y-8"
      initial="hidden"
      animate="show"
      variants={staggerContainer}
    >
      {/* Page header */}
      <motion.div variants={staggerItem}>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-gray-600 to-gray-800 p-3 shadow-lg dark:from-gray-500 dark:to-gray-700">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
              Settings
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Customize your dashboard experience
            </p>
          </div>
        </div>
      </motion.div>

      {/* Profile section */}
      <motion.div variants={staggerItem}>
        <Card variant="glass">
          <div className="flex items-start gap-4">
            <div className="finrise-accent-gradient flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg">
              <User className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Demo User
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                demo@financehub.com
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                    role === "Admin"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300"
                      : "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                  }`}
                >
                  <Shield className="h-3 w-3" />
                  {role} Role
                </span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Appearance */}
      <motion.div variants={staggerItem}>
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          <Palette className="h-4 w-4" />
          Appearance
        </h3>
        <Card variant="glass">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Dark Mode
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Toggle between light and dark themes
              </p>
            </div>
            <motion.button
              onClick={() => setDarkMode(!darkMode)}
              className={`relative h-8 w-14 rounded-full transition-colors ${
                darkMode ? "bg-indigo-600" : "bg-gray-300 dark:bg-gray-600"
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="absolute top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md"
                animate={{ left: darkMode ? "calc(100% - 28px)" : "4px" }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                {darkMode ? (
                  <Moon className="h-3 w-3 text-indigo-600" />
                ) : (
                  <Sun className="h-3 w-3 text-amber-500" />
                )}
              </motion.div>
            </motion.button>
          </div>
        </Card>
      </motion.div>

      {/* Data Management */}
      <motion.div variants={staggerItem}>
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          <Database className="h-4 w-4" />
          Data Management
        </h3>
        <Card variant="glass">
          <div className="space-y-4">
            {/* Export options */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Export Data
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Download your transaction data
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleExportJSON}
                  icon={<Download className="h-4 w-4" />}
                >
                  JSON
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleExportCSV}
                  icon={<Download className="h-4 w-4" />}
                >
                  CSV
                </Button>
              </div>
            </div>

            <hr className="border-gray-200 dark:border-gray-700" />

            {/* Data stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl bg-gray-50 p-3 text-center dark:bg-gray-800/50">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {transactions.length}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Transactions
                </p>
              </div>
              <div className="rounded-xl bg-gray-50 p-3 text-center dark:bg-gray-800/50">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {transactions.filter((t) => t.type === "income").length}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Income
                </p>
              </div>
              <div className="rounded-xl bg-gray-50 p-3 text-center dark:bg-gray-800/50">
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {transactions.filter((t) => t.type === "expense").length}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Expenses
                </p>
              </div>
            </div>

            <hr className="border-gray-200 dark:border-gray-700" />

            {/* Reset data */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Reset to Demo Data
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Restore the original {MOCK_TRANSACTIONS.length} demo
                  transactions
                </p>
              </div>

              <RoleGate allowedRoles={["Admin"]}>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleResetData}
                  icon={<Trash2 className="h-4 w-4" />}
                >
                  Reset Data
                </Button>
              </RoleGate>

              {role !== "Admin" && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Admin role required to reset data
                </p>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* About */}
      <motion.div variants={staggerItem}>
        <Card variant="gradient">
          <div className="text-center">
            <div className="finrise-accent-gradient mb-4 inline-flex rounded-2xl p-4 shadow-xl">
              <span className="text-2xl">💰</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              FinanceHub Dashboard
            </h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              Version 1.0.0
            </p>
            <p className="mt-4 text-xs text-zinc-600 dark:text-zinc-400">
              Built with React, TypeScript, Tailwind CSS, and Framer Motion
            </p>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
