import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'
import {
  BarChart3,
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  Users,
  DollarSign,
  Filter,
  Loader2,
  X,
} from 'lucide-react'
import { Table } from '../../components/common/Table'
import type { Column } from '../../components/common/Table'

// Dummy Data
const topMenuItems = [
  {
    name: 'Bacon Burger',
    sold: '1,240 sold',
    revenue: '185,000 EGP',
    change: '+14%',
    up: true,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100&h=100&fit=crop',
  },
  {
    name: 'Truffle Pizza',
    sold: '982 sold',
    revenue: '152,000 EGP',
    change: '+9%',
    up: true,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=100&h=100&fit=crop',
  },
  {
    name: 'Salmon Bowl',
    sold: '845 sold',
    revenue: '128,000 EGP',
    change: '-3%',
    up: false,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop',
  },
]

const customerRetention = [
  {
    segment: 'Platinum Members',
    badge: 'VIP',
    orders: '1,420',
    spend: '428,000 EGP',
    frequency: '4.2x / mo',
    retention: 92,
    status: 'GROWING',
    statusClass: 'bg-green-105 text-green-700 dark:bg-green-950/20 dark:text-green-500',
    barColor: 'bg-green-500',
  },
  {
    segment: 'First-Time Users',
    badge: 'NEW',
    orders: '854',
    spend: '224,100 EGP',
    frequency: '1.0x / mo',
    retention: 45,
    status: 'ACQUISITION',
    statusClass: 'bg-yellow-105 text-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-500',
    barColor: 'bg-yellow-500',
  },
  {
    segment: 'Regular Diners',
    badge: 'REG',
    orders: '2,547',
    spend: '773,700 EGP',
    frequency: '2.8x / mo',
    retention: 78,
    status: 'STABLE',
    statusClass: 'bg-blue-105 text-blue-700 dark:bg-blue-950/20 dark:text-blue-500',
    barColor: 'bg-blue-500',
  },
]

