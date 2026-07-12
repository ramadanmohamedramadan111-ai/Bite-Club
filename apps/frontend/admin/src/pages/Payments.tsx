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

interface Payment {
  id: string
  transactionId: string
  orderId: string
  customer: string
  amount: string
  method: string
  status: string
  date: string
  fee: string
  netAmount: string
}

const PAYMENTS: Payment[] = [
  { id: '1', transactionId: 'TXN-001', orderId: '#BC-9841', customer: 'Ahmed Ramadan', amount: '$24.50', method: 'creditCard', status: 'completed', date: '2026-07-12 14:30', fee: '$0.73', netAmount: '$23.77' },
  { id: '2', transactionId: 'TXN-002', orderId: '#BC-9840', customer: 'Sara El-Sayed', amount: '$18.00', method: 'wallet', status: 'completed', date: '2026-07-12 14:22', fee: '$0.00', netAmount: '$18.00' },
  { id: '3', transactionId: 'TXN-003', orderId: '#BC-9839', customer: 'Omar Farouk', amount: '$32.00', method: 'cash', status: 'pending', date: '2026-07-12 14:15', fee: '$0.00', netAmount: '$32.00' },
  { id: '4', transactionId: 'TXN-004', orderId: '#BC-9838', customer: 'Nada Hassan', amount: '$14.75', method: 'debitCard', status: 'completed', date: '2026-07-12 14:08', fee: '$0.44', netAmount: '$14.31' },
  { id: '5', transactionId: 'TXN-005', orderId: '#BC-9837', customer: 'Khaled Ibrahim', amount: '$45.00', method: 'creditCard', status: 'refunded', date: '2026-07-12 13:55', fee: '$1.35', netAmount: '$43.65' },
  { id: '6', transactionId: 'TXN-006', orderId: '#BC-9836', customer: 'Mona Sherif', amount: '$52.00', method: 'wallet', status: 'completed', date: '2026-07-12 13:30', fee: '$0.00', netAmount: '$52.00' },
  { id: '7', transactionId: 'TXN-007', orderId: '#BC-9835', customer: 'Yousef Mahmoud', amount: '$20.00', method: 'cash', status: 'completed', date: '2026-07-12 13:00', fee: '$0.00', netAmount: '$20.00' },
  { id: '8', transactionId: 'TXN-008', orderId: '#BC-9834', customer: 'Layla Ahmed', amount: '$15.50', method: 'creditCard', status: 'failed', date: '2026-07-12 12:30', fee: '$0.00', netAmount: '$0.00' },
]

const PAGE_SIZE = 5

