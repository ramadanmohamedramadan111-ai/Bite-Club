import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import {
  TrendingUp,
  Users,
  DollarSign,
  Plus,
  MoreVertical,
  Ticket,
  Percent,
  Calendar,
} from 'lucide-react'
import { Table } from '../../components/common/Table'
import type { Column } from '../../components/common/Table'
import { Pagination } from '../../components/common/Pagination'

export function PromotionsPage() {
  const { t } = useTranslation()
  const [activeTrendTab, setActiveTrendTab] = useState<'week' | 'month'>('month')
  const [currentPage, setCurrentPage] = useState(1)

  const metrics = [
    {
      label: t('totalUsage', 'TOTAL USAGE'),
      value: '4,289',
      change: '+12.5%',
      up: true,
      icon: Ticket,
    },
    {
      label: t('revenueUplift', 'REVENUE UPLIFT'),
      value: '12,450 EGP',
      change: '+8.2%',
      up: true,
      icon: DollarSign,
    },
    {
      label: t('newCustomersProm', 'NEW CUSTOMERS'),
      value: '842',
      change: '+154',
      up: true,
      icon: Users,
    },
    {
      label: t('roiRatio', 'ROI RATIO'),
      value: '4.8',
      change: '3.2x',
      up: true,
      icon: TrendingUp,
    },
  ]

  const campaigns = [
    {
      name: 'FIRSTBITE25',
      desc: t('firstBiteDesc', '25% off for new users'),
      status: 'ACTIVE',
      type: t('couponCode', 'Coupon Code'),
      schedule: t('noExpiry', 'No Expiry'),
      usage: 1204,
      maxUsage: 2000,
    },
    {
      name: 'FREE APPL TUESDAYS',
      desc: t('freeApplDesc', 'Free Appetizer > 250 EGP'),
      status: 'ACTIVE',
      type: t('campaignType', 'Campaign'),
      schedule: t('recurringTue', 'Recurring (Tue)'),
      usage: 842,
      maxUsage: 1000,
    },
    {
      name: 'HOLIDAY FLASH 50',
      desc: t('holidayFlashDesc', '50% off select menu items'),
      status: 'SCHEDULED',
      type: t('flashSale', 'Flash Sale'),
      schedule: 'Dec 24 - Dec 26',
      usage: 0,
      maxUsage: 500,
    },
  ]

  // Redemption Trend dummy bar heights (as % of total)
  const barHeights = [40, 52, 35, 60, 80, 68, 80, 75, 55, 30]

  const columns: Column<typeof campaigns[0]>[] = [
    {
      header: t('campaignNameCol', 'CAMPAIGN NAME'),
      key: 'name',
      render: (c) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-brand-orange dark:bg-orange-950/20">
            {c.status === 'ACTIVE' ? (
              <Percent size={16} />
            ) : (
              <Calendar size={16} />
            )}
          </div>
          <div>
            <p className="font-bold text-gray-800 dark:text-white">
              {c.name}
            </p>
            <p className="text-xs text-gray-400 dark:text-slate-500">
              {c.desc}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: t('statusCol', 'STATUS'),
      key: 'status',
      render: (c) => (
        <span
          className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
            c.status === 'ACTIVE'
              ? 'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-500'
              : 'bg-blue-105 text-blue-600 dark:bg-blue-950/20 dark:text-blue-500'
          }`}
        >
          {c.status}
        </span>
      ),
    },
    {
      header: t('typeCol', 'TYPE'),
      key: 'type',
      render: (c) => c.type,
    },
    {
      header: t('scheduleCol', 'SCHEDULE'),
      key: 'schedule',
      render: (c) => c.schedule,
    },
    {
      header: t('usageCol', 'USAGE'),
      key: 'usage',
      render: (c) => (
        <div className="flex flex-col gap-1.5 min-w-[120px]">
          <span className="font-bold text-gray-800 dark:text-white">
            {c.usage.toLocaleString()}
          </span>
          <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-brand-orange"
              style={{
                width: `${(c.usage / c.maxUsage) * 100}%`,
              }}
            />
          </div>
        </div>
      ),
    },
    {
      header: t('actionsCol', 'ACTIONS'),
      key: 'actions',
      render: () => (
        <button className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-slate-800 transition">
          <MoreVertical size={15} />
        </button>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6 mx-auto ">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('promotionsMarketing', 'Promotions & Marketing')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            {t('promotionsSubtitle', 'Drive growth with targeted campaigns and real-time performance tracking.')}
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-brand-orange px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition shadow-sm self-start sm:self-auto">
          <Plus size={16} /> {t('createCampaign', 'Create Campaign')}
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => {
          const Icon = m.icon
          return (
            <div
              key={m.label}
              className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-brand-orange dark:bg-orange-950/20">
                  <Icon size={16} />
                </div>
                <span className="text-xs font-bold text-green-600 bg-green-50 dark:bg-green-950/20 px-2 py-0.5 rounded-full">
                  {m.change}
                </span>
              </div>
              <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 tracking-wider">
                {m.label}
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                {m.value}
              </p>
              <p className="mt-1.5 text-xs text-gray-400 dark:text-slate-500">
                {t('activeAcrossAllStores', 'Active across all stores')}
              </p>
            </div>
          )
        })}
      </div>

      {/* Charts & Highlight Card */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Redemption Trend Chart */}
        <div className="lg:col-span-2 rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              {t('redemptionTrends', 'Redemption Trends')}
            </h2>
            <div className="flex rounded-lg border border-gray-200 p-0.5 dark:border-slate-700">
              <button
                onClick={() => setActiveTrendTab('week')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                  activeTrendTab === 'week'
                    ? 'bg-brand-orange text-white'
                    : 'text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {t('week', 'Week')}
              </button>
              <button
                onClick={() => setActiveTrendTab('month')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                  activeTrendTab === 'month'
                    ? 'bg-brand-orange text-white'
                    : 'text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {t('month', 'Month')}
              </button>
            </div>
          </div>

          <div className="rounded-lg bg-gray-50 dark:bg-slate-800/50 p-4">
            <div className="flex items-end gap-2 h-44">
              {barHeights.map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <div
                    className={`w-full rounded-t-lg transition-all ${
                      i === barHeights.length - 2
                        ? 'bg-brand-orange'
                        : 'bg-brand-orange/30 dark:bg-brand-orange/15'
                    }`}
                    style={{ height: `${h}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-3 text-[10px] text-gray-400 dark:text-slate-500 font-bold px-1 uppercase tracking-wider">
              <span>1st</span>
              <span>7th</span>
              <span>14th</span>
              <span>21st</span>
              <span>28th</span>
            </div>
          </div>
        </div>

        {/* Hot Offer Highlight Card */}
        <div className="relative rounded-2xl bg-gradient-to-br from-brand-orange to-orange-700 p-6 text-white shadow-lg overflow-hidden flex flex-col justify-between min-h-[250px]">
          {/* Decorative background shape */}
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-xl" />

          <div>
            <span className="inline-block rounded-md bg-white/20 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest">
              {t('hotOffer', 'HOT OFFER')}
            </span>
            <h3 className="mt-4 text-2xl font-bold leading-tight">
              Weekend Burger Bonanza
            </h3>
            <p className="mt-2 text-sm text-orange-100 font-medium">
              {t('weekendBurgerBonanzaDesc', 'BOGO on all artisanal burgers every Saturday.')}
            </p>
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
            <div>
              <p className="text-[10px] font-bold text-orange-200 tracking-wider">
                {t('currentRoi', 'CURRENT ROI')}
              </p>
              <p className="text-xl font-extrabold">5.2x</p>
            </div>
            <button className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-brand-orange shadow-md hover:bg-orange-50 transition">
              {t('edit', 'Edit')}
            </button>
          </div>
        </div>
      </div>

      {/* Active & Scheduled Offers Table */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-55 dark:border-slate-800">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            {t('activeScheduledOffers', 'Active & Scheduled Offers')}
          </h2>
          <select className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 outline-none focus:border-brand-orange dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
            <option>{t('allTypes', 'All Types')}</option>
            <option>{t('couponCodes', 'Coupon Codes')}</option>
            <option>{t('flashSales', 'Flash Sales')}</option>
          </select>
        </div>

        {/* Reusable Table */}
        <Table
          columns={columns}
          data={campaigns}
          keyExtractor={(row) => row.name}
        />

        {/* Reusable Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={4}
          onPageChange={setCurrentPage}
          showingText={t('showingPromotions', 'Showing 3 of 12 promotions')}
        />
      </div>
    </div>
  )
}
