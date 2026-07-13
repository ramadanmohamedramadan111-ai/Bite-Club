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

interface Restaurant {
  id: string
  name: string
  owner: string
  email: string
  phone: string
  cuisine: string
  status: string
  rating: number
  ordersCount: number
  revenue: string
  joinedDate: string
  address: string
}

const RESTAURANTS: Restaurant[] = [
  { id: '1', name: 'Burger House', owner: 'Ahmed Hassan', email: 'info@burgerhouse.com', phone: '+201001002003', cuisine: 'American', status: 'active', rating: 4.5, ordersCount: 1250, revenue: '$28,500', joinedDate: '2024-08-15', address: '12 Tahrir St, Cairo' },
  { id: '2', name: 'Pizza Roma', owner: 'Marco Polo', email: 'info@pizzaroma.com', phone: '+201001004005', cuisine: 'Italian', status: 'active', rating: 4.2, ordersCount: 980, revenue: '$22,300', joinedDate: '2024-09-01', address: '45 Nile Ave, Cairo' },
  { id: '3', name: 'Sushi Master', owner: 'Tanaka Kenji', email: 'info@sushimaster.com', phone: '+201001006007', cuisine: 'Japanese', status: 'pending', rating: 4.8, ordersCount: 450, revenue: '$15,200', joinedDate: '2026-06-20', address: '78 Corniche St, Alexandria' },
  { id: '4', name: 'Tacos El Rey', owner: 'Carlos Ruiz', email: 'info@tacoselrey.com', phone: '+201001008009', cuisine: 'Mexican', status: 'active', rating: 4.0, ordersCount: 670, revenue: '$12,800', joinedDate: '2025-02-10', address: '23 Nile St, Giza' },
  { id: '5', name: 'Green Bowl', owner: 'Mona Said', email: 'info@greenbowl.com', phone: '+201001010011', cuisine: 'Healthy', status: 'suspended', rating: 3.5, ordersCount: 120, revenue: '$3,400', joinedDate: '2025-05-05', address: '56 Zamalek, Cairo' },
  { id: '6', name: 'Spice Kitchen', owner: 'Ali Raza', email: 'info@spicekitchen.com', phone: '+201001012013', cuisine: 'Indian', status: 'active', rating: 4.6, ordersCount: 890, revenue: '$19,700', joinedDate: '2024-11-20', address: '34 Haram St, Giza' },
  { id: '7', name: 'Le Petit Bistro', owner: 'Pierre Dubois', email: 'info@lepetitbistro.com', phone: '+201001014015', cuisine: 'French', status: 'pending', rating: 4.7, ordersCount: 230, revenue: '$8,900', joinedDate: '2026-07-01', address: '89 Maadi, Cairo' },
]

const PAGE_SIZE = 5

