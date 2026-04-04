import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useTransactions } from '../hooks/useTransactions'
import { useAppStore } from '../store/store'
import type { Transaction, TransactionType, Category } from '../types'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { RoleGate } from '../components/auth/RoleGate'
import { TransactionFilters } from '../components/transactions/TransactionFilters'
import { TransactionTable } from '../components/transactions/TransactionTable'
import { TransactionForm } from '../components/transactions/TransactionForm'

export function TransactionsPage() {
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'category'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTxn, setEditingTxn] = useState<Transaction | undefined>(undefined)

  const transactions = useTransactions({ type: typeFilter, category: categoryFilter, search, sortBy, sortOrder })

  const addTransaction = useAppStore((s) => s.addTransaction)
  const editTransaction = useAppStore((s) => s.editTransaction)

  const handleSort = (column: 'date' | 'amount' | 'category') => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
  }

  const handleOpenAdd = () => {
    setEditingTxn(undefined)
    setModalOpen(true)
  }

  const handleOpenEdit = (txn: Transaction) => {
    setEditingTxn(txn)
    setModalOpen(true)
  }

  const handleClose = () => {
    setModalOpen(false)
    setEditingTxn(undefined)
  }

  const handleFormSubmit = (data: Omit<Transaction, 'id'>) => {
    if (editingTxn) {
      editTransaction(editingTxn.id, data)
    } else {
      addTransaction({ id: crypto.randomUUID(), ...data })
    }
    handleClose()
  }

  return (
    <div className="space-y-4">
      {/* Page header row */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Transactions</h1>
        <RoleGate allowedRoles={['Admin']}>
          <Button onClick={handleOpenAdd} className="flex items-center gap-2">
            <Plus size={16} />
            Add Transaction
          </Button>
        </RoleGate>
      </div>

      {/* Filter controls */}
      <TransactionFilters
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        search={search}
        onSearchChange={setSearch}
      />

      {/* Transaction table */}
      <TransactionTable
        transactions={transactions}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        onEdit={handleOpenEdit}
      />

      {/* Add/Edit modal — key remounts form on switch between add/edit */}
      <Modal
        open={modalOpen}
        onClose={handleClose}
        title={editingTxn ? 'Edit Transaction' : 'Add Transaction'}
      >
        <TransactionForm
          key={editingTxn?.id ?? 'new'}
          initialData={editingTxn}
          onSubmit={handleFormSubmit}
          onClose={handleClose}
        />
      </Modal>
    </div>
  )
}
