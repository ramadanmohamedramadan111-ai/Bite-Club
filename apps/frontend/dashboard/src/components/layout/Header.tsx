import { Bell, Globe, LogOut, Moon, Search, SunMedium } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { type ShellProps } from '../../App'
import { useAuthStore } from '../../store/authStore'
import { authService } from '../../lib/authService'

type HeaderProps = ShellProps

export function Header({ theme, toggleTheme, language, toggleLanguage }: HeaderProps) {
  const { t } = useTranslation()
  const { token, logout } = useAuthStore((state) => ({
    token: state.token,
    logout: state.logout,
  }))

  const handleLogout = async () => {
    try {
      if (token) await authService.logout(token)
    } catch {
      // logout locally even if the API call fails
    } finally {
      logout()
      toast.success(t('logout'))
    }
  }

  return (
    <header className="flex items-center gap-4 border-b border-gray-100 bg-white px-6 py-4 dark:border-slate-700 dark:bg-slate-900">
      {/* Search */}
      <div className="flex flex-1 items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-800">
        <Search size={16} className="shrink-0 text-gray-400" />
        <input
          className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400 dark:text-slate-200 dark:placeholder:text-slate-500"
          placeholder={t('searchPlaceholder')}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          title={t('notifications')}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:border-brand-orange hover:text-brand-orange dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
        >
          <Bell size={16} />
        </button>

        <button
          onClick={toggleLanguage}
          title={t('language')}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:border-brand-orange hover:text-brand-orange dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
        >
          <Globe size={16} />
        </button>

        <button
          onClick={toggleTheme}
          title={t('toggleTheme')}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:border-brand-orange hover:text-brand-orange dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
        >
          {theme === 'dark' ? <SunMedium size={16} /> : <Moon size={16} />}
        </button>

        {/* Profile */}
        <div className="flex items-center gap-2.5 rounded-xl bg-white px-3 py-1.5 dark:bg-slate-800">
          <div className="hidden text-left sm:block">
            <p className="text-xs font-semibold leading-none text-gray-800 dark:text-white">{t('profile')}</p>
            <p className="mt-0.5 text-[10px] text-gray-400 dark:text-slate-400">{t('manager')}</p>
          </div>
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-orange text-xs font-bold text-white">
            P
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          title={t('logout')}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:border-red-400 hover:text-red-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  )
}