export function RestaurantsPage() {
  const { t } = useLocale()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [cuisineFilter, setCuisineFilter] = useState('')
  const [page, setPage] = useState(1)
  const [sortKey, setSortKey] = useState('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [selected, setSelected] = useState<Restaurant | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState<Restaurant | null>(null)
  const [showDetails, setShowDetails] = useState<Restaurant | null>(null)
  const [showDelete, setShowDelete] = useState<Restaurant | null>(null)

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
  }

  let filtered = RESTAURANTS.filter((r) => {
    const q = search.toLowerCase()
    return (r.name.toLowerCase().includes(q) || r.owner.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)) &&
      (!statusFilter || r.status === statusFilter) &&
      (!cuisineFilter || r.cuisine === cuisineFilter)
  })

  filtered.sort((a, b) => {
    const aVal = String((a as any)[sortKey] ?? '')
    const bVal = String((b as any)[sortKey] ?? '')
    const cmp = aVal.localeCompare(bVal)
    return sortDir === 'asc' ? cmp : -cmp
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const columns: Column<Restaurant>[] = [
    { key: 'name', label: t('restaurants.fields.name'), sortable: true },
    { key: 'owner', label: t('restaurants.fields.owner'), sortable: true },
    { key: 'cuisine', label: t('restaurants.fields.cuisine'), sortable: true },
    { key: 'status', label: t('common.status'), sortable: true, render: (r) => <StatusBadge status={r.status} /> },
    { key: 'rating', label: t('restaurants.fields.rating'), sortable: true, render: (r) => <span>{'★'.repeat(Math.floor(r.rating))}{'☆'.repeat(5 - Math.floor(r.rating))} {r.rating}</span> },
    { key: 'revenue', label: t('restaurants.fields.revenue'), sortable: true },
    { key: 'id', label: t('common.actions'), render: (r) => (
      <div className="action-btns">
        <button className="btn btn-sm btn-outline" onClick={(e) => { e.stopPropagation(); setShowDetails(r) }}>{t('common.view')}</button>
        {r.status === 'pending' && <button className="btn btn-sm btn-success" onClick={(e) => { e.stopPropagation() }}>{t('restaurants.approve')}</button>}
        <button className="btn btn-sm btn-outline" onClick={(e) => { e.stopPropagation(); setShowEdit(r) }}>{t('common.edit')}</button>
      </div>
    ) },
  ]

  return (
    <div className="page-content">
      <PageHeader title={t('restaurants.title')} subtitle={t('restaurants.subtitle')}>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ {t('restaurants.createRestaurant')}</button>
      </PageHeader>

      <div className="stats-grid">
        <StatCard label={t('restaurants.totalRestaurants')} value="7" change="+2" direction="up" icon="🏪" iconBg="var(--info-bg)" />
        <StatCard label={t('restaurants.active')} value="4" change="" icon="✅" iconBg="var(--success-bg)" />
        <StatCard label={t('restaurants.pending')} value="2" change="" icon="⏳" iconBg="var(--warning-bg)" />
        <StatCard label={t('restaurants.suspended')} value="1" change="" icon="🚫" iconBg="var(--danger-bg)" />
      </div>

      <div className="card">
        <div className="card-header">
          <div className="toolbar">
            <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1) }} />
            <FilterBar
              filters={[
                { label: t('common.status'), value: statusFilter, options: [
                  { label: t('common.active'), value: 'active' },
                  { label: t('restaurants.pending'), value: 'pending' },
                  { label: t('restaurants.suspended'), value: 'suspended' },
                ], onChange: (v) => { setStatusFilter(v); setPage(1) } },
                { label: t('restaurants.fields.cuisine'), value: cuisineFilter, options: [
                  { label: 'American', value: 'American' },
                  { label: 'Italian', value: 'Italian' },
                  { label: 'Japanese', value: 'Japanese' },
                  { label: 'Mexican', value: 'Mexican' },
                  { label: 'Indian', value: 'Indian' },
                  { label: 'French', value: 'French' },
                  { label: 'Healthy', value: 'Healthy' },
                ], onChange: (v) => { setCuisineFilter(v); setPage(1) } },
              ]}
              onClear={() => { setStatusFilter(''); setCuisineFilter(''); setPage(1) }}
            />
          </div>
        </div>
        <DataTable columns={columns} data={paged} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} onRowClick={(r) => setShowDetails(r)} />
        <PaginationUI currentPage={page} totalPages={totalPages} totalItems={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title={t('restaurants.createRestaurant')} size="lg">
        <div className="form-grid">
          {['name', 'owner', 'email', 'phone', 'cuisine', 'address'].map((f) => (
            <div key={f} className="form-group">
              <label className="form-label">{(t as any)(`restaurants.fields.${f}`, f)}</label>
              <input className="form-input" placeholder={`Enter ${f}`} />
            </div>
          ))}
        </div>
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={() => setShowCreate(false)}>{t('common.cancel')}</button>
          <button className="btn btn-primary" onClick={() => setShowCreate(false)}>{t('common.save')}</button>
        </div>
      </Modal>

      <Modal open={!!showEdit} onClose={() => setShowEdit(null)} title={t('restaurants.editRestaurant')} size="lg">
        {showEdit && (
          <>
            <div className="form-grid">
              {['name', 'owner', 'email', 'phone', 'cuisine', 'address'].map((f) => (
                <div key={f} className="form-group">
                  <label className="form-label">{(t as any)(`restaurants.fields.${f}`)}</label>
                  <input className="form-input" defaultValue={(showEdit as any)[f]} />
                </div>
              ))}
              <div className="form-group">
                <label className="form-label">{t('common.status')}</label>
                <select className="form-input" defaultValue={showEdit.status}>
                  <option value="active">{t('common.active')}</option>
                  <option value="pending">{t('restaurants.pending')}</option>
                  <option value="suspended">{t('restaurants.suspended')}</option>
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

      <Modal open={!!showDetails} onClose={() => setShowDetails(null)} title={t('restaurants.restaurantDetails')} size="lg">
        {showDetails && (
          <div className="details-grid">
            <div className="details-field"><span className="details-label">{t('restaurants.fields.name')}</span><span>{showDetails.name}</span></div>
            <div className="details-field"><span className="details-label">{t('restaurants.fields.owner')}</span><span>{showDetails.owner}</span></div>
            <div className="details-field"><span className="details-label">{t('restaurants.fields.email')}</span><span>{showDetails.email}</span></div>
            <div className="details-field"><span className="details-label">{t('restaurants.fields.phone')}</span><span>{showDetails.phone}</span></div>
            <div className="details-field"><span className="details-label">{t('restaurants.fields.cuisine')}</span><span>{showDetails.cuisine}</span></div>
            <div className="details-field"><span className="details-label">{t('common.status')}</span><span><StatusBadge status={showDetails.status} /></span></div>
            <div className="details-field"><span className="details-label">{t('restaurants.fields.rating')}</span><span>{showDetails.rating} ★</span></div>
            <div className="details-field"><span className="details-label">{t('restaurants.fields.ordersCount')}</span><span>{showDetails.ordersCount}</span></div>
            <div className="details-field"><span className="details-label">{t('restaurants.fields.revenue')}</span><span>{showDetails.revenue}</span></div>
            <div className="details-field"><span className="details-label">{t('restaurants.fields.address')}</span><span>{showDetails.address}</span></div>
            <div className="details-field"><span className="details-label">{t('restaurants.fields.joinedDate')}</span><span>{showDetails.joinedDate}</span></div>
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
