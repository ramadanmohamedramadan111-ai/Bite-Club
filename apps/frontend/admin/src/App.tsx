import { useState, useEffect, useCallback } from 'react'
import { useTheme } from './contexts/ThemeContext'
import { useLocale } from './contexts/LocaleContext'
import api from './lib/api'
import { getAuthToken, clearAuth } from './lib/cookies'
import { DashboardPage } from './pages/Dashboard'
import { UsersPage } from './pages/Users'
import { BlockedUsersPage } from './pages/BlockedUsers'
import { RestaurantsPage } from './pages/Restaurants'
import { CategoriesPage } from './pages/Categories'
import { OrdersPage } from './pages/Orders'
import { PaymentsPage } from './pages/Payments'
import { CommissionsPage } from './pages/Commissions'
import { LoyaltyPointsPage } from './pages/LoyaltyPoints'
import { ReferralSystemPage } from './pages/ReferralSystem'
import { BadgesPage } from './pages/Badges'
import { LeaderboardPage } from './pages/Leaderboard'
import { FeedModerationPage } from './pages/FeedModeration'
import { AIMonitoringPage } from './pages/AIMonitoring'
import { ActivityLogsPage } from './pages/ActivityLogs'
import { GeneralSettingsPage } from './pages/GeneralSettings'
import { AdminProfilePage } from './pages/AdminProfile'
import { LoginPage } from './pages/Login'
import './App.css'

type NavItemId =
  | 'dashboard' | 'users' | 'blockedUsers' | 'restaurants' | 'categories'
  | 'orders' | 'payments' | 'commissions' | 'loyalty' | 'referrals'
  | 'badges' | 'leaderboard' | 'feed' | 'aiMonitoring' | 'activityLogs'
  | 'settings' | 'profile'

interface NavItem {
  id: NavItemId
  labelKey: string
  icon: React.ReactNode
  badge?: number
  section: string
}

function Svg({ d, stroke = 1.8 }: { d: string; stroke?: number }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      {d.split('|').map((p, i) => <path key={i} d={p.trim()} />)}
    </svg>
  )
}

