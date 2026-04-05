import { useState } from "react";
import { motion } from "motion/react";
import { Plus, ArrowLeftRight } from "lucide-react";
import { useTransactions } from "../hooks/useTransactions";
import { useAppStore } from "../store/store";
import type { Transaction, TransactionType, Category } from "../types";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { RoleGate } from "../components/auth/RoleGate";
import { TransactionFilters } from "../components/transactions/TransactionFilters";
import { TransactionTable } from "../components/transactions/TransactionTable";
import { TransactionExportActions } from "../components/transactions/TransactionExportActions";
import { TransactionForm } from "../components/transactions/TransactionForm";
import { staggerContainer, staggerItem } from "../utils/motionConfig";

export function TransactionsPage() {
  const [typeFilter, setTypeFilter] = useState<TransactionType | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<Category | "all">("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "amount" | "category">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTxn, setEditingTxn] = useState<Transaction | undefined>(
    undefined,
  );

  const transactions = useTransactions({
    type: typeFilter,
    category: categoryFilter,
    search,
    sortBy,
    sortOrder,
  });

  const addTransaction = useAppStore((s) => s.addTransaction);
  const editTransaction = useAppStore((s) => s.editTransaction);

  const handleSort = (column: "date" | "amount" | "category") => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const handleOpenAdd = () => {
    setEditingTxn(undefined);
    setModalOpen(true);
  };

  const handleOpenEdit = (txn: Transaction) => {
    setEditingTxn(txn);
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setEditingTxn(undefined);
  };

  const handleFormSubmit = (data: Omit<Transaction, "id">) => {
    if (editingTxn) {
      editTransaction(editingTxn.id, data);
    } else {
      addTransaction({ id: crypto.randomUUID(), ...data });
    }
    handleClose();
  };

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="show"
      variants={staggerContainer}
    >
      {/* Page header */}
      <motion.div
        className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
        variants={staggerItem}
      >
        <div className="flex items-center gap-3">
          <div className="finrise-accent-gradient rounded-xl p-3 shadow-lg">
            <ArrowLeftRight className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
              Transactions
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage and track all your financial activities
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <TransactionExportActions visibleTransactions={transactions} />

          <RoleGate allowedRoles={["Admin"]}>
            <Button
              onClick={handleOpenAdd}
              variant="gradient"
              icon={<Plus size={18} />}
            >
              Add Transaction
            </Button>
          </RoleGate>
        </div>
      </motion.div>

      {/* Stats bar */}
      <motion.div className="grid grid-cols-3 gap-4" variants={staggerItem}>
        <div className="finrise-accent-soft rounded-xl p-4">
          <p className="text-sm text-zinc-700 dark:text-zinc-300">Showing</p>
          <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
            {transactions.length}
          </p>
          <p className="text-xs text-zinc-700 dark:text-zinc-300">
            transactions
          </p>
        </div>
        <div className="finrise-accent-soft rounded-xl p-4">
          <p className="text-sm text-zinc-700 dark:text-zinc-300">Income</p>
          <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
            {transactions.filter((t) => t.type === "income").length}
          </p>
          <p className="text-xs text-zinc-700 dark:text-zinc-300">entries</p>
        </div>
        <div className="finrise-accent-soft rounded-xl p-4">
          <p className="text-sm text-zinc-700 dark:text-zinc-300">Expenses</p>
          <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
            {transactions.filter((t) => t.type === "expense").length}
          </p>
          <p className="text-xs text-zinc-700 dark:text-zinc-300">entries</p>
        </div>
      </motion.div>

      {/* Filter controls */}
      <motion.div variants={staggerItem}>
        <TransactionFilters
          typeFilter={typeFilter}
          onTypeChange={setTypeFilter}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          search={search}
          onSearchChange={setSearch}
        />
      </motion.div>

      {/* Transaction table */}
      <motion.div variants={staggerItem}>
        <TransactionTable
          transactions={transactions}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          onEdit={handleOpenEdit}
        />
      </motion.div>

      {/* Add/Edit modal — key remounts form on switch between add/edit */}
      <Modal
        open={modalOpen}
        onClose={handleClose}
        title={editingTxn ? "Edit Transaction" : "Add Transaction"}
      >
        <TransactionForm
          key={editingTxn?.id ?? "new"}
          initialData={editingTxn}
          onSubmit={handleFormSubmit}
          onClose={handleClose}
        />
      </Modal>
    </motion.div>
  );
}
