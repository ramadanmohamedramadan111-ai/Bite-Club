import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import i18next from './i18n'
import { LoginPage } from './pages/auth/LoginPage'
import { DashboardPage } from './pages/dashboard/DashboardPage'
import { OrdersPage } from './pages/orders/OrdersPage'
import { OrderTrackingPage } from './pages/orders/OrderTrackingPage'
import { MenuPage } from './pages/menu/MenuPage'
import { CategoriesPage } from './pages/menu/CategoriesPage'
import { CustomersPage } from './pages/customers/CustomersPage'
import { SettingsPage } from './pages/settings/SettingsPage'
import { PromotionsPage } from './pages/promotions/PromotionsPage'
import { ReviewsPage } from './pages/reviews/ReviewsPage'
import { ReportsPage } from './pages/reports/ReportsPage'
import { useAuthStore } from './store/authStore'
import { AppShell } from './components/layout/AppShell'

type ThemeMode = 'light' | 'dark'
type LanguageMode = 'en' | 'ar'

export type ShellProps = {
  theme: ThemeMode
  toggleTheme: () => void
  language: LanguageMode
  toggleLanguage: () => void
}

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [theme, setTheme] = useState<ThemeMode>(() =>
    window.localStorage.getItem('biteclub-theme') === 'dark' ? 'dark' : 'light'
  )
  const [language, setLanguage] = useState<LanguageMode>(() =>
    window.localStorage.getItem('biteclub-language') === 'ar' ? 'ar' : 'en'
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = language
    window.localStorage.setItem('biteclub-theme', theme)
    window.localStorage.setItem('biteclub-language', language)
    void i18next.changeLanguage(language)
  }, [theme, language])

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  const toggleLanguage = () => setLanguage((l) => (l === 'en' ? 'ar' : 'en'))

  const shellProps: ShellProps = { theme, toggleTheme, language, toggleLanguage }

  if (!isAuthenticated) {
    return (
      <>
        <Toaster position="top-right" toastOptions={{ duration: 3050 }} />
        <LoginPage {...shellProps} />
      </>
    )
  }

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <BrowserRouter>
        <AppShell {...shellProps}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/orders"    element={<OrdersPage />}   />
            <Route path="/orders/:id" element={<OrderTrackingPage />} />
            <Route path="/menu"      element={<MenuPage />}     />
            <Route path="/menu/categories" element={<CategoriesPage />} />
            <Route path="/customers" element={<CustomersPage />}/>
            <Route path="/settings"   element={<SettingsPage />} />
            <Route path="/promotions" element={<PromotionsPage />} />
            <Route path="/reviews"    element={<ReviewsPage />} />
            <Route path="/reports"    element={<ReportsPage />} />
            <Route path="*"           element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AppShell>
      </BrowserRouter>
    </>
  )
}

export default App
