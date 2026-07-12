import { useState } from 'react'
import { useLocale } from '../contexts/LocaleContext'
import { PageHeader } from '../components/PageHeader'
import { SearchBar } from '../components/SearchBar'
import { FilterBar } from '../components/FilterBar'
import { DataTable, type Column } from '../components/DataTable'
import { PaginationUI } from '../components/PaginationUI'
import { Modal } from '../components/Modal'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { StatusBadge } from '../components/StatusBadge'
import { StatCard } from '../components/StatCard'

interface Badge {
  id: string
  name: string
  icon: string
  description: string
  category: string
  criteria: string
  usersCount: number
  status: string
}

const BADGES: Badge[] = [
  { id: '1', name: 'Foodie Legend', icon: '🏆', description: 'Placed over 100 orders', category: 'orders', criteria: '100 orders completed', usersCount: 45, status: 'active' },
  { id: '2', name: 'Top Reviewer', icon: '⭐', description: 'Wrote 50 reviews', category: 'reviews', criteria: '50 reviews submitted', usersCount: 28, status: 'active' },
  { id: '3', name: 'Super Referrer', icon: '👥', description: 'Referred 20 friends', category: 'referrals', criteria: '20 successful referrals', usersCount: 12, status: 'active' },
  { id: '4', name: 'Loyal Customer', icon: '💎', description: 'Platinum loyalty tier member', category: 'loyalty', criteria: 'Reach platinum tier', usersCount: 67, status: 'active' },
  { id: '5', name: 'Early Bird', icon: '🌅', description: 'First 100 registered users', category: 'special', criteria: 'Registered in first month', usersCount: 100, status: 'active' },
  { id: '6', name: 'Photo Pro', icon: '📸', description: 'Uploaded 30 food photos', category: 'reviews', criteria: '30 photo reviews', usersCount: 19, status: 'inactive' },
  { id: '7', name: 'Spice Master', icon: '🌶️', description: 'Ordered from 20+ restaurants', category: 'orders', criteria: 'Order from 20 restaurants', usersCount: 33, status: 'active' },
]

const PAGE_SIZE = 5

