import { useState, useEffect } from 'react'
import { useLocale } from '../contexts/LocaleContext'
import { PageHeader } from '../components/PageHeader'
import { SearchBar } from '../components/SearchBar'
import { DataTable, type Column } from '../components/DataTable'
import { PaginationUI } from '../components/PaginationUI'
import { Modal } from '../components/Modal'
import { StatusBadge } from '../components/StatusBadge'
import { StatCard } from '../components/StatCard'
import api from '../lib/api'

interface BanItem {
  id: number
  reason: string
  banned_at: string
  lifted_at: string | null
  lifted_reason: string | null
  user: {
    id: number
    username: string
    full_name: string
    email: string
  } | null
  banned_by: {
    id: number
    name: string
    email: string
  } | null
  lifted_by: {
    id: number
    name: string
    email: string
  } | null
}

const PAGE_SIZE = 5

export function BlockedUsersPage() {
  const { t } = useLocale()
  const [bans, setBans] = useState<BanItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Filters & Pagination
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [totalUsersCount, setTotalUsersCount] = useState(0)

  // Modals
  const [showDetails, setShowDetails] = useState<BanItem | null>(null)
  const [showUnblockModal, setShowUnblockModal] = useState<BanItem | null>(null)
  const [unblockReason, setUnblockReason] = useState('')

  const fetchTotalUsers = async () => {
    try {
      const res = await api.get('/admin/users/stats')
      const payload = res.data?.data || res.data || {}
      setTotalUsersCount(payload.total_users ?? 0)
    } catch (err) {
      console.error('Failed to fetch user stats', err)
    }
  }

  const fetchBans = async () => {
    setLoading(true)
    setError('')
    try {
      const params: any = {
        page,
        per_page: PAGE_SIZE,
      }
      if (search) params.search = search

      const res = await api.get('/admin/user-bans', { params })
      const payload = res.data?.data || res.data || {}
      const rawItems = payload.items || (Array.isArray(payload) ? payload : [])
      const meta = payload.meta || {}

      setBans(rawItems)
      setTotalItems(meta.total ?? rawItems.length)
      setTotalPages(meta.last_page ?? 1)
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || 'Failed to fetch blocked users.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBans()
    fetchTotalUsers()
  }, [page, search])

  const handleLiftBan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!showUnblockModal) return
    setSubmitting(true)
    setError('')
    try {
      await api.patch(`/admin/user-bans/${showUnblockModal.id}/lift`, {
        reason: unblockReason || undefined,
      })
      setShowUnblockModal(null)
      setUnblockReason('')
      if (showDetails?.id === showUnblockModal.id) {
        setShowDetails(null)
      }
      fetchBans()
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || 'Failed to unblock user.')
    } finally {
      setSubmitting(false)
    }
  }

  const columns: Column<BanItem>[] = [
    { key: 'username', label: t('users.fields.username'), sortable: true, render: (b) => b.user?.username || '—' },
    { key: 'email', label: t('users.fields.email'), sortable: true, render: (b) => b.user?.email || '—' },
    { key: 'reason', label: t('blockedUsers.blockReason'), render: (b) => <span className="text-truncate" style={{ maxWidth: '200px', display: 'inline-block' }}>{b.reason}</span> },
    { key: 'banned_by', label: t('blockedUsers.blockedBy'), render: (b) => b.banned_by?.name || 'Admin' },
    { key: 'banned_at', label: t('blockedUsers.blockedAt'), render: (b) => b.banned_at ? new Date(b.banned_at).toLocaleString() : '—' },
    { key: 'id', label: t('common.actions'), render: (b) => (
      <div className="action-btns">
        <button className="btn btn-sm btn-outline" onClick={(e) => { e.stopPropagation(); setShowDetails(b) }}>{t('common.view')}</button>
        <button className="btn btn-sm btn-primary" onClick={(e) => { e.stopPropagation(); setShowUnblockModal(b) }} disabled={submitting}>{t('blockedUsers.unblock')}</button>
      </div>
    ) },
  ]

  return (
    <div className="page-content">
      <PageHeader title={t('blockedUsers.title')} subtitle={t('blockedUsers.subtitle')} />

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '20px' }}>
          {error}
        </div>
      )}

      <div className="stats-grid">
        <StatCard label={t('blockedUsers.title')} value={totalItems.toString()} change="" icon="🚫" iconBg="var(--danger-bg)" />
        <StatCard label={t('users.totalUsers')} value={totalUsersCount.toString()} change="" icon="👥" iconBg="var(--info-bg)" />
      </div>

      <div className="card">
        <div className="card-header">
          <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1) }} />
        </div>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            {t('common.loading')}
          </div>
        ) : (
          <>
            <DataTable columns={columns} data={bans} onRowClick={(b) => setShowDetails(b)} />
            <PaginationUI currentPage={page} totalPages={totalPages} totalItems={totalItems} pageSize={PAGE_SIZE} onPageChange={setPage} />
          </>
        )}
      </div>

      {/* Ban Details Modal */}
      <Modal open={!!showDetails} onClose={() => setShowDetails(null)} title={t('users.userDetails')} size="md">
        {showDetails && (
          <div className="details-grid">
            <div className="details-field"><span className="details-label">{t('users.fields.username')}</span><span>{showDetails.user?.username || '—'}</span></div>
            <div className="details-field"><span className="details-label">{t('users.fields.email')}</span><span>{showDetails.user?.email || '—'}</span></div>
            <div className="details-field"><span className="details-label">{t('blockedUsers.blockReason')}</span><span>{showDetails.reason}</span></div>
            <div className="details-field"><span className="details-label">{t('blockedUsers.blockedBy')}</span><span>{showDetails.banned_by?.name || 'Admin'}</span></div>
            <div className="details-field"><span className="details-label">{t('blockedUsers.blockedAt')}</span><span>{showDetails.banned_at ? new Date(showDetails.banned_at).toLocaleString() : '—'}</span></div>
          </div>
        )}
        {showDetails && (
          <div className="modal-actions" style={{ marginTop: '20px' }}>
            <button className="btn btn-primary" onClick={() => setShowUnblockModal(showDetails)} disabled={submitting}>
              {t('blockedUsers.unblock')}
            </button>
          </div>
        )}
      </Modal>

      {/* Unblock Confirmation Modal */}
      <Modal open={!!showUnblockModal} onClose={() => { setShowUnblockModal(null); setUnblockReason('') }} title={t('blockedUsers.unblockUser')} size="md">
        <form onSubmit={handleLiftBan}>
          <div style={{ marginBottom: '16px' }}>
            <p>{t('blockedUsers.confirmUnblock')} ({showUnblockModal?.user?.username || 'user'})</p>
          </div>
          <div className="form-group">
            <label className="form-label">Unblock Reason (Optional)</label>
            <textarea
              className="form-input form-textarea"
              value={unblockReason}
              onChange={(e) => setUnblockReason(e.target.value)}
              placeholder="Enter reason for unblocking..."
              rows={3}
            />
          </div>
          <div className="modal-actions" style={{ marginTop: '20px' }}>
            <button type="button" className="btn btn-outline" onClick={() => { setShowUnblockModal(null); setUnblockReason('') }} disabled={submitting}>
              {t('common.cancel')}
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? t('common.loading') : t('blockedUsers.unblock')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
