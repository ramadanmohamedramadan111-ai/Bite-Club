import { Bell, ChevronDown, Globe2, Moon, Search, UserCircle2 } from 'lucide-react'

export function Header() {
  return (
    <header className="border-b border-brand-muted/70 bg-white/90 px-6 py-4 shadow-sm backdrop-blur-sm">
      <div className="mx-auto flex flex-wrap items-center justify-between gap-4 max-w-7xl">
        <div className="flex flex-1 items-center gap-3 rounded-3xl border border-brand-muted/80 bg-brand-surface px-4 py-3">
          <Search size={18} className="text-brand-slate" />
          <input
            className="w-full bg-transparent text-sm text-brand-navy outline-none placeholder:text-brand-slate"
            placeholder="Search orders, customers, or items..."
          />
        </div>

        <div className="flex items-center gap-3">
          <button className="grid h-12 w-12 place-items-center rounded-3xl border border-brand-muted/80 bg-white text-brand-slate transition hover:border-brand-orange hover:text-brand-orange">
            <Globe2 size={18} />
          </button>
          <button className="grid h-12 w-12 place-items-center rounded-3xl border border-brand-muted/80 bg-white text-brand-slate transition hover:border-brand-orange hover:text-brand-orange">
            <Moon size={18} />
          </button>
          <button className="inline-flex items-center gap-3 rounded-3xl border border-brand-muted/80 bg-white px-4 py-3 text-sm font-semibold text-brand-slate transition hover:border-brand-orange hover:text-brand-orange">
            <UserCircle2 size={20} />
            <span>Profile</span>
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
