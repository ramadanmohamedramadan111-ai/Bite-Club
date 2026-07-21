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

interface PostImage {
  id: number
  image_url: string
  position: number
}

interface OrderItem {
  item_name: string
  quantity: number
  price: number
}

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
  
  // Enriched fields from the backend
  restaurantName?: string
  orderTotal?: number
  orderItems?: OrderItem[]
  images?: PostImage[]
  rejectionReason?: string
  authorEmail?: string
  authorUsername?: string
}

const PAGE_SIZE = 5

export function FeedModerationPage() {
  const { t } = useLocale()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [page, setPage] = useState(1)
  const [showDetails, setShowDetails] = useState<FeedItem | null>(null)
  
  // API Integration states
  const [posts, setPosts] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  
  // Rejection modal states
  const [showRejectModal, setShowRejectModal] = useState<FeedItem | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  
  // Stats counters
  const [pendingCount, setPendingCount] = useState(0)
  const [approvedCount, setApprovedCount] = useState(0)
  const [rejectedCount, setRejectedCount] = useState(0)

  // Fetch count stats for pending, approved, and rejected posts
  const fetchStats = async () => {
    try {
      const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
        api.get('/admin/posts', { params: { status: 'pending', per_page: 1 } }),
        api.get('/admin/posts', { params: { status: 'approved', per_page: 1 } }),
        api.get('/admin/posts', { params: { status: 'rejected', per_page: 1 } }),
      ])
      setPendingCount(pendingRes.data?.data?.meta?.total || 0)
      setApprovedCount(approvedRes.data?.data?.meta?.total || 0)
      setRejectedCount(rejectedRes.data?.data?.meta?.total || 0)
    } catch (err) {
      console.error('Failed to fetch moderation stats:', err)
    }
  }

  // Fetch posts from backend api
  const fetchPosts = async () => {
    setLoading(true)
    setError('')
    try {
      const params: any = {
        page,
        per_page: PAGE_SIZE,
      }
      if (statusFilter) {
        params.status = statusFilter
      }
      
      const res = await api.get('/admin/posts', { params })
      const rawItems = res.data?.data?.items || []
      const meta = res.data?.data?.meta
      
      const mappedItems = rawItems.map((item: any) => ({
        id: item.id.toString(),
        author: item.user?.name || item.user?.username || 'Unknown',
        authorEmail: item.user?.email,
        authorUsername: item.user?.username,
        content: item.caption || (item.restaurant?.name ? `Shared order from ${item.restaurant.name}` : 'No content'),
        type: item.images && item.images.length > 0 ? 'photo' : 'post',
        status: item.status,
        submittedAt: item.created_at ? new Date(item.created_at).toLocaleString() : '—',
        reviewedBy: item.reviewed_by?.name || '—',
        reviewedAt: item.reviewed_at ? new Date(item.reviewed_at).toLocaleString() : '—',
        reportReason: item.rejection_reason || '',
        
        restaurantName: item.restaurant?.name,
        orderTotal: item.order?.total,
        orderItems: item.order?.items || [],
        images: item.images || [],
        rejectionReason: item.rejection_reason || '',
      }))
      
      setPosts(mappedItems)
      setTotalItems(meta?.total || 0)
      setTotalPages(meta?.last_page || 1)
    } catch (err: any) {
      console.error('Failed to fetch posts:', err)
      setError(err.response?.data?.message || 'Failed to fetch posts.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
    fetchStats()
  }, [page, statusFilter])

  const handleApprove = async (postId: string) => {
    setSubmitting(true)
    setError('')
    try {
      await api.post(`/admin/posts/${postId}/approve`)
      setShowDetails(null)
      fetchPosts()
      fetchStats()
    } catch (err: any) {
      console.error('Failed to approve post:', err)
      setError(err.response?.data?.message || 'Failed to approve post.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!showRejectModal) return
    if (!rejectionReason.trim()) {
      setError('Rejection reason is required')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      await api.post(`/admin/posts/${showRejectModal.id}/reject`, {
        rejection_reason: rejectionReason,
      })
      setShowRejectModal(null)
      setShowDetails(null)
      setRejectionReason('')
      fetchPosts()
      fetchStats()
    } catch (err: any) {
      console.error('Failed to reject post:', err)
      setError(err.response?.data?.message || 'Failed to reject post.')
    } finally {
      setSubmitting(false)
    }
  }

  // Client-side search and type filter of the retrieved posts list
  let displayedPosts = posts
  if (search) {
    const q = search.toLowerCase()
    displayedPosts = displayedPosts.filter(
      (f) => f.author.toLowerCase().includes(q) || f.content.toLowerCase().includes(q)
    )
  }
  if (typeFilter) {
    displayedPosts = displayedPosts.filter((f) => f.type === typeFilter)
  }

  const columns: Column<FeedItem>[] = [
    { key: 'author', label: t('feed.fields.author'), sortable: true },
    { key: 'content', label: t('feed.fields.content'), render: (f) => <span className="text-truncate" style={{ maxWidth: '250px', display: 'inline-block' }}>{f.content}</span> },
    { key: 'type', label: t('feed.fields.type'), sortable: true, render: (f) => <StatusBadge status={f.type} label={t(`feed.types.${f.type}` as any) || f.type} /> },
    { key: 'status', label: t('common.status'), sortable: true, render: (f) => <StatusBadge status={f.status} /> },
    { key: 'submittedAt', label: t('feed.fields.submittedAt'), sortable: true },
    { key: 'id', label: t('common.actions'), render: (f) => (
      <div className="action-btns">
        <button className="btn btn-sm btn-outline" onClick={(e) => { e.stopPropagation(); setShowDetails(f) }}>{t('common.view')}</button>
        {f.status === 'pending' && (
          <>
            <button className="btn btn-sm btn-success" onClick={(e) => { e.stopPropagation(); handleApprove(f.id) }} disabled={submitting}>{t('feed.approve')}</button>
            <button className="btn btn-sm btn-danger" onClick={(e) => { e.stopPropagation(); setShowRejectModal(f) }} disabled={submitting}>{t('feed.reject')}</button>
          </>
        )}
      </div>
    ) },
  ]

  return (
    <div className="page-content">
      <PageHeader title={t('feed.title')} subtitle={t('feed.subtitle')} />

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '20px' }}>
          {error}
        </div>
      )}

      <div className="stats-grid">
        <StatCard label={t('feed.pendingReviews')} value={pendingCount.toString()} change="" icon="⏳" iconBg="var(--warning-bg)" />
        <StatCard label={t('feed.approvedContent')} value={approvedCount.toString()} change="" icon="✅" iconBg="var(--success-bg)" />
        <StatCard label={t('feed.rejectedContent')} value={rejectedCount.toString()} change="" icon="❌" iconBg="var(--danger-bg)" />
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
                  { label: t('feed.types.photo'), value: 'photo' },
                  { label: t('feed.types.post'), value: 'post' },
                ], onChange: (v) => { setTypeFilter(v); setPage(1) } },
              ]}
              onClear={() => { setStatusFilter(''); setTypeFilter(''); setPage(1) }}
            />
          </div>
        </div>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            {t('common.loading')}
          </div>
        ) : (
          <>
            <DataTable columns={columns} data={displayedPosts} onRowClick={(f) => setShowDetails(f)} />
            <PaginationUI currentPage={page} totalPages={totalPages} totalItems={totalItems} pageSize={PAGE_SIZE} onPageChange={setPage} />
          </>
        )}
      </div>

      {/* Details Modal */}
      <Modal open={!!showDetails} onClose={() => setShowDetails(null)} title={t('feed.fields.content')} size="lg">
        {showDetails && (
          <div className="details-grid">
            <div className="details-field"><span className="details-label">{t('feed.fields.author')}</span><span>{showDetails.author}</span></div>
            {showDetails.authorEmail && (
              <div className="details-field"><span className="details-label">Email</span><span>{showDetails.authorEmail}</span></div>
            )}
            {showDetails.authorUsername && (
              <div className="details-field"><span className="details-label">Username</span><span>@{showDetails.authorUsername}</span></div>
            )}
            <div className="details-field"><span className="details-label">{t('feed.fields.type')}</span><span><StatusBadge status={showDetails.type} label={t(`feed.types.${showDetails.type}` as any) || showDetails.type} /></span></div>
            <div className="details-field" style={{ gridColumn: 'span 2' }}><span className="details-label">{t('feed.fields.content')}</span><span style={{ whiteSpace: 'pre-wrap' }}>{showDetails.content}</span></div>
            <div className="details-field"><span className="details-label">{t('common.status')}</span><span><StatusBadge status={showDetails.status} /></span></div>
            <div className="details-field"><span className="details-label">{t('feed.fields.submittedAt')}</span><span>{showDetails.submittedAt}</span></div>
            <div className="details-field"><span className="details-label">{t('feed.fields.reviewedBy')}</span><span>{showDetails.reviewedBy}</span></div>
            <div className="details-field"><span className="details-label">{t('feed.fields.reviewedAt')}</span><span>{showDetails.reviewedAt}</span></div>
            
            {showDetails.restaurantName && (
              <div className="details-field"><span className="details-label">Restaurant</span><span>{showDetails.restaurantName}</span></div>
            )}
            {showDetails.orderTotal !== undefined && (
              <div className="details-field"><span className="details-label">Order Total</span><span>${showDetails.orderTotal}</span></div>
            )}
            
            {showDetails.orderItems && showDetails.orderItems.length > 0 && (
              <div className="details-field" style={{ gridColumn: 'span 2' }}>
                <span className="details-label">Order Items</span>
                <div style={{ marginTop: '8px', padding: '12px', background: 'var(--bg-light)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  {showDetails.orderItems.map((item: any, idx: number) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0', borderBottom: idx < showDetails.orderItems!.length - 1 ? '1px dashed var(--border-color)' : 'none' }}>
                      <span>{item.item_name} x{item.quantity}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showDetails.images && showDetails.images.length > 0 && (
              <div className="details-field" style={{ gridColumn: 'span 2' }}>
                <span className="details-label">Images</span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                  {showDetails.images.map((img: any) => (
                    <a key={img.id} href={img.image_url} target="_blank" rel="noopener noreferrer">
                      <img
                        src={img.image_url}
                        alt="Post content"
                        style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-color)', cursor: 'pointer' }}
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {showDetails.rejectionReason && (
              <div className="details-field" style={{ gridColumn: 'span 2' }}>
                <span className="details-label" style={{ color: 'var(--danger-color)' }}>{t('feed.rejectReason')}</span>
                <span style={{ whiteSpace: 'pre-wrap', color: 'var(--danger-color)', fontWeight: 500 }}>{showDetails.rejectionReason}</span>
              </div>
            )}
          </div>
        )}
        {showDetails?.status === 'pending' && (
          <div className="modal-actions" style={{ marginTop: '20px' }}>
            <button className="btn btn-success" onClick={() => handleApprove(showDetails.id)} disabled={submitting}>{t('feed.approve')}</button>
            <button className="btn btn-danger" onClick={() => setShowRejectModal(showDetails)} disabled={submitting}>{t('feed.reject')}</button>
          </div>
        )}
      </Modal>

      {/* Reject Reason Confirmation Modal */}
      <Modal open={!!showRejectModal} onClose={() => { setShowRejectModal(null); setRejectionReason('') }} title={t('feed.rejectReason')} size="md">
        <form onSubmit={handleRejectSubmit}>
          <div className="form-group">
            <label className="form-label">{t('feed.enterRejectReason')}</label>
            <textarea
              className="form-input form-textarea"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder={t('feed.enterRejectReason')}
              rows={4}
              required
            />
          </div>
          <div className="modal-actions" style={{ marginTop: '20px' }}>
            <button type="button" className="btn btn-outline" onClick={() => { setShowRejectModal(null); setRejectionReason('') }} disabled={submitting}>
              {t('common.cancel')}
            </button>
            <button type="submit" className="btn btn-danger" disabled={submitting || !rejectionReason.trim()}>
              {submitting ? t('common.loading') : t('feed.reject')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
