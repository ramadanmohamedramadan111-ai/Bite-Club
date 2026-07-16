import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  BarChart3, LayoutGrid, MessageSquare,
  ShoppingBag, Settings, Star, Users,
  LogOut, UtensilsCrossed, X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../store/authStore'
import { authService } from '../../lib/authService'
import Logo from '../../assets/images/logo.svg'

const navItems = [
  { key: 'nav_dashboard',  icon: LayoutGrid,      path: '/dashboard'  },
  { key: 'nav_orders',     icon: ShoppingBag,     path: '/orders'     },
  { key: 'nav_menu',       icon: UtensilsCrossed, path: '/menu'       },
  { key: 'nav_customers',  icon: Users,           path: '/customers'  },
  { key: 'nav_promotions', icon: MessageSquare,   path: '/promotions' },
  { key: 'nav_reviews',    icon: Star,            path: '/reviews'    },
  { key: 'nav_reports',    icon: BarChart3,       path: '/reports'    },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

// Shared nav content extracted so both mobile and desktop render the same thing
function SidebarContent({ onClose, showClose }: { onClose: () => void; showClose: boolean }) {
  const { t } = useTranslation()
  const token  = useAuthStore((s) => s.token)
  const logout = useAuthStore((s) => s.logout)

  const handleLogout = async () => {
    try {
      if (token) await authService.logout(token)
    } catch {
      // always logout locally even if API fails
    } finally {
      logout()
      toast.success(t('logout'))
    }
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
      isActive
        ? 'bg-brand-orange text-white shadow-sm'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
    }`

  const iconClass = (isActive: boolean) =>
    `flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition ${
      isActive
        ? 'bg-white/20 text-white'
        : 'bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-400'
    }`

  return (
    <div className="flex h-full flex-col bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-700">
      {/* Logo row */}
      <div className="flex items-center justify-between gap-3 px-5 py-5 border-b border-gray-100 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-orange shadow shadow-orange-200">
            <img src={Logo} alt="logo" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">BiteClub</p>
            <p className="text-[11px] text-gray-400 dark:text-slate-400 mt-0.5">Restaurant Terminal</p>
          </div>
        </div>
        {showClose && (
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300"
            aria-label="Close sidebar"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.key}>
                <NavLink to={item.path} className={navLinkClass}>
                  {({ isActive }) => (
                    <>
                      <span className={iconClass(isActive)}>
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
        <NavLink to="/settings" className={navLinkClass}>
          {({ isActive }) => (
            <>
              <span className={iconClass(isActive)}>
                <Settings size={14} />
              </span>
              {t('settings')}
            </>
          )}
        </NavLink>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-400">
            <LogOut size={14} />
          </span>
          {t('logout')}
        </button>
      </div>
    </div>
  )
}

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* ── Desktop: always visible, static in flex flow ── */}
      <aside className="hidden lg:flex lg:w-[250px] lg:shrink-0 lg:flex-col min-h-screen">
        <SidebarContent onClose={onClose} showClose={false} />
      </aside>

      {/* ── Mobile: only mounted when open ── */}
      {open && (
        <div className="lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-20 bg-black/40"
            onClick={onClose}
            aria-hidden="true"
          />
          {/* Drawer */}
          <aside className="fixed inset-y-0 start-0 z-30 w-64 shadow-xl">
            <SidebarContent onClose={onClose} showClose={true} />
          </aside>
        </div>
      )}
    </>
  )
}