export function BadgesPage() {
  const { t } = useLocale()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [page, setPage] = useState(1)
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState<Badge | null>(null)
  const [showDelete, setShowDelete] = useState<Badge | null>(null)

  let filtered = BADGES.filter((b) => {
    const q = search.toLowerCase()
    return (b.name.toLowerCase().includes(q) || b.description.toLowerCase().includes(q)) &&
      (!categoryFilter || b.category === categoryFilter)
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const columns: Column<Badge>[] = [
    { key: 'name', label: t('badges.fields.name'), sortable: true, render: (b) => <span><span className="category-icon">{b.icon}</span> {b.name}</span> },
    { key: 'description', label: t('badges.fields.description') },
    { key: 'category', label: t('badges.fields.category'), sortable: true, render: (b) => <StatusBadge status={b.category} /> },
    { key: 'usersCount', label: t('badges.fields.usersCount'), sortable: true },
    { key: 'status', label: t('common.status'), sortable: true, render: (b) => <StatusBadge status={b.status} /> },
    { key: 'id', label: t('common.actions'), render: (b) => (
      <div className="action-btns">
        <button className="btn btn-sm btn-outline" onClick={(e) => { e.stopPropagation(); setShowEdit(b) }}>{t('common.edit')}</button>
        <button className="btn btn-sm btn-danger" onClick={(e) => { e.stopPropagation(); setShowDelete(b) }}>{t('common.delete')}</button>
      </div>
    ) },
  ]

  return (
    <div className="page-content">
      <PageHeader title={t('badges.title')} subtitle={t('badges.subtitle')}>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ {t('badges.createBadge')}</button>
      </PageHeader>

      <div className="stats-grid">
        <StatCard label={t('badges.totalBadges')} value="7" change="" icon="🎖️" iconBg="var(--info-bg)" />
        <StatCard label={t('badges.assignedBadges')} value="304" change="" icon="👥" iconBg="var(--success-bg)" />
      </div>

      <div className="card">
        <div className="card-header">
          <div className="toolbar">
            <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1) }} />
            <FilterBar
              filters={[{
                label: t('badges.fields.category'), value: categoryFilter, options: [
                  { label: t('badges.categories.orders'), value: 'orders' },
                  { label: t('badges.categories.reviews'), value: 'reviews' },
                  { label: t('badges.categories.referrals'), value: 'referrals' },
                  { label: t('badges.categories.loyalty'), value: 'loyalty' },
                  { label: t('badges.categories.special'), value: 'special' },
                ], onChange: (v) => { setCategoryFilter(v); setPage(1) },
              }]}
              onClear={() => { setCategoryFilter(''); setPage(1) }}
            />
          </div>
        </div>
        <DataTable columns={columns} data={paged} />
        <PaginationUI currentPage={page} totalPages={totalPages} totalItems={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title={t('badges.createBadge')} size="md">
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">{t('badges.fields.name')}</label>
            <input className="form-input" placeholder="Badge name" />
          </div>
          <div className="form-group">
            <label className="form-label">{t('badges.fields.icon')}</label>
            <input className="form-input" placeholder="Emoji icon" />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">{t('badges.fields.description')}</label>
            <textarea className="form-input form-textarea" placeholder="Badge description" rows={3} />
          </div>
          <div className="form-group">
            <label className="form-label">{t('badges.fields.category')}</label>
            <select className="form-input">
              <option value="orders">{t('badges.categories.orders')}</option>
              <option value="reviews">{t('badges.categories.reviews')}</option>
              <option value="referrals">{t('badges.categories.referrals')}</option>
              <option value="loyalty">{t('badges.categories.loyalty')}</option>
              <option value="special">{t('badges.categories.special')}</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">{t('badges.fields.criteria')}</label>
            <input className="form-input" placeholder="e.g. 100 orders" />
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={() => setShowCreate(false)}>{t('common.cancel')}</button>
          <button className="btn btn-primary" onClick={() => setShowCreate(false)}>{t('common.save')}</button>
        </div>
      </Modal>

      <Modal open={!!showEdit} onClose={() => setShowEdit(null)} title={t('badges.editBadge')} size="md">
        {showEdit && (
          <>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">{t('badges.fields.name')}</label>
                <input className="form-input" defaultValue={showEdit.name} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('badges.fields.icon')}</label>
                <input className="form-input" defaultValue={showEdit.icon} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">{t('badges.fields.description')}</label>
                <textarea className="form-input form-textarea" defaultValue={showEdit.description} rows={3} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('badges.fields.category')}</label>
                <select className="form-input" defaultValue={showEdit.category}>
                  <option value="orders">{t('badges.categories.orders')}</option>
                  <option value="reviews">{t('badges.categories.reviews')}</option>
                  <option value="referrals">{t('badges.categories.referrals')}</option>
                  <option value="loyalty">{t('badges.categories.loyalty')}</option>
                  <option value="special">{t('badges.categories.special')}</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">{t('badges.fields.criteria')}</label>
                <input className="form-input" defaultValue={showEdit.criteria} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('common.status')}</label>
                <select className="form-input" defaultValue={showEdit.status}>
                  <option value="active">{t('common.active')}</option>
                  <option value="inactive">{t('common.inactive')}</option>
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowEdit(null)}>{t('common.cancel')}</button>
              <button className="btn btn-primary" onClick={() => setShowEdit(null)}>{t('common.save')}</button>
            </div>
          </>
        )}
      </Modal>

      <ConfirmDialog
        open={!!showDelete}
        title={t('common.delete')}
        message={`${t('common.confirmDelete')} (${showDelete?.name})`}
        onConfirm={() => setShowDelete(null)}
        onCancel={() => setShowDelete(null)}
      />
    </div>
  )
}
