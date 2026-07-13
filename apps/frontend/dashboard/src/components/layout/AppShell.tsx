import { type ReactNode } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

interface AppShellProps {
  children: ReactNode
  theme: 'light' | 'dark'
  toggleTheme: () => void
  language: 'en' | 'ar'
  toggleLanguage: () => void
}

export function AppShell({ children, theme, toggleTheme, language, toggleLanguage }: AppShellProps) {
  return (
    <div className="min-h-screen bg-brand-surface text-brand-navy transition-colors duration-200 dark:text-slate-100">
      <div className="grid min-h-screen grid-cols-[280px_1fr] bg-brand-surface">
        <Sidebar />
        <div className="flex flex-col">
          <Header theme={theme} toggleTheme={toggleTheme} language={language} toggleLanguage={toggleLanguage} />
          <main className="flex-1 p-6 xl:p-8">{children}</main>
        </div>
      </div>
    </div>
  )
}
