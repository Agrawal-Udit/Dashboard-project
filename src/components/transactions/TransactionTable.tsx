import { ChevronUp, ChevronDown, ChevronsUpDown, Pencil } from 'lucide-react'
import type { Transaction } from '../../types'
import { getCategoryMeta } from '../../constants/categories'
import { RoleGate } from '../auth/RoleGate'
import { EmptyState } from '../dashboard/EmptyState'

type SortColumn = 'date' | 'amount' | 'category'

interface TransactionTableProps {
  transactions: Transaction[]
  sortBy: SortColumn
  sortOrder: 'asc' | 'desc'
  onSort: (column: SortColumn) => void
  onEdit: (transaction: Transaction) => void
}

function SortIcon({ column, sortBy, sortOrder }: { column: SortColumn; sortBy: SortColumn; sortOrder: 'asc' | 'desc' }) {
  if (sortBy === column) {
    return sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
  }
  return <ChevronsUpDown size={14} className="text-gray-400" />
}

export function TransactionTable({ transactions, sortBy, sortOrder, onSort, onEdit }: TransactionTableProps) {
  if (transactions.length === 0) {
    return <EmptyState message="No transactions match your filters." />
  }

  const thClass = 'py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'
  const tdClass = 'py-3 px-4 text-gray-900 dark:text-gray-100'

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className={thClass}>
              <button
                onClick={() => onSort('date')}
                className="flex items-center gap-1 font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs"
              >
                Date
                <SortIcon column="date" sortBy={sortBy} sortOrder={sortOrder} />
              </button>
            </th>
            <th className={thClass}>Description</th>
            <th className={thClass}>
              <button
                onClick={() => onSort('category')}
                className="flex items-center gap-1 font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs"
              >
                Category
                <SortIcon column="category" sortBy={sortBy} sortOrder={sortOrder} />
              </button>
            </th>
            <th className={thClass}>Type</th>
            <th className={thClass}>
              <button
                onClick={() => onSort('amount')}
                className="flex items-center gap-1 font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs"
              >
                Amount
                <SortIcon column="amount" sortBy={sortBy} sortOrder={sortOrder} />
              </button>
            </th>
            <th className={thClass}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => {
            const isIncome = t.type === 'income'
            const amountClass = isIncome
              ? 'text-green-600 dark:text-green-400 font-medium'
              : 'text-red-600 dark:text-red-400 font-medium'
            const typeClass = isIncome
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
            const formattedAmount = t.amount.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })

            return (
              <tr
                key={t.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800"
              >
                <td className={tdClass}>{t.date}</td>
                <td className={tdClass}>{t.description}</td>
                <td className={tdClass}>{getCategoryMeta(t.category).label}</td>
                <td className={`${tdClass} ${typeClass}`}>{t.type}</td>
                <td className={`${tdClass} ${amountClass}`}>
                  {isIncome ? '' : '-'}${formattedAmount}
                </td>
                <td className={tdClass}>
                  <RoleGate allowedRoles={['Admin']}>
                    <button
                      onClick={() => onEdit(t)}
                      className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                      aria-label={`Edit ${t.description}`}
                    >
                      <Pencil size={14} />
                    </button>
                  </RoleGate>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
