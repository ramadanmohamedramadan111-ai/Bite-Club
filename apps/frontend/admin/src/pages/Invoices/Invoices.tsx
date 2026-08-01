import './Invoices.css';
import { useState, useEffect } from 'react'
import { useLocale } from '../../contexts/LocaleContext'
import { PageHeader } from '../../components/PageHeader'
import { DataTable, type Column } from '../../components/DataTable'
import { PaginationUI } from '../../components/PaginationUI'
import { Modal } from '../../components/Modal'
import { StatusBadge } from '../../components/StatusBadge'
import { StatsGrid } from '../../components/StatsGrid'
import { ActionButtons } from '../../components/ActionButtons'
import { AlertBanner } from '../../components/AlertBanner'
import { LoadingState } from '../../components/LoadingState'
import { FilterBar } from '../../components/FilterBar'
import api from '../../lib/api'

interface Invoice {
  id: number
  amount: string
  billing_start_date: string
  billing_end_date: string
  due_date: string
  status: string
  payment_gateway_ref: string | null
  created_at: string
  restaurant?: {
    id: number
    name: string
  }
}

interface PlatformDue {
  id: number
  order_id: number
  total_due: number
  invoice_status: string
  created_at: string
}

interface InvoiceDetail extends Invoice {
  platform_dues?: PlatformDue[]
}

const FRONTEND_PAGE_SIZE = 5
const BACKEND_PAGE_SIZE = 15

