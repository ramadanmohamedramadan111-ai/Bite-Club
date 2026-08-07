import { Globe, Menu, Moon, SunMedium } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { type ShellProps } from '../../App'
import Logo from '../../assets/images/logo.svg'
import { NotificationDropdown } from './NotificationDropdown'

type HeaderProps = ShellProps & { onMenuToggle: () => void }

export function Header({ theme, toggleTheme, toggleLanguage, onMenuToggle }: HeaderProps) {
  const { t } = useTranslation()

  return (
    <header className="flex items-center gap-3 border-b border-gray-100 bg-white px-4 py-3 sm:px-6 sm:py-4 dark:border-slate-700 dark:bg-slate-900">
      {/* Logo — hidden on desktop (sidebar already shows it), pinned to the start on smaller screens */}
      <div className="flex lg:hidden shrink-0 items-center">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-orange shadow shadow-orange-200">
          <img src={Logo} alt="logo" className="h-5 w-5" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2 ms-auto">

        <NotificationDropdown />

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

        {/* Profile — hidden on medium screens and below, only shown on large desktop */}
        <div className="hidden lg:flex items-center gap-2 rounded-xl bg-white px-2 py-1.5 sm:px-3 dark:border-slate-700 dark:bg-slate-800">
          <div className="hidden text-start md:block">
            <Link to="/settings" className='cursor-pointer'><p className="text-xs font-semibold leading-none text-gray-800 dark:text-white">{t('profile')}</p></Link>
            <p className="mt-0.5 text-[10px] text-gray-400 dark:text-slate-400">{t('manager')}</p>
          </div>
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-orange text-xs font-bold text-white">
            P
          </div>
        </div>

      </div>

      {/* Hamburger — mobile/medium only, pinned to the end (opposite side of the logo) */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:border-brand-orange hover:text-brand-orange dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
        aria-label="Toggle sidebar"
      >
        <Menu size={18} />
      </button>
    </header>
  )
}