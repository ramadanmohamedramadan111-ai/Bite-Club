interface StatCardProps {
  label: string
  value: string
  change?: string
  direction?: 'up' | 'down'
  icon: string
  iconBg?: string
}

export function StatCard({ label, value, change, direction, icon, iconBg }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <span className="stat-card-label">{label}</span>
        <span className="stat-icon" style={iconBg ? { background: iconBg } : undefined}>
          {icon}
        </span>
      </div>
      <div className="stat-value">{value}</div>
      {change && (
        <div className={`stat-change ${direction || 'up'}`}>
          <span>{direction === 'up' ? '↑' : '↓'}</span>
          <span className="stat-change-text">{change}</span>
        </div>
      )}
    </div>
  )
}
