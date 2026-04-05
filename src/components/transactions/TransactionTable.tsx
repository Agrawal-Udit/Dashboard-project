import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { ChevronUp, ChevronDown, ChevronsUpDown, Pencil } from "lucide-react";
import type { Transaction } from "../../types";
import { getCategoryMeta } from "../../constants/categories";
import { formatDate } from "../../utils/dateUtils";
import { RoleGate } from "../auth/RoleGate";
import { EmptyState } from "../dashboard/EmptyState";

type SortColumn = "date" | "amount" | "category";

interface TransactionTableProps {
  transactions: Transaction[];
  sortBy: SortColumn;
  sortOrder: "asc" | "desc";
  onSort: (column: SortColumn) => void;
  onEdit: (transaction: Transaction) => void;
}

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatInrAmount(amount: number): string {
  return inrFormatter.format(Math.abs(amount));
}

function SortIcon({
  column,
  sortBy,
  sortOrder,
}: {
  column: SortColumn;
  sortBy: SortColumn;
  sortOrder: "asc" | "desc";
}) {
  if (sortBy === column) {
    return sortOrder === "asc" ? (
      <ChevronUp size={14} />
    ) : (
      <ChevronDown size={14} />
    );
  }
  return <ChevronsUpDown size={14} className="text-gray-400" />;
}

export function TransactionTable({
  transactions,
  sortBy,
  sortOrder,
  onSort,
  onEdit,
}: TransactionTableProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;

  if (transactions.length === 0) {
    return <EmptyState message="No transactions match your filters." />;
  }

  const thClass =
    "py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider";
  const tdClass = "py-3 px-4 text-gray-900 dark:text-gray-100";

  return (
    <div className="space-y-3">
      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        <div className="flex flex-wrap gap-2">
          {(["date", "category", "amount"] as const).map((col) => (
            <motion.button
              key={col}
              onClick={() => onSort(col)}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm transition-all hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              whileHover={!shouldReduceMotion ? { scale: 1.02 } : undefined}
              whileTap={!shouldReduceMotion ? { scale: 0.98 } : undefined}
            >
              {col.charAt(0).toUpperCase() + col.slice(1)}
              <SortIcon column={col} sortBy={sortBy} sortOrder={sortOrder} />
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="popLayout">
          {transactions.map((t, index) => {
            const isIncome = t.type === "income";
            const amountClass = isIncome
              ? "text-green-600 dark:text-green-400 font-semibold"
              : "text-red-600 dark:text-red-400 font-semibold";
            const typeClass = isIncome
              ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300"
              : "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300";
            const formattedAmount = formatInrAmount(t.amount);

            return (
              <motion.article
                key={t.id}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                layout
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {t.description}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(t.date, "MMM d, yyyy")}
                      </p>
                    </div>

                    <RoleGate allowedRoles={["Admin"]}>
                      <motion.button
                        onClick={() => onEdit(t)}
                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                        aria-label={`Edit ${t.description}`}
                        whileHover={
                          !shouldReduceMotion ? { scale: 1.1 } : undefined
                        }
                        whileTap={
                          !shouldReduceMotion ? { scale: 0.9 } : undefined
                        }
                      >
                        <Pencil size={14} />
                      </motion.button>
                    </RoleGate>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeClass}`}
                      >
                        {t.type}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {getCategoryMeta(t.category).label}
                      </span>
                    </div>
                    <p className={amountClass}>
                      {isIncome ? "+" : "-"}
                      {formattedAmount}
                    </p>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
              <th className={thClass}>
                <button
                  onClick={() => onSort("date")}
                  className="flex items-center gap-1 font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs transition-colors hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Date
                  <SortIcon
                    column="date"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                  />
                </button>
              </th>
              <th className={thClass}>Description</th>
              <th className={thClass}>
                <button
                  onClick={() => onSort("category")}
                  className="flex items-center gap-1 font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs transition-colors hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Category
                  <SortIcon
                    column="category"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                  />
                </button>
              </th>
              <th className={thClass}>Type</th>
              <th className={thClass}>
                <button
                  onClick={() => onSort("amount")}
                  className="flex items-center gap-1 font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs transition-colors hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Amount
                  <SortIcon
                    column="amount"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                  />
                </button>
              </th>
              <th className={thClass}>Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {transactions.map((t, index) => {
                const isIncome = t.type === "income";
                const amountClass = isIncome
                  ? "text-green-600 dark:text-green-400 font-semibold"
                  : "text-red-600 dark:text-red-400 font-semibold";
                const typeClass = isIncome
                  ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300"
                  : "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300";
                const formattedAmount = formatInrAmount(t.amount);

                return (
                  <motion.tr
                    key={t.id}
                    className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.02, duration: 0.2 }}
                    layout
                  >
                    <td className={tdClass}>
                      {formatDate(t.date, "MMM d, yyyy")}
                    </td>
                    <td className={`${tdClass} max-w-xs truncate`}>
                      {t.description}
                    </td>
                    <td className={tdClass}>
                      <span className="inline-flex items-center rounded-lg bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                        {getCategoryMeta(t.category).label}
                      </span>
                    </td>
                    <td className={tdClass}>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${typeClass}`}
                      >
                        {t.type}
                      </span>
                    </td>
                    <td className={`${tdClass} ${amountClass}`}>
                      {isIncome ? "+" : "-"}
                      {formattedAmount}
                    </td>
                    <td className={tdClass}>
                      <RoleGate allowedRoles={["Admin"]}>
                        <motion.button
                          onClick={() => onEdit(t)}
                          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                          aria-label={`Edit ${t.description}`}
                          whileHover={
                            !shouldReduceMotion ? { scale: 1.1 } : undefined
                          }
                          whileTap={
                            !shouldReduceMotion ? { scale: 0.9 } : undefined
                          }
                        >
                          <Pencil size={14} />
                        </motion.button>
                      </RoleGate>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
