import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Bell, CheckCircle, Search, XCircle } from 'lucide-react'
import { Table } from '../../components/common/Table'
import type { Column } from '../../components/common/Table'
import { Pagination } from '../../components/common/Pagination'
import { useOrderStore } from '../../store/orderStore'

function statusPill(status: string) {
  switch (status.toLowerCase()) {
    case 'preparing':  return 'bg-blue-100 text-blue-600 dark:bg-blue-950/20 dark:text-blue-500'
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
    case 'refunded': return 'text-red-500 dark:text-red-500'
    case 'pending':  return 'text-yellow-500 dark:text-yellow-600'
    default:         return 'text-gray-400 dark:text-slate-500'
  }
}


export function OrdersPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [currentPage, setCurrentPage] = useState(1)

  const { orders: liveOrders, historyOrders, historyMeta, isLoading, fetchLiveOrders, fetchHistoryOrders } = useOrderStore()
  const [activeTab, setActiveTab] = useState<'live' | 'history'>('live')

  // History filters — only sent to the API when on the history tab
  const [filterStatus, setFilterStatus]       = useState('')
  const [filterType, setFilterType]           = useState('')
  const [filterFromDate, setFilterFromDate]   = useState('')
  const [filterToDate, setFilterToDate]       = useState('')

  const query = searchParams.get('q') || ''

  const handleSearch = (val: string) => {
    if (val) {
      searchParams.set('q', val)
    } else {
      searchParams.delete('q')
    }
    setSearchParams(searchParams)
    setCurrentPage(1)
  }

  // Fetch live orders on load and poll every minute while the live tab is active
  useEffect(() => {
    if (activeTab !== 'live') return

    fetchLiveOrders(query)

    const intervalId = window.setInterval(() => {
      fetchLiveOrders(query)
    }, 60_000)

    return () => window.clearInterval(intervalId)
  }, [activeTab, fetchLiveOrders, query])

  // Fetch history orders when page, tab, or query changes
  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistoryOrders(currentPage, {
        status:     filterStatus || undefined,
        order_type: filterType || undefined,
        from_date:  filterFromDate || undefined,
        to_date:    filterToDate || undefined,
        search:     query || undefined,
      })
    }
  }, [currentPage, activeTab, query]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleApplyFilters = () => {
    setCurrentPage(1)
    fetchHistoryOrders(1, {
      status:     filterStatus || undefined,
      order_type: filterType || undefined,
      from_date:  filterFromDate || undefined,
      to_date:    filterToDate || undefined,
      search:     query || undefined,
    })
  }

  const handleClearFilters = () => {
    setFilterStatus(''); setFilterType(''); setFilterFromDate(''); setFilterToDate('')
    setCurrentPage(1)
    fetchHistoryOrders(1, { search: query || undefined })
  }

  const orders = activeTab === 'live' ? liveOrders : historyOrders

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
      render: (o) => <span className="capitalize">{(o.order_type || '').replace('_', ' ')}</span>
    },
    {
      header: t('status', 'STATUS'),
      key: 'status',
      render: (o) => (
        <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusPill(o.status)}`}>
          {(o.status || '').replace('_', ' ')}
        </span>
      )
    },
    {
      header: t('payment', 'PAYMENT'),
      key: 'payment',
      render: (o) => {
        const paymentStatus = o.payments?.[0]?.status || 'unpaid'
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
      render: (o) => <span className="font-bold text-gray-800 dark:text-white">{o.financials?.total || 0} EGP</span>
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
          onClick={(e) => { e.stopPropagation(); navigate(`/orders/${o.id}`) }}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:border-brand-orange hover:text-brand-orange transition dark:border-slate-600 dark:text-slate-300"
        >
          {t('viewDetails')}
        </button>
      )
    }
  ]

  const historyFrom = (historyMeta.current_page - 1) * historyMeta.per_page + 1
  const historyTo   = Math.min(historyMeta.current_page * historyMeta.per_page, historyMeta.total)

  return (
    <div className="flex flex-col gap-6 mx-auto w-full">

      <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('nav_orders')}</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{t('ordersSub')}</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder={t('searchOrders', 'Search orders by customer, phone, or ID...')}
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full max-w-md ps-10 pe-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-slate-700 pb-0">
        <button
          onClick={() => { setActiveTab('live'); setCurrentPage(1) }}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'live'
              ? 'text-brand-orange border-brand-orange'
              : 'text-gray-500 border-transparent hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          {t('liveOrders', 'Live Orders')}
        </button>
        <button
          onClick={() => { setActiveTab('history'); setCurrentPage(1) }}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'history'
              ? 'text-brand-orange border-brand-orange'
              : 'text-gray-500 border-transparent hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          {t('orderHistory', 'Order History')}
        </button>
      </div>

      {/* History Filters — only shown on the History tab */}
      {activeTab === 'history' && (
        <div className="flex flex-wrap items-end gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          {/* Status */}
          <div className="flex flex-col gap-1 min-w-[150px]">
            <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">{t('orderStatus', 'Status')}</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-brand-orange dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="">{t('allStatuses', 'All Statuses')}</option>
              <option value="pending">{t('pending')}</option>
              <option value="preparing">{t('preparing')}</option>
              <option value="ready">{t('ready')}</option>
              <option value="completed">{t('completed')}</option>
              <option value="cancelled">{t('cancelled')}</option>
            </select>
          </div>

          {/* Order Type */}
          <div className="flex flex-col gap-1 min-w-[150px]">
            <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">{t('type', 'Order Type')}</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-brand-orange dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="">{t('allTypes', 'All Types')}</option>
              <option value="delivery">{t('delivery', 'Delivery')}</option>
              <option value="pickup">{t('pickup', 'Pickup')}</option>
            </select>
          </div>

          {/* From Date */}
          <div className="flex flex-col gap-1 min-w-[160px]">
            <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">{t('fromDate', 'From Date')}</label>
            <input
              type="date"
              value={filterFromDate}
              onChange={(e) => setFilterFromDate(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-brand-orange dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            />
          </div>

          {/* To Date */}
          <div className="flex flex-col gap-1 min-w-[160px]">
            <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">{t('toDate', 'To Date')}</label>
            <input
              type="date"
              value={filterToDate}
              onChange={(e) => setFilterToDate(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-brand-orange dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="flex gap-2 ml-auto">
            <button
              onClick={handleClearFilters}
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:border-gray-300 transition dark:border-slate-600 dark:text-slate-300"
            >
              {t('clear', 'Clear')}
            </button>
            <button
              onClick={handleApplyFilters}
              className="flex items-center gap-2 rounded-xl bg-brand-orange px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition shadow-sm"
            >
              {t('applyFilters', 'Apply Filters')}
            </button>
          </div>
        </div>
      )}

      {/* Orders table */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <span className="h-8 w-8 animate-spin rounded-full border-4 border-brand-orange border-t-transparent" />
          </div>
        ) : (
          <Table
            columns={columns}
            data={orders}
            keyExtractor={(row) => row.id}
            onRowClick={(row) => navigate(`/orders/${row.id}`)}
          />
        )}

        {/* Only show pagination for history orders */}
        {orders.length > 0 && activeTab === 'history' && (
          <Pagination
            currentPage={historyMeta.current_page}
            totalPages={historyMeta.last_page}
            onPageChange={setCurrentPage}
            showingText={`Showing ${historyFrom} to ${historyTo} of ${historyMeta.total} orders`}
          />
        )}
      </div>
    </div>
  )
}
