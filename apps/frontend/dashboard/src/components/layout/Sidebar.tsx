import {
  BarChart3,
  Box,
  LayoutGrid,
  MessageSquare,
  PackageOpen,
  ShoppingBag,
  Settings,
  Star,
  Truck,
  User,
  Users,
  MapPin,
  LogOut,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', icon: LayoutGrid },
  { label: 'Orders', icon: ShoppingBag },
  { label: 'Menu', icon: PackageOpen },
  { label: 'Customers', icon: Users },
  { label: 'Delivery', icon: Truck },
  { label: 'Inventory', icon: Box },
  { label: 'Promotions', icon: MessageSquare },
  { label: 'Reviews', icon: Star },
  { label: 'Branches', icon: MapPin },
  { label: 'Employees', icon: User },
  { label: 'Reports', icon: BarChart3 },
]

const activeItem = 'Dashboard'

export function Sidebar() {
  return (
    <aside className="flex min-h-screen flex-col bg-white shadow-panel dark:bg-slate-900">
      <div className="flex items-center gap-3 border-b border-brand-muted/80 px-6 py-6 dark:border-slate-700">
        <div className="grid h-12 w-12 place-items-center rounded-3xl bg-brand-orange text-white shadow-lg shadow-brand-orange/20">
          <LayoutGrid size={22} />
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-slate dark:text-slate-300">BiteClub</p>
          <p className="text-xs text-brand-slate/80 dark:text-slate-400">Admin Terminal</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-6">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = item.label === activeItem
            return (
              <li key={item.label}>
                <button
                  className={`group flex w-full items-center gap-3 rounded-3xl px-4 py-3 text-left text-sm font-medium transition ${
                    isActive
                      ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/10'
                      : 'text-brand-slate hover:bg-brand-surface hover:text-brand-navy dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                  }`}
                >
                  <span
                    className={`grid h-10 w-10 place-items-center rounded-2xl transition ${
                      isActive ? 'bg-white text-brand-orange' : 'bg-brand-surface text-brand-orange'
                    }`}
                  >
                    <Icon size={18} />
                  </span>
                  {item.label}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-brand-muted/80 px-6 py-5 dark:border-slate-700">
        <button className="group flex w-full items-center justify-between gap-3 rounded-3xl bg-brand-surface px-4 py-3 text-sm font-semibold text-brand-slate transition hover:bg-brand-orange hover:text-white dark:bg-slate-800 dark:text-slate-300">
          <span>Settings</span>
          <Settings size={18} />
        </button>
        <button className="mt-3 flex w-full items-center justify-between gap-3 rounded-3xl px-4 py-3 text-sm font-semibold text-brand-slate transition hover:bg-brand-orange hover:text-white dark:text-slate-300">
          <span>Logout</span>
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  )
}
