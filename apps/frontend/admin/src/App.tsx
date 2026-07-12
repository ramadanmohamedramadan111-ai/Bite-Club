import { useState } from 'react'
import './App.css'

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
type NavItemId =
  | 'dashboard'
  | 'users'
  | 'orders'
  | 'menu'
  | 'analytics'
  | 'settings'

interface NavItem {
  id: NavItemId
  label: string
  icon: string
  badge?: number
}

interface Order {
  id: string
  customer: string
  items: string
  total: string
  status: 'Delivered' | 'Pending' | 'Cancelled' | 'Processing'
  time: string
}

interface StatCard {
  label: string
  value: string
  change: string
  direction: 'up' | 'down'
  icon: string
  iconBg: string
}

interface ActivityItem {
  id: number
  text: string
  user: string
  time: string
  dotColor: string
}

/* ─────────────────────────────────────────────
   Static Data
───────────────────────────────────────────── */
const NAV_MAIN: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard',  icon: '⊞'  },
  { id: 'orders',    label: 'Orders',     icon: '🧾', badge: 12 },
  { id: 'menu',      label: 'Menu',       icon: '🍽️' },
  { id: 'users',     label: 'Users',      icon: '👥' },
  { id: 'analytics', label: 'Analytics',  icon: '📊' },
]

const NAV_SYSTEM: NavItem[] = [
  { id: 'settings', label: 'Settings', icon: '⚙️' },
]

const STATS: StatCard[] = [
  {
    label: 'Total Revenue',
    value: '$48,295',
    change: '+12.5%',
    direction: 'up',
    icon: '💰',
    iconBg: 'var(--success-bg)',
  },
  {
    label: 'Total Orders',
    value: '3,842',
    change: '+8.3%',
    direction: 'up',
    icon: '🧾',
    iconBg: 'var(--info-bg)',
  },
  {
    label: 'Active Users',
    value: '1,204',
    change: '+5.1%',
    direction: 'up',
    icon: '👥',
    iconBg: 'rgba(139,91,246,0.15)',
  },
  {
    label: 'Cancelled',
    value: '47',
    change: '-2.4%',
    direction: 'down',
    icon: '❌',
    iconBg: 'var(--danger-bg)',
  },
]

const ORDERS: Order[] = [
  { id: '#BC-9841', customer: 'Ahmed Ramadan',    items: 'Burger + Fries',        total: '$24.50', status: 'Delivered',  time: '2 min ago'  },
  { id: '#BC-9840', customer: 'Sara El-Sayed',    items: 'Grilled Chicken Wrap',  total: '$18.00', status: 'Processing', time: '8 min ago'  },
  { id: '#BC-9839', customer: 'Omar Farouk',      items: 'Pizza Margherita x2',   total: '$32.00', status: 'Pending',    time: '15 min ago' },
  { id: '#BC-9838', customer: 'Nada Hassan',      items: 'Caesar Salad + Juice',  total: '$14.75', status: 'Delivered',  time: '22 min ago' },
  { id: '#BC-9837', customer: 'Khaled Ibrahim',   items: 'Steak Plate',           total: '$45.00', status: 'Cancelled',  time: '35 min ago' },
  { id: '#BC-9836', customer: 'Mona Sherif',      items: 'Sushi Platter',         total: '$52.00', status: 'Delivered',  time: '1 hr ago'   },
  { id: '#BC-9835', customer: 'Yousef Mahmoud',   items: 'Vegan Bowl + Smoothie', total: '$20.00', status: 'Processing', time: '1 hr ago'   },
]

const ACTIVITY: ActivityItem[] = [
  { id: 1, text: 'New order placed by',     user: 'Ahmed Ramadan',   time: '2 min ago',  dotColor: 'var(--success)' },
  { id: 2, text: 'Order cancelled by',      user: 'Khaled Ibrahim',  time: '35 min ago', dotColor: 'var(--danger)'  },
  { id: 3, text: 'New user registered:',    user: 'Sara El-Sayed',   time: '1 hr ago',   dotColor: 'var(--info)'    },
  { id: 4, text: 'Menu item updated by',    user: 'Admin',           time: '2 hr ago',   dotColor: 'var(--warning)' },
  { id: 5, text: 'Payment confirmed for',   user: 'Mona Sherif',     time: '2 hr ago',   dotColor: 'var(--success)' },
  { id: 6, text: 'Support ticket from',     user: 'Omar Farouk',     time: '3 hr ago',   dotColor: 'var(--warning)' },
]

const QUICK_ACTIONS = [
  { icon: '➕', label: 'Add Menu Item' },
  { icon: '👤', label: 'New User'      },
  { icon: '📦', label: 'New Order'     },
  { icon: '📢', label: 'Send Promo'    },
]

