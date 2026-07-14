import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  BarChart3, Box, LayoutGrid, MessageSquare,
  ShoppingBag, Settings, Star, User, Users,
  MapPin, LogOut, UtensilsCrossed,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import Logo from "../../assets/images/logo.svg"
// Delivery removed — BiteClub is pickup-only
const navItems = [
  { key: 'nav_dashboard', icon: LayoutGrid, path: '/dashboard' },
  { key: 'nav_orders', icon: ShoppingBag, path: '/orders' },
  { key: 'nav_menu', icon: UtensilsCrossed, path: '/menu' },
  { key: 'nav_customers', icon: Users, path: '/customers' },
  { key: 'nav_promotions', icon: MessageSquare, path: '/promotions' },
  { key: 'nav_reviews', icon: Star, path: '/reviews' },
  //{ key: 'nav_branches',  icon: MapPin,           path: '/branches'  },
  //{ key: 'nav_employees', icon: User,             path: '/employees' },
  { key: 'nav_reports', icon: BarChart3, path: '/reports' },
]

export function Sidebar() {
  const { t } = useTranslation()
  const logout = useAuthStore((s) => s.logout)

  return (
    <aside className="flex min-h-screen w-[250px] shrink-0 flex-col bg-white shadow-sm dark:bg-slate-900 border-r border-gray-100 dark:border-slate-700">

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100 dark:border-slate-700">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-orange text-white shadow shadow-orange-200">
          <img src={Logo} alt="logo" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">BiteClub</p>
          <p className="text-[11px] text-gray-400 dark:text-slate-400 mt-0.5">Restaurant Terminal</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.key}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive
                      ? 'bg-brand-orange text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition ${isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-400'
                        }`}>
                        <Icon size={14} />
                      </span>
                      {t(item.key)}
                    </>
                  )}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-100 dark:border-slate-700 px-3 py-4 flex flex-col gap-0.5">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive
              ? 'bg-brand-orange text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition ${isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-400'
                }`}>
                <Settings size={14} />
              </span>
              {t('settings')}
            </>
          )}
        </NavLink>
        <button
          onClick={logout}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-400">
            <LogOut size={14} />
          </span>
          {t('logout')}
        </button>
      </div>
    </aside>
  )
}
