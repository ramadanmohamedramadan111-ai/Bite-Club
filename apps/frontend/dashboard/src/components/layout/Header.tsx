import { useRef, useState, useEffect } from 'react'
import { Bell, ChevronDown, Globe, LogOut, Menu, Moon, Search, SunMedium } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { type ShellProps } from '../../App'
import { useAuthStore } from '../../store/authStore'
import { authService } from '../../lib/authService'

type HeaderProps = ShellProps & { onMenuToggle: () => void }

export function Header({ theme, toggleTheme, language, toggleLanguage, onMenuToggle }: HeaderProps) {
  const { t } = useTranslation()
  const token  = useAuthStore((state) => state.token)
  const logout = useAuthStore((state) => state.logout)

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    setDropdownOpen(false)
    try {
      if (token) await authService.logout(token)
    } catch {
      // always logout locally even if API fails
    } finally {
      logout()
      toast.success(t('logout'))
    }
  }

  return (
    <header className="flex items-center gap-3 border-b border-gray-100 bg-white px-4 py-3 sm:px-6 sm:py-4 dark:border-slate-700 dark:bg-slate-900">

      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:border-brand-orange hover:text-brand-orange dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
        aria-label="Toggle sidebar"
      >
        <Menu size={18} />
      </button>

      {/* Search */}
      <div className="flex flex-1 items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-800">
        <Search size={16} className="shrink-0 text-gray-400" />
        <input
          className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400 dark:text-slate-200 dark:placeholder:text-slate-500"
          placeholder={t('searchPlaceholder')}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2">

        <button
          title={t('notifications')}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:border-brand-orange hover:text-brand-orange dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
        >
          <Bell size={16} />
        </button>

        <button
          onClick={toggleLanguage}
          title={t('language')}
          className="hidden sm:flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:border-brand-orange hover:text-brand-orange dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
        >
          <Globe size={16} />
        </button>

        <button
          onClick={toggleTheme}
          title={t('toggleTheme')}
          className="hidden sm:flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:border-brand-orange hover:text-brand-orange dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
        >
          {theme === 'dark' ? <SunMedium size={16} /> : <Moon size={16} />}
        </button>

        {/* Profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-2 py-1.5 sm:px-3 transition hover:border-brand-orange dark:border-slate-700 dark:bg-slate-800"
          >
            <div className="hidden text-left md:block">
              <p className="text-xs font-semibold leading-none text-gray-800 dark:text-white">{t('profile')}</p>
              <p className="mt-0.5 text-[10px] text-gray-400 dark:text-slate-400">{t('manager')}</p>
            </div>
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-orange text-xs font-bold text-white">
              P
            </div>
            <ChevronDown
              size={14}
              className={`hidden sm:block shrink-0 text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <div className="absolute end-0 top-full z-50 mt-2 w-44 rounded-2xl border border-gray-100 bg-white py-1.5 shadow-panel dark:border-slate-700 dark:bg-slate-900">
              <div className="border-b border-gray-100 px-4 pb-2.5 pt-1 dark:border-slate-700">
                <p className="text-xs font-semibold text-gray-800 dark:text-white">{t('profile')}</p>
                <p className="text-[11px] text-gray-400 dark:text-slate-400">{t('manager')}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-50 dark:hover:bg-red-500/10"
              >
                <LogOut size={15} />
                {t('logout')}
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  )
}
