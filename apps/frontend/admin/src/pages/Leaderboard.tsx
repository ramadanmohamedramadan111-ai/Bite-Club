import { useState, useEffect } from 'react'
import { useLocale } from '../contexts/LocaleContext'
import { PageHeader } from '../components/PageHeader'
import { DataTable, type Column } from '../components/DataTable'
import { PaginationUI } from '../components/PaginationUI'
import { Tabs } from '../components/Tabs'
import { StatsGrid } from '../components/StatsGrid'
import { AlertBanner } from '../components/AlertBanner'
import { LoadingState } from '../components/LoadingState'
import api from '../lib/api'

interface PostEntry {
  id: string | number
  image_url: string | null
  caption: string | null
  copy_count: number
  created_at: string
  user: {
    id: string | number
    full_name: string
  }
  restaurant: {
    id: string | number
    name: string
  }
}

interface RestaurantEntry {
  id: string | number
  name: string
  posts_count: number
  total_copies: number
}

interface DashboardData {
  summary: {
    total_posts: number
    total_copies: number
    active_users: number
    active_restaurants: number
  }
  top_posts: PostEntry[]
  top_restaurants: RestaurantEntry[]
}

const PAGE_SIZE = 5

export function LeaderboardPage() {
  const { t } = useLocale()
  const [activeTab, setActiveTab] = useState<'posts' | 'restaurants'>('posts')
  const [page, setPage] = useState(1)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        setError('')
        const response = await api.get('/admin/leaderboard/dashboard')
        if (active) {
          setDashboardData(response.data.data)
        }
      } catch (err: any) {
        if (active) {
          setError(err.response?.data?.message || 'Failed to fetch leaderboard statistics.')
        }
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }
    fetchDashboardData()
    return () => {
      active = false
    }
  }, [])

  const stats = dashboardData ? [
    { label: t('leaderboard.totalPosts') || 'Total Posts', value: String(dashboardData.summary.total_posts), change: '', icon: '📝', iconBg: 'var(--info-bg)' },
    { label: t('leaderboard.totalCopies') || 'Total Copies', value: String(dashboardData.summary.total_copies), change: '', icon: '📋', iconBg: 'var(--warning-bg)' },
    { label: t('leaderboard.activeUsers') || 'Active Users', value: String(dashboardData.summary.active_users), change: '', icon: '👥', iconBg: 'var(--success-bg)' },
    { label: t('leaderboard.activeRestaurants') || 'Active Restaurants', value: String(dashboardData.summary.active_restaurants), change: '', icon: '🏪', iconBg: 'var(--danger-bg)' },
  ] : []

  const activeData: (PostEntry | RestaurantEntry)[] = activeTab === 'posts'
    ? (dashboardData?.top_posts || [])
    : (dashboardData?.top_restaurants || [])

  const totalPages = Math.ceil(activeData.length / PAGE_SIZE)
  const pagedData = activeData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const columnsPosts: Column<PostEntry>[] = [
    {
      key: 'rank',
      label: t('leaderboard.fields.rank'),
      width: '60px',
      render: (e) => {
        const index = pagedData.indexOf(e)
        const rank = (page - 1) * PAGE_SIZE + index + 1
        return (
          <span className={`rank-badge rank-${rank}`}>
            #{rank}
          </span>
        )
      },
    },
    {
      key: 'image',
      label: t('categories.fields.image') || 'Image',
      width: '80px',
      render: (e) =>
        e.image_url ? (
          <img
            src={e.image_url}
            alt="post"
            style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
          />
        ) : (
          <span style={{ fontSize: '20px' }}>🖼️</span>
        ),
    },
    {
      key: 'caption',
      label: t('feed.fields.content') || 'Caption',
      render: (e) => (
        <span className="text-truncate" style={{ maxWidth: '240px', display: 'inline-block' }}>
          {e.caption || '—'}
        </span>
      ),
    },
    {
      key: 'user',
      label: t('feed.fields.author') || 'User',
      render: (e) => <span>{e.user?.full_name || '—'}</span>,
    },
    {
      key: 'restaurant',
      label: t('orders.fields.restaurant') || 'Restaurant',
      render: (e) => <span>{e.restaurant?.name || '—'}</span>,
    },
    {
      key: 'copies',
      label: t('leaderboard.totalCopies') || 'Copies',
      sortable: true,
      render: (e) => <strong>{e.copy_count.toLocaleString()}</strong>,
    },
    {
      key: 'created_at',
      label: t('common.createdAt') || 'Created At',
      render: (e) => (
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          {e.created_at ? new Date(e.created_at).toLocaleDateString() : '—'}
        </span>
      ),
    },
  ]

  const columnsRestaurants: Column<RestaurantEntry>[] = [
    {
      key: 'rank',
      label: t('leaderboard.fields.rank'),
      width: '60px',
      render: (e) => {
        const index = pagedData.indexOf(e)
        const rank = (page - 1) * PAGE_SIZE + index + 1
        return (
          <span className={`rank-badge rank-${rank}`}>
            #{rank}
          </span>
        )
      },
    },
    {
      key: 'name',
      label: t('restaurants.fields.name') || 'Restaurant Name',
    },
    {
      key: 'posts_count',
      label: t('categories.fields.itemsCount') || 'Posts Count',
      sortable: true,
      render: (e) => <strong>{e.posts_count.toLocaleString()}</strong>,
    },
    {
      key: 'total_copies',
      label: t('leaderboard.totalCopies') || 'Copies Count',
      sortable: true,
      render: (e) => <strong>{e.total_copies.toLocaleString()}</strong>,
    },
  ]

  return (
    <div className="page-content">
      <PageHeader title={t('leaderboard.title')} subtitle={t('leaderboard.subtitle')} />

      {error && <AlertBanner variant="danger" message={error} onClose={() => setError('')} />}

      {isLoading ? (
        <LoadingState message={t('common.loading') || 'Loading...'} />
      ) : (
        <>
          <StatsGrid cards={stats} />

          <Tabs
            tabs={[
              { id: 'posts', label: t('leaderboard.topPosts') || 'Top Posts' },
              { id: 'restaurants', label: t('leaderboard.topRestaurants') || 'Top Restaurants' },
            ]}
            activeTab={activeTab}
            onChange={(id) => {
              setActiveTab(id as any)
              setPage(1)
            }}
          />

          <div className="card">
            {activeTab === 'posts' ? (
              <DataTable
                columns={columnsPosts}
                data={pagedData as PostEntry[]}
                emptyTitle={t('common.noResults') || 'No data found'}
              />
            ) : (
              <DataTable
                columns={columnsRestaurants}
                data={pagedData as RestaurantEntry[]}
                emptyTitle={t('common.noResults') || 'No data found'}
              />
            )}
            <PaginationUI
              currentPage={page}
              totalPages={totalPages}
              totalItems={activeData.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </div>
        </>
      )}
    </div>
  )
}
