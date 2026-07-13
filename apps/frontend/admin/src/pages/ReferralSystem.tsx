import { useState } from 'react'
import { useLocale } from '../contexts/LocaleContext'
import { PageHeader } from '../components/PageHeader'
import { SearchBar } from '../components/SearchBar'
import { FilterBar } from '../components/FilterBar'
import { DataTable, type Column } from '../components/DataTable'
import { PaginationUI } from '../components/PaginationUI'
import { Modal } from '../components/Modal'
import { StatusBadge } from '../components/StatusBadge'
import { StatCard } from '../components/StatCard'

interface Referral {
  id: string
  referrer: string
  referred: string
  status: string
  reward: string
  date: string
  code: string
}

const REFERRALS: Referral[] = [
  { id: '1', referrer: 'Ahmed Ramadan', referred: 'Mona Sherif', status: 'completed', reward: '$5.00', date: '2026-07-10', code: 'AHMED10' },
  { id: '2', referrer: 'Sara El-Sayed', referred: 'Layla Ahmed', status: 'completed', reward: '$5.00', date: '2026-07-08', code: 'SARA50' },
  { id: '3', referrer: 'Nada Hassan', referred: 'Yousef Mahmoud', status: 'pending', reward: '$5.00', date: '2026-07-11', code: 'NADA25' },
  { id: '4', referrer: 'Khaled Ibrahim', referred: 'Omar Farouk', status: 'expired', reward: '$0.00', date: '2026-05-20', code: 'KHALED' },
  { id: '5', referrer: 'Mona Sherif', referred: 'Noor Khaled', status: 'completed', reward: '$5.00', date: '2026-07-05', code: 'MONA75' },
  { id: '6', referrer: 'Layla Ahmed', referred: 'Hassan Mohamed', status: 'pending', reward: '$5.00', date: '2026-07-12', code: 'LAYLA30' },
]

const PAGE_SIZE = 5

export function ReferralSystemPage() {
  const { t } = useLocale()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [showCreateCode, setShowCreateCode] = useState(false)

  let filtered = REFERRALS.filter((r) => {
    const q = search.toLowerCase()
    return (r.referrer.toLowerCase().includes(q) || r.referred.toLowerCase().includes(q) || r.code.toLowerCase().includes(q)) &&
      (!statusFilter || r.status === statusFilter)
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const columns: Column<Referral>[] = [
    { key: 'referrer', label: t('referrals.fields.referrer'), sortable: true },
    { key: 'referred', label: t('referrals.fields.referred'), sortable: true },
    { key: 'status', label: t('common.status'), sortable: true, render: (r) => <StatusBadge status={r.status} /> },
    { key: 'reward', label: t('referrals.fields.reward'), sortable: true },
    { key: 'date', label: t('referrals.fields.date'), sortable: true },
    { key: 'code', label: t('referrals.fields.code'), sortable: true },
  ]

  return (
    <div className="page-content">
      <PageHeader title={t('referrals.title')} subtitle={t('referrals.subtitle')}>
        <button className="btn btn-primary" onClick={() => setShowCreateCode(true)}>+ {t('referrals.createCode')}</button>
      </PageHeader>

      <div className="stats-grid">
        <StatCard label={t('referrals.totalReferrals')} value="6" change="+2" direction="up" icon="🔗" iconBg="var(--info-bg)" />
        <StatCard label={t('referrals.successfulReferrals')} value="3" change="" icon="✅" iconBg="var(--success-bg)" />
        <StatCard label={t('referrals.rewardRate')} value="$5.00" change="" icon="🎁" iconBg="var(--warning-bg)" />
      </div>

      <div className="card">
        <div className="card-header">
          <div className="toolbar">
            <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1) }} />
            <FilterBar
              filters={[{
                label: t('common.status'), value: statusFilter, options: [
                  { label: t('referrals.statuses.pending'), value: 'pending' },
                  { label: t('referrals.statuses.completed'), value: 'completed' },
                  { label: t('referrals.statuses.expired'), value: 'expired' },
                ], onChange: (v) => { setStatusFilter(v); setPage(1) },
              }]}
              onClear={() => { setStatusFilter(''); setPage(1) }}
            />
          </div>
        </div>
        <DataTable columns={columns} data={paged} />
        <PaginationUI currentPage={page} totalPages={totalPages} totalItems={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
      </div>

      <Modal open={showCreateCode} onClose={() => setShowCreateCode(false)} title={t('referrals.createCode')} size="sm">
        <div className="form-group">
          <label className="form-label">{t('referrals.fields.code')}</label>
          <input className="form-input" placeholder="e.g. WELCOME20" />
        </div>
        <div className="form-group">
          <label className="form-label">{t('referrals.fields.reward')}</label>
          <input className="form-input" placeholder="$5.00" />
        </div>
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={() => setShowCreateCode(false)}>{t('common.cancel')}</button>
          <button className="btn btn-primary" onClick={() => setShowCreateCode(false)}>{t('common.save')}</button>
        </div>
      </Modal>
    </div>
  )
}
