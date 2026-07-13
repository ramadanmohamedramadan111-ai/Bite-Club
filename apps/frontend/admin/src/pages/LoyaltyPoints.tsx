import { useState } from 'react'
import { useLocale } from '../contexts/LocaleContext'
import { PageHeader } from '../components/PageHeader'
import { SearchBar } from '../components/SearchBar'
import { FilterBar } from '../components/FilterBar'
import { DataTable, type Column } from '../components/DataTable'
import { PaginationUI } from '../components/PaginationUI'
import { Modal } from '../components/Modal'
import { StatusBadge } from '../components/StatusBadge'
import { StatCard } from '../components/StatCard'

interface LoyaltyMember {
  id: string
  user: string
  points: number
  earned: number
  redeemed: number
  balance: number
  tier: string
  expiresAt: string
  lastActivity: string
}

const LOYALTY: LoyaltyMember[] = [
  { id: '1', user: 'Ahmed Ramadan', points: 2450, earned: 3200, redeemed: 750, balance: 2450, tier: 'gold', expiresAt: '2027-01-15', lastActivity: '2026-07-12' },
  { id: '2', user: 'Sara El-Sayed', points: 1200, earned: 1500, redeemed: 300, balance: 1200, tier: 'silver', expiresAt: '2027-03-20', lastActivity: '2026-07-11' },
  { id: '3', user: 'Nada Hassan', points: 5800, earned: 6000, redeemed: 200, balance: 5800, tier: 'platinum', expiresAt: '2027-05-05', lastActivity: '2026-07-12' },
  { id: '4', user: 'Mona Sherif', points: 3200, earned: 4000, redeemed: 800, balance: 3200, tier: 'gold', expiresAt: '2027-02-01', lastActivity: '2026-07-12' },
  { id: '5', user: 'Khaled Ibrahim', points: 150, earned: 150, redeemed: 0, balance: 150, tier: 'bronze', expiresAt: '2027-06-10', lastActivity: '2026-07-10' },
  { id: '6', user: 'Yousef Mahmoud', points: 450, earned: 500, redeemed: 50, balance: 450, tier: 'bronze', expiresAt: '2027-04-20', lastActivity: '2026-07-09' },
  { id: '7', user: 'Layla Ahmed', points: 1800, earned: 2000, redeemed: 200, balance: 1800, tier: 'silver', expiresAt: '2027-07-12', lastActivity: '2026-07-11' },
]

const TIER_ORDER: Record<string, number> = { bronze: 0, silver: 1, gold: 2, platinum: 3 }

const PAGE_SIZE = 5

