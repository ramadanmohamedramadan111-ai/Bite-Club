import { useState } from 'react'
import { useLocale } from '../contexts/LocaleContext'
import { PageHeader } from '../components/PageHeader'
import { DataTable, type Column } from '../components/DataTable'
import { PaginationUI } from '../components/PaginationUI'
import { Tabs } from '../components/Tabs'
import { StatCard } from '../components/StatCard'

interface LeaderboardEntry {
  id: string
  rank: number
  user: string
  points: number
  orders: number
  reviews: number
  badges: number
  change: 'up' | 'down' | 'same'
}

const TODAY: LeaderboardEntry[] = [
  { id: '1', rank: 1, user: 'Nada Hassan', points: 5800, orders: 32, reviews: 18, badges: 5, change: 'up' },
  { id: '2', rank: 2, user: 'Mona Sherif', points: 3200, orders: 45, reviews: 25, badges: 4, change: 'same' },
  { id: '3', rank: 3, user: 'Ahmed Ramadan', points: 2450, orders: 24, reviews: 12, badges: 3, change: 'up' },
  { id: '4', rank: 4, user: 'Layla Ahmed', points: 1800, orders: 12, reviews: 8, badges: 2, change: 'up' },
  { id: '5', rank: 5, user: 'Sara El-Sayed', points: 1200, orders: 18, reviews: 10, badges: 3, change: 'down' },
  { id: '6', rank: 6, user: 'Yousef Mahmoud', points: 450, orders: 3, reviews: 2, badges: 1, change: 'down' },
  { id: '7', rank: 7, user: 'Khaled Ibrahim', points: 150, orders: 5, reviews: 1, badges: 1, change: 'same' },
]

const THIS_WEEK: LeaderboardEntry[] = [
  { id: '1', rank: 1, user: 'Mona Sherif', points: 8900, orders: 67, reviews: 35, badges: 5, change: 'up' },
  { id: '2', rank: 2, user: 'Nada Hassan', points: 7200, orders: 48, reviews: 22, badges: 5, change: 'down' },
  { id: '3', rank: 3, user: 'Ahmed Ramadan', points: 5100, orders: 38, reviews: 18, badges: 4, change: 'up' },
  { id: '4', rank: 4, user: 'Sara El-Sayed', points: 3800, orders: 29, reviews: 15, badges: 3, change: 'same' },
  { id: '5', rank: 5, user: 'Layla Ahmed', points: 2400, orders: 18, reviews: 10, badges: 2, change: 'up' },
]

const THIS_MONTH: LeaderboardEntry[] = [
  { id: '1', rank: 1, user: 'Mona Sherif', points: 24500, orders: 180, reviews: 95, badges: 5, change: 'up' },
  { id: '2', rank: 2, user: 'Nada Hassan', points: 19800, orders: 142, reviews: 78, badges: 5, change: 'down' },
  { id: '3', rank: 3, user: 'Ahmed Ramadan', points: 15200, orders: 110, reviews: 55, badges: 4, change: 'up' },
  { id: '4', rank: 4, user: 'Sara El-Sayed', points: 9800, orders: 75, reviews: 40, badges: 3, change: 'same' },
  { id: '5', rank: 5, user: 'Layla Ahmed', points: 6500, orders: 50, reviews: 25, badges: 2, change: 'up' },
]

const PAGE_SIZE = 5

export function LeaderboardPage() {
  const { t } = useLocale()
  const [activeTab, setActiveTab] = useState('today')
  const [page, setPage] = useState(1)

  const dataMap: Record<string, LeaderboardEntry[]> = { today: TODAY, thisWeek: THIS_WEEK, thisMonth: THIS_MONTH }
  const data = dataMap[activeTab] || []
  const totalPages = Math.ceil(data.length / PAGE_SIZE)
  const paged = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const changeIcon = (c: string) => {
    if (c === 'up') return <span style={{ color: 'var(--success)' }}>▲</span>
    if (c === 'down') return <span style={{ color: 'var(--danger)' }}>▼</span>
    return <span style={{ color: 'var(--text-muted)' }}>—</span>
  }

  const columns: Column<LeaderboardEntry>[] = [
    { key: 'rank', label: t('leaderboard.fields.rank'), sortable: true, width: '60px', render: (e) => (
      <span className={`rank-badge rank-${e.rank}`}>#{e.rank}</span>
    ) },
    { key: 'user', label: t('leaderboard.fields.user'), sortable: true },
    { key: 'points', label: t('leaderboard.fields.points'), sortable: true, render: (e) => <strong>{e.points.toLocaleString()}</strong> },
    { key: 'orders', label: t('leaderboard.fields.orders'), sortable: true },
    { key: 'reviews', label: t('leaderboard.fields.reviews'), sortable: true },
    { key: 'badges', label: t('leaderboard.fields.badges'), sortable: true },
    { key: 'change', label: t('leaderboard.fields.change'), render: (e) => changeIcon(e.change) },
  ]

  return (
    <div className="page-content">
      <PageHeader title={t('leaderboard.title')} subtitle={t('leaderboard.subtitle')}>
        <button className="btn btn-outline btn-danger-outline" onClick={() => {}}>{t('leaderboard.resetLeaderboard')}</button>
      </PageHeader>

      <div className="stats-grid">
        <StatCard label={t('loyalty.totalPointsIssued')} value="17,350" change="" icon="⭐" iconBg="var(--info-bg)" />
        <StatCard label={t('users.totalUsers')} value="10" change="" icon="👥" iconBg="var(--success-bg)" />
      </div>

      <Tabs
        tabs={[
          { id: 'today', label: t('leaderboard.today') },
          { id: 'thisWeek', label: t('leaderboard.thisWeek') },
          { id: 'thisMonth', label: t('leaderboard.thisMonth') },
        ]}
        activeTab={activeTab}
        onChange={(id) => { setActiveTab(id); setPage(1) }}
      />

      <div className="card">
        <DataTable columns={columns} data={paged} />
        <PaginationUI currentPage={page} totalPages={totalPages} totalItems={data.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
      </div>
    </div>
  )
}
