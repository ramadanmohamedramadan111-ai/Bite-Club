import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  AlertCircle, CreditCard, ShoppingBag, Zap, Clock,
} from 'lucide-react'
import { useDashboardAnalytics } from '../../hooks/useDashboardAnalytics'
import { useExportDashboardPdf } from '../../hooks/useExportDashboardPdf'
import type { DashboardPeriod } from '../../types/analytics'

const periods = ['today', 'week', 'month', 'year'] as const

type Period = (typeof periods)[number]

function statusPill(status: string) {
  switch (status) {
    case 'pending':
    case 'preparing':
      return 'bg-orange-100 text-orange-600'
    case 'ready':
    case 'delivered':
      return 'bg-green-100 text-green-700'
    case 'cancelled':
      return 'bg-red-100 text-red-500'
    default:
      return 'bg-gray-100 text-gray-500'
  }
}

function formatCurrency(value: number) {
  return `${value.toLocaleString()} EGP`
}

function formatReviewDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString()
}

function formatOrderLabel(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

export function DashboardPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [period, setPeriod] = useState<Period>('week')
  const { analytics, loading, error } = useDashboardAnalytics(period as DashboardPeriod)
  const { exportPdf, isExporting } = useExportDashboardPdf()

  const stats = useMemo(() => {
    if (!analytics) {
      return [
        { label: t('totalRevenue'), value: '—', badge: null, up: null, icon: CreditCard },
        { label: t('ordersToday'), value: '—', badge: null, up: null, icon: ShoppingBag },
        { label: t('activeOrders'), value: '—', badge: null, up: null, icon: Zap },
        { label: t('averageRating'), value: '—', badge: null, up: null, icon: Clock },
      ]
    }

    return [
      { label: t('totalRevenue'), value: formatCurrency(analytics.summary.revenue), badge: null, up: null, icon: CreditCard },
      { label: t('ordersToday'), value: analytics.summary.orders.toString(), badge: null, up: null, icon: ShoppingBag },
      { label: t('activeOrders'), value: analytics.pending_orders.toString(), badge: null, up: null, icon: Zap },
      { label: t('averageRating'), value: analytics.average_rating.toFixed(1), badge: null, up: null, icon: Clock },
    ]
  }, [analytics, t])

  const restaurantStatusLabel = analytics?.restaurant_status?.accepting_orders ? t('acceptingOrders') : t('pausedOrders')
  const restaurantOpenLabel = analytics?.restaurant_status?.is_open ? t('openNow') : t('closedNow')

  return (
    <div className="flex flex-col gap-5 mx-auto">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('operationsDashboard')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{t('operationsDashboardSub')}</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center rounded-lg border border-gray-200 bg-white p-1 dark:border-slate-600 dark:bg-slate-800">
            {periods.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setPeriod(item)}
                className={`rounded-md px-3 py-2 text-sm font-medium capitalize transition ${period === item ? 'bg-brand-orange text-white' : 'text-gray-700 hover:text-brand-orange dark:text-slate-200'}`}
              >
                {item}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => exportPdf({ analytics, period: period as DashboardPeriod, title: t('operationsDashboard') })}
            disabled={isExporting}
            className="flex items-center gap-2 rounded-lg bg-brand-orange px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition shadow-sm disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isExporting ? t('exporting') : t('exportPDF')}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4  xl:grid-cols-4">
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
              <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white leading-tight">{loading ? '...' : s.value}</p>
            </div>
          )
        })}
      </div>

      {/* Live overview */}
      <div className="grid gap-4 xl:grid-cols-[1.3fr_0.9fr]">
        <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-orange-50 via-white to-orange-100 p-5 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-orange-600">{t('performance')}</p>
              <h2 className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">{t('restaurantStatus')}</h2>
            </div>
            <div className={`rounded-full px-3 py-1 text-sm font-semibold ${analytics?.restaurant_status?.is_open ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {restaurantOpenLabel}
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-white/70 bg-white/80 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/70">
              <p className="text-sm text-gray-500 dark:text-slate-400">{t('revenue')}</p>
              <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{analytics ? formatCurrency(analytics.summary.revenue) : '—'}</p>
            </div>
            <div className="rounded-xl border border-white/70 bg-white/80 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/70">
              <p className="text-sm text-gray-500 dark:text-slate-400">{t('completedOrders')}</p>
              <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{analytics ? analytics.summary.orders : '—'}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between rounded-xl border border-orange-100 bg-white/70 p-3 text-sm text-gray-600 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300">
            <span>{restaurantStatusLabel}</span>
            <span className="font-semibold text-orange-600">{analytics?.pending_orders ?? 0} {t('pendingOrders')}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-orange-600">{t('customerSatisfactionLabel')}</p>
              <h2 className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">{t('averageRating')}</h2>
            </div>
            <div className="rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-600 dark:bg-orange-900/20">
              {analytics ? `${analytics.average_rating.toFixed(1)} / 5` : '—'}
            </div>
          </div>
          <div className="mt-6 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 p-5 text-white">
            <p className="text-sm opacity-90">{t('ratingFromReviews')}</p>
            <p className="mt-2 text-4xl font-semibold">{analytics ? analytics.average_rating.toFixed(1) : '—'}</p>
            <p className="mt-2 text-sm opacity-90">{analytics?.recent_reviews?.length ?? 0} {t('recentReviews')}</p>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="grid gap-4 ">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">{t('recentOrders')}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">{t('latestOrders')}</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/orders')}
              className="text-sm font-semibold text-brand-orange transition hover:underline"
            >
              {t('viewAll')}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm text-left">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-700">
                  {[t('orderId'), t('customer'), t('type'), t('status'), t('items'), t('payment'), t('total'), t('date')].map((h) => (
                    <th key={h} className="pb-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                {!analytics?.latest_orders?.length ? (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-sm text-gray-500 dark:text-slate-400">{t('noData')}</td>
                  </tr>
                ) : analytics.latest_orders.map((o) => {
                  const payment = o.payments?.[0]
                  const itemSummary = o.items?.length
                    ? o.items.map((item) => `${item.item_name} × ${item.quantity}`).join(', ')
                    : t('noData')

                  return (
                    <tr key={o.id} className="transition hover:bg-gray-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 font-semibold text-gray-800 dark:text-white">#{o.id}</td>
                      <td className="py-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-800 dark:text-white">{o.customer.name}</span>
                          <span className="text-xs text-gray-500 dark:text-slate-400">{o.customer.phone_number}</span>
                        </div>
                      </td>
                      <td className="py-3 text-gray-600 dark:text-slate-300">
                        <span className="capitalize">{formatOrderLabel(o.order_type)}</span>
                      </td>
                      <td className="py-3">
                        <span className={`inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${statusPill(o.status)}`}>
                          {formatOrderLabel(o.status)}
                        </span>
                      </td>
                      <td className="max-w-[220px] py-3 text-gray-600 dark:text-slate-300">
                        <div className="line-clamp-2">{itemSummary}</div>
                      </td>
                      <td className="py-3 text-gray-600 dark:text-slate-300">
                        {payment ? `${payment.payment_method} • ${payment.status}` : t('noData')}
                      </td>
                      <td className="py-3 font-semibold text-gray-800 dark:text-white">{formatCurrency(o.financials.total)}</td>
                      <td className="py-3 text-gray-500 dark:text-slate-400">{o.time_ago}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

    
      </div>

      {/* Reviews */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-orange-600">{t('latestReviews')}</p>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('recentReviews')}</h2>
          </div>
          <div className="rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-600 dark:bg-orange-900/20">
            {analytics?.recent_reviews?.length ?? 0}
          </div>
        </div>
        <div className="space-y-3">
          {!analytics?.recent_reviews?.length ? (
            <div className="rounded-xl border border-dashed border-gray-200 p-4 text-sm text-gray-500 dark:border-slate-700 dark:text-slate-400">
              {t('noData')}
            </div>
          ) : analytics.recent_reviews.map((review) => (
            <div key={review.id} className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-slate-700 dark:bg-slate-800">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{review.user.name}</p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">{formatReviewDate(review.created_at)}</p>
                </div>
                <div className="rounded-full bg-yellow-100 px-2.5 py-1 text-sm font-semibold text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
                  ★ {review.rating}
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-600 dark:text-slate-300">{review.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
