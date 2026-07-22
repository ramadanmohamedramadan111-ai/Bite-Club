import { useState, useEffect } from 'react'
import { useLocale } from '../contexts/LocaleContext'
import { PageHeader } from '../components/PageHeader'
import { SearchBar } from '../components/SearchBar'
import { FilterBar } from '../components/FilterBar'
import { DataTable, type Column } from '../components/DataTable'
import { PaginationUI } from '../components/PaginationUI'
import { Modal } from '../components/Modal'
import { StatusBadge } from '../components/StatusBadge'
import { StatCard } from '../components/StatCard'
import api from '../lib/api'

interface UserItem {
  id: number | string
  username: string
  full_name: string
  email: string
  phone_number: string
  status: string
  created_at: string
  last_login_at: string
}

interface UserDetail {
  id: number | string
  username: string
  first_name: string
  last_name: string
  full_name: string
  email: string
  phone_number: string
  profile_image_url: string | null
  gender: string | null
  date_of_birth: string | null
  referral_code: string | null
  referred_by: string | null
  failed_pickup_count: number
  status: string
  email_verified_at: string | null
  join_date: string
  last_login: string | null
  orders_count: number
  active_ban: {
    id: number
    reason: string
    banned_at: string
    banned_by: { id: number; name: string; email: string } | null
  } | null
}

const PAGE_SIZE = 5

