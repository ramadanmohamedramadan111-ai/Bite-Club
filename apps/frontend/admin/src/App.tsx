import { useState, useCallback, useEffect } from 'react'
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
import { LeaderboardPage } from './pages/Leaderboard'
import { FeedModerationPage } from './pages/FeedModeration'
import { GeneralSettingsPage } from './pages/GeneralSettings'
import { AdminProfilePage } from './pages/AdminProfile'
import { LoginPage } from './pages/Login'
import { Sidebar } from './components/Sidebar'
import { Navbar } from './components/Navbar'
import { NAV_ITEMS, type NavItemId } from './config/navigation'
import './App.css'

const pageTitles: Record<NavItemId, string> = {
  dashboard: 'Dashboard',
  users: 'Users',
  blockedUsers: 'Blocked Users',
  restaurants: 'Restaurants',
  categories: 'Categories',
  orders: 'Orders',
  payments: 'Payments',
  commissions: 'Commissions',
  leaderboard: 'Leaderboard',
  feed: 'Feed Moderation',
  settings: 'General Settings',
  profile: 'Admin Profile',
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!getAuthToken()
  })
  const [activeNav, setActiveNav] = useState<NavItemId>(() => {
    const path = window.location.pathname.replace('/', '') as NavItemId
    return NAV_ITEMS.some(i => i.id === path) ? path : 'dashboard'
  })
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { dir } = useLocale()

  const handleNavChange = useCallback((id: NavItemId) => {
    setActiveNav(id)
    window.history.pushState({}, '', `/${id}`)
  }, [])

  useEffect(() => {
    document.title = isAuthenticated ? pageTitles[activeNav] : 'Login - Bite-Club Admin'
  }, [activeNav, isAuthenticated])

  useEffect(() => {
    const onPop = () => {
      const path = window.location.pathname.replace('/', '') as NavItemId
      if (NAV_ITEMS.some(i => i.id === path)) setActiveNav(path)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const handleLogin = useCallback(() => {
    setIsAuthenticated(true)
    window.history.replaceState({}, '', '/dashboard')
  }, [])

  const handleLogout = useCallback(async () => {
    try {
      await api.post('/admin/logout')
    } catch {
    }
    clearAuth()
    setIsAuthenticated(false)
    window.history.replaceState({}, '', '/login')
  }, [])

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
      case 'leaderboard': return <LeaderboardPage />
      case 'feed': return <FeedModerationPage />
      case 'settings': return <GeneralSettingsPage />
      case 'profile': return <AdminProfilePage />
    }
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />
  }

  return (
    <div className={`admin-shell ${dir === 'rtl' ? 'rtl' : ''}`}>
      <Sidebar
        activeNav={activeNav}
        onNavChange={handleNavChange}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(c => !c)}
      />

      <div className={`admin-main${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
        <Navbar
          activeNav={activeNav}
          sidebarCollapsed={sidebarCollapsed}
          onNavChange={handleNavChange}
          onLogout={handleLogout}
        />

        <main className="page-content-area">
          {renderPage()}
        </main>
      </div>
    </div>
  )
}

export default App
