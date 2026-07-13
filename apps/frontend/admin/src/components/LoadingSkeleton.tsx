interface LoadingSkeletonProps {
  rows?: number
  columns?: number
  type?: 'table' | 'card' | 'list'
}

export function LoadingSkeleton({ rows = 5, columns = 4, type = 'table' }: LoadingSkeletonProps) {
  if (type === 'card') {
    return (
      <div className="skeleton-grid">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="skeleton-card">
            <div className="skeleton-line skeleton-line-title" />
            <div className="skeleton-line skeleton-line-text" />
            <div className="skeleton-line skeleton-line-text short" />
          </div>
        ))}
      </div>
    )
  }

  if (type === 'list') {
    return (
      <div className="skeleton-list">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="skeleton-list-item">
            <div className="skeleton-avatar" />
            <div className="skeleton-list-content">
              <div className="skeleton-line skeleton-line-title" />
              <div className="skeleton-line skeleton-line-text short" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="skeleton-table">
      <div className="skeleton-header">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="skeleton-line skeleton-line-th" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton-row">
          {Array.from({ length: columns }).map((_, j) => (
            <div key={j} className="skeleton-line skeleton-line-td" />
          ))}
        </div>
      ))}
    </div>
  )
}
