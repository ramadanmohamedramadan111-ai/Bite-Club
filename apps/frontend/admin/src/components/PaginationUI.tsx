import { useLocale } from '../contexts/LocaleContext'

interface PaginationUIProps {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
}

export function PaginationUI({ currentPage, totalPages, totalItems, pageSize, onPageChange }: PaginationUIProps) {
  const { t, dir } = useLocale()

  if (totalPages <= 1) return null

  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  const pages: (number | string)[] = []
  const delta = 2
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...')
    }
  }

  return (
    <div className="pagination">
      <span className="pagination-info">
        {t('common.showing')} {startItem} {t('common.to')} {endItem} {t('common.of')} {totalItems} {t('common.entries')}
      </span>
      <div className="pagination-buttons">
        <button
          className="pagination-btn"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label={t('common.previous')}
        >
          {dir === 'rtl' ? '›' : '‹'}
        </button>
        {pages.map((p, i) =>
          typeof p === 'number' ? (
            <button
              key={i}
              className={`pagination-btn${p === currentPage ? ' active' : ''}`}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          ) : (
            <span key={i} className="pagination-ellipsis">…</span>
          )
        )}
        <button
          className="pagination-btn"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label={t('common.next')}
        >
          {dir === 'rtl' ? '‹' : '›'}
        </button>
      </div>
    </div>
  )
}
