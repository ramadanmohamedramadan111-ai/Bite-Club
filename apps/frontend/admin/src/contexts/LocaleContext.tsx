import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { en } from '../i18n/en'
import { ar } from '../i18n/ar'

type Locale = 'en' | 'ar'
type Translations = Record<string, any>

const translations: Record<Locale, Translations> = { en, ar }

interface LocaleContextType {
  locale: Locale
  setLocale: (l: Locale) => void
  dir: 'ltr' | 'rtl'
  t: (path: string) => string
}

function resolve(obj: any, path: string): string {
  const keys = path.split('.')
  let current = obj
  for (const key of keys) {
    if (current == null || typeof current !== 'object') return path
    current = current[key]
  }
  return typeof current === 'string' ? current : path
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = localStorage.getItem('admin-locale')
    if (saved === 'en' || saved === 'ar') return saved
    return 'en'
  })

  const dir = locale === 'ar' ? 'rtl' : 'ltr'

  useEffect(() => {
    document.documentElement.setAttribute('lang', locale)
    document.documentElement.setAttribute('dir', dir)
    localStorage.setItem('admin-locale', locale)
  }, [locale, dir])

  const setLocale = (l: Locale) => setLocaleState(l)

  const t = (path: string): string => {
    return resolve(translations[locale], path)
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, dir, t }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider')
  return ctx
}