export function PaymentsPage() {
  const { t } = useLocale()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [methodFilter, setMethodFilter] = useState('')
  const [page, setPage] = useState(1)
  const [showDetails, setShowDetails] = useState<Payment | null>(null)
  const [showRefund, setShowRefund] = useState<Payment | null>(null)

  const methodLabels: Record<string, string> = {
    creditCard: t('payments.methods.creditCard'),
    debitCard: t('payments.methods.debitCard'),
    cash: t('payments.methods.cash'),
    wallet: t('payments.methods.wallet'),
  }

  let filtered = PAYMENTS.filter((p) => {
    const q = search.toLowerCase()
    return (p.transactionId.toLowerCase().includes(q) || p.customer.toLowerCase().includes(q) || p.orderId.toLowerCase().includes(q)) &&
      (!statusFilter || p.status === statusFilter) &&
      (!methodFilter || p.method === methodFilter)
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const columns: Column<Payment>[] = [
    { key: 'transactionId', label: t('payments.fields.transactionId'), sortable: true },
    { key: 'orderId', label: t('payments.fields.orderId'), sortable: true },
    { key: 'customer', label: t('payments.fields.customer'), sortable: true },
    { key: 'amount', label: t('payments.fields.amount'), sortable: true },
    { key: 'method', label: t('payments.fields.method'), sortable: true, render: (p) => methodLabels[p.method] || p.method },
    { key: 'status', label: t('common.status'), sortable: true, render: (p) => <StatusBadge status={p.status} /> },
    { key: 'date', label: t('payments.fields.date'), sortable: true },
    { key: 'id', label: t('common.actions'), render: (p) => (
      <div className="action-btns">
        <button className="btn btn-sm btn-outline" onClick={(e) => { e.stopPropagation(); setShowDetails(p) }}>{t('common.view')}</button>
        {p.status === 'completed' && <button className="btn btn-sm btn-warning" onClick={(e) => { e.stopPropagation(); setShowRefund(p) }}>{t('payments.refund')}</button>}
      </div>
    ) },
  ]

  return (
    <div className="page-content">
      <PageHeader title={t('payments.title')} subtitle={t('payments.subtitle')} />

      <div className="stats-grid">
        <StatCard label={t('payments.totalRevenue')} value="$206.75" change="+15.3%" direction="up" icon="💰" iconBg="var(--success-bg)" />
        <StatCard label={t('payments.successfulPayments')} value="5" change="" icon="✅" iconBg="var(--success-bg)" />
        <StatCard label={t('payments.failedPayments')} value="1" change="" icon="❌" iconBg="var(--danger-bg)" />
        <StatCard label={t('payments.refundedPayments')} value="1" change="" icon="↩️" iconBg="var(--warning-bg)" />
      </div>

      <div className="card">
        <div className="card-header">
          <div className="toolbar">
            <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1) }} />
            <FilterBar
              filters={[
                { label: t('common.status'), value: statusFilter, options: [
                  { label: t('payments.statuses.completed'), value: 'completed' },
                  { label: t('payments.statuses.failed'), value: 'failed' },
                  { label: t('payments.statuses.refunded'), value: 'refunded' },
                  { label: t('payments.statuses.pending'), value: 'pending' },
                ], onChange: (v) => { setStatusFilter(v); setPage(1) } },
                { label: t('payments.fields.method'), value: methodFilter, options: [
                  { label: t('payments.methods.creditCard'), value: 'creditCard' },
                  { label: t('payments.methods.debitCard'), value: 'debitCard' },
                  { label: t('payments.methods.cash'), value: 'cash' },
                  { label: t('payments.methods.wallet'), value: 'wallet' },
                ], onChange: (v) => { setMethodFilter(v); setPage(1) } },
              ]}
              onClear={() => { setStatusFilter(''); setMethodFilter(''); setPage(1) }}
            />
          </div>
        </div>
        <DataTable columns={columns} data={paged} onRowClick={(p) => setShowDetails(p)} />
        <PaginationUI currentPage={page} totalPages={totalPages} totalItems={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
      </div>

      <Modal open={!!showDetails} onClose={() => setShowDetails(null)} title={t('payments.paymentDetails')} size="md">
        {showDetails && (
          <div className="details-grid">
            <div className="details-field"><span className="details-label">{t('payments.fields.transactionId')}</span><span>{showDetails.transactionId}</span></div>
            <div className="details-field"><span className="details-label">{t('payments.fields.orderId')}</span><span>{showDetails.orderId}</span></div>
            <div className="details-field"><span className="details-label">{t('payments.fields.customer')}</span><span>{showDetails.customer}</span></div>
            <div className="details-field"><span className="details-label">{t('payments.fields.amount')}</span><span>{showDetails.amount}</span></div>
            <div className="details-field"><span className="details-label">{t('payments.fields.method')}</span><span>{methodLabels[showDetails.method]}</span></div>
            <div className="details-field"><span className="details-label">{t('common.status')}</span><span><StatusBadge status={showDetails.status} /></span></div>
            <div className="details-field"><span className="details-label">{t('payments.fields.fee')}</span><span>{showDetails.fee}</span></div>
            <div className="details-field"><span className="details-label">{t('payments.fields.netAmount')}</span><span>{showDetails.netAmount}</span></div>
            <div className="details-field"><span className="details-label">{t('payments.fields.date')}</span><span>{showDetails.date}</span></div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!showRefund}
        title={t('payments.refund')}
        message={`${t('payments.confirmRefund')} (${showRefund?.transactionId})`}
        variant="warning"
        confirmLabel={t('payments.refund')}
        onConfirm={() => setShowRefund(null)}
        onCancel={() => setShowRefund(null)}
      />
    </div>
  )
}