const PAGE_TITLES: Record<NavItemId, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard',   subtitle: 'Welcome back, Admin 👋' },
  orders:    { title: 'Orders',      subtitle: 'Manage and track all orders' },
  menu:      { title: 'Menu',        subtitle: 'Manage your restaurant menu' },
  users:     { title: 'Users',       subtitle: 'View and manage user accounts' },
  analytics: { title: 'Analytics',   subtitle: 'Performance insights & reports' },
  settings:  { title: 'Settings',    subtitle: 'Configure your admin preferences' },
}

/* ─────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────── */
function StatusBadge({ status }: { status: Order['status'] }) {
  const map: Record<Order['status'], string> = {
    Delivered:  'badge badge-success',
    Processing: 'badge badge-info',
    Pending:    'badge badge-warning',
    Cancelled:  'badge badge-danger',
  }
  return <span className={map[status]}>{status}</span>
}

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
function App() {
  const [activeNav, setActiveNav] = useState<NavItemId>('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const { title, subtitle } = PAGE_TITLES[activeNav]

  return (
    <div className="admin-shell">
      {/* ─── Sidebar ─── */}
      <aside className={`sidebar${sidebarCollapsed ? ' collapsed' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">🍔</div>
          {!sidebarCollapsed && (
            <div className="sidebar-brand-text">
              <span className="name">Bite-Club</span>
              <span className="label">Admin Panel</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav" aria-label="Admin navigation">
          {!sidebarCollapsed && (
            <span className="nav-section-label">Main</span>
          )}
          {NAV_MAIN.map((item) => (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              className={`nav-item${activeNav === item.id ? ' active' : ''}`}
              onClick={() => setActiveNav(item.id)}
              aria-current={activeNav === item.id ? 'page' : undefined}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>
              {!sidebarCollapsed && (
                <>
                  <span className="nav-label">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="nav-badge">{item.badge}</span>
                  )}
                </>
              )}
            </button>
          ))}

          {!sidebarCollapsed && (
            <span className="nav-section-label" style={{ marginTop: '8px' }}>
              System
            </span>
          )}
          {NAV_SYSTEM.map((item) => (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              className={`nav-item${activeNav === item.id ? ' active' : ''}`}
              onClick={() => setActiveNav(item.id)}
              aria-current={activeNav === item.id ? 'page' : undefined}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>
              {!sidebarCollapsed && (
                <span className="nav-label">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Collapse Toggle */}
        <div className="sidebar-footer">
          <button
            id="sidebar-toggle-btn"
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed((c) => !c)}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={sidebarCollapsed ? 'Expand' : 'Collapse'}
          >
            <span className="nav-icon" aria-hidden="true">
              {sidebarCollapsed ? '→' : '←'}
            </span>
            {!sidebarCollapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* ─── Main ─── */}
      <div className={`admin-main${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">{title}</span>
            <span className="topbar-subtitle">{subtitle}</span>
          </div>
          <div className="topbar-right">
            <button id="topbar-search-btn" className="topbar-btn" aria-label="Search" title="Search">
              🔍
            </button>
            <button id="topbar-notifications-btn" className="topbar-btn" aria-label="Notifications" title="Notifications">
              🔔
              <span className="dot" aria-hidden="true" />
            </button>
            <div
              id="admin-avatar"
              className="admin-avatar"
              role="button"
              tabIndex={0}
              aria-label="Admin profile"
              title="Admin profile"
            >
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content">
          {/* ─── Placeholder Pages ─── */}
          <PlaceholderPage nav={activeNav} onBack={() => setActiveNav('dashboard')} />
        </main>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Placeholder Pages
───────────────────────────────────────────── */
function PlaceholderPage({
  nav,
  onBack,
}: {
  nav: NavItemId
  onBack: () => void
}) {
  const { title, subtitle } = PAGE_TITLES[nav]
  const iconMap: Record<NavItemId, string> = {
    dashboard: '⊞',
    orders:    '🧾',
    menu:      '🍽️',
    users:     '👥',
    analytics: '📊',
    settings:  '⚙️',
  }
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        flex: 1,
        padding: '60px 24px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: 'var(--radius)',
          background: 'var(--bg-elevated)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
          border: '1px solid var(--border-subtle)',
        }}
        aria-hidden="true"
      >
        {iconMap[nav]}
      </div>
      <div>
        <h1 style={{ fontSize: '20px', marginBottom: '8px' }}>{title}</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{subtitle}</p>
        <p
          style={{
            fontSize: '13px',
            color: 'var(--text-muted)',
            marginTop: '8px',
          }}
        >
          This section is under construction. Full implementation coming soon.
        </p>
      </div>
      {nav !== 'dashboard' && (
        <button
          id={`back-to-dashboard-from-${nav}`}
          className="btn btn-outline"
          onClick={onBack}
        >
          ← Back to Dashboard
        </button>
      )}
    </div>
  )
}

export default App
