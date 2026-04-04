import type { TransactionType, Category } from '../../types'
import { Button } from '../ui/Button'
import { Select } from '../ui/Select'
import { Input } from '../ui/Input'
import { CATEGORIES } from '../../constants/categories'

interface TransactionFiltersProps {
  typeFilter: TransactionType | 'all'
  onTypeChange: (type: TransactionType | 'all') => void
  categoryFilter: Category | 'all'
  onCategoryChange: (category: Category | 'all') => void
  search: string
  onSearchChange: (search: string) => void
}

export function TransactionFilters({
  typeFilter,
  onTypeChange,
  categoryFilter,
  onCategoryChange,
  search,
  onSearchChange,
}: TransactionFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex gap-1">
        {(['all', 'income', 'expense'] as const).map((t) => (
          <Button
            key={t}
            variant={typeFilter === t ? 'primary' : 'secondary'}
            onClick={() => onTypeChange(t)}
            className="capitalize"
          >
            {t === 'all' ? 'All' : t}
          </Button>
        ))}
      </div>

      <Select
        label="Category"
        id="filter-category"
        value={categoryFilter}
        onChange={(e) => onCategoryChange(e.target.value as Category | 'all')}
        className="min-w-[160px]"
      >
        <option value="all">All categories</option>
        {CATEGORIES.map((c) => (
          <option key={c.id} value={c.id}>{c.label}</option>
        ))}
      </Select>

      <div className="relative flex-1 min-w-[200px]">
        <Input
          label="Search"
          id="filter-search"
          type="text"
          placeholder="Search descriptions..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  )
}
