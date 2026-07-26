import { useLocale } from '../contexts/LocaleContext'

interface EmptyStateProps {
  icon?: React.ReactNode
  title?: string
  message?: string
  action?: { label: string; onClick: () => void }
}

const defaultIcon = (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5">
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
    <polyline points="13 2 13 9 20 9"/>
    <line x1="9" y1="13" x2="15" y2="13"/>
    <line x1="12" y1="10" x2="12" y2="16"/>
  </svg>
)

export function EmptyState({ icon = defaultIcon, title, message, action }: EmptyStateProps) {
  const { t } = useLocale()
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3 className="empty-title">{title || t('common.noResults')}</h3>
      {message && <p className="empty-message">{message}</p>}
      {action && (
        <button className="btn btn-primary" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  )
}
