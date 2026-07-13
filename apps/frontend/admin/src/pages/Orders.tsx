import { useState } from 'react'
import { useLocale } from '../contexts/LocaleContext'
import { PageHeader } from '../components/PageHeader'
import { SearchBar } from '../components/SearchBar'
import { FilterBar } from '../components/FilterBar'
import { DataTable, type Column } from '../components/DataTable'
import { PaginationUI } from '../components/PaginationUI'
import { Modal } from '../components/Modal'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { StatusBadge } from '../components/StatusBadge'
import { StatCard } from '../components/StatCard'

interface Order {
  id: string
  orderId: string
  customer: string
  restaurant: string
  items: string
  total: string
  status: string
  time: string
  paymentMethod: string
  deliveryAddress: string
  notes: string
}

const ORDERS: Order[] = [
  { id: '1', orderId: '#BC-9841', customer: 'Ahmed Ramadan', restaurant: 'Burger House', items: 'Burger + Fries', total: '$24.50', status: 'delivered', time: '2 min ago', paymentMethod: 'Credit Card', deliveryAddress: '12 Tahrir St, Cairo', notes: 'Extra ketchup' },
  { id: '2', orderId: '#BC-9840', customer: 'Sara El-Sayed', restaurant: 'Green Bowl', items: 'Grilled Chicken Wrap', total: '$18.00', status: 'processing', time: '8 min ago', paymentMethod: 'Wallet', deliveryAddress: '45 Nile Ave, Cairo', notes: '' },
  { id: '3', orderId: '#BC-9839', customer: 'Omar Farouk', restaurant: 'Pizza Roma', items: 'Pizza Margherita x2', total: '$32.00', status: 'pending', time: '15 min ago', paymentMethod: 'Cash', deliveryAddress: '78 Corniche St, Alexandria', notes: 'Ring doorbell' },
  { id: '4', orderId: '#BC-9838', customer: 'Nada Hassan', restaurant: 'Spice Kitchen', items: 'Caesar Salad + Juice', total: '$14.75', status: 'delivered', time: '22 min ago', paymentMethod: 'Debit Card', deliveryAddress: '23 Nile St, Giza', notes: '' },
  { id: '5', orderId: '#BC-9837', customer: 'Khaled Ibrahim', restaurant: 'Sushi Master', items: 'Steak Plate', total: '$45.00', status: 'cancelled', time: '35 min ago', paymentMethod: 'Credit Card', deliveryAddress: '56 Zamalek, Cairo', notes: 'Canceled by user' },
  { id: '6', orderId: '#BC-9836', customer: 'Mona Sherif', restaurant: 'Le Petit Bistro', items: 'Sushi Platter', total: '$52.00', status: 'delivered', time: '1 hr ago', paymentMethod: 'Wallet', deliveryAddress: '34 Haram St, Giza', notes: '' },
  { id: '7', orderId: '#BC-9835', customer: 'Yousef Mahmoud', restaurant: 'Tacos El Rey', items: 'Vegan Bowl + Smoothie', total: '$20.00', status: 'processing', time: '1 hr ago', paymentMethod: 'Cash', deliveryAddress: '89 Maadi, Cairo', notes: 'No onions' },
  { id: '8', orderId: '#BC-9834', customer: 'Layla Ahmed', restaurant: 'Burger House', items: 'Double Cheeseburger', total: '$15.50', status: 'refunded', time: '2 hr ago', paymentMethod: 'Credit Card', deliveryAddress: '12 Tahrir St, Cairo', notes: 'Wrong item delivered' },
]

const PAGE_SIZE = 5

