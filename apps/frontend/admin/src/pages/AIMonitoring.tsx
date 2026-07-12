import { useState } from 'react'
import { useLocale } from '../contexts/LocaleContext'
import { PageHeader } from '../components/PageHeader'
import { SearchBar } from '../components/SearchBar'
import { FilterBar } from '../components/FilterBar'
import { DataTable, type Column } from '../components/DataTable'
import { PaginationUI } from '../components/PaginationUI'
import { StatusBadge } from '../components/StatusBadge'
import { StatCard } from '../components/StatCard'

interface AIRequest {
  id: string
  timestamp: string
  model: string
  requestType: string
  status: string
  responseTime: string
  tokensUsed: number
  cost: string
  user: string
}

const AI_REQUESTS: AIRequest[] = [
  { id: '1', timestamp: '2026-07-12 14:30:00', model: 'recommendation', requestType: 'Get Recommendations', status: 'success', responseTime: '245ms', tokensUsed: 450, cost: '$0.009', user: 'Ahmed Ramadan' },
  { id: '2', timestamp: '2026-07-12 14:28:00', model: 'moderation', requestType: 'Flag Content', status: 'success', responseTime: '180ms', tokensUsed: 320, cost: '$0.006', user: 'System' },
  { id: '3', timestamp: '2026-07-12 14:25:00', model: 'search', requestType: 'Search Restaurants', status: 'success', responseTime: '312ms', tokensUsed: 280, cost: '$0.005', user: 'Sara El-Sayed' },
  { id: '4', timestamp: '2026-07-12 14:20:00', model: 'chatbot', requestType: 'Customer Support', status: 'success', responseTime: '890ms', tokensUsed: 1240, cost: '$0.025', user: 'Nada Hassan' },
  { id: '5', timestamp: '2026-07-12 14:15:00', model: 'recommendation', requestType: 'Get Recommendations', status: 'failed', responseTime: '5000ms', tokensUsed: 0, cost: '$0.000', user: 'Omar Farouk' },
  { id: '6', timestamp: '2026-07-12 14:10:00', model: 'moderation', requestType: 'Filter Review', status: 'success', responseTime: '156ms', tokensUsed: 210, cost: '$0.004', user: 'System' },
  { id: '7', timestamp: '2026-07-12 14:05:00', model: 'search', requestType: 'Search Restaurants', status: 'rateLimited', responseTime: '12ms', tokensUsed: 0, cost: '$0.000', user: 'Yousef Mahmoud' },
  { id: '8', timestamp: '2026-07-12 14:00:00', model: 'chatbot', requestType: 'Order Help', status: 'success', responseTime: '756ms', tokensUsed: 980, cost: '$0.019', user: 'Mona Sherif' },
]

const PAGE_SIZE = 5

export function AIMonitoringPage() {
  const { t } = useLocale()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [modelFilter, setModelFilter] = useState('')
  const [page, setPage] = useState(1)

  const modelLabels: Record<string, string> = {
    recommendation: t('aiMonitoring.models.recommendation'),
    moderation: t('aiMonitoring.models.moderation'),
    search: t('aiMonitoring.models.search'),
    chatbot: t('aiMonitoring.models.chatbot'),
  }

  let filtered = AI_REQUESTS.filter((r) => {
    const q = search.toLowerCase()
    return (r.user.toLowerCase().includes(q) || r.requestType.toLowerCase().includes(q)) &&
      (!statusFilter || r.status === statusFilter) &&
      (!modelFilter || r.model === modelFilter)
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const columns: Column<AIRequest>[] = [
    { key: 'timestamp', label: t('aiMonitoring.fields.timestamp'), sortable: true },
    { key: 'model', label: t('aiMonitoring.fields.model'), sortable: true, render: (r) => modelLabels[r.model] || r.model },
    { key: 'requestType', label: t('aiMonitoring.fields.requestType') },
    { key: 'status', label: t('common.status'), sortable: true, render: (r) => <StatusBadge status={r.status} /> },
    { key: 'responseTime', label: t('aiMonitoring.fields.responseTime'), sortable: true },
    { key: 'tokensUsed', label: t('aiMonitoring.fields.tokensUsed'), sortable: true },
    { key: 'cost', label: t('aiMonitoring.fields.cost'), sortable: true },
  ]

  const totalCost = AI_REQUESTS.reduce((sum, r) => sum + parseFloat(r.cost.replace('$', '')), 0)
  const avgTime = AI_REQUESTS.filter((r) => r.status === 'success').reduce((sum, r) => sum + parseInt(r.responseTime), 0) / AI_REQUESTS.filter((r) => r.status === 'success').length

  return (
    <div className="page-content">
      <PageHeader title={t('aiMonitoring.title')} subtitle={t('aiMonitoring.subtitle')}>
        <button className="btn btn-outline" onClick={() => {}}>{t('aiMonitoring.clearLogs')}</button>
      </PageHeader>

      <div className="stats-grid">
        <StatCard label={t('aiMonitoring.totalRequests')} value="8" change="+12" direction="up" icon="🤖" iconBg="var(--info-bg)" />
        <StatCard label={t('aiMonitoring.successRate')} value="75%" change="" icon="✅" iconBg="var(--success-bg)" />
        <StatCard label={t('aiMonitoring.avgResponseTime')} value={`${Math.round(avgTime)}ms`} change="" icon="⚡" iconBg="var(--warning-bg)" />
        <StatCard label={t('payments.totalRevenue')} value={`$${totalCost.toFixed(3)}`} change="" icon="💰" iconBg="var(--info-bg)" />
      </div>

      <div className="card">
        <div className="card-header">
          <div className="toolbar">
            <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1) }} />
            <FilterBar
              filters={[
                { label: t('common.status'), value: statusFilter, options: [
                  { label: t('aiMonitoring.statuses.success'), value: 'success' },
                  { label: t('aiMonitoring.statuses.failed'), value: 'failed' },
                  { label: t('aiMonitoring.statuses.rateLimited'), value: 'rateLimited' },
                ], onChange: (v) => { setStatusFilter(v); setPage(1) } },
                { label: t('aiMonitoring.fields.model'), value: modelFilter, options: [
                  { label: t('aiMonitoring.models.recommendation'), value: 'recommendation' },
                  { label: t('aiMonitoring.models.moderation'), value: 'moderation' },
                  { label: t('aiMonitoring.models.search'), value: 'search' },
                  { label: t('aiMonitoring.models.chatbot'), value: 'chatbot' },
                ], onChange: (v) => { setModelFilter(v); setPage(1) } },
              ]}
              onClear={() => { setStatusFilter(''); setModelFilter(''); setPage(1) }}
            />
          </div>
        </div>
        <DataTable columns={columns} data={paged} />
        <PaginationUI currentPage={page} totalPages={totalPages} totalItems={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
      </div>
    </div>
  )
}
