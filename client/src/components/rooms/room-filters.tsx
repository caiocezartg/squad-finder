import { Search } from 'lucide-react'

interface RoomFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  filter: string
  onFilterChange: (value: string) => void
  sort: string
  onSortChange: (value: string) => void
}

const filters = [
  { value: 'all', label: 'ALL' },
  { value: 'has-space', label: 'HAS SPACE' },
  { value: 'almost-full', label: 'ALMOST FULL' },
]

const sorts = [
  { value: 'newest', label: 'NEWEST' },
  { value: 'oldest', label: 'OLDEST' },
]

export function RoomFilters({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  sort,
  onSortChange,
}: RoomFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by game name..."
          className="input-field pl-10"
        />
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => onFilterChange(f.value)}
            className={`px-4 py-3 rounded-lg text-xs font-medium transition-all flex-1 md:flex-auto ${
              filter === f.value
                ? 'bg-accent/10 text-accent border border-accent/20'
                : 'bg-surface text-muted border border-border hover:border-border-light hover:text-offwhite'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Sort */}
      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value)}
        className="input-field w-auto min-w-[120px]"
      >
        {sorts.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  )
}
