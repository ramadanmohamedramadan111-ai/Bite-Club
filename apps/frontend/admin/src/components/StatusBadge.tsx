interface StatusBadgeProps {
  status: string
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  label?: string
}

const variantMap: Record<string, string> = {
  success: 'badge badge-success',
  warning: 'badge badge-warning',
  danger: 'badge badge-danger',
  info: 'badge badge-info',
  neutral: 'badge badge-neutral',
}

const autoVariant: Record<string, string> = {
  active: 'success',
  approved: 'success',
  completed: 'success',
  delivered: 'success',
  verified: 'success',
  success: 'success',
  paid: 'success',
  yes: 'success',
  pending: 'warning',
  processing: 'info',
  suspended: 'warning',
  unverified: 'warning',
  failed: 'danger',
  cancelled: 'danger',
  rejected: 'danger',
  blocked: 'danger',
  refunded: 'info',
  expired: 'neutral',
  'rate limited': 'warning',
  no: 'danger',
}

export function StatusBadge({ status, variant, label }: StatusBadgeProps) {
  const v = variant || autoVariant[status.toLowerCase()] || 'neutral'
  return <span className={variantMap[v]}>{label || status}</span>
}
