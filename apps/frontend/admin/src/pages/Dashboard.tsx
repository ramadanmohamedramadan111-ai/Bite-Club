import { useState, useEffect } from 'react'
import { useLocale } from '../contexts/LocaleContext'
import { StatusBadge } from '../components/StatusBadge'
import { PageHeader } from '../components/PageHeader'
import { StatsGrid } from '../components/StatsGrid'
import { LoadingState } from '../components/LoadingState'
import { AlertBanner } from '../components/AlertBanner'
import { PaginationUI } from '../components/PaginationUI'
import api from '../lib/api'

interface DashboardStats {
  total_revenue: number
  total_orders: number
  new_users: number
  pending_restaurants: number
}

interface DashboardOrder {
  id: number | string
  restaurant_name: string | null
  host_user: string | null
  total_amount: number
  commission_amount: number
  status: string
  created_at: string
}

interface DashboardActivity {
  type: string
  title: string
  description: string
  created_at: string
}

interface DashboardData {
  stats: DashboardStats
  recent_orders: DashboardOrder[]
  recent_activity: DashboardActivity[]
}

const ORDERS_PAGE_SIZE = 5

const getActivityDotColor = (type: string) => {
  switch (type) {
    case 'restaurant_approved':
    case 'order_created':
      return 'var(--success)'
    case 'restaurant_rejected':
    case 'order_cancelled':
      return 'var(--danger)'
    case 'restaurant_created':
      return 'var(--warning)'
    case 'user_registered':
    case 'post_created':
    default:
      return 'var(--info)'
  }
}

export function DashboardPage() {
  const { t } = useLocale()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year' | 'all'>('month')
  const [ordersPage, setOrdersPage] = useState(1)

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      setError('')
      setOrdersPage(1)
      try {
        const response = await api.get('/admin/dashboard', {
          params: { period }
        })
        const payload = response.data?.data || response.data
        if (payload) {
          setData(payload)
        } else {
          throw new Error('No dashboard data received')
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data', err)
        let message = 'Failed to fetch dashboard data.'
        if (err && typeof err === 'object' && 'response' in err) {
          const response = (err as { response?: { data?: { message?: string } } }).response
          if (response?.data?.message) {
            message = response.data.message
          }
        }
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(() => {
      fetchDashboardData()
    }, 0)

    return () => {
      clearTimeout(timer)
    }
  }, [period])

  // Pagination calculations for recent orders
  const recentOrders = data?.recent_orders || []
  const totalOrdersPages = Math.ceil(recentOrders.length / ORDERS_PAGE_SIZE)
  const startIndex = (ordersPage - 1) * ORDERS_PAGE_SIZE
  const pagedOrders = recentOrders.slice(startIndex, startIndex + ORDERS_PAGE_SIZE)

  return (
    <div className="page-content">
      <PageHeader title={t('dashboard.title')} subtitle={t('dashboard.subtitle')}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {(['today', 'week', 'month', 'year', 'all'] as const).map((p) => {
            const isActive = period === p
            return (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: isActive ? 'none' : '1px solid var(--border-subtle, #252840)',
                  background: isActive ? 'var(--brand-primary, #ff6b35)' : 'var(--bg-surface, #1a1d27)',
                  color: isActive ? '#ffffff' : 'var(--text-secondary, #8b91b0)',
                  cursor: 'pointer',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  transition: 'all 0.2s ease',
                  textAlign: 'center',
                  minWidth: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isActive ? '0 4px 12px rgba(255, 107, 53, 0.25)' : 'none'
                }}
              >
                {t(`dashboard.periods.${p}`)}
              </button>
            )
          })}
        </div>
      </PageHeader>

      {error && <AlertBanner variant="danger" message={error} />}

      {loading && !data ? (
        <LoadingState message={t('common.loading')} />
      ) : (
        <>
          <StatsGrid cards={[
            {
              label: t('dashboard.totalRevenue'),
              value: `$${(data?.stats.total_revenue ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              icon: '💰',
              iconBg: 'var(--success-bg)'
            },
            {
              label: t('dashboard.totalOrders'),
              value: (data?.stats.total_orders ?? 0).toLocaleString(),
              icon: '🧾',
              iconBg: 'var(--info-bg)'
            },
            {
              label: t('dashboard.newUsers'),
              value: (data?.stats.new_users ?? 0).toLocaleString(),
              icon: '👥',
              iconBg: 'rgba(139,91,246,0.15)'
            },
            {
              label: t('dashboard.pendingRestaurants'),
              value: (data?.stats.pending_restaurants ?? 0).toLocaleString(),
              icon: '🏪',
              iconBg: 'var(--warning-bg)'
            },
          ]} />

          <div className="content-grid" style={{ alignItems: 'start' }}>
            <div className="card">
              <div className="card-header">
                <span className="card-title">{t('dashboard.recentOrders')}</span>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>{t('orders.fields.customer')}</th>
                      <th>{t('orders.fields.restaurant')}</th>
                      <th>{t('orders.fields.total')}</th>
                      <th>{t('common.status')}</th>
                      <th>{t('orders.fields.time')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!data || pagedOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                          {t('common.noResults')}
                        </td>
                      </tr>
                    ) : (
                      pagedOrders.map((o) => (
                        <tr key={o.id}>
                          <td>#BC-{o.id}</td>
                          <td>{o.host_user || '—'}</td>
                          <td>{o.restaurant_name || '—'}</td>
                          <td>${o.total_amount.toFixed(2)}</td>
                          <td><StatusBadge status={o.status} /></td>
                          <td>{new Date(o.created_at).toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {data && recentOrders.length > ORDERS_PAGE_SIZE && (
                <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-subtle)' }}>
                  <PaginationUI
                    currentPage={ordersPage}
                    totalPages={totalOrdersPages}
                    totalItems={recentOrders.length}
                    pageSize={ORDERS_PAGE_SIZE}
                    onPageChange={setOrdersPage}
                  />
                </div>
              )}
            </div>

            <div className="card">
              <div className="card-header">
                <span className="card-title">{t('dashboard.recentActivity')}</span>
              </div>
              <div className="activity-list">
                {!data || data.recent_activity.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    {t('common.noResults')}
                  </div>
                ) : (
                  data.recent_activity.map((a, i) => (
                    <div key={i} className="activity-item">
                      <span className="activity-dot" style={{ background: getActivityDotColor(a.type) }} />
                      <div className="activity-body">
                        <div className="activity-text">
                          <strong>{a.title}</strong> — {a.description}
                        </div>
                        <div className="activity-time">{new Date(a.created_at).toLocaleString()}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