export function LoyaltyPointsPage() {
  const { t } = useLocale()
  const [search, setSearch] = useState('')
  const [tierFilter, setTierFilter] = useState('')
  const [page, setPage] = useState(1)
  const [showAdjust, setShowAdjust] = useState<LoyaltyMember | null>(null)
  const [showHistory, setShowHistory] = useState<LoyaltyMember | null>(null)

  let filtered = LOYALTY.filter((m) => {
    const q = search.toLowerCase()
    return m.user.toLowerCase().includes(q) && (!tierFilter || m.tier === tierFilter)
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const columns: Column<LoyaltyMember>[] = [
    { key: 'user', label: t('loyalty.fields.user'), sortable: true },
    { key: 'balance', label: t('loyalty.fields.balance'), sortable: true, render: (m) => <strong>{m.balance.toLocaleString()}</strong> },
    { key: 'earned', label: t('loyalty.fields.earned'), sortable: true },
    { key: 'redeemed', label: t('loyalty.fields.redeemed'), sortable: true },
    { key: 'tier', label: t('loyalty.fields.tier'), sortable: true, render: (m) => <StatusBadge status={m.tier} variant={m.tier === 'platinum' ? 'info' : m.tier === 'gold' ? 'warning' : m.tier === 'silver' ? 'neutral' : 'success'} /> },
    { key: 'lastActivity', label: t('loyalty.fields.lastActivity'), sortable: true },
    { key: 'id', label: t('common.actions'), render: (m) => (
      <div className="action-btns">
        <button className="btn btn-sm btn-outline" onClick={(e) => { e.stopPropagation(); setShowHistory(m) }}>{t('loyalty.history')}</button>
        <button className="btn btn-sm btn-primary" onClick={(e) => { e.stopPropagation(); setShowAdjust(m) }}>{t('loyalty.adjustPoints')}</button>
      </div>
    ) },
  ]

  const tierLabel = (tier: string) => {
    const map: Record<string, string> = { bronze: t('loyalty.tiers.bronze'), silver: t('loyalty.tiers.silver'), gold: t('loyalty.tiers.gold'), platinum: t('loyalty.tiers.platinum') }
    return map[tier] || tier
  }

  return (
    <div className="page-content">
      <PageHeader title={t('loyalty.title')} subtitle={t('loyalty.subtitle')} />

      <div className="stats-grid">
        <StatCard label={t('loyalty.totalPointsIssued')} value="17,350" change="+5.2%" direction="up" icon="⭐" iconBg="var(--info-bg)" />
        <StatCard label={t('loyalty.activeMembers')} value="7" change="" icon="👥" iconBg="var(--success-bg)" />
        <StatCard label={t('loyalty.pointsRedeemed')} value="2,300" change="" icon="🎁" iconBg="var(--warning-bg)" />
      </div>

      <div className="card">
        <div className="card-header">
          <div className="toolbar">
            <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1) }} />
            <FilterBar
              filters={[{
                label: t('loyalty.fields.tier'), value: tierFilter, options: [
                  { label: t('loyalty.tiers.bronze'), value: 'bronze' },
                  { label: t('loyalty.tiers.silver'), value: 'silver' },
                  { label: t('loyalty.tiers.gold'), value: 'gold' },
                  { label: t('loyalty.tiers.platinum'), value: 'platinum' },
                ], onChange: (v) => { setTierFilter(v); setPage(1) },
              }]}
              onClear={() => { setTierFilter(''); setPage(1) }}
            />
          </div>
        </div>
        <DataTable columns={columns} data={paged} />
        <PaginationUI currentPage={page} totalPages={totalPages} totalItems={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
      </div>

      <Modal open={!!showAdjust} onClose={() => setShowAdjust(null)} title={t('loyalty.adjustPoints')} size="sm">
        {showAdjust && (
          <>
            <p style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>{t('loyalty.fields.user')}: {showAdjust.user}</p>
            <p style={{ marginBottom: '16px' }}>{t('loyalty.fields.balance')}: <strong>{showAdjust.balance.toLocaleString()}</strong></p>
            <div className="form-group">
              <label className="form-label">{t('loyalty.fields.points')}</label>
              <input className="form-input" type="number" placeholder="Enter points" />
            </div>
            <div className="form-group">
              <label className="form-label">{t('loyalty.fields.tier')}</label>
              <select className="form-input" defaultValue={showAdjust.tier}>
                <option value="bronze">{t('loyalty.tiers.bronze')}</option>
                <option value="silver">{t('loyalty.tiers.silver')}</option>
                <option value="gold">{t('loyalty.tiers.gold')}</option>
                <option value="platinum">{t('loyalty.tiers.platinum')}</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowAdjust(null)}>{t('common.cancel')}</button>
              <button className="btn btn-primary" onClick={() => setShowAdjust(null)}>{t('common.save')}</button>
            </div>
          </>
        )}
      </Modal>

      <Modal open={!!showHistory} onClose={() => setShowHistory(null)} title={t('loyalty.history')} size="lg">
        {showHistory && (
          <>
            <p style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>{t('loyalty.fields.user')}: {showHistory.user} — {t('loyalty.fields.tier')}: {tierLabel(showHistory.tier)}</p>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>{t('payments.fields.date')}</th>
                    <th>{t('common.type')}</th>
                    <th>{t('loyalty.fields.points')}</th>
                    <th>{t('orders.fields.notes')}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>2026-07-12</td><td>Earned</td><td style={{ color: 'var(--success)' }}>+150</td><td>Order #BC-9841</td></tr>
                  <tr><td>2026-07-10</td><td>Redeemed</td><td style={{ color: 'var(--danger)' }}>-200</td><td>Discount voucher</td></tr>
                  <tr><td>2026-07-08</td><td>Earned</td><td style={{ color: 'var(--success)' }}>+300</td><td>Order #BC-9838</td></tr>
                  <tr><td>2026-07-05</td><td>Bonus</td><td style={{ color: 'var(--success)' }}>+500</td><td>Referral reward</td></tr>
                </tbody>
              </table>
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}