export function InvoicesPage() {
  const { t } = useLocale()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [frontendPage, setFrontendPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const [statusFilter, setStatusFilter] = useState('')

  const [sortKey, setSortKey] = useState('created_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  
  const [stats, setStats] = useState({
    total_count: 0,
    total_amount: 0,
    paid_count: 0,
    paid_amount: 0,
    unpaid_count: 0,
    unpaid_amount: 0,
    overdue_count: 0,
    overdue_amount: 0,
  })

  const [showDetails, setShowDetails] = useState<InvoiceDetail | null>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)

  const backendPage = Math.ceil((frontendPage * FRONTEND_PAGE_SIZE) / BACKEND_PAGE_SIZE)

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/invoices/statistics')
      const data = res.data?.data || res.data || {}
      setStats({
        total_count: data.total_count || 0,
        total_amount: data.total_amount || 0,
        paid_count: data.paid_count || 0,
        paid_amount: data.paid_amount || 0,
        unpaid_count: data.unpaid_count || 0,
        unpaid_amount: data.unpaid_amount || 0,
        overdue_count: data.overdue_count || 0,
        overdue_amount: data.overdue_amount || 0,
      })
    } catch (err) {
      console.error('Failed to fetch stats', err)
    }
  }

  const fetchInvoices = async () => {
    setLoading(true)
    setError('')

    try {
      const params: any = { page: backendPage }
      if (statusFilter) params.status = statusFilter

      const res = await api.get('/admin/invoices', { params })
      const payload = res.data?.data || res.data || {}
      const data = payload.data || []
      const meta = payload.meta || {}

      setInvoices(data)
      setTotalItems(meta.total ?? data.length)
    } catch (err: unknown) {
      console.error(err)
      setError((err as any).response?.data?.message || 'Failed to fetch invoices.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchStats()
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchInvoices()
  }, [backendPage, statusFilter])

  const handleStatusChange = (v: string) => {
    setStatusFilter(v)
    setFrontendPage(1)
  }

  const handleClearFilters = () => {
    setStatusFilter('')
    setFrontendPage(1)
  }

  const handleOpenDetails = async (id: number) => {
    setLoadingDetails(true)
    setError('')
    try {
      const res = await api.get(`/admin/invoices/${id}`)
      const payload = res.data?.data || res.data || null
      setShowDetails(payload)
    } catch (err: unknown) {
      console.error(err)
      setError((err as any).response?.data?.message || 'Failed to fetch invoice details.')
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
  }

  const sortedInvoices = [...invoices].sort((a, b) => {
    let aVal: unknown = a[sortKey as keyof Invoice]
    let bVal: unknown = b[sortKey as keyof Invoice]
    
    if (sortKey === 'restaurant') {
      aVal = a.restaurant?.name || ''
      bVal = b.restaurant?.name || ''
    }

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    }
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal
    }
    return 0
  })

  const offset = ((frontendPage - 1) * FRONTEND_PAGE_SIZE) % BACKEND_PAGE_SIZE
  const pagedInvoices = sortedInvoices.slice(offset, offset + FRONTEND_PAGE_SIZE)
  const totalPages = Math.ceil(totalItems / FRONTEND_PAGE_SIZE)

  const columns: Column<Invoice>[] = [
    { key: 'id', label: t('common.id') || 'ID', sortable: true, render: (i) => `#INV-${i.id}` },
    { key: 'restaurant', label: t('invoices.restaurantName'), sortable: true, render: (i) => i.restaurant?.name || '—' },
    { key: 'amount', label: t('common.amount') || 'Amount', sortable: true, render: (i) => `$${Number(i.amount).toFixed(2)}` },
    { key: 'due_date', label: t('invoices.due'), sortable: true, render: (i) => new Date(i.due_date).toLocaleDateString() },
    { key: 'status', label: t('common.status'), sortable: true, render: (i) => <StatusBadge status={i.status} /> },
    { key: 'id', label: t('common.actions'), render: (i) => (
      <ActionButtons actions={[
        { label: t('common.view'), onClick: () => handleOpenDetails(i.id), disabled: loadingDetails },
      ]} />
    ) },
  ]

  return (
    <div className="page-content">
      <PageHeader title={t('invoices.title')} subtitle={t('invoices.subtitle')} />

      {error && <AlertBanner variant="danger" message={error} />}

      <StatsGrid cards={[
        { label: t('invoices.totalAmount'), value: `$${stats.total_amount.toFixed(2)}`, change: '', icon: '💰', iconBg: 'var(--info-bg)' },
        { label: t('invoices.paidAmount'), value: `$${stats.paid_amount.toFixed(2)}`, change: '', icon: '✅', iconBg: 'var(--success-bg)' },
        { label: t('invoices.unpaidAmount'), value: `$${stats.unpaid_amount.toFixed(2)}`, change: '', icon: '⏳', iconBg: 'var(--warning-bg)' },
        { label: t('invoices.overdueAmount'), value: `$${stats.overdue_amount.toFixed(2)}`, change: '', icon: '⚠️', iconBg: 'var(--danger-bg)' },
      ]} />

      <div className="card">
        <div className="card-header" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', width: '100%' }}>
            <h3 style={{ margin: 0 }}>{t('invoices.listTitle')}</h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              <FilterBar
                filters={[
                  {
                    label: t('common.status'),
                    value: statusFilter,
                    options: [
                      { label: t('invoices.statusPaid') || 'Paid', value: 'paid' },
                      { label: t('invoices.statusUnpaid') || 'Unpaid', value: 'unpaid' },
                      { label: t('invoices.statusOverdue') || 'Overdue', value: 'overdue' },
                    ],
                    onChange: handleStatusChange,
                  },
                ]}
                onClear={handleClearFilters}
              />
            </div>
          </div>
        </div>
        
        {loading ? (
          <LoadingState message={t('invoices.loading')} />
        ) : (
          <>
            <DataTable columns={columns} data={pagedInvoices} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} onRowClick={(i) => handleOpenDetails(i.id)} emptyTitle={t('invoices.empty')} />
            <PaginationUI currentPage={frontendPage} totalPages={totalPages} totalItems={totalItems} pageSize={FRONTEND_PAGE_SIZE} onPageChange={setFrontendPage} />
          </>
        )}
      </div>

      <Modal open={!!showDetails} onClose={() => setShowDetails(null)} title={t('invoices.detailsTitle')} size="lg">
        {showDetails && (
          <div className="invoice-details-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'var(--sans)' }}>
            
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
                  <h2 style={{ fontSize: '1.6rem', fontWeight: '700', letterSpacing: '-0.02em', margin: 0 }}>#INV-{showDetails.id}</h2>
                  <StatusBadge status={showDetails.status} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.9rem', flexWrap: 'wrap' }}>
                  <span>{t('invoices.created')}: {new Date(showDetails.created_at).toLocaleString()}</span>
                  <span style={{ margin: '0 4px', color: 'var(--text-muted)' }}>•</span>
                  <span>{t('invoices.due')}: {new Date(showDetails.due_date).toLocaleDateString()}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em' }}>{t('invoices.amountDue')}</span>
                <span style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--brand-primary)' }}>${Number(showDetails.amount).toFixed(2)}</span>
              </div>
            </div>

            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius)',
              padding: '20px',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>{t('invoices.restaurantInfo')}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.95rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{t('invoices.restaurantName')}</span>
                  <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{showDetails.restaurant?.name || '—'}</span>
                </div>
              </div>
            </div>

            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius)',
              padding: '20px',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>{t('invoices.billingPeriod')}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.95rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{t('invoices.startDate')}</span>
                  <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{new Date(showDetails.billing_start_date).toLocaleDateString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{t('invoices.endDate')}</span>
                  <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{new Date(showDetails.billing_end_date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {showDetails.platform_dues && showDetails.platform_dues.length > 0 && (
              <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius)',
                padding: '20px',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>{t('invoices.platformDues')}</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <th style={{ padding: '12px 8px 12px 0', fontWeight: '600' }}>{t('invoices.orderId')}</th>
                        <th style={{ padding: '12px 8px', fontWeight: '600', textAlign: 'center' }}>{t('common.date') || 'Date'}</th>
                        <th style={{ padding: '12px 0 12px 8px', fontWeight: '600', textAlign: 'right' }}>{t('common.amount') || 'Amount'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {showDetails.platform_dues.map((due, index) => (
                        <tr key={due.id} style={{ borderBottom: index === showDetails.platform_dues!.length - 1 ? 'none' : '1px solid var(--border-subtle)', fontSize: '0.95rem' }}>
                          <td style={{ padding: '16px 8px 16px 0', fontWeight: '600', color: 'var(--text-primary)' }}>
                            #{due.order_id}
                          </td>
                          <td style={{ padding: '16px 8px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            {new Date(due.created_at).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '16px 0 16px 8px', textAlign: 'right', fontWeight: '600', color: 'var(--text-primary)' }}>
                            ${Number(due.total_due).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
          </div>
        )}
      </Modal>
    </div>
  )
}
