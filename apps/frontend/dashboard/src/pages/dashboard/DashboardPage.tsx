import { useTranslation } from 'react-i18next'
import {
  CreditCard, ShoppingBag, Zap, Clock, UserPlus,
  AlertTriangle, ShoppingBasket, ShoppingCart,
} from 'lucide-react'

const barHeights = [40, 52, 52, 65, 100, 65, 50]
const todayIdx = 4

const recentOrders = [
  { id: '#BC-9921', customer: 'Ahmed Mansour', status: 'Preparing',       items: '3 items', total: '450 EGP' },
  { id: '#BC-9920', customer: 'Sarah Khalil',  status: 'Out for Delivery', items: '1 item',  total: '120 EGP' },
  { id: '#BC-9919', customer: 'Omar Farouk',   status: 'Delivered',        items: '2 items', total: '310 EGP' },
  { id: '#BC-9918', customer: 'Dina Mourad',   status: 'Delivered',        items: '4 items', total: '585 EGP' },
  { id: '#BC-9917', customer: 'Guest User',    status: 'Cancelled',        items: '1 item',  total: '85 EGP'  },
]

const lowStock = [
  { item: 'Wagyu Patties', note: 'Only 8 units left'            },
  { item: 'Brioche Buns',  note: 'Only 24 units left'           },
  { item: 'Truffle Mayo',  note: '12 units left (Restock soon)' },
]

function statusPill(status: string) {
  switch (status) {
    case 'Preparing':        return 'bg-orange-100 text-orange-600'
    case 'Out for Delivery': return 'bg-yellow-100 text-yellow-700'
    case 'Delivered':        return 'bg-green-100 text-green-700'
    case 'Cancelled':        return 'bg-red-100 text-red-500'
    default:                 return 'bg-gray-100 text-gray-500'
  }
}

