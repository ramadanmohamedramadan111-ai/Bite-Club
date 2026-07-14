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

interface Category {
  id: string | number
  name: string
  slug: string
}

interface Restaurant {
  id: string | number
  name: string
  email: string
  phone_number: string
  category: Category | null
  description: string
  logo_url: string | null
  cover_image_url: string | null
  address: string
  status: string
  approved_at: string | null
  approved_by: number | null
  average_rating: number
  total_orders_count: number
}

const PAGE_SIZE = 5

export function RestaurantsPage() {
  const { t } = useLocale()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingStatusId, setUpdatingStatusId] = useState<string | number | null>(null)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [page, setPage] = useState(1)
  const [sortKey, setSortKey] = useState('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [showDetails, setShowDetails] = useState<Restaurant | null>(null)

  // Fetch restaurants and categories from the backend
  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const [restaurantsRes, categoriesRes] = await Promise.all([
        api.get('/admin/restaurants', { params: { all: true } }),
        api.get('/admin/restaurant-categories', { params: { all: true } })
      ])
      
      setRestaurants(restaurantsRes.data?.data?.items || [])
      setCategories(categoriesRes.data?.data?.items || [])
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  // Handle restaurant status update
  const handleStatusUpdate = async (id: string | number, newStatus: string) => {
    setUpdatingStatusId(id)
    setError('')
    try {
      const response = await api.put(`/admin/restaurants/${id}/status`, { status: newStatus })
      const updatedRestaurant = response.data?.data
      if (updatedRestaurant) {
        setRestaurants((prev) =>
          prev.map((r) => (r.id === id ? { ...r, ...updatedRestaurant } : r))
        )
        if (showDetails?.id === id) {
          setShowDetails((prev) => (prev ? { ...prev, ...updatedRestaurant } : null))
        }
      } else {
        fetchData()
      }
    } catch (err: any) {
      console.error(err)
      alert(err.response?.data?.message || 'Failed to update restaurant status')
    } finally {
      setUpdatingStatusId(null)
    }
  }

  // Local filtering & sorting
  const filtered = restaurants.filter((r) => {
    const q = search.toLowerCase()
    const matchesSearch =
      (r.name || '').toLowerCase().includes(q) ||
      (r.email || '').toLowerCase().includes(q) ||
      (r.phone_number || '').toLowerCase().includes(q)

    const matchesStatus = !statusFilter || r.status === statusFilter
    const matchesCategory =
      !categoryFilter || (r.category && String(r.category.id) === String(categoryFilter))

    return matchesSearch && matchesStatus && matchesCategory
  })

  filtered.sort((a, b) => {
    let aVal = ''
    let bVal = ''
    if (sortKey === 'category') {
      aVal = a.category?.name || ''
      bVal = b.category?.name || ''
    } else {
      aVal = String((a as any)[sortKey] ?? '')
      bVal = String((b as any)[sortKey] ?? '')
    }
    const cmp = aVal.localeCompare(bVal)
    return sortDir === 'asc' ? cmp : -cmp
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const columns: Column<Restaurant>[] = [
    { key: 'name', label: t('restaurants.fields.name'), sortable: true },
    { key: 'email', label: t('restaurants.fields.email') || 'Email', sortable: true },
    { key: 'phone_number', label: t('restaurants.fields.phone') || 'Phone', sortable: true },
    {
      key: 'category',
      label: t('nav.categories'),
      sortable: true,
      render: (r) => r.category?.name || '-',
    },
    {
      key: 'status',
      label: t('common.status'),
      sortable: true,
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: 'average_rating',
      label: t('restaurants.fields.rating'),
      sortable: true,
      render: (r) => {
        const rating = r.average_rating || 0
        return (
          <span>
            {'★'.repeat(Math.floor(rating))}
            {'☆'.repeat(5 - Math.floor(rating))} {rating}
          </span>
        )
      },
    },
    {
      key: 'id',
      label: t('common.actions'),
      render: (r) => {
        const isActionLoading = updatingStatusId === r.id
        return (
          <div className="action-btns">
            <button
              className="btn btn-sm btn-outline"
              onClick={(e) => {
                e.stopPropagation()
                setShowDetails(r)
              }}
              disabled={isActionLoading}
            >
              {t('common.view')}
            </button>
            {r.status === 'pending_approval' && (
              <>
                <button
                  className="btn btn-sm btn-success"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleStatusUpdate(r.id, 'active')
                  }}
                  disabled={isActionLoading}
                >
                  {t('restaurants.approve')}
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleStatusUpdate(r.id, 'rejected')
                  }}
                  disabled={isActionLoading}
                >
                  {t('feed.reject') || 'Reject'}
                </button>
              </>
            )}
            {r.status === 'active' && (
              <>
                <button
                  className="btn btn-sm btn-warning"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleStatusUpdate(r.id, 'suspended')
                  }}
                  disabled={isActionLoading}
                >
                  {t('restaurants.suspend')}
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleStatusUpdate(r.id, 'closed')
                  }}
                  disabled={isActionLoading}
                >
                  Close
                </button>
              </>
            )}
            {r.status === 'suspended' && (
              <>
                <button
                  className="btn btn-sm btn-success"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleStatusUpdate(r.id, 'active')
                  }}
                  disabled={isActionLoading}
                >
                  {t('restaurants.activate')}
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleStatusUpdate(r.id, 'closed')
                  }}
                  disabled={isActionLoading}
                >
                  Close
                </button>
              </>
            )}
            {r.status === 'closed' && (
              <button
                className="btn btn-sm btn-success"
                onClick={(e) => {
                  e.stopPropagation()
                  handleStatusUpdate(r.id, 'active')
                }}
                disabled={isActionLoading}
              >
                {t('restaurants.activate')}
              </button>
            )}
            {r.status === 'rejected' && (
              <button
                className="btn btn-sm btn-success"
                onClick={(e) => {
                  e.stopPropagation()
                  handleStatusUpdate(r.id, 'active')
                }}
                disabled={isActionLoading}
              >
                {t('restaurants.activate')}
              </button>
            )}
          </div>
        )
      },
    },
  ]

  // Calculate stats dynamically
  const totalCount = restaurants.length
  const activeCount = restaurants.filter((r) => r.status === 'active').length
  const pendingCount = restaurants.filter((r) => r.status === 'pending_approval').length
  const suspendedCount = restaurants.filter((r) => r.status === 'suspended').length

  return (
    <div className="page-content">
      <PageHeader title={t('restaurants.title')} subtitle={t('restaurants.subtitle')} />

      <div className="stats-grid">
        <StatCard
          label={t('restaurants.totalRestaurants')}
          value={loading ? '...' : totalCount.toString()}
          change=""
          icon="🏪"
          iconBg="var(--info-bg)"
        />
        <StatCard
          label={t('restaurants.active')}
          value={loading ? '...' : activeCount.toString()}
          change=""
          icon="✅"
          iconBg="var(--success-bg)"
        />
        <StatCard
          label={t('restaurants.pending')}
          value={loading ? '...' : pendingCount.toString()}
          change=""
          icon="⏳"
          iconBg="var(--warning-bg)"
        />
        <StatCard
          label={t('restaurants.suspended')}
          value={loading ? '...' : suspendedCount.toString()}
          change=""
          icon="🚫"
          iconBg="var(--danger-bg)"
        />
      </div>

      {error && (
        <div
          style={{
            background: 'var(--danger-bg)',
            border: '1px solid var(--danger)',
            color: 'var(--danger)',
            padding: '12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '13px',
            fontWeight: '500',
            marginBottom: '16px',
          }}
        >
          {error}
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <div className="toolbar">
            <SearchBar
              value={search}
              onChange={(v) => {
                setSearch(v)
                setPage(1)
              }}
            />
            <FilterBar
              filters={[
                {
                  label: t('common.status'),
                  value: statusFilter,
                  options: [
                    { label: t('common.active'), value: 'active' },
                    { label: t('restaurants.pending'), value: 'pending_approval' },
                    { label: t('restaurants.suspended'), value: 'suspended' },
                    { label: 'Closed', value: 'closed' },
                    { label: 'Rejected', value: 'rejected' },
                  ],
                  onChange: (v) => {
                    setStatusFilter(v)
                    setPage(1)
                  },
                },
                {
                  label: t('nav.categories'),
                  value: categoryFilter,
                  options: categories.map((c) => ({
                    label: c.name,
                    value: String(c.id),
                  })),
                  onChange: (v) => {
                    setCategoryFilter(v)
                    setPage(1)
                  },
                },
              ]}
              onClear={() => {
                setStatusFilter('')
                setCategoryFilter('')
                setPage(1)
              }}
            />
          </div>
        </div>
        <DataTable
          columns={columns}
          data={paged}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
          onRowClick={(r) => setShowDetails(r)}
          loading={loading}
        />
        <PaginationUI
          currentPage={page}
          totalPages={totalPages}
          totalItems={filtered.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      </div>

      <Modal
        open={!!showDetails}
        onClose={() => setShowDetails(null)}
        title={t('restaurants.restaurantDetails')}
        size="lg"
      >
        {showDetails && (
          <div className="details-grid">
            <div className="details-field">
              <span className="details-label">{t('common.id') || 'ID'}</span>
              <span>{showDetails.id}</span>
            </div>
            <div className="details-field">
              <span className="details-label">{t('restaurants.fields.name')}</span>
              <span>{showDetails.name}</span>
            </div>
            <div className="details-field">
              <span className="details-label">{t('restaurants.fields.email')}</span>
              <span>{showDetails.email}</span>
            </div>
            <div className="details-field">
              <span className="details-label">{t('restaurants.fields.phone') || 'Phone'}</span>
              <span>{showDetails.phone_number}</span>
            </div>
            <div className="details-field">
              <span className="details-label">{t('nav.categories')}</span>
              <span>{showDetails.category?.name || '-'}</span>
            </div>
            <div className="details-field">
              <span className="details-label">{t('common.status')}</span>
              <span>
                <StatusBadge status={showDetails.status} />
              </span>
            </div>
            <div className="details-field">
              <span className="details-label">{t('restaurants.fields.rating')}</span>
              <span>{showDetails.average_rating || 0} ★</span>
            </div>
            <div className="details-field">
              <span className="details-label">Total Orders</span>
              <span>{showDetails.total_orders_count || 0}</span>
            </div>
            <div className="details-field">
              <span className="details-label">{t('restaurants.fields.address')}</span>
              <span>{showDetails.address}</span>
            </div>
            <div className="details-field">
              <span className="details-label">Description</span>
              <span>{showDetails.description || '-'}</span>
            </div>
            <div className="details-field">
              <span className="details-label">Approved At</span>
              <span>{showDetails.approved_at || '-'}</span>
            </div>
            <div className="details-field">
              <span className="details-label">Approved By Admin ID</span>
              <span>{showDetails.approved_by || '-'}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

