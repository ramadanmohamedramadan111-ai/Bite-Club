import type { ReactNode } from 'react'
import { useLocale } from '../contexts/LocaleContext'

export interface Column<T> {
  key: string
  label: string
  sortable?: boolean
  render?: (item: T) => ReactNode
  width?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  sortKey?: string
  sortDir?: 'asc' | 'desc'
  onSort?: (key: string) => void
  onRowClick?: (item: T) => void
  loading?: boolean
  emptyIcon?: string
  emptyTitle?: string
  emptyMessage?: string
  emptyAction?: { label: string; onClick: () => void }
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  sortKey,
  sortDir,
  onSort,
  onRowClick,
  loading,
  emptyIcon,
  emptyTitle,
  emptyMessage,
  emptyAction,
}: DataTableProps<T>) {
  const { t, dir } = useLocale()

  if (loading) {
    return <div className="skeleton-table">
      <div className="skeleton-header">
        {columns.map((c, i) => <div key={i} className="skeleton-line skeleton-line-th" />)}
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="skeleton-row">
          {columns.map((_, j) => <div key={j} className="skeleton-line skeleton-line-td" />)}
        </div>
      ))}
    </div>
  }

  if (data.length === 0) {
    const defaultSvg = (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5">
        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
        <polyline points="13 2 13 9 20 9"/>
        <line x1="9" y1="13" x2="15" y2="13"/>
        <line x1="12" y1="10" x2="12" y2="16"/>
      </svg>
    )
    return (
      <div className="empty-state">
        <div className="empty-icon">{emptyIcon || defaultSvg}</div>
        <h3 className="empty-title">{emptyTitle || t('common.noResults')}</h3>
        {emptyMessage && <p className="empty-message">{emptyMessage}</p>}
        {emptyAction && <button className="btn btn-primary" onClick={emptyAction.onClick}>{emptyAction.label}</button>}
      </div>
    )
  }

  const sortIndicator = (key: string) => {
    if (sortKey !== key) return <span className="sort-icon"> ↕</span>
    return <span className="sort-icon active">{sortDir === 'asc' ? ' ↑' : ' ↓'}</span>
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={col.width ? { width: col.width } : undefined}
                className={col.sortable ? 'sortable' : ''}
                onClick={() => col.sortable && onSort?.(col.key)}
              >
                {col.label}
                {col.sortable && sortIndicator(col.key)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={item.id}
              onClick={() => onRowClick?.(item)}
              className={onRowClick ? 'clickable' : ''}
            >
              {columns.map((col) => (
                <td key={col.key}>
                  {col.render
                    ? col.render(item)
                    : String((item as any)[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
