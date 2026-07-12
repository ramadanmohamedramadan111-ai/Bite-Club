import { ArrowRight, BarChart3, CreditCard, Users, Warehouse } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../store/authStore'
import { AppShell } from '../layout/AppShell'

const metrics = [
  { label: 'Total Orders', value: '126', icon: Warehouse, trend: '+4.2%' },
  { label: 'Group Orders', value: '38', icon: Users, trend: '+2.9%' },
  { label: 'Active Restaurants', value: '14', icon: CreditCard, trend: '+1.6%' },
  { label: 'Pickup Codes', value: '47', icon: BarChart3, trend: 'New' },
]

export function DashboardPage() {
  const { t } = useTranslation()
  const logout = useAuthStore((state) => state.logout)

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">{t('dashboardTitle')}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">{t('dashboardSubtitle')}</p>
          </div>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800"
          >
            {t('logout')} <ArrowRight size={18} />
          </button>
        </div>

        <section className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
          <div className="grid gap-6 lg:grid-cols-2">
            {metrics.map((metric) => {
              const Icon = metric.icon
              return (
                <article key={metric.label} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-glow">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">{metric.label}</p>
                      <p className="mt-4 text-4xl font-semibold tracking-tight text-slate-900">{metric.value}</p>
                    </div>
                    <div className="grid h-12 w-12 place-items-center rounded-3xl bg-orange-500 text-white">
                      <Icon size={20} />
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-slate-500">Real-time overview • {metric.trend}</p>
                </article>
              )
            })}
          </div>

          <div className="grid gap-6">
            <article className="rounded-[28px] border border-slate-200 bg-slate-950/95 p-6 text-white shadow-glow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Live order velocity</p>
                  <h3 className="mt-3 text-3xl font-semibold">8.2x</h3>
                </div>
                <span className="inline-flex rounded-full bg-emerald-500/15 px-3 py-1 text-sm font-semibold text-emerald-300">
                  +18% YoY
                </span>
              </div>
              <div className="mt-6 h-32 rounded-[24px] bg-gradient-to-r from-orange-500/15 via-orange-400/10 to-transparent p-4">
                <div className="h-full rounded-[20px] bg-gradient-to-r from-orange-500 via-orange-400 to-orange-200" />
              </div>
            </article>
            <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-glow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Active pickup groups</p>
                  <h3 className="mt-3 text-3xl font-semibold text-slate-900">12</h3>
                </div>
                <div className="rounded-3xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                  Host only
                </div>
              </div>
              <p className="mt-5 text-sm leading-6 text-slate-500">Group orders are tracked in real time and show all active restaurant pickups.</p>
            </article>
          </div>
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-glow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">{t('ordersSummary')}</p>
                <h3 className="mt-3 text-2xl font-semibold text-slate-900">Order lifecycle</h3>
              </div>
              <span className="rounded-3xl bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-700">Live metrics</span>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-500">{t('pendingOrders')}</p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">92</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-500">{t('confirmedOrders')}</p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">18</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-500">{t('readyForPickup')}</p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">12</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-glow">
              <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">{t('recentActivity')}</h3>
              <ul className="mt-6 space-y-4 text-sm text-slate-600">
                <li className="rounded-3xl bg-slate-50 px-4 py-4">
                  <p className="font-semibold text-slate-900">{t('newGroup')}</p>
                  <p className="mt-1">{t('groupCreated')}</p>
                </li>
                <li className="rounded-3xl bg-slate-50 px-4 py-4">
                  <p className="font-semibold text-slate-900">{t('commission')}</p>
                  <p className="mt-1">{t('commissionRate')}</p>
                </li>
                <li className="rounded-3xl bg-slate-50 px-4 py-4">
                  <p className="font-semibold text-slate-900">{t('deposit')}</p>
                  <p className="mt-1">{t('depositThreshold')}</p>
                </li>
              </ul>
            </article>
            <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-glow">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Loyalty insights</p>
                  <h3 className="mt-3 text-2xl font-semibold text-slate-900">100 points = 10 EGP</h3>
                </div>
                <div className="rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-700">Discount ready</div>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">Reward points and weekly streaks appear here once the restaurant completes order pickups.</p>
            </article>
          </div>
        </section>

        <div className="mt-8 rounded-[28px] border border-slate-200 bg-slate-50 p-6 text-slate-700 shadow-glow">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">{t('dashboardFooter')}</p>
          <p className="mt-3 text-sm leading-6">{t('dashboardSupport')}</p>
        </div>
      </div>
    </AppShell>
  )
}
