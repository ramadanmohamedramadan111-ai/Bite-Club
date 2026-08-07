import { useLocale } from '../contexts/LocaleContext'
import { NAV_ITEMS, I, type NavItemId } from '../config/navigation'

interface SidebarProps {
  activeNav: NavItemId
  onNavChange: (id: NavItemId) => void
  collapsed: boolean
  onToggleCollapse: () => void
}

export function Sidebar({ activeNav, onNavChange, collapsed, onToggleCollapse }: SidebarProps) {
  const { t, dir } = useLocale()

  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      <div className="sidebar-brand" role="button" tabIndex={0} onClick={() => onNavChange('dashboard')} style={{ cursor: 'pointer' }}>
        <div className="sidebar-brand-icon">
          <img src="/images/logo.png" alt="BiteClub Logo" />
        </div>
        {!collapsed && (
          <div className="sidebar-brand-text">
            <span className="name">BiteClub</span>
          </div>
        )}
      </div>

      <nav className="sidebar-nav" aria-label="Admin navigation">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`nav-item${activeNav === item.id ? ' active' : ''}`}
            onClick={() => onNavChange(item.id)}
            aria-current={activeNav === item.id ? 'page' : undefined}
            title={collapsed ? (t as any)(`nav.${item.labelKey}`) : undefined}
          >
            <span className="nav-icon" aria-hidden="true">{item.icon}</span>
            {!collapsed && (
              <>
                <span className="nav-label">{(t as any)(`nav.${item.labelKey}`)}</span>
                {item.badge !== undefined && <span className="nav-badge">{item.badge}</span>}
              </>
            )}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button
          className="sidebar-toggle"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span className="nav-icon" aria-hidden="true">
            {collapsed ? I.dashboard : (dir === 'rtl' ? '→' : '←')}
          </span>
          {!collapsed && <span>{t('common.close')}</span>}
        </button>
      </div>
    </aside>
  )
}
