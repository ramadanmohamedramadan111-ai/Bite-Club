import { useLocale } from '../contexts/LocaleContext'

interface SearchBarProps {
  value: string
  onChange: (val: string) => void
  placeholder?: string
}

export function SearchBar({ value, onChange, placeholder }: SearchBarProps) {
  const { t } = useLocale()
  return (
    <div className="search-bar">
      <span className="search-icon">&#x1F50D;</span>
      <input
        type="text"
        className="search-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || t('common.search')}
      />
      {value && (
        <button className="search-clear" onClick={() => onChange('')} aria-label={t('common.clear')}>
          &times;
        </button>
      )}
    </div>
  )
}
