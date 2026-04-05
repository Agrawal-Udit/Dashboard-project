import type { TransactionType, Category } from "../../types";
import { Button } from "../ui/Button";
import { Select } from "../ui/Select";
import { Input } from "../ui/Input";
import { CATEGORIES } from "../../constants/categories";

interface TransactionFiltersProps {
  typeFilter: TransactionType | "all";
  onTypeChange: (type: TransactionType | "all") => void;
  categoryFilter: Category | "all";
  onCategoryChange: (category: Category | "all") => void;
  search: string;
  onSearchChange: (search: string) => void;
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
      <div className="flex w-full flex-wrap gap-1 sm:w-auto">
        {(["all", "income", "expense"] as const).map((t) => (
          <Button
            key={t}
            variant={typeFilter === t ? "primary" : "secondary"}
            onClick={() => onTypeChange(t)}
            className="capitalize"
          >
            {t === "all" ? "All" : t}
          </Button>
        ))}
      </div>

      <Select
        label="Category"
        id="filter-category"
        value={categoryFilter}
        onChange={(e) => onCategoryChange(e.target.value as Category | "all")}
        className="w-full sm:w-auto sm:min-w-40"
      >
        <option value="all">All categories</option>
        {CATEGORIES.map((c) => (
          <option key={c.id} value={c.id}>
            {c.label}
          </option>
        ))}
      </Select>

      <div className="relative w-full min-w-0 sm:flex-1">
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
  );
}
