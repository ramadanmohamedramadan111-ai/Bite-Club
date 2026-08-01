import { useState, useEffect } from 'react'
import { useLocale } from '../contexts/LocaleContext'
import { PageHeader } from '../components/PageHeader'
import { SearchBar } from '../components/SearchBar'
import { FilterBar } from '../components/FilterBar'
import { DataTable, type Column } from '../components/DataTable'
import { PaginationUI } from '../components/PaginationUI'
import { Modal } from '../components/Modal'
import { StatusBadge } from '../components/StatusBadge'
import { StatsGrid } from '../components/StatsGrid'
import { ActionButtons } from '../components/ActionButtons'
import { AlertBanner } from '../components/AlertBanner'
import { LoadingState } from '../components/LoadingState'
import api from '../lib/api'

interface Order {
  id: number
  status: string
  order_type: string
  subtotal: number
  delivery_fee: number
  service_fee: number
  total: number
  created_at: string | null
  user: {
    id: number
    first_name: string
    last_name: string
    email: string
  } | null
  restaurant: {
    id: number
    name: string
  } | null
}

interface OrderDetail {
  id: number
  status: string
  order_type: string
  subtotal: number
  delivery_fee: number
  service_fee: number
  total: number
  created_at: string | null
  updated_at: string | null
  user: {
    id: number
    username: string
    first_name: string
    last_name: string
    email: string
    phone_number: string | null
  } | null
  restaurant: {
    id: number
    name: string
    email: string
    phone_number: string | null
    address: string
  } | null
  items: {
    id: number
    item_id: number
    item_name: string
    quantity: number
    price: number
    total_price: number
    notes: string | null
  }[]
  payments: {
    id: number
    payment_type: string
    payment_method: string
    amount: number
    status: string
    transaction_id: string | null
  }[]
}

const FRONTEND_PAGE_SIZE = 5
const BACKEND_PAGE_SIZE = 15

