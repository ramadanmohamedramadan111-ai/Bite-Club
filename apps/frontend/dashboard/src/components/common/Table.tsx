import type { ReactNode } from 'react'

export interface Column<T> {
  header: ReactNode
  key: string
  className?: string
  render?: (row: T, index: number) => ReactNode
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (row: T, index: number) => string | number
  onRowClick?: (row: T, index: number) => void
  emptyState?: ReactNode
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  emptyState,
}: TableProps<T>) {
  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 dark:bg-slate-800/70 border-b border-gray-100 dark:border-slate-800">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500 whitespace-nowrap ${
                  col.className || ''
                }`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-5 py-8 text-center text-gray-400 dark:text-slate-500">
                {emptyState || 'No data available'}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={keyExtractor(row, rowIndex)}
                onClick={() => onRowClick && onRowClick(row, rowIndex)}
                className={`transition ${
                  onRowClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/40' : 'hover:bg-gray-50 dark:hover:bg-slate-800/40'
                }`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-5 py-4 text-gray-600 dark:text-slate-350 whitespace-normal ${
                      col.className || ''
                    }`}
                  >
                    {col.render ? col.render(row, rowIndex) : (row as any)[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
