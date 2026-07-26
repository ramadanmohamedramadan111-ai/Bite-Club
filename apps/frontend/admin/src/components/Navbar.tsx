import { useTheme } from '../contexts/ThemeContext'
import { useLocale } from '../contexts/LocaleContext'
import { I, type NavItemId } from '../config/navigation'

interface NavbarProps {
  activeNav: NavItemId
  sidebarCollapsed: boolean
  onNavChange: (id: NavItemId) => void
  onLogout: () => void
}

export function Navbar({ onNavChange, onLogout }: NavbarProps) {
  const { theme, toggleTheme } = useTheme()
  const { t, locale, setLocale } = useLocale()

  return (
    <header className="topbar">
      <div className="topbar-left" />
      <div className="topbar-right">
        <button className="topbar-btn locale-btn" onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')} title="Toggle language">
          {locale === 'en' ? 'AR' : 'EN'}
        </button>
        <button className="topbar-btn theme-btn" onClick={toggleTheme} title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
          {theme === 'dark' ? I.sun : I.moon}
        </button>
        <button className="topbar-btn logout-btn" onClick={onLogout} title={t('common.logout')}>
          {I.logout}
        </button>
        <div
          className="admin-avatar"
          role="button"
          tabIndex={0}
          aria-label="Admin profile"
          title={t('nav.profile')}
          onClick={() => onNavChange('profile')}
        >
          {I.profile}
        </div>
      </div>
    </header>
  )
}
