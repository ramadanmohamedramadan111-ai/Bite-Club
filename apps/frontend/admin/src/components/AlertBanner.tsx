interface AlertBannerProps {
  variant: 'danger' | 'success' | 'warning' | 'info'
  message: string
  onClose?: () => void
  className?: string
}

const variantStyles: Record<string, React.CSSProperties> = {
  danger: {
    background: 'var(--danger-bg)',
    border: '1px solid var(--danger)',
    color: 'var(--danger)',
  },
  success: {
    background: 'var(--success-bg)',
    border: '1px solid var(--success)',
    color: 'var(--success)',
  },
  warning: {
    background: 'var(--warning-bg)',
    border: '1px solid var(--warning)',
    color: 'var(--warning)',
  },
  info: {
    background: 'var(--info-bg)',
    border: '1px solid var(--info)',
    color: 'var(--info)',
  },
}

export function AlertBanner({ variant, message, onClose, className = '' }: AlertBannerProps) {
  return (
    <div
      className={className}
      style={{
        ...variantStyles[variant],
        padding: '12px',
        borderRadius: 'var(--radius-sm)',
        fontSize: '13px',
        fontWeight: '500',
        marginBottom: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            fontSize: '16px',
            lineHeight: '1',
            padding: '0 0 0 12px',
          }}
        >
          ×
        </button>
      )}
    </div>
  )
}
