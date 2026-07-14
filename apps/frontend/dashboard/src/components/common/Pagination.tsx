import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  showingText: string
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showingText,
}: PaginationProps) {
  const { t } = useTranslation()

  // Helper to generate page numbers to display
  const getPages = () => {
    const pages: (number | string)[] = []
    const range = 1 // number of pages to show around current page

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - range && i <= currentPage + range)
      ) {
        pages.push(i)
      } else if (
        pages[pages.length - 1] !== '...'
      ) {
        pages.push('...')
      }
    }
    return pages
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-105 dark:border-slate-800 px-5 py-4 gap-4">
      <span className="text-xs text-gray-400 dark:text-slate-500 font-medium">
        {showingText}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-250 text-gray-400 hover:border-brand-orange hover:text-brand-orange disabled:opacity-50 disabled:hover:border-gray-250 disabled:hover:text-gray-400 transition dark:border-slate-700"
        >
          <ChevronLeft size={13} />
        </button>

        {getPages().map((page, idx) => {
          if (page === '...') {
            return (
              <span key={`dots-${idx}`} className="px-1 text-gray-400">
                ...
              </span>
            )
          }

          const isCurrent = page === currentPage
          return (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition ${
                isCurrent
                  ? 'bg-brand-orange text-white shadow-sm'
                  : 'border border-gray-250 text-gray-500 hover:border-brand-orange hover:text-brand-orange dark:border-slate-700 dark:text-slate-400'
              }`}
            >
              {page}
            </button>
          )
        })}

        <button
          onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-250 text-gray-400 hover:border-brand-orange hover:text-brand-orange disabled:opacity-50 disabled:hover:border-gray-250 disabled:hover:text-gray-400 transition dark:border-slate-700"
        >
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  )
}
