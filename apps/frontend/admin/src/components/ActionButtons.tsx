
interface Action {
  label: string
  onClick: (e: React.MouseEvent) => void
  variant?: 'outline' | 'primary' | 'danger' | 'success' | 'warning'
  disabled?: boolean
  condition?: boolean
}

interface ActionButtonsProps {
  actions: Action[]
}

export function ActionButtons({ actions }: ActionButtonsProps) {
  const visible = actions.filter((a) => a.condition !== false)
  if (visible.length === 0) return null

  return (
    <div className="action-btns">
      {visible.map((a, i) => (
        <button
          key={i}
          className={`btn btn-sm ${a.variant ? `btn-${a.variant}` : 'btn-outline'}`}
          onClick={(e) => { e.stopPropagation(); a.onClick(e) }}
          disabled={a.disabled}
        >
          {a.label}
        </button>
      ))}
    </div>
  )
}
