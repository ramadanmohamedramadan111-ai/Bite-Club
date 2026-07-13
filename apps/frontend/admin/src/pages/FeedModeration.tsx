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

interface FeedItem {
  id: string
  author: string
  content: string
  type: string
  status: string
  submittedAt: string
  reviewedBy: string
  reviewedAt: string
  reportReason: string
}

const FEED: FeedItem[] = [
  { id: '1', author: 'Omar Farouk', content: 'The burger was amazing! Best in town. Highly recommended!', type: 'review', status: 'pending', submittedAt: '2026-07-12 10:30', reviewedBy: '—', reviewedAt: '—', reportReason: '' },
  { id: '2', author: 'Spam User', content: 'Click here for free money!!! http://spam-link.com', type: 'comment', status: 'pending', submittedAt: '2026-07-12 09:15', reviewedBy: '—', reviewedAt: '—', reportReason: 'Spam content' },
  { id: '3', author: 'Sara El-Sayed', content: 'Great atmosphere and friendly staff. Will visit again!', type: 'review', status: 'approved', submittedAt: '2026-07-11 14:00', reviewedBy: 'Admin', reviewedAt: '2026-07-11 16:30', reportReason: '' },
  { id: '4', author: 'Troll User', content: 'This restaurant is terrible. Worst food ever!!!', type: 'review', status: 'rejected', submittedAt: '2026-07-10 11:00', reviewedBy: 'Moderator', reviewedAt: '2026-07-10 12:00', reportReason: 'Abusive language' },
  { id: '5', author: 'Nada Hassan', content: '[Photo] Delicious sushi platter from Sushi Master!', type: 'photo', status: 'approved', submittedAt: '2026-07-09 18:30', reviewedBy: 'Admin', reviewedAt: '2026-07-09 20:00', reportReason: '' },
  { id: '6', author: 'Ahmed Ramadan', content: 'Anyone tried the new pizza place? Looking for recommendations!', type: 'post', status: 'pending', submittedAt: '2026-07-12 08:00', reviewedBy: '—', reviewedAt: '—', reportReason: '' },
  { id: '7', author: 'Mona Sherif', content: 'Check out this amazing burger I had today!', type: 'photo', status: 'approved', submittedAt: '2026-07-08 12:00', reviewedBy: 'Moderator', reviewedAt: '2026-07-08 13:00', reportReason: '' },
]

const PAGE_SIZE = 5

export function FeedModerationPage() {
  const { t } = useLocale()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [page, setPage] = useState(1)
  const [showDetails, setShowDetails] = useState<FeedItem | null>(null)

  let filtered = FEED.filter((f) => {
    const q = search.toLowerCase()
    return (f.author.toLowerCase().includes(q) || f.content.toLowerCase().includes(q)) &&
      (!statusFilter || f.status === statusFilter) &&
      (!typeFilter || f.type === typeFilter)
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const columns: Column<FeedItem>[] = [
    { key: 'author', label: t('feed.fields.author'), sortable: true },
    { key: 'content', label: t('feed.fields.content'), render: (f) => <span className="text-truncate" style={{ maxWidth: '250px', display: 'inline-block' }}>{f.content}</span> },
    { key: 'type', label: t('feed.fields.type'), sortable: true, render: (f) => <StatusBadge status={f.type} /> },
    { key: 'status', label: t('common.status'), sortable: true, render: (f) => <StatusBadge status={f.status} /> },
    { key: 'submittedAt', label: t('feed.fields.submittedAt'), sortable: true },
    { key: 'id', label: t('common.actions'), render: (f) => (
      <div className="action-btns">
        <button className="btn btn-sm btn-outline" onClick={(e) => { e.stopPropagation(); setShowDetails(f) }}>{t('common.view')}</button>
        {f.status === 'pending' && (
          <>
            <button className="btn btn-sm btn-success" onClick={(e) => { e.stopPropagation() }}>{t('feed.approve')}</button>
            <button className="btn btn-sm btn-danger" onClick={(e) => { e.stopPropagation() }}>{t('feed.reject')}</button>
          </>
        )}
      </div>
    ) },
  ]

  return (
    <div className="page-content">
      <PageHeader title={t('feed.title')} subtitle={t('feed.subtitle')} />

      <div className="stats-grid">
        <StatCard label={t('feed.pendingReviews')} value="3" change="" icon="⏳" iconBg="var(--warning-bg)" />
        <StatCard label={t('feed.approvedContent')} value="3" change="" icon="✅" iconBg="var(--success-bg)" />
        <StatCard label={t('feed.rejectedContent')} value="1" change="" icon="❌" iconBg="var(--danger-bg)" />
      </div>

      <div className="card">
        <div className="card-header">
          <div className="toolbar">
            <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1) }} />
            <FilterBar
              filters={[
                { label: t('common.status'), value: statusFilter, options: [
                  { label: t('common.pending'), value: 'pending' },
                  { label: t('common.approved'), value: 'approved' },
                  { label: t('common.rejected'), value: 'rejected' },
                ], onChange: (v) => { setStatusFilter(v); setPage(1) } },
                { label: t('feed.fields.type'), value: typeFilter, options: [
                  { label: t('feed.types.review'), value: 'review' },
                  { label: t('feed.types.comment'), value: 'comment' },
                  { label: t('feed.types.photo'), value: 'photo' },
                  { label: t('feed.types.post'), value: 'post' },
                ], onChange: (v) => { setTypeFilter(v); setPage(1) } },
              ]}
              onClear={() => { setStatusFilter(''); setTypeFilter(''); setPage(1) }}
            />
          </div>
        </div>
        <DataTable columns={columns} data={paged} onRowClick={(f) => setShowDetails(f)} />
        <PaginationUI currentPage={page} totalPages={totalPages} totalItems={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
      </div>

      <Modal open={!!showDetails} onClose={() => setShowDetails(null)} title={t('feed.fields.content')} size="lg">
        {showDetails && (
          <div className="details-grid">
            <div className="details-field"><span className="details-label">{t('feed.fields.author')}</span><span>{showDetails.author}</span></div>
            <div className="details-field"><span className="details-label">{t('feed.fields.type')}</span><span><StatusBadge status={showDetails.type} /></span></div>
            <div className="details-field"><span className="details-label">{t('feed.fields.content')}</span><span style={{ whiteSpace: 'pre-wrap' }}>{showDetails.content}</span></div>
            <div className="details-field"><span className="details-label">{t('common.status')}</span><span><StatusBadge status={showDetails.status} /></span></div>
            <div className="details-field"><span className="details-label">{t('feed.fields.submittedAt')}</span><span>{showDetails.submittedAt}</span></div>
            <div className="details-field"><span className="details-label">{t('feed.fields.reviewedBy')}</span><span>{showDetails.reviewedBy}</span></div>
            <div className="details-field"><span className="details-label">{t('feed.fields.reviewedAt')}</span><span>{showDetails.reviewedAt}</span></div>
            {showDetails.reportReason && (
              <div className="details-field"><span className="details-label">{t('feed.reportReason')}</span><span>{showDetails.reportReason}</span></div>
            )}
          </div>
        )}
        {showDetails?.status === 'pending' && (
          <div className="modal-actions" style={{ marginTop: '20px' }}>
            <button className="btn btn-success" onClick={() => setShowDetails(null)}>{t('feed.approve')}</button>
            <button className="btn btn-danger" onClick={() => setShowDetails(null)}>{t('feed.reject')}</button>
          </div>
        )}
      </Modal>
    </div>
  )
}
