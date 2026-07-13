import { useState } from 'react'
import { useLocale } from '../contexts/LocaleContext'
import { PageHeader } from '../components/PageHeader'
import { SearchBar } from '../components/SearchBar'
import { FilterBar } from '../components/FilterBar'
import { DataTable, type Column } from '../components/DataTable'
import { PaginationUI } from '../components/PaginationUI'
import { StatusBadge } from '../components/StatusBadge'
import { StatCard } from '../components/StatCard'

interface ActivityLog {
  id: string
  timestamp: string
  admin: string
  action: string
  resource: string
  details: string
  ipAddress: string
}

const LOGS: ActivityLog[] = [
  { id: '1', timestamp: '2026-07-12 14:30:00', admin: 'Admin', action: 'updated', resource: 'User #5', details: 'Updated user role to moderator', ipAddress: '192.168.1.1' },
  { id: '2', timestamp: '2026-07-12 14:25:00', admin: 'Admin', action: 'deleted', resource: 'Review #12', details: 'Deleted abusive review', ipAddress: '192.168.1.1' },
  { id: '3', timestamp: '2026-07-12 14:20:00', admin: 'Moderator', action: 'created', resource: 'Category #8', details: 'Created new category: Indian', ipAddress: '192.168.1.2' },
  { id: '4', timestamp: '2026-07-12 14:15:00', admin: 'Admin', action: 'viewed', resource: 'Orders Report', details: 'Exported monthly orders report', ipAddress: '192.168.1.1' },
  { id: '5', timestamp: '2026-07-12 14:00:00', admin: 'Admin', action: 'login', resource: 'Admin Panel', details: 'Successful login', ipAddress: '192.168.1.1' },
  { id: '6', timestamp: '2026-07-12 13:45:00', admin: 'System', action: 'updated', resource: 'Restaurant #3', details: 'Auto-approved pending restaurant', ipAddress: 'System' },
  { id: '7', timestamp: '2026-07-12 13:30:00', admin: 'Moderator', action: 'updated', resource: 'Commission #2', details: 'Marked commission as paid', ipAddress: '192.168.1.2' },
  { id: '8', timestamp: '2026-07-12 13:15:00', admin: 'Admin', action: 'exported', resource: 'Users List', details: 'Exported all users to CSV', ipAddress: '192.168.1.1' },
]

const PAGE_SIZE = 5

export function ActivityLogsPage() {
  const { t } = useLocale()
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [page, setPage] = useState(1)

  let filtered = LOGS.filter((l) => {
    const q = search.toLowerCase()
    return (l.admin.toLowerCase().includes(q) || l.resource.toLowerCase().includes(q) || l.details.toLowerCase().includes(q)) &&
      (!actionFilter || l.action === actionFilter)
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const actionLabels: Record<string, string> = {
    created: t('activityLogs.actions.created'),
    updated: t('activityLogs.actions.updated'),
    deleted: t('activityLogs.actions.deleted'),
    viewed: t('activityLogs.actions.viewed'),
    login: t('activityLogs.actions.login'),
    logout: t('activityLogs.actions.logout'),
    exported: t('activityLogs.actions.exported'),
  }

  const columns: Column<ActivityLog>[] = [
    { key: 'timestamp', label: t('activityLogs.fields.timestamp'), sortable: true },
    { key: 'admin', label: t('activityLogs.fields.admin'), sortable: true },
    { key: 'action', label: t('activityLogs.fields.action'), sortable: true, render: (l) => <StatusBadge status={l.action} /> },
    { key: 'resource', label: t('activityLogs.fields.resource'), sortable: true },
    { key: 'details', label: t('activityLogs.fields.details') },
    { key: 'ipAddress', label: t('activityLogs.fields.ipAddress') },
  ]

  return (
    <div className="page-content">
      <PageHeader title={t('activityLogs.title')} subtitle={t('activityLogs.subtitle')}>
        <button className="btn btn-outline" onClick={() => {}}>{t('activityLogs.exportLogs')}</button>
        <button className="btn btn-outline btn-danger-outline" onClick={() => {}}>{t('activityLogs.clearLogs')}</button>
      </PageHeader>

      <div className="stats-grid">
        <StatCard label={t('activityLogs.totalLogs')} value="8" change="" icon="📋" iconBg="var(--info-bg)" />
      </div>

      <div className="card">
        <div className="card-header">
          <div className="toolbar">
            <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1) }} />
            <FilterBar
              filters={[{
                label: t('activityLogs.fields.action'), value: actionFilter, options: [
                  { label: t('activityLogs.actions.created'), value: 'created' },
                  { label: t('activityLogs.actions.updated'), value: 'updated' },
                  { label: t('activityLogs.actions.deleted'), value: 'deleted' },
                  { label: t('activityLogs.actions.viewed'), value: 'viewed' },
                  { label: t('activityLogs.actions.login'), value: 'login' },
                  { label: t('activityLogs.actions.exported'), value: 'exported' },
                ], onChange: (v) => { setActionFilter(v); setPage(1) },
              }]}
              onClear={() => { setActionFilter(''); setPage(1) }}
            />
          </div>
        </div>
        <DataTable columns={columns} data={paged} />
        <PaginationUI currentPage={page} totalPages={totalPages} totalItems={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
      </div>
    </div>
  )
}
