import { type ReactNode } from 'react'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return <main className="min-h-screen bg-slate-50 py-10">{children}</main>
}
