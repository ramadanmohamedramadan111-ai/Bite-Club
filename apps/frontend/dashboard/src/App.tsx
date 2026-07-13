import { useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import i18next from './i18n'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { useAuthStore } from './store/authStore'

type ThemeMode = 'light' | 'dark'
type LanguageMode = 'en' | 'ar'

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const storedTheme = window.localStorage.getItem('biteclub-theme')
    return storedTheme === 'dark' ? 'dark' : 'light'
  })
  const [language, setLanguage] = useState<LanguageMode>(() => {
    const storedLanguage = window.localStorage.getItem('biteclub-language')
    return storedLanguage === 'ar' ? 'ar' : 'en'
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = language
    window.localStorage.setItem('biteclub-theme', theme)
    window.localStorage.setItem('biteclub-language', language)
    void i18next.changeLanguage(language)
  }, [theme, language])

  const toggleTheme = () => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  const toggleLanguage = () => setLanguage((current) => (current === 'en' ? 'ar' : 'en'))

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      {isAuthenticated ? (
        <DashboardPage theme={theme} toggleTheme={toggleTheme} language={language} toggleLanguage={toggleLanguage} />
      ) : (
        <LoginPage theme={theme} toggleTheme={toggleTheme} language={language} toggleLanguage={toggleLanguage} />
      )}
    </>
  )
}

export default App
