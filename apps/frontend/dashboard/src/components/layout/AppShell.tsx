import { type ReactNode } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-brand-surface text-brand-navy">
      <div className="grid min-h-screen grid-cols-[280px_1fr] bg-brand-surface">
        <Sidebar />
        <div className="flex flex-col">
          <Header />
          <main className="flex-1 p-6 xl:p-8">{children}</main>
        </div>
      </div>
    </div>
  )
}
