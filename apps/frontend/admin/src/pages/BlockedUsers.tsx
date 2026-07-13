import { useState } from 'react'
import { useLocale } from '../contexts/LocaleContext'
import { PageHeader } from '../components/PageHeader'
import { SearchBar } from '../components/SearchBar'
import { DataTable, type Column } from '../components/DataTable'
import { PaginationUI } from '../components/PaginationUI'
import { Modal } from '../components/Modal'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { StatusBadge } from '../components/StatusBadge'
import { StatCard } from '../components/StatCard'

interface BlockedUser {
  id: string
  username: string
  firstName: string
  lastName: string
  email: string
  reason: string
  blockedBy: string
  blockedAt: string
  previousOrders: number
}

const BLOCKED: BlockedUser[] = [
  { id: '1', username: 'omar_f', firstName: 'Omar', lastName: 'Farouk', email: 'omar@example.com', reason: 'Multiple chargeback disputes', blockedBy: 'Admin', blockedAt: '2026-06-15 14:30', previousOrders: 5 },
  { id: '2', username: 'spam_user', firstName: 'Spam', lastName: 'Account', email: 'spam@example.com', reason: 'Spam reviews and fake orders', blockedBy: 'System', blockedAt: '2026-06-20 09:15', previousOrders: 0 },
  { id: '3', username: 'troll_99', firstName: 'Troll', lastName: 'User', email: 'troll@example.com', reason: 'Abusive language in reviews', blockedBy: 'Moderator', blockedAt: '2026-07-01 11:00', previousOrders: 2 },
  { id: '4', username: 'fake_user', firstName: 'Fake', lastName: 'Identity', email: 'fake@example.com', reason: 'Suspected fraudulent account', blockedBy: 'System', blockedAt: '2026-07-05 16:45', previousOrders: 1 },
]

const PAGE_SIZE = 5

export function BlockedUsersPage() {
  const { t } = useLocale()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showDetails, setShowDetails] = useState<BlockedUser | null>(null)
  const [showUnblock, setShowUnblock] = useState<BlockedUser | null>(null)

  let filtered = BLOCKED.filter((u) => {
    const q = search.toLowerCase()
    return u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.reason.toLowerCase().includes(q)
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const columns: Column<BlockedUser>[] = [
    { key: 'username', label: t('users.fields.username'), sortable: true },
    { key: 'email', label: t('users.fields.email'), sortable: true },
    { key: 'reason', label: t('blockedUsers.blockReason'), sortable: true },
    { key: 'blockedBy', label: t('blockedUsers.blockedBy'), sortable: true },
    { key: 'blockedAt', label: t('blockedUsers.blockedAt'), sortable: true },
    { key: 'id', label: t('common.actions'), render: (u) => (
      <div className="action-btns">
        <button className="btn btn-sm btn-outline" onClick={(e) => { e.stopPropagation(); setShowDetails(u) }}>{t('common.view')}</button>
        <button className="btn btn-sm btn-primary" onClick={(e) => { e.stopPropagation(); setShowUnblock(u) }}>{t('blockedUsers.unblock')}</button>
      </div>
    ) },
  ]

  return (
    <div className="page-content">
      <PageHeader title={t('blockedUsers.title')} subtitle={t('blockedUsers.subtitle')} />

      <div className="stats-grid">
        <StatCard label={t('blockedUsers.title')} value="4" change="+2" direction="up" icon="🚫" iconBg="var(--danger-bg)" />
        <StatCard label={t('users.totalUsers')} value="10" change="" icon="👥" iconBg="var(--info-bg)" />
      </div>

      <div className="card">
        <div className="card-header">
          <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1) }} />
        </div>
        <DataTable columns={columns} data={paged} onRowClick={(u) => setShowDetails(u)} />
        <PaginationUI currentPage={page} totalPages={totalPages} totalItems={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
      </div>

      <Modal open={!!showDetails} onClose={() => setShowDetails(null)} title={t('users.userDetails')} size="md">
        {showDetails && (
          <div className="details-grid">
            <div className="details-field"><span className="details-label">{t('users.fields.username')}</span><span>{showDetails.username}</span></div>
            <div className="details-field"><span className="details-label">{t('users.fields.email')}</span><span>{showDetails.email}</span></div>
            <div className="details-field"><span className="details-label">{t('blockedUsers.blockReason')}</span><span>{showDetails.reason}</span></div>
            <div className="details-field"><span className="details-label">{t('blockedUsers.blockedBy')}</span><span>{showDetails.blockedBy}</span></div>
            <div className="details-field"><span className="details-label">{t('blockedUsers.blockedAt')}</span><span>{showDetails.blockedAt}</span></div>
            <div className="details-field"><span className="details-label">{t('users.fields.ordersCount')}</span><span>{showDetails.previousOrders}</span></div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!showUnblock}
        title={t('blockedUsers.unblockUser')}
        message={`${t('blockedUsers.confirmUnblock')} (${showUnblock?.username})`}
        variant="warning"
        confirmLabel={t('blockedUsers.unblock')}
        onConfirm={() => setShowUnblock(null)}
        onCancel={() => setShowUnblock(null)}
      />
    </div>
  )
}
