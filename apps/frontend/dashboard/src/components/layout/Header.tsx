import { Bell, ChevronDown, Moon, Search, SunMedium, UserCircle2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface HeaderProps {
  theme: 'light' | 'dark'
  toggleTheme: () => void
  language: 'en' | 'ar'
  toggleLanguage: () => void
}

export function Header({ theme, toggleTheme, language, toggleLanguage }: HeaderProps) {
  const { t } = useTranslation()

  return (
    <header className="border-b border-brand-muted/70 bg-white/90 px-6 py-4 shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/90">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3 rounded-3xl border border-brand-muted/80 bg-brand-surface px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
          <Search size={18} className="text-brand-slate" />
          <input
            className="w-full bg-transparent text-sm text-brand-navy outline-none placeholder:text-brand-slate dark:text-slate-100"
            placeholder={t('searchPlaceholder')}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleLanguage}
            className="rounded-3xl border border-brand-muted/80 bg-white px-4 py-3 text-sm font-semibold text-brand-slate transition hover:border-brand-orange hover:text-brand-orange dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            {language === 'en' ? 'AR' : 'EN'}
          </button>
          <button
            onClick={toggleTheme}
            className="grid h-12 w-12 place-items-center rounded-3xl border border-brand-muted/80 bg-white text-brand-slate transition hover:border-brand-orange hover:text-brand-orange dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            {theme === 'dark' ? <SunMedium size={18} /> : <Moon size={18} />}
          </button>
          <button className="inline-flex items-center gap-3 rounded-3xl border border-brand-muted/80 bg-white px-4 py-3 text-sm font-semibold text-brand-slate transition hover:border-brand-orange hover:text-brand-orange dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
            <UserCircle2 size={20} />
            <span>{t('profile')}</span>
            <ChevronDown size={16} />
          </button>
          <button className="grid h-12 w-12 place-items-center rounded-3xl bg-brand-orange text-white shadow-lg shadow-brand-orange/10">
            <Bell size={20} />
          </button>
        </div>
      </div>
    </header>
  )
}