export function ReportsPage() {
  const { t } = useTranslation()
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('monthly')
  const [showToast, setShowToast] = useState(true)

  // Auto-dismiss the report toast after 8 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowToast(false)
    }, 8000)
    return () => clearTimeout(timer)
  }, [])

  const columns: Column<typeof customerRetention[0]>[] = [
    {
      header: t('customerSegmentCol', 'Customer Segment'),
      key: 'segment',
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold text-brand-orange bg-orange-50 dark:bg-orange-950/20 px-2 py-0.5 rounded-full shrink-0">
            {row.badge}
          </span>
          <span className="font-bold text-gray-800 dark:text-white">
            {row.segment}
          </span>
        </div>
      ),
    },
    {
      header: t('totalOrdersCol', 'Total Orders'),
      key: 'orders',
      render: (row) => row.orders,
    },
    {
      header: t('totalSpendCol', 'Total Spend'),
      key: 'spend',
      render: (row) => row.spend,
    },
    {
      header: t('avgFrequencyCol', 'Avg. Frequency'),
      key: 'frequency',
      render: (row) => row.frequency,
    },
    {
      header: t('retentionRateCol', 'Retention Rate'),
      key: 'retention',
      render: (row) => (
        <div className="flex flex-col gap-1.5 min-w-[120px]">
          <span className="font-bold text-gray-850 dark:text-white">
            {row.retention}%
          </span>
          <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full ${row.barColor}`}
              style={{ width: `${row.retention}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      header: t('statusCol', 'Status'),
      key: 'status',
      render: (row) => (
        <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${row.statusClass}`}>
          {row.status}
        </span>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6 mx-auto w-full relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('reportsInsights', 'Reports & Insights')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            {t('reportsSubtitle', 'Performance monitoring and trend analysis for BiteClub (Main Branch).')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0 self-start sm:self-auto">
          {/* Timeframe selector */}
          <div className="flex rounded-xl border border-gray-200 bg-white p-0.5 dark:border-slate-700 dark:bg-slate-800">
            {['daily', 'weekly', 'monthly'].map((type) => (
              <button
                key={type}
                onClick={() => setTimeframe(type as any)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition ${
                  timeframe === type
                    ? 'bg-brand-orange text-white'
                    : 'text-gray-500 hover:text-gray-700 dark:text-slate-450 dark:hover:text-slate-200'
                }`}
              >
                {t(type, type)}
              </button>
            ))}
          </div>

          {/* Date Picker Button */}
          <button className="flex items-center gap-2 rounded-xl border border-gray-255 bg-white px-3.5 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
            <Calendar size={14} />
            <span>Oct 2023 - Nov 2023</span>
          </button>

          {/* Export Button */}
          <button className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-850 dark:bg-brand-orange dark:hover:opacity-90 transition">
            <Download size={14} />
            {t('exportBtn', 'Export')}
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: t('grossRevenue', 'Gross Revenue'),
            value: '142,580.00 EGP',
            change: '+12.5%',
            up: true,
            icon: DollarSign,
          },
          {
            label: t('totalOrdersCol', 'Total Orders'),
            value: '4,821',
            change: '+8.2%',
            up: true,
            icon: BarChart3,
          },
          {
            label: t('newCustomersProm', 'New Customers'),
            value: '1,204',
            change: '-2.4%',
            up: false,
            icon: Users,
          },
          {
            label: t('avgOrderValueReport', 'Avg. Order Value'),
            value: '295.70 EGP',
            change: '+5.1%',
            up: true,
            icon: Percent,
          },
        ].map((m) => {
          const Icon = m.icon
          return (
            <div
              key={m.label}
              className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                  {m.label}
                </p>
                <span
                  className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                    m.up
                      ? 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-500'
                      : 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-500'
                  }`}
                >
                  {m.up ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                  {m.change}
                </span>
              </div>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
                {m.value}
              </p>
            </div>
          )
        })}
      </div>

      {/* Charts / Top Items Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sales Revenue Trend Chart */}
        <div className="lg:col-span-2 rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              {t('salesRevenueTrend', 'Sales Revenue Trend')}
            </h2>
            <div className="flex items-center gap-4 text-xs font-bold text-gray-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-brand-orange inline-block" />
                {t('currentPeriod', 'Current Period')}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-400 inline-block" />
                {t('lastPeriod', 'Last Period')}
              </span>
            </div>
          </div>

          <div className="rounded-lg bg-gray-50 dark:bg-slate-800/40 p-4">
            <div className="flex items-end gap-3 h-44">
              {[
                { day: 'Mon', curr: 45, prev: 30 },
                { day: 'Tue', curr: 55, prev: 40 },
                { day: 'Wed', curr: 38, prev: 48 },
                { day: 'Thu', curr: 62, prev: 50 },
                { day: 'Fri', curr: 85, prev: 72 },
                { day: 'Sat', curr: 92, prev: 80 },
                { day: 'Sun', curr: 75, prev: 65 },
              ].map((item) => (
                <div key={item.day} className="flex-1 flex flex-col justify-end h-full gap-1 items-center">
                  <div className="w-full flex gap-1 justify-center items-end h-full">
                    {/* Previous period bar */}
                    <div
                      className="w-2.5 rounded-t bg-blue-300 dark:bg-blue-900/50"
                      style={{ height: `${item.prev}%` }}
                    />
                    {/* Current period bar */}
                    <div
                      className="w-2.5 rounded-t bg-brand-orange"
                      style={{ height: `${item.curr}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 dark:text-slate-550 mt-1 uppercase tracking-wider">
                    {t(item.day.toLowerCase(), item.day)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Menu Items */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              {t('topMenuItemsTitle', 'Top Menu Items')}
            </h2>
            <button className="text-xs font-bold text-brand-orange hover:underline">
              {t('viewAll', 'View All')}
            </button>
          </div>

          <div className="flex flex-col gap-3.5">
            {topMenuItems.map((item) => (
              <div
                key={item.name}
                className="flex items-center gap-3 py-1 border-b border-gray-50 dark:border-slate-800/40 last:border-0 last:pb-0"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-10 w-10 rounded-xl object-cover shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-gray-800 dark:text-white truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-405 dark:text-slate-500 mt-0.5">
                    {item.sold}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-extrabold text-gray-900 dark:text-white">
                    {item.revenue}
                  </p>
                  <span
                    className={`text-[10px] font-extrabold ${
                      item.up ? 'text-green-600' : 'text-red-500'
                    }`}
                  >
                    {item.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Retention & Orders Table */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50 dark:border-slate-800">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            {t('customerRetentionOrders', 'Customer Retention & Orders')}
          </h2>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition">
            <Filter size={15} />
          </button>
        </div>

        <Table
          columns={columns}
          data={customerRetention}
          keyExtractor={(row) => row.segment}
        />
      </div>

      {/* Floating Generating Report Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-55 rounded-2xl bg-slate-900 p-4 text-white shadow-xl dark:bg-slate-800 border border-slate-700/50 flex items-center justify-between gap-4 animate-bounce max-w-sm">
          <div className="flex items-center gap-3">
            <Loader2 className="animate-spin text-brand-orange" size={20} />
            <div className="min-w-0">
              <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                {t('generatingReport', 'Generating Report...')}
              </p>
              <p className="text-xs font-medium text-white truncate mt-0.5">
                Monthly_Sales_Oct_2023.pdf
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowToast(false)}
            className="text-slate-400 hover:text-white transition shrink-0"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
