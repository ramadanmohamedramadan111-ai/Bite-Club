import { Bell, Globe, Menu, Moon, Search, SunMedium } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { type ShellProps } from '../../App'

type HeaderProps = ShellProps & { onMenuToggle: () => void }

export function Header({ theme, toggleTheme, language, toggleLanguage, onMenuToggle }: HeaderProps) {
  const { t } = useTranslation()

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

        {/* Profile */}
        <div className="flex items-center gap-2 rounded-xl bg-white px-2 py-1.5 sm:px-3 dark:border-slate-700 dark:bg-slate-800">
          <div className="hidden text-left md:block">
            <p className="text-xs font-semibold leading-none text-gray-800 dark:text-white">{t('profile')}</p>
            <p className="mt-0.5 text-[10px] text-gray-400 dark:text-slate-400">{t('manager')}</p>
          </div>
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-orange text-xs font-bold text-white">
            P
          </div>
        </div>

      </div>
    </header>
  )
}
