import { useLocale } from '../contexts/LocaleContext'

interface EmptyStateProps {
  icon?: string
  title?: string
  message?: string
  action?: { label: string; onClick: () => void }
}

export function EmptyState({ icon = '📭', title, message, action }: EmptyStateProps) {
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
