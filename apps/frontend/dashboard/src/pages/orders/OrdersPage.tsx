import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Bell, CheckCircle, XCircle } from 'lucide-react'
import { Table } from '../../components/common/Table'
import type { Column } from '../../components/common/Table'
import { Pagination } from '../../components/common/Pagination'
import { useOrderStore } from '../../store/orderStore'
import type { Order } from '../../store/orderStore'

function statusPill(status: string) {
  switch (status.toLowerCase()) {
    case 'preparing':  return 'bg-blue-105 text-blue-600 dark:bg-blue-950/20 dark:text-blue-500'
    case 'ready':      return 'bg-orange-50 text-brand-orange dark:bg-orange-950/20'
    case 'completed':  return 'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-500'
    case 'cancelled':  return 'bg-red-100 text-red-500 dark:bg-red-950/20 dark:text-red-500'
    case 'pending':    return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-950/20 dark:text-yellow-500'
    default:           return 'bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-slate-400'
  }
}

function paymentColor(p: string) {
  switch (p?.toLowerCase()) {
    case 'paid':     return 'text-green-600 dark:text-green-500'
    case 'unpaid':   return 'text-gray-400 dark:text-slate-500'
    case 'refunded': return 'text-red-550 dark:text-red-500'
    case 'pending':  return 'text-yellow-500 dark:text-yellow-600'
    default:         return 'text-gray-400 dark:text-slate-500'
  }
}

export function OrdersPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [currentPage, setCurrentPage] = useState(1)

  const { orders: liveOrders, isLoading, fetchLiveOrders } = useOrderStore()

  useEffect(() => {
    fetchLiveOrders()
  }, [fetchLiveOrders])

  const query = (searchParams.get('q') || '').toLowerCase()
  const orders = liveOrders.filter(o => 
    (o.customer?.name || '').toLowerCase().includes(query) || 
    o.id.toString().toLowerCase().includes(query) ||
    (o.customer?.phone_number || '').includes(query)
  )

  const columns: Column<typeof orders[0]>[] = [
    {
      header: t('orderHash', 'ORDER ID'),
      key: 'id',
      render: (o) => <span className="font-bold text-gray-800 dark:text-white">#{o.id}</span>
    },
    {
      header: t('customer', 'CUSTOMER'),
      key: 'customer',
      render: (o) => (
        <div>
          <p className="font-semibold text-gray-800 dark:text-white">{o.customer?.name || 'Guest'}</p>
          <p className="text-xs text-gray-400 dark:text-slate-500">{o.customer?.phone_number || '-'}</p>
        </div>
      )
    },
    {
      header: t('type', 'TYPE'),
      key: 'order_type',
      render: (o) => <span className="capitalize">{o.order_type.replace('_', ' ')}</span>
    },
    {
      header: t('status', 'STATUS'),
      key: 'status',
      render: (o) => (
        <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusPill(o.status)}`}>
          {o.status.replace('_', ' ')}
        </span>
      )
    },
    {
      header: t('payment', 'PAYMENT'),
      key: 'payment',
      render: (o) => {
        const paymentStatus = o.payments[0]?.status || 'unpaid'
        return (
          <span className={`text-sm font-semibold capitalize ${paymentColor(paymentStatus)}`}>
            {paymentStatus}
          </span>
        )
      }
    },
    {
      header: t('total', 'TOTAL'),
      key: 'financials',
      render: (o) => <span className="font-bold text-gray-800 dark:text-white">{o.financials.total} EGP</span>
    },
    {
      header: t('date', 'DATE'),
      key: 'time_ago',
      render: (o) => o.time_ago
    },
    {
      header: t('action', 'ACTION'),
      key: 'action',
      render: (o) => (
        <button
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/orders/${o.id}`)
          }}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:border-brand-orange hover:text-brand-orange transition dark:border-slate-600 dark:text-slate-300"
        >
          {t('viewDetails')}
        </button>
      )
    }
  ]

  return (
    <div className="flex flex-col gap-6 mx-auto w-full">

      {/* Incoming order + efficiency */}
      <div className="grid gap-4 xl:grid-cols-[1fr_300px]">
        <div className="flex items-center justify-between gap-4 rounded-xl bg-orange-50 border border-orange-200 px-5 py-4 dark:bg-orange-900/10 dark:border-orange-800/40">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-orange text-white">
              <Bell size={20} />
            </div>
            <div>
              <p className="font-bold text-brand-orange text-base">{t('newIncomingOrder')}</p>
              <p className="text-sm text-gray-600 dark:text-slate-300 mt-0.5">Order #BC-1102 from Cairo Festival City &bull; 3 Items &bull; 680 EGP</p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button className="flex items-center gap-2 rounded-xl bg-brand-orange px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition shadow-sm">
              <CheckCircle size={16} /> {t('accept')}
            </button>
            <button className="flex items-center gap-2 rounded-xl border-2 border-brand-orange px-5 py-2.5 text-sm font-semibold text-brand-orange hover:bg-orange-50 transition dark:hover:bg-orange-900/20">
              <XCircle size={16} /> {t('reject')}
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700 dark:text-slate-200">{t('dailyEfficiency')}</span>
            <span className="text-xl font-bold text-brand-orange">88%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-slate-700 overflow-hidden">
            <div className="h-full rounded-full bg-brand-orange" style={{ width: '88%' }} />
          </div>
          <p className="mt-2.5 text-xs text-gray-400 dark:text-slate-500">{t('avgPrepTime')}: 12.4 min</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-1 min-w-[160px]">
          <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">{t('branch')}</label>
          <select className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-brand-orange dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
            <option>{t('allBranches')}</option>
            <option>Zamalek</option><option>Maadi</option><option>New Cairo</option>
          </select>
        </div>
        <div className="flex flex-col gap-1 min-w-[160px]">
          <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">{t('orderStatus')}</label>
          <select className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-brand-orange dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
            <option>{t('allStatuses')}</option>
            <option>{t('preparing')}</option><option>{t('ready')}</option>
            <option>{t('completed')}</option><option>{t('cancelled')}</option>
          </select>
        </div>
        <div className="flex flex-col gap-1 min-w-[180px]">
          <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">{t('dateRange')}</label>
          <input type="date" defaultValue="2023-10-24"
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-brand-orange dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200" />
        </div>
        <button className="ml-auto flex items-center gap-2 rounded-xl bg-brand-orange px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition shadow-sm">
          {t('applyFilters')}
        </button>
      </div>

      {/* Orders table */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 overflow-hidden">
        <Table
          columns={columns}
          data={orders}
          keyExtractor={(row) => row.id}
          onRowClick={(row) => navigate(`/orders/${row.id.replace('#', '')}`)}
        />
        <Pagination
          currentPage={currentPage}
          totalPages={13}
          onPageChange={setCurrentPage}
          showingText="Showing 1 to 4 of 128 orders"
        />
      </div>
    </div>
  )
}