export function OrdersPage() {
  const { t } = useLocale()
  
  // State variables
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [validationError, setValidationError] = useState('')
  
  // Filters & Pagination
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [periodFilter, setPeriodFilter] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  
  const [frontendPage, setFrontendPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  // Sorting
  const [sortKey, setSortKey] = useState('created_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  
  // Statistics
  const [stats, setStats] = useState({
    total_orders: 0,
    pending_orders: 0,
    processing_orders: 0,
    completed_orders: 0,
    cancelled_orders: 0,
  })

  // Modals & Details
  const [showDetails, setShowDetails] = useState<OrderDetail | null>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)

  // Calculate backend page based on current frontend page
  const backendPage = Math.ceil((frontendPage * FRONTEND_PAGE_SIZE) / BACKEND_PAGE_SIZE)

  // API Call: Fetch orders
  const fetchOrders = async () => {
    setLoading(true)
    setError('')
    setValidationError('')

    // Client-side validations
    if (search.length > 255) {
      setValidationError('Search query cannot exceed 255 characters.')
      setLoading(false)
      return
    }

    if (fromDate && toDate) {
      const from = new Date(fromDate)
      const to = new Date(toDate)
      if (to < from) {
        setValidationError('To Date must be after or equal to From Date.')
        setLoading(false)
        return
      }
    }

    try {
      const params: any = {
        page: backendPage,
      }
      if (search.trim()) params.search = search.trim()
      if (statusFilter) params.status = statusFilter
      if (periodFilter) params.period = periodFilter
      if (fromDate) params.from = fromDate
      if (toDate) params.to = toDate

      const res = await api.get('/admin/orders', { params })
      const payload = res.data?.data || res.data || {}
      
      const statistics = payload.statistics || {}
      const ordersData = payload.orders || {}
      const rawItems = ordersData.data || []
      const meta = ordersData.meta || {}

      setOrders(rawItems)
      setTotalItems(meta.total ?? rawItems.length)
      
      setStats({
        total_orders: statistics.total_orders ?? 0,
        pending_orders: statistics.pending_orders ?? 0,
        processing_orders: statistics.processing_orders ?? 0,
        completed_orders: statistics.completed_orders ?? 0,
        cancelled_orders: statistics.cancelled_orders ?? 0,
      })
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || 'Failed to fetch orders.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [backendPage, statusFilter, periodFilter, fromDate, toDate, search])

  // Reset pagination on filter or search changes
  const handleSearchChange = (v: string) => {
    setSearch(v)
    setFrontendPage(1)
  }

  const handleStatusChange = (v: string) => {
    setStatusFilter(v)
    setFrontendPage(1)
  }

  const handlePeriodChange = (v: string) => {
    setPeriodFilter(v)
    setFromDate('')
    setToDate('')
    setFrontendPage(1)
  }

  const handleFromDateChange = (v: string) => {
    setFromDate(v)
    setPeriodFilter('')
    setFrontendPage(1)
  }

  const handleToDateChange = (v: string) => {
    setToDate(v)
    setPeriodFilter('')
    setFrontendPage(1)
  }

  const handleClearFilters = () => {
    setStatusFilter('')
    setPeriodFilter('')
    setFromDate('')
    setToDate('')
    setFrontendPage(1)
  }

  // API Call: Fetch single order details
  const handleOpenDetails = async (orderId: number) => {
    setLoadingDetails(true)
    setError('')
    try {
      const res = await api.get(`/admin/orders/${orderId}`)
      const payload = res.data?.data || res.data || null
      setShowDetails(payload)
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || 'Failed to fetch order details.')
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
  }

  // Apply sorting locally on loaded orders
  const sortedOrders = [...orders].sort((a, b) => {
    let aVal: any = a[sortKey as keyof Order]
    let bVal: any = b[sortKey as keyof Order]
    
    if (sortKey === 'customer') {
      aVal = a.user ? `${a.user.first_name} ${a.user.last_name}` : ''
      bVal = b.user ? `${b.user.first_name} ${b.user.last_name}` : ''
    } else if (sortKey === 'restaurant') {
      aVal = a.restaurant?.name || ''
      bVal = b.restaurant?.name || ''
    }

    if (typeof aVal === 'string') {
      return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    }
    if (typeof aVal === 'number') {
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal
    }
    return 0
  })

  // Slicing offset within backend returned block
  const offset = ((frontendPage - 1) * FRONTEND_PAGE_SIZE) % BACKEND_PAGE_SIZE
  const pagedOrders = sortedOrders.slice(offset, offset + FRONTEND_PAGE_SIZE)
  const totalPages = Math.ceil(totalItems / FRONTEND_PAGE_SIZE)

  const columns: Column<Order>[] = [
    { key: 'id', label: t('orders.fields.orderId'), sortable: true, render: (o) => `#BC-${o.id}` },
    { key: 'customer', label: t('orders.fields.customer'), sortable: true, render: (o) => o.user ? `${o.user.first_name} ${o.user.last_name}` : '—' },
    { key: 'restaurant', label: t('orders.fields.restaurant'), sortable: true, render: (o) => o.restaurant?.name || '—' },
    { key: 'order_type', label: t('orders.orderType'), sortable: true, render: (o) => o.order_type.toUpperCase() },
    { key: 'total', label: t('orders.fields.total'), sortable: true, render: (o) => `$${o.total.toFixed(2)}` },
    { key: 'status', label: t('common.status'), sortable: true, render: (o) => <StatusBadge status={o.status} /> },
    { key: 'created_at', label: t('orders.fields.time'), sortable: true, render: (o) => o.created_at ? new Date(o.created_at).toLocaleString() : '—' },
    { key: 'id', label: t('common.actions'), render: (o) => (
      <ActionButtons actions={[
        { label: t('common.view'), onClick: () => handleOpenDetails(o.id), disabled: loadingDetails },
      ]} />
    ) },
  ]

  return (
    <div className="page-content">
      <PageHeader title={t('orders.title')} subtitle={t('orders.subtitle')} />

      {error && <AlertBanner variant="danger" message={error} />}
      {validationError && <AlertBanner variant="warning" message={validationError} />}

      <StatsGrid cards={[
        { label: t('orders.totalOrders'), value: stats.total_orders.toString(), change: '', icon: '📦', iconBg: 'var(--info-bg)' },
        { label: t('orders.pendingOrders'), value: stats.pending_orders.toString(), change: '', icon: '⏳', iconBg: 'var(--warning-bg)' },
        { label: t('orders.processingOrders'), value: stats.processing_orders.toString(), change: '', icon: '⚙️', iconBg: 'var(--info-bg)' },
        { label: t('orders.deliveredOrders'), value: stats.completed_orders.toString(), change: '', icon: '✅', iconBg: 'var(--success-bg)' },
      ]} />

      <div className="card">
        <div className="card-header">
          <div className="toolbar" style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '16px', flexWrap: 'wrap' }}>
              <SearchBar value={search} onChange={handleSearchChange} />
              <FilterBar
                filters={[
                  {
                    label: t('common.status'), value: statusFilter, options: [
                      { label: t('orders.statuses.awaiting_payment'), value: 'awaiting_payment' },
                      { label: t('orders.statuses.pending'), value: 'pending' },
                      { label: t('orders.statuses.preparing'), value: 'preparing' },
                      { label: t('orders.statuses.ready'), value: 'ready' },
                      { label: t('orders.statuses.out_for_delivery'), value: 'out_for_delivery' },
                      { label: t('orders.statuses.completed'), value: 'completed' },
                      { label: t('orders.statuses.cancelled'), value: 'cancelled' },
                    ], onChange: handleStatusChange,
                  },
                  {
                    label: 'Period', value: periodFilter, options: [
                      { label: 'Today', value: 'today' },
                      { label: 'This Week', value: 'week' },
                      { label: 'This Month', value: 'month' },
                    ], onChange: handlePeriodChange,
                  }
                ]}
                onClear={handleClearFilters}
              />
            </div>
            
            <div className="date-range">
              <span className="date-range-label">Date Range:</span>
              <input
                type="date"
                className="date-range-input"
                value={fromDate}
                onChange={(e) => handleFromDateChange(e.target.value)}
              />
              <span className="date-range-separator">to</span>
              <input
                type="date"
                className="date-range-input"
                value={toDate}
                onChange={(e) => handleToDateChange(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        {loading ? (
          <LoadingState message={t('common.loading')} />
        ) : (
          <>
            <DataTable columns={columns} data={pagedOrders} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} onRowClick={(o) => handleOpenDetails(o.id)} emptyTitle="No orders found" />
            <PaginationUI currentPage={frontendPage} totalPages={totalPages} totalItems={totalItems} pageSize={FRONTEND_PAGE_SIZE} onPageChange={setFrontendPage} />
          </>
        )}
      </div>

      <Modal open={!!showDetails} onClose={() => setShowDetails(null)} title={t('orders.orderDetails')} size="lg">
        {showDetails && (
          <div className="order-details-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'var(--sans)' }}>
            
            {/* Top Summary Banner */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px',
              background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-elevated) 100%)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-sm)',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: '700', letterSpacing: '-0.02em', margin: 0 }}>#BC-{showDetails.id}</h2>
                  <StatusBadge status={showDetails.status} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.9rem', flexWrap: 'wrap' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <span>{showDetails.created_at ? new Date(showDetails.created_at).toLocaleString() : '—'}</span>
                  <span style={{ margin: '0 4px', color: 'var(--text-muted)' }}>•</span>
                  <span style={{ fontWeight: '500' }}>{showDetails.order_type.toUpperCase()}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em' }}>{t('orders.fields.total')}</span>
                <span style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--brand-primary)' }}>${showDetails.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Customer & Restaurant Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              {/* Customer Info Card */}
              <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius)',
                padding: '20px',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'var(--info-bg)',
                    color: 'var(--info)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>{t('orders.customerInfo')}</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.95rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{t('orders.fields.customer')}</span>
                    <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
                      {showDetails.user ? `${showDetails.user.first_name} ${showDetails.user.last_name}` : '—'}
                      {showDetails.user && <small style={{ color: 'var(--text-secondary)', marginLeft: '6px' }}>@{showDetails.user.username}</small>}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{t('users.fields.email')}</span>
                    <span style={{ fontWeight: '500', color: 'var(--text-primary)', fontFamily: 'var(--mono)', fontSize: '0.85rem' }}>{showDetails.user?.email || '—'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{t('users.fields.phone')}</span>
                    <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{showDetails.user?.phone_number || '—'}</span>
                  </div>
                </div>
              </div>

              {/* Restaurant Info Card */}
              <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius)',
                padding: '20px',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'var(--warning-bg)',
                    color: 'var(--warning)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v4"/><path d="M9 2v4"/><path d="M17 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v3c0 2.5 1.5 5 5 5Z"/><path d="M11 15v7"/></svg>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>{t('orders.restaurantInfo')}</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.95rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{t('orders.fields.restaurant')}</span>
                    <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{showDetails.restaurant?.name || '—'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{t('restaurants.fields.email')}</span>
                    <span style={{ fontWeight: '500', color: 'var(--text-primary)', fontFamily: 'var(--mono)', fontSize: '0.85rem' }}>{showDetails.restaurant?.email || '—'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{t('restaurants.fields.phone')}</span>
                    <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{showDetails.restaurant?.phone_number || '—'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{t('restaurants.fields.address')}</span>
                    <span style={{ fontWeight: '500', color: 'var(--text-primary)', textAlign: 'right', maxWidth: '200px', fontSize: '0.9rem' }}>{showDetails.restaurant?.address || '—'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table Card */}
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius)',
              padding: '20px',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>{t('orders.fields.items')}</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <th style={{ padding: '12px 8px 12px 0', fontWeight: '600' }}>{t('orders.fields.items')}</th>
                      <th style={{ padding: '12px 8px', fontWeight: '600', textAlign: 'center', width: '80px' }}>Qty</th>
                      <th style={{ padding: '12px 8px', fontWeight: '600', textAlign: 'right', width: '120px' }}>Price</th>
                      <th style={{ padding: '12px 0 12px 8px', fontWeight: '600', textAlign: 'right', width: '120px' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {showDetails.items.map((item, index) => (
                      <tr key={item.id} style={{ borderBottom: index === showDetails.items.length - 1 ? 'none' : '1px solid var(--border-subtle)', fontSize: '0.95rem' }}>
                        <td style={{ padding: '16px 8px 16px 0' }}>
                          <div style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>{item.item_name}</div>
                          {item.notes && (
                            <div style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: 'var(--warning-bg)',
                              color: 'var(--warning)',
                              fontSize: '0.8rem',
                              padding: '4px 8px',
                              borderRadius: 'var(--radius-sm)',
                              marginTop: '4px'
                            }}>
                              <span style={{ fontWeight: 'bold' }}>Note:</span> {item.notes}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '16px 8px', textAlign: 'center', fontWeight: '700', color: 'var(--brand-primary)' }}>
                          x{item.quantity}
                        </td>
                        <td style={{ padding: '16px 8px', textAlign: 'right', color: 'var(--text-secondary)' }}>
                          ${item.price.toFixed(2)}
                        </td>
                        <td style={{ padding: '16px 0 16px 8px', textAlign: 'right', fontWeight: '600', color: 'var(--text-primary)' }}>
                          ${item.total_price.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment & Receipt Summary */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              {/* Payment Details Card */}
              <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius)',
                padding: '20px',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'var(--success-bg)',
                      color: 'var(--success)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" rx="2" x="2" y="5"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                    </div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>{t('orders.paymentInfo')}</h3>
                  </div>
                  {showDetails.payments && showDetails.payments.length > 0 ? (
                    showDetails.payments.map((p) => (
                      <div key={p.id} style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.95rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>{t('payments.fields.method')}</span>
                          <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{p.payment_method.toUpperCase()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>{t('payments.fields.transactionId')}</span>
                          <span style={{ fontWeight: '500', fontFamily: 'var(--mono)', fontSize: '0.85rem', color: 'var(--text-primary)' }}>{p.transaction_id || '—'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>{t('common.status')}</span>
                          <StatusBadge status={p.status} />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', padding: '10px 0', textAlign: 'center' }}>
                      No transactions recorded.
                    </div>
                  )}
                </div>
              </div>

              {/* Receipt Summary Card */}
              <div style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: '20px',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                    <span>{t('orders.subtotal')}</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>${showDetails.subtotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                    <span>{t('orders.deliveryFee')}</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>${showDetails.delivery_fee.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                    <span>{t('orders.serviceFee')}</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>${showDetails.service_fee.toFixed(2)}</span>
                  </div>
                  
                  {/* Decorative dashed line */}
                  <div style={{ borderTop: '1px dashed var(--border)', margin: '10px 0' }}></div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--text-primary)' }}>{t('orders.fields.total')}</span>
                    <span style={{ fontWeight: '800', fontSize: '1.5rem', color: 'var(--brand-primary)' }}>${showDetails.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </Modal>
    </div>
  )
}