export function DashboardPage() {
  const { t } = useTranslation()

  const stats = [
    { label: t('totalRevenue'),    value: '125,430 EGP', badge: '+12%', up: true,  icon: CreditCard  },
    { label: t('todaysRevenue'),   value: '8,200 EGP',   badge: '+4%',  up: true,  icon: CreditCard  },
    { label: t('ordersToday'),     value: '42',           badge: '-2%',  up: false, icon: ShoppingBag },
    { label: t('activeOrders'),    value: '12',           badge: null,   up: null,  icon: Zap         },
    { label: t('avgOrderValue'),   value: '195 EGP',      badge: null,   up: null,  icon: Clock       },
    { label: t('customersPerMonth'), value: '1,240',      badge: '+28%', up: true,  icon: UserPlus    },
  ]

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div className="flex flex-col gap-5 mx-auto">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('operationsDashboard')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{t('operationsDashboardSub')}</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-brand-orange hover:text-brand-orange transition dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200">
            {t('thisWeek')}
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-brand-orange px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition shadow-sm">
            {t('exportPDF')}
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-brand-orange dark:bg-orange-900/20">
                  <Icon size={16} />
                </div>
                {s.badge && (
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${s.up ? 'bg-green-50 text-green-600 dark:bg-green-900/20' : 'bg-red-50 text-red-500 dark:bg-red-900/20'}`}>
                    {s.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 dark:text-slate-400">{s.label}</p>
              <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white leading-tight">{s.value}</p>
            </div>
          )
        })}
      </div>

      {/* Revenue Trend + Sales by Category */}
      <div className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold text-gray-900 dark:text-white">{t('revenueTrend')}</span>
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-700 inline-block" />{t('revenue')}</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-blue-500 inline-block" />{t('target')}</span>
            </div>
          </div>
          <div className="rounded-lg bg-gray-50 dark:bg-slate-800 p-4">
            <div className="flex items-end gap-2 h-48">
              {barHeights.map((h, i) => (
                <div key={i} className="flex-1 flex items-end justify-center">
                  <div className={`w-full rounded-t-lg transition-all ${i === todayIdx ? 'bg-red-800' : 'bg-red-200 dark:bg-red-900/40'}`} style={{ height: `${h}%` }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <span className="font-semibold text-gray-900 dark:text-white">{t('salesByCategory')}</span>
          <div className="flex justify-center my-3">
            <div className="relative flex items-center justify-center">
              <svg viewBox="0 0 120 120" width="160" height="160">
                <circle cx="60" cy="60" r="46" fill="none" stroke="#e5e7eb" strokeWidth="16" className="dark:stroke-slate-700" />
                <circle cx="60" cy="60" r="46" fill="none" stroke="#b91c1c" strokeWidth="16" strokeDasharray="121.5 289.0" strokeDashoffset="72.2" strokeLinecap="butt" />
                <circle cx="60" cy="60" r="46" fill="none" stroke="#3b82f6" strokeWidth="16" strokeDasharray="80.9 289.0" strokeDashoffset="-49.2" strokeLinecap="butt" />
                <circle cx="60" cy="60" r="46" fill="none" stroke="#60a5fa" strokeWidth="16" strokeDasharray="57.8 289.0" strokeDashoffset="-130.2" strokeLinecap="butt" />
                <circle cx="60" cy="60" r="46" fill="none" stroke="#bfdbfe" strokeWidth="16" strokeDasharray="28.9 289.0" strokeDashoffset="-188.0" strokeLinecap="butt" />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">42%</span>
                <span className="text-[10px] text-gray-400 tracking-widest uppercase">{t('burgers')}</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 text-xs text-gray-600 dark:text-slate-300">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-700 shrink-0" />{t('burgers')} (42%)</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-blue-500 shrink-0" />{t('sides')} (28%)</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-blue-300 shrink-0" />{t('drinks')} (20%)</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-blue-100 shrink-0" />{t('desserts')} (10%)</span>
          </div>
        </div>
      </div>

      {/* Recent Orders + Low Stock */}
      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold text-gray-900 dark:text-white">{t('recentOrders')}</span>
            <button className="text-sm font-semibold text-brand-orange hover:underline">{t('viewAll')}</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-700">
                  {[t('orderId'), t('customer'), t('status'), t('items'), t('total')].map((h) => (
                    <th key={h} className="pb-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                {recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition">
                    <td className="py-3 font-semibold text-gray-800 dark:text-white">{o.id}</td>
                    <td className="py-3 text-gray-600 dark:text-slate-300">{o.customer}</td>
                    <td className="py-3"><span className={`inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${statusPill(o.status)}`}>{o.status}</span></td>
                    <td className="py-3 text-gray-500 dark:text-slate-400">{o.items}</td>
                    <td className="py-3 font-semibold text-gray-800 dark:text-white">{o.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold text-gray-900 dark:text-white">{t('lowStockAlerts')}</span>
            <AlertTriangle size={18} className="text-brand-orange" />
          </div>
          <div className="flex flex-col gap-3">
            {lowStock.map((item) => (
              <div key={item.item} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-slate-700 dark:bg-slate-800">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-200 text-gray-600 dark:bg-slate-700 dark:text-slate-300">
                  <ShoppingBasket size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-800 dark:text-white">{item.item}</p>
                  <p className="text-xs text-brand-orange">{item.note}</p>
                </div>
                <button className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white transition">
                  <ShoppingCart size={14} />
                </button>
              </div>
            ))}
          </div>
          <button className="mt-4 w-full rounded-xl border border-brand-orange py-2.5 text-sm font-semibold text-brand-orange hover:bg-brand-orange hover:text-white transition">
            {t('inventoryAudit')}
          </button>
        </div>
      </div>

      {/* Orders Trend Weekly */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between mb-4">
          <span className="font-semibold text-gray-900 dark:text-white">{t('ordersTrendWeekly')}</span>
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-blue-500 inline-block" />{t('dineIn')}</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-blue-800 inline-block" />{t('delivery')}</span>
          </div>
        </div>
        <div className="rounded-lg bg-gray-50 dark:bg-slate-800 p-4">
          <svg viewBox="0 0 700 130" preserveAspectRatio="none" className="w-full h-32">
            <defs>
              <linearGradient id="dineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2"/>
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
              </linearGradient>
              <linearGradient id="delivGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.2"/>
                <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <path d="M0,100 C80,90 140,60 200,70 C260,80 320,40 380,50 C440,60 500,30 580,40 L700,35 L700,130 L0,130 Z" fill="url(#dineGrad)" />
            <path d="M0,100 C80,90 140,60 200,70 C260,80 320,40 380,50 C440,60 500,30 580,40 L700,35" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M0,115 C80,110 140,90 200,100 C260,110 320,75 380,82 C440,90 500,60 580,70 L700,60 L700,130 L0,130 Z" fill="url(#delivGrad)" />
            <path d="M0,115 C80,110 140,90 200,100 C260,110 320,75 380,82 C440,90 500,60 580,70 L700,60" fill="none" stroke="#1e3a8a" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <div className="flex justify-between mt-2 px-1">
            {days.map((d, i) => (
              <span key={d} className={`text-xs font-medium px-2 py-0.5 rounded ${i === todayIdx ? 'bg-brand-orange text-white' : 'text-gray-400 dark:text-slate-500'}`}>{d}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
