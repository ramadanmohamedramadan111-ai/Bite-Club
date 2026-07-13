import { useState } from 'react'
import { useLocale } from '../contexts/LocaleContext'
import { PageHeader } from '../components/PageHeader'
import { SearchBar } from '../components/SearchBar'
import { DataTable, type Column } from '../components/DataTable'
import { PaginationUI } from '../components/PaginationUI'
import { Modal } from '../components/Modal'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { StatusBadge } from '../components/StatusBadge'
import { StatCard } from '../components/StatCard'

interface Category {
  id: string
  name: string
  slug: string
  icon: string
  restaurantsCount: number
  itemsCount: number
  status: string
  order: number
}

const CATEGORIES: Category[] = [
  { id: '1', name: 'Burgers', slug: 'burgers', icon: '🍔', restaurantsCount: 12, itemsCount: 45, status: 'active', order: 1 },
  { id: '2', name: 'Pizza', slug: 'pizza', icon: '🍕', restaurantsCount: 8, itemsCount: 32, status: 'active', order: 2 },
  { id: '3', name: 'Sushi', slug: 'sushi', icon: '🍣', restaurantsCount: 5, itemsCount: 28, status: 'active', order: 3 },
  { id: '4', name: 'Salads', slug: 'salads', icon: '🥗', restaurantsCount: 7, itemsCount: 18, status: 'active', order: 4 },
  { id: '5', name: 'Desserts', slug: 'desserts', icon: '🍰', restaurantsCount: 10, itemsCount: 35, status: 'active', order: 5 },
  { id: '6', name: 'Beverages', slug: 'beverages', icon: '🥤', restaurantsCount: 15, itemsCount: 40, status: 'active', order: 6 },
  { id: '7', name: 'Mexican', slug: 'mexican', icon: '🌮', restaurantsCount: 3, itemsCount: 15, status: 'inactive', order: 7 },
  { id: '8', name: 'Indian', slug: 'indian', icon: '🍛', restaurantsCount: 4, itemsCount: 22, status: 'active', order: 8 },
]

const PAGE_SIZE = 5

export function CategoriesPage() {
  const { t } = useLocale()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sortKey, setSortKey] = useState('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState<Category | null>(null)
  const [showDetails, setShowDetails] = useState<Category | null>(null)
  const [showDelete, setShowDelete] = useState<Category | null>(null)

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
  }

  let filtered = CATEGORIES.filter((c) => {
    const q = search.toLowerCase()
    return c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
  })

  filtered.sort((a, b) => {
    const aVal = String((a as any)[sortKey] ?? '')
    const bVal = String((b as any)[sortKey] ?? '')
    const cmp = aVal.localeCompare(bVal)
    return sortDir === 'asc' ? cmp : -cmp
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const columns: Column<Category>[] = [
    { key: 'name', label: t('categories.fields.name'), sortable: true, render: (c) => <span><span className="category-icon">{c.icon}</span> {c.name}</span> },
    { key: 'slug', label: t('categories.fields.slug'), sortable: true },
    { key: 'restaurantsCount', label: t('categories.fields.restaurantsCount'), sortable: true },
    { key: 'itemsCount', label: t('categories.fields.itemsCount'), sortable: true },
    { key: 'status', label: t('common.status'), sortable: true, render: (c) => <StatusBadge status={c.status} /> },
    { key: 'order', label: t('categories.fields.order'), sortable: true },
    { key: 'id', label: t('common.actions'), render: (c) => (
      <div className="action-btns">
        <button className="btn btn-sm btn-outline" onClick={(e) => { e.stopPropagation(); setShowDetails(c) }}>{t('common.details')}</button>
        <button className="btn btn-sm btn-outline" onClick={(e) => { e.stopPropagation(); setShowEdit(c) }}>{t('common.edit')}</button>
        <button className="btn btn-sm btn-danger" onClick={(e) => { e.stopPropagation(); setShowDelete(c) }}>{t('common.delete')}</button>
      </div>
    ) },
  ]

  return (
    <div className="page-content">
      <PageHeader title={t('categories.title')} subtitle={t('categories.subtitle')}>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ {t('categories.createCategory')}</button>
      </PageHeader>

      <div className="stats-grid">
        <StatCard label={t('categories.totalCategories')} value="8" change="" icon="📂" iconBg="var(--info-bg)" />
        <StatCard label={t('categories.activeCategories')} value="7" change="" icon="✅" iconBg="var(--success-bg)" />
      </div>

      <div className="card">
        <div className="card-header">
          <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1) }} />
        </div>
        <DataTable columns={columns} data={paged} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} onRowClick={(c) => setShowDetails(c)} />
        <PaginationUI currentPage={page} totalPages={totalPages} totalItems={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title={t('categories.createCategory')} size="md">
        <div className="form-grid two-col">
          <div className="form-group">
            <label className="form-label">{t('categories.fields.name')}</label>
            <input className="form-input" placeholder="Category name" />
          </div>
          <div className="form-group">
            <label className="form-label">{t('categories.fields.icon')}</label>
            <input className="form-input" placeholder="Emoji icon" />
          </div>
          <div className="form-group">
            <label className="form-label">{t('categories.fields.slug')}</label>
            <input className="form-input" placeholder="category-slug" />
          </div>
          <div className="form-group">
            <label className="form-label">{t('categories.fields.order')}</label>
            <input className="form-input" type="number" placeholder="1" />
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={() => setShowCreate(false)}>{t('common.cancel')}</button>
          <button className="btn btn-primary" onClick={() => setShowCreate(false)}>{t('common.save')}</button>
        </div>
      </Modal>

      <Modal open={!!showEdit} onClose={() => setShowEdit(null)} title={t('categories.editCategory')} size="md">
        {showEdit && (
          <>
            <div className="form-grid two-col">
              <div className="form-group">
                <label className="form-label">{t('categories.fields.name')}</label>
                <input className="form-input" defaultValue={showEdit.name} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('categories.fields.icon')}</label>
                <input className="form-input" defaultValue={showEdit.icon} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('categories.fields.slug')}</label>
                <input className="form-input" defaultValue={showEdit.slug} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('categories.fields.order')}</label>
                <input className="form-input" type="number" defaultValue={showEdit.order} />
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

      <Modal open={!!showDetails} onClose={() => setShowDetails(null)} title={t('categories.categoryDetails')} size="md">
        {showDetails && (
          <div className="details-grid">
            <div className="details-field"><span className="details-label">{t('categories.fields.name')}</span><span><span className="category-icon">{showDetails.icon}</span> {showDetails.name}</span></div>
            <div className="details-field"><span className="details-label">{t('categories.fields.slug')}</span><span>{showDetails.slug}</span></div>
            <div className="details-field"><span className="details-label">{t('categories.fields.restaurantsCount')}</span><span>{showDetails.restaurantsCount}</span></div>
            <div className="details-field"><span className="details-label">{t('categories.fields.itemsCount')}</span><span>{showDetails.itemsCount}</span></div>
            <div className="details-field"><span className="details-label">{t('common.status')}</span><span><StatusBadge status={showDetails.status} /></span></div>
            <div className="details-field"><span className="details-label">{t('categories.fields.order')}</span><span>{showDetails.order}</span></div>
          </div>
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
