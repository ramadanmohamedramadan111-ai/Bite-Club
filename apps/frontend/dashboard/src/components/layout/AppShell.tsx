import { type ReactNode } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { Plus } from 'lucide-react'

interface AppShellProps {
  children: ReactNode
  theme: 'light' | 'dark'
  toggleTheme: () => void
  language: 'en' | 'ar'
  toggleLanguage: () => void
}

export function AppShell({ children, theme, toggleTheme, language, toggleLanguage }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <Header theme={theme} toggleTheme={toggleTheme} language={language} toggleLanguage={toggleLanguage} />
        <main className="flex-1 overflow-y-auto p-5 xl:p-6">
          {children}
        </main>
      </div>
      {/* Floating Action Button */}
      <button className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-brand-orange text-white shadow-lg shadow-orange-200 hover:opacity-90 transition z-50 dark:shadow-none">
        <Plus size={24} />
      </button>
    </div>
  )
}
