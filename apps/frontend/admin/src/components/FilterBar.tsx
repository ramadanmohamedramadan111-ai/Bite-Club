import { useLocale } from '../contexts/LocaleContext'

interface FilterOption {
  label: string
  value: string
}

interface FilterBarProps {
  filters: { label: string; value: string; options: FilterOption[]; onChange: (val: string) => void }[]
  onClear: () => void
}

export function FilterBar({ filters, onClear }: FilterBarProps) {
  const { t } = useLocale()
  const hasFilters = filters.some((f) => f.value !== '')
  return (
    <div className="filter-bar">
      {filters.map((filter, i) => (
        <select
          key={i}
          className="filter-select"
          value={filter.value}
          onChange={(e) => filter.onChange(e.target.value)}
        >
          <option value="">{filter.label}</option>
          {filter.options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ))}
      {hasFilters && (
        <button className="btn btn-outline btn-sm" onClick={onClear}>
          {t('common.clear')}
        </button>
      )}
    </div>
  )
}
