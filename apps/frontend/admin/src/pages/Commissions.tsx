import { useState } from 'react'
import { useLocale } from '../contexts/LocaleContext'
import { PageHeader } from '../components/PageHeader'
import { SearchBar } from '../components/SearchBar'
import { DataTable, type Column } from '../components/DataTable'
import { PaginationUI } from '../components/PaginationUI'
import { Modal } from '../components/Modal'
import { StatusBadge } from '../components/StatusBadge'
import { StatCard } from '../components/StatCard'

interface Commission {
  id: string
  restaurant: string
  rate: string
  earned: string
  paid: string
  pending: string
  status: string
  dueDate: string
  paidDate: string
}

const COMMISSIONS: Commission[] = [
  { id: '1', restaurant: 'Burger House', rate: '15%', earned: '$4,275', paid: '$3,600', pending: '$675', status: 'partial', dueDate: '2026-07-15', paidDate: '2026-07-01' },
  { id: '2', restaurant: 'Pizza Roma', rate: '12%', earned: '$2,676', paid: '$2,676', pending: '$0', status: 'paid', dueDate: '2026-07-15', paidDate: '2026-07-10' },
  { id: '3', restaurant: 'Sushi Master', rate: '18%', earned: '$2,736', paid: '$0', pending: '$2,736', status: 'pending', dueDate: '2026-07-20', paidDate: '—' },
  { id: '4', restaurant: 'Spice Kitchen', rate: '15%', earned: '$2,955', paid: '$1,500', pending: '$1,455', status: 'partial', dueDate: '2026-07-15', paidDate: '2026-06-30' },
  { id: '5', restaurant: 'Tacos El Rey', rate: '10%', earned: '$1,280', paid: '$1,280', pending: '$0', status: 'paid', dueDate: '2026-07-15', paidDate: '2026-07-08' },
  { id: '6', restaurant: 'Le Petit Bistro', rate: '20%', earned: '$1,780', paid: '$0', pending: '$1,780', status: 'pending', dueDate: '2026-07-25', paidDate: '—' },
  { id: '7', restaurant: 'Green Bowl', rate: '15%', earned: '$510', paid: '$510', pending: '$0', status: 'paid', dueDate: '2026-07-15', paidDate: '2026-07-05' },
]

const PAGE_SIZE = 5

export function CommissionsPage() {
  const { t } = useLocale()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showAdjust, setShowAdjust] = useState<Commission | null>(null)
  const [showPayout, setShowPayout] = useState<Commission | null>(null)

  let filtered = COMMISSIONS.filter((c) => c.restaurant.toLowerCase().includes(search.toLowerCase()))
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const columns: Column<Commission>[] = [
    { key: 'restaurant', label: t('commissions.fields.restaurant'), sortable: true },
    { key: 'rate', label: t('commissions.fields.rate'), sortable: true },
    { key: 'earned', label: t('commissions.fields.earned'), sortable: true },
    { key: 'paid', label: t('commissions.fields.paid'), sortable: true },
    { key: 'pending', label: t('commissions.fields.pending'), sortable: true },
    { key: 'status', label: t('common.status'), sortable: true, render: (c) => <StatusBadge status={c.status} /> },
    { key: 'id', label: t('common.actions'), render: (c) => (
      <div className="action-btns">
        <button className="btn btn-sm btn-outline" onClick={(e) => { e.stopPropagation(); setShowAdjust(c) }}>{t('commissions.adjustRate')}</button>
        {c.status !== 'paid' && <button className="btn btn-sm btn-primary" onClick={(e) => { e.stopPropagation(); setShowPayout(c) }}>{t('commissions.markAsPaid')}</button>}
      </div>
    ) },
  ]

  return (
    <div className="page-content">
      <PageHeader title={t('commissions.title')} subtitle={t('commissions.subtitle')} />

      <div className="stats-grid">
        <StatCard label={t('commissions.totalEarned')} value="$16,212" change="+8.7%" direction="up" icon="💰" iconBg="var(--success-bg)" />
        <StatCard label={t('commissions.pendingPayout')} value="$6,646" change="" icon="⏳" iconBg="var(--warning-bg)" />
        <StatCard label={t('commissions.paidOut')} value="$9,566" change="" icon="✅" iconBg="var(--info-bg)" />
        <StatCard label={t('commissions.commissionRate')} value="15%" change="" icon="📊" iconBg="var(--info-bg)" />
      </div>

      <div className="card">
        <div className="card-header">
          <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1) }} />
        </div>
        <DataTable columns={columns} data={paged} />
        <PaginationUI currentPage={page} totalPages={totalPages} totalItems={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
      </div>

      <Modal open={!!showAdjust} onClose={() => setShowAdjust(null)} title={t('commissions.adjustRate')} size="sm">
        {showAdjust && (
          <>
            <p style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>{t('commissions.fields.restaurant')}: {showAdjust.restaurant}</p>
            <div className="form-group">
              <label className="form-label">{t('commissions.fields.rate')}</label>
              <div className="input-suffix">
                <input className="form-input" type="number" defaultValue={showAdjust.rate.replace('%', '')} />
                <span>%</span>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowAdjust(null)}>{t('common.cancel')}</button>
              <button className="btn btn-primary" onClick={() => setShowAdjust(null)}>{t('common.save')}</button>
            </div>
          </>
        )}
      </Modal>

      <Modal open={!!showPayout} onClose={() => setShowPayout(null)} title={t('commissions.markAsPaid')} size="sm">
        {showPayout && (
          <>
            <p style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>{t('commissions.fields.restaurant')}: {showPayout.restaurant}</p>
            <p style={{ marginBottom: '16px' }}>{t('commissions.fields.pending')}: <strong>{showPayout.pending}</strong></p>
            <div className="form-group">
              <label className="form-label">{t('commissions.fields.paidDate')}</label>
              <input className="form-input" type="date" defaultValue="2026-07-12" />
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowPayout(null)}>{t('common.cancel')}</button>
              <button className="btn btn-primary" onClick={() => setShowPayout(null)}>{t('common.save')}</button>
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}