export function OrdersPage() {
  const { t } = useLocale()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [sortKey, setSortKey] = useState('time')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [showDetails, setShowDetails] = useState<Order | null>(null)
  const [showCancel, setShowCancel] = useState<Order | null>(null)
  const [showUpdateStatus, setShowUpdateStatus] = useState<Order | null>(null)

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
  }

  let filtered = ORDERS.filter((o) => {
    const q = search.toLowerCase()
    return o.orderId.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q) || o.restaurant.toLowerCase().includes(q)
      && (!statusFilter || o.status === statusFilter)
  })

  filtered.sort((a, b) => {
    const cmp = a[sortKey as keyof Order]!.localeCompare(b[sortKey as keyof Order]!)
    return sortDir === 'asc' ? cmp : -cmp
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const columns: Column<Order>[] = [
    { key: 'orderId', label: t('orders.fields.orderId'), sortable: true },
    { key: 'customer', label: t('orders.fields.customer'), sortable: true },
    { key: 'restaurant', label: t('orders.fields.restaurant'), sortable: true },
    { key: 'items', label: t('orders.fields.items') },
    { key: 'total', label: t('orders.fields.total'), sortable: true },
    { key: 'status', label: t('common.status'), sortable: true, render: (o) => <StatusBadge status={o.status} /> },
    { key: 'time', label: t('orders.fields.time'), sortable: true },
    { key: 'id', label: t('common.actions'), render: (o) => (
      <div className="action-btns">
        <button className="btn btn-sm btn-outline" onClick={(e) => { e.stopPropagation(); setShowDetails(o) }}>{t('common.view')}</button>
        {o.status === 'pending' && <button className="btn btn-sm btn-primary" onClick={(e) => { e.stopPropagation(); setShowUpdateStatus(o) }}>{t('orders.updateStatus')}</button>}
        {(o.status === 'pending' || o.status === 'processing') && <button className="btn btn-sm btn-danger" onClick={(e) => { e.stopPropagation(); setShowCancel(o) }}>{t('orders.cancelOrder')}</button>}
      </div>
    ) },
  ]

  return (
    <div className="page-content">
      <PageHeader title={t('orders.title')} subtitle={t('orders.subtitle')} />

      <div className="stats-grid">
        <StatCard label={t('orders.totalOrders')} value="8" change="+12" direction="up" icon="📦" iconBg="var(--info-bg)" />
        <StatCard label={t('orders.pendingOrders')} value="1" change="" icon="⏳" iconBg="var(--warning-bg)" />
        <StatCard label={t('orders.processingOrders')} value="2" change="" icon="⚙️" iconBg="var(--info-bg)" />
        <StatCard label={t('orders.deliveredOrders')} value="3" change="" icon="✅" iconBg="var(--success-bg)" />
      </div>

      <div className="card">
        <div className="card-header">
          <div className="toolbar">
            <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1) }} />
            <FilterBar
              filters={[{
                label: t('common.status'), value: statusFilter, options: [
                  { label: t('orders.statuses.pending'), value: 'pending' },
                  { label: t('orders.statuses.processing'), value: 'processing' },
                  { label: t('orders.statuses.delivered'), value: 'delivered' },
                  { label: t('orders.statuses.cancelled'), value: 'cancelled' },
                  { label: t('orders.statuses.refunded'), value: 'refunded' },
                ], onChange: (v) => { setStatusFilter(v); setPage(1) },
              }]}
              onClear={() => { setStatusFilter(''); setPage(1) }}
            />
          </div>
        </div>
        <DataTable columns={columns} data={paged} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} onRowClick={(o) => setShowDetails(o)} />
        <PaginationUI currentPage={page} totalPages={totalPages} totalItems={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
      </div>

      <Modal open={!!showDetails} onClose={() => setShowDetails(null)} title={t('orders.orderDetails')} size="lg">
        {showDetails && (
          <div className="details-grid">
            <div className="details-field"><span className="details-label">{t('orders.fields.orderId')}</span><span>{showDetails.orderId}</span></div>
            <div className="details-field"><span className="details-label">{t('orders.fields.customer')}</span><span>{showDetails.customer}</span></div>
            <div className="details-field"><span className="details-label">{t('orders.fields.restaurant')}</span><span>{showDetails.restaurant}</span></div>
            <div className="details-field"><span className="details-label">{t('orders.fields.items')}</span><span>{showDetails.items}</span></div>
            <div className="details-field"><span className="details-label">{t('orders.fields.total')}</span><span>{showDetails.total}</span></div>
            <div className="details-field"><span className="details-label">{t('common.status')}</span><span><StatusBadge status={showDetails.status} /></span></div>
            <div className="details-field"><span className="details-label">{t('orders.fields.time')}</span><span>{showDetails.time}</span></div>
            <div className="details-field"><span className="details-label">{t('orders.fields.paymentMethod')}</span><span>{showDetails.paymentMethod}</span></div>
            <div className="details-field"><span className="details-label">{t('orders.fields.deliveryAddress')}</span><span>{showDetails.deliveryAddress}</span></div>
            <div className="details-field"><span className="details-label">{t('orders.fields.notes')}</span><span>{showDetails.notes || '—'}</span></div>
          </div>
        )}
      </Modal>

      <Modal open={!!showUpdateStatus} onClose={() => setShowUpdateStatus(null)} title={t('orders.updateStatus')} size="sm">
        {showUpdateStatus && (
          <>
            <p style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>{t('orders.fields.orderId')}: {showUpdateStatus.orderId}</p>
            <div className="form-group">
              <label className="form-label">{t('common.status')}</label>
              <select className="form-input">
                <option value="pending">{t('orders.statuses.pending')}</option>
                <option value="processing">{t('orders.statuses.processing')}</option>
                <option value="delivered">{t('orders.statuses.delivered')}</option>
                <option value="cancelled">{t('orders.statuses.cancelled')}</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowUpdateStatus(null)}>{t('common.cancel')}</button>
              <button className="btn btn-primary" onClick={() => setShowUpdateStatus(null)}>{t('common.save')}</button>
            </div>
          </>
        )}
      </Modal>

      <ConfirmDialog
        open={!!showCancel}
        title={t('orders.cancelOrder')}
        message={`${t('common.confirmDelete')} (${showCancel?.orderId})`}
        onConfirm={() => setShowCancel(null)}
        onCancel={() => setShowCancel(null)}
      />
    </div>
  )
}