export function UsersPage() {
  const { t } = useLocale()
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Filters & Pagination
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  // Stats
  const [stats, setStats] = useState({
    total_users: 0,
    new_users_this_month: 0,
    verified_users: 0,
    unverified_users: 0,
  })

  // Modals
  const [showDetails, setShowDetails] = useState<UserDetail | null>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [showBlockModal, setShowBlockModal] = useState<UserItem | null>(null)
  const [blockReason, setBlockReason] = useState('')

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/users/stats')
      const payload = res.data?.data || res.data || {}
      setStats({
        total_users: payload.total_users ?? 0,
        new_users_this_month: payload.new_users_this_month ?? 0,
        verified_users: payload.verified_users ?? 0,
        unverified_users: payload.unverified_users ?? 0,
      })
    } catch (err) {
      console.error('Failed to fetch user stats', err)
    }
  }

  const fetchUsers = async () => {
    setLoading(true)
    setError('')
    try {
      const params: any = {
        page,
        per_page: PAGE_SIZE,
      }
      if (statusFilter) params.status = statusFilter
      if (search) params.username = search

      const res = await api.get('/admin/users', { params })
      const payload = res.data?.data || res.data || {}
      const rawItems = payload.items || (Array.isArray(payload) ? payload : [])
      const meta = payload.meta || {}

      setUsers(rawItems)
      setTotalItems(meta.total ?? rawItems.length)
      setTotalPages(meta.last_page ?? 1)
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || 'Failed to fetch users.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchStats()
  }, [page, statusFilter, search])

  const handleOpenDetails = async (user: UserItem) => {
    setLoadingDetails(true)
    setError('')
    try {
      const res = await api.get(`/admin/users/${user.id}`)
      const payload = res.data?.data || res.data || null
      setShowDetails(payload)
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || 'Failed to fetch user details.')
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleBlockUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!showBlockModal || !blockReason.trim()) return
    setSubmitting(true)
    setError('')
    try {
      await api.post('/admin/user-bans', {
        user_id: showBlockModal.id,
        reason: blockReason,
      })
      setShowBlockModal(null)
      setBlockReason('')
      if (showDetails?.id === showBlockModal.id) {
        setShowDetails(null)
      }
      fetchUsers()
      fetchStats()
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || 'Failed to block user.')
    } finally {
      setSubmitting(false)
    }
  }

  const columns: Column<UserItem>[] = [
    { key: 'username', label: t('users.fields.username'), sortable: true },
    { key: 'full_name', label: t('users.fields.firstName'), sortable: true },
    { key: 'email', label: t('users.fields.email'), sortable: true },
    { key: 'phone_number', label: t('users.fields.phone') },
    { key: 'status', label: t('common.status'), sortable: true, render: (u) => <StatusBadge status={u.status} /> },
    { key: 'created_at', label: t('users.fields.joinedDate'), render: (u) => u.created_at ? new Date(u.created_at).toLocaleDateString() : '—' },
    { key: 'id', label: t('common.actions'), render: (u) => (
      <div className="action-btns">
        <button className="btn btn-sm btn-outline" onClick={(e) => { e.stopPropagation(); handleOpenDetails(u) }} disabled={loadingDetails}>{t('common.view')}</button>
        {u.status !== 'banned' && (
          <button className="btn btn-sm btn-danger" onClick={(e) => { e.stopPropagation(); setShowBlockModal(u) }} disabled={submitting}>{t('users.banUser')}</button>
        )}
      </div>
    ) },
  ]

  return (
    <div className="page-content">
      <PageHeader title={t('users.title')} subtitle={t('users.subtitle')} />

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '20px' }}>
          {error}
        </div>
      )}

      <div className="stats-grid">
        <StatCard label={t('users.totalUsers')} value={stats.total_users.toString()} change="" icon="👥" iconBg="var(--info-bg)" />
        <StatCard label={t('users.newThisMonth')} value={stats.new_users_this_month.toString()} change="" icon="📈" iconBg="var(--success-bg)" />
        <StatCard label={t('users.verified')} value={stats.verified_users.toString()} change="" icon="✅" iconBg="var(--success-bg)" />
        <StatCard label={t('users.unverified')} value={stats.unverified_users.toString()} change="" icon="❌" iconBg="var(--warning-bg)" />
      </div>

      <div className="card">
        <div className="card-header">
          <div className="toolbar">
            <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1) }} />
            <FilterBar
              filters={[
                { label: t('common.status'), value: statusFilter, options: [
                  { label: t('common.active'), value: 'active' },
                  { label: t('common.blocked'), value: 'banned' },
                ], onChange: (v) => { setStatusFilter(v); setPage(1) } },
              ]}
              onClear={() => { setStatusFilter(''); setPage(1) }}
            />
          </div>
        </div>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            {t('common.loading')}
          </div>
        ) : (
          <>
            <DataTable columns={columns} data={users} onRowClick={(u) => handleOpenDetails(u)} />
            <PaginationUI currentPage={page} totalPages={totalPages} totalItems={totalItems} pageSize={PAGE_SIZE} onPageChange={setPage} />
          </>
        )}
      </div>

      {/* User Details Modal */}
      <Modal open={!!showDetails} onClose={() => setShowDetails(null)} title={t('users.userDetails')} size="lg">
        {showDetails && (
          <div className="details-grid">
            <div className="details-field"><span className="details-label">{t('users.fields.username')}</span><span>{showDetails.username}</span></div>
            <div className="details-field"><span className="details-label">{t('users.fields.firstName')}</span><span>{showDetails.full_name || `${showDetails.first_name || ''} ${showDetails.last_name || ''}`}</span></div>
            <div className="details-field"><span className="details-label">{t('users.fields.email')}</span><span>{showDetails.email}</span></div>
            <div className="details-field"><span className="details-label">{t('users.fields.phone')}</span><span>{showDetails.phone_number || '—'}</span></div>
            <div className="details-field"><span className="details-label">{t('common.status')}</span><span><StatusBadge status={showDetails.status} /></span></div>
            <div className="details-field"><span className="details-label">{t('users.fields.ordersCount')}</span><span>{showDetails.orders_count ?? 0}</span></div>
            <div className="details-field"><span className="details-label">{t('users.fields.joinedDate')}</span><span>{showDetails.join_date ? new Date(showDetails.join_date).toLocaleDateString() : '—'}</span></div>
            <div className="details-field"><span className="details-label">{t('users.fields.lastLogin')}</span><span>{showDetails.last_login ? new Date(showDetails.last_login).toLocaleString() : '—'}</span></div>
            {showDetails.referral_code && (
              <div className="details-field"><span className="details-label">Referral Code</span><span>{showDetails.referral_code}</span></div>
            )}
            {showDetails.failed_pickup_count > 0 && (
              <div className="details-field"><span className="details-label">Failed Pickups</span><span>{showDetails.failed_pickup_count}</span></div>
            )}
            {showDetails.active_ban && (
              <div className="details-field" style={{ gridColumn: 'span 2' }}>
                <span className="details-label" style={{ color: 'var(--danger-color)' }}>{t('blockedUsers.blockReason')}</span>
                <span style={{ color: 'var(--danger-color)', fontWeight: 500 }}>{showDetails.active_ban.reason}</span>
              </div>
            )}
          </div>
        )}
        {showDetails && showDetails.status !== 'banned' && (
          <div className="modal-actions" style={{ marginTop: '20px' }}>
            <button className="btn btn-danger" onClick={() => { const u = users.find(x => String(x.id) === String(showDetails.id)); if (u) setShowBlockModal(u); }}>
              {t('users.banUser')}
            </button>
          </div>
        )}
      </Modal>

      {/* Block User Modal */}
      <Modal open={!!showBlockModal} onClose={() => { setShowBlockModal(null); setBlockReason('') }} title={t('users.banUser')} size="md">
        <form onSubmit={handleBlockUser}>
          <div className="form-group">
            <label className="form-label">{t('blockedUsers.blockReason')}</label>
            <textarea
              className="form-input form-textarea"
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              placeholder="Enter reason for banning user..."
              rows={4}
              required
            />
          </div>
          <div className="modal-actions" style={{ marginTop: '20px' }}>
            <button type="button" className="btn btn-outline" onClick={() => { setShowBlockModal(null); setBlockReason('') }} disabled={submitting}>
              {t('common.cancel')}
            </button>
            <button type="submit" className="btn btn-danger" disabled={submitting || !blockReason.trim()}>
              {submitting ? t('common.loading') : t('users.banUser')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