const I = {
  bold: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /><line x1="6" y1="4" x2="6" y2="20" /></svg>,
  dashboard: <Svg d="M3 3h7v7H3z|M14 3h7v7h-7z|M3 14h7v7H3z|M14 14h7v7h-7z" />,
  orders: <Svg d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2|M15 2v4H9V2z|M9 13h6|M9 17h6" />,
  users: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><circle cx="17" cy="8" r="3.5"/><path d="M21 19v-1.5a3.5 3.5 0 0 0-3.5-3.5H17"/></svg>,
  ban: <Svg d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z|M4.93 4.93l14.14 14.14" />,
  restaurants: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>,
  categories: <Svg d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z|M2 10h20" />,
  payments: <Svg d="M3 10h18M7 15h1m4 0h1M3 6h18a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />,
  commissions: <Svg d="M12 20l9-16H3z|M6 9l6 6 6-6" />,
  loyalty: <Svg d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />,
  referrals: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  badges: <Svg d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={1.6} />,
  leaderboard: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 6 9 6 9z"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C17 4 18 9 18 9z"/><path d="M4 22h16"/><path d="M10 22V2h4v20"/><circle cx="12" cy="15" r="2" fill="currentColor" opacity="0.3"/></svg>,
  feed: <Svg d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z|M9 10h6|M9 14h6" />,
  aiMonitoring: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="8" width="16" height="12" rx="2"/><path d="M8 4v4M16 4v4"/><circle cx="9" cy="13" r="1" fill="currentColor"/><circle cx="15" cy="13" r="1" fill="currentColor"/><path d="M9 17a3 3 0 0 0 6 0"/></svg>,
  activityLogs: <Svg d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z|M14 2v6h6|M16 13H8|M16 17H8|M10 9H8" />,
  settings: <Svg d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z|M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" stroke={1.6} />,
  profile: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2"/></svg>,
  sun: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M6.34 17.66l-1.41 1.41"/><path d="M19.07 4.93l-1.41 1.41"/></svg>,
  moon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  logout: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',     labelKey: 'dashboard',     icon: I.dashboard,   section: 'main' },
  { id: 'orders',        labelKey: 'orders',        icon: I.orders,      section: 'main' },
  { id: 'users',         labelKey: 'users',         icon: I.users,       section: 'management' },
  { id: 'blockedUsers',  labelKey: 'blockedUsers',  icon: I.ban,         section: 'management' },
  { id: 'restaurants',   labelKey: 'restaurants',   icon: I.restaurants, section: 'management' },
  { id: 'categories',    labelKey: 'categories',    icon: I.categories,  section: 'management' },
  { id: 'payments',      labelKey: 'payments',      icon: I.payments,    section: 'finance' },
  { id: 'commissions',   labelKey: 'commissions',   icon: I.commissions, section: 'finance' },
  { id: 'loyalty',       labelKey: 'loyalty',       icon: I.loyalty,     section: 'engagement' },
  { id: 'referrals',     labelKey: 'referrals',     icon: I.referrals,   section: 'engagement' },
  { id: 'badges',        labelKey: 'badges',        icon: I.badges,      section: 'engagement' },
  { id: 'leaderboard',   labelKey: 'leaderboard',   icon: I.leaderboard, section: 'engagement' },
  { id: 'feed',          labelKey: 'feed',          icon: I.feed,        section: 'moderation' },
  { id: 'aiMonitoring',  labelKey: 'aiMonitoring',  icon: I.aiMonitoring, section: 'moderation' },
  { id: 'activityLogs',  labelKey: 'activityLogs',  icon: I.activityLogs, section: 'moderation' },
  { id: 'settings',      labelKey: 'settings',      icon: I.settings,    section: 'system' },
  { id: 'profile',       labelKey: 'profile',       icon: I.profile,     section: 'system' },
]

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!getAuthToken()
  })
  const [activeNav, setActiveNav] = useState<NavItemId>('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const { t, locale, setLocale, dir } = useLocale()

  const handleLogout = useCallback(async () => {
    try {
      await api.post('/admin/logout')
    } catch {
      // proceed even if API call fails
    }
    clearAuth()
    setIsAuthenticated(false)
  }, [])

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    main: true,
    management: false,
    finance: false,
    engagement: false,
    moderation: false,
    system: false,
  })

  useEffect(() => {
    if (!isAuthenticated) return
    const activeItem = NAV_ITEMS.find(item => item.id === activeNav)
    if (activeItem) {
      setExpandedSections(prev => ({
        ...prev,
        [activeItem.section]: true
      }))
    }
  }, [activeNav, isAuthenticated])

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const groups: Record<string, NavItem[]> = {}
  const sectionOrder = ['main', 'management', 'finance', 'engagement', 'moderation', 'system']
  for (const item of NAV_ITEMS) {
    if (!groups[item.section]) groups[item.section] = []
    groups[item.section].push(item)
  }

  const renderPage = () => {
    switch (activeNav) {
      case 'dashboard': return <DashboardPage />
      case 'users': return <UsersPage />
      case 'blockedUsers': return <BlockedUsersPage />
      case 'restaurants': return <RestaurantsPage />
      case 'categories': return <CategoriesPage />
      case 'orders': return <OrdersPage />
      case 'payments': return <PaymentsPage />
      case 'commissions': return <CommissionsPage />
      case 'loyalty': return <LoyaltyPointsPage />
      case 'referrals': return <ReferralSystemPage />
      case 'badges': return <BadgesPage />
      case 'leaderboard': return <LeaderboardPage />
      case 'feed': return <FeedModerationPage />
      case 'aiMonitoring': return <AIMonitoringPage />
      case 'activityLogs': return <ActivityLogsPage />
      case 'settings': return <GeneralSettingsPage />
      case 'profile': return <AdminProfilePage />
    }
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />
  }

  return (
    <div className={`admin-shell ${dir === 'rtl' ? 'rtl' : ''}`}>
      <aside className={`sidebar${sidebarCollapsed ? ' collapsed' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">{I.bold}</div>
          {!sidebarCollapsed && (
            <div className="sidebar-brand-text">
              <span className="name">BiteClub</span>
            </div>
          )}
        </div>

        <nav className="sidebar-nav" aria-label="Admin navigation">
          {sectionOrder.map((section) => {
            const items = groups[section]
            if (!items) return null
            const isExpanded = expandedSections[section] || sidebarCollapsed
            return (
              <div key={section} className={`nav-section ${isExpanded ? 'expanded' : 'collapsed'}`}>
                {!sidebarCollapsed && (
                  <button
                    className="nav-section-header"
                    onClick={() => toggleSection(section)}
                    aria-expanded={isExpanded}
                  >
                    <span className="nav-section-label">{t(`sections.${section}`)}</span>
                    <span className="nav-section-chevron">{isExpanded ? '▼' : (dir === 'rtl' ? '◄' : '►')}</span>
                  </button>
                )}
                <div className="nav-section-items">
                  {items.map((item) => (
                    <button
                      key={item.id}
                      className={`nav-item${activeNav === item.id ? ' active' : ''}`}
                      onClick={() => setActiveNav(item.id)}
                      aria-current={activeNav === item.id ? 'page' : undefined}
                      title={sidebarCollapsed ? (t as any)(`nav.${item.labelKey}`) : undefined}
                    >
                      <span className="nav-icon" aria-hidden="true">{item.icon}</span>
                      {!sidebarCollapsed && (
                        <>
                          <span className="nav-label">{(t as any)(`nav.${item.labelKey}`)}</span>
                          {item.badge !== undefined && <span className="nav-badge">{item.badge}</span>}
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed((c) => !c)}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <span className="nav-icon" aria-hidden="true">
              {sidebarCollapsed ? I.dashboard : (dir === 'rtl' ? '→' : '←')}
            </span>
            {!sidebarCollapsed && <span>{t('common.close')}</span>}
          </button>
        </div>
      </aside>

      <div className={`admin-main${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
        <header className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">
              {(t as any)(`nav.${NAV_ITEMS.find(i => i.id === activeNav)?.labelKey || 'dashboard'}`)}
            </span>
          </div>
          <div className="topbar-right">
            <button className="topbar-btn locale-btn" onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')} title="Toggle language">
              {locale === 'en' ? 'AR' : 'EN'}
            </button>
            <button className="topbar-btn theme-btn" onClick={toggleTheme} title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
              {theme === 'dark' ? I.sun : I.moon}
            </button>
            <button className="topbar-btn logout-btn" onClick={handleLogout} title={t('common.logout')}>
              {I.logout}
            </button>
            <div
              className="admin-avatar"
              role="button"
              tabIndex={0}
              aria-label="Admin profile"
              title={t('nav.profile')}
              onClick={() => setActiveNav('profile')}
            >
              {I.profile}
            </div>
          </div>
        </header>

        <main className="page-content-area">
          {renderPage()}
        </main>
      </div>
    </div>
  )
}

export default App
