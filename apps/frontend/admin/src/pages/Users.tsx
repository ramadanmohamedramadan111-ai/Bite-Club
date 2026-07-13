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

interface User {
  id: string
  username: string
  firstName: string
  lastName: string
  email: string
  phone: string
  role: string
  status: string
  ordersCount: number
  totalSpent: string
  joinedDate: string
  lastLogin: string
  verified: boolean
}

const USERS: User[] = [
  { id: '1', username: 'ahmed_r', firstName: 'Ahmed', lastName: 'Ramadan', email: 'ahmed@example.com', phone: '+201234567890', role: 'user', status: 'active', ordersCount: 24, totalSpent: '$356.00', joinedDate: '2025-01-15', lastLogin: '2026-07-12 10:30', verified: true },
  { id: '2', username: 'sara_e', firstName: 'Sara', lastName: 'El-Sayed', email: 'sara@example.com', phone: '+201098765432', role: 'user', status: 'active', ordersCount: 18, totalSpent: '$289.50', joinedDate: '2025-03-20', lastLogin: '2026-07-11 14:15', verified: true },
  { id: '3', username: 'omar_f', firstName: 'Omar', lastName: 'Farouk', email: 'omar@example.com', phone: '+201112223344', role: 'user', status: 'blocked', ordersCount: 5, totalSpent: '$78.00', joinedDate: '2025-06-10', lastLogin: '2026-05-20 09:00', verified: true },
  { id: '4', username: 'nada_h', firstName: 'Nada', lastName: 'Hassan', email: 'nada@example.com', phone: '+201556677889', role: 'moderator', status: 'active', ordersCount: 32, totalSpent: '$512.00', joinedDate: '2024-11-05', lastLogin: '2026-07-12 08:45', verified: true },
  { id: '5', username: 'khaled_i', firstName: 'Khaled', lastName: 'Ibrahim', email: 'khaled@example.com', phone: '+201223344556', role: 'restaurantOwner', status: 'active', ordersCount: 0, totalSpent: '$0.00', joinedDate: '2025-02-14', lastLogin: '2026-07-10 16:30', verified: true },
  { id: '6', username: 'mona_s', firstName: 'Mona', lastName: 'Sherif', email: 'mona@example.com', phone: '+201334455667', role: 'user', status: 'active', ordersCount: 45, totalSpent: '$678.00', joinedDate: '2024-09-01', lastLogin: '2026-07-12 11:00', verified: true },
  { id: '7', username: 'yousef_m', firstName: 'Yousef', lastName: 'Mahmoud', email: 'yousef@example.com', phone: '+201445566778', role: 'user', status: 'inactive', ordersCount: 3, totalSpent: '$45.00', joinedDate: '2026-01-20', lastLogin: '2026-04-15 12:00', verified: false },
  { id: '8', username: 'layla_a', firstName: 'Layla', lastName: 'Ahmed', email: 'layla@example.com', phone: '+201556677880', role: 'user', status: 'active', ordersCount: 12, totalSpent: '$167.00', joinedDate: '2025-08-12', lastLogin: '2026-07-11 19:30', verified: true },
  { id: '9', username: 'hassan_m', firstName: 'Hassan', lastName: 'Mohamed', email: 'hassan@example.com', phone: '+201667788990', role: 'admin', status: 'active', ordersCount: 0, totalSpent: '$0.00', joinedDate: '2024-06-01', lastLogin: '2026-07-12 12:00', verified: true },
  { id: '10', username: 'noor_k', firstName: 'Noor', lastName: 'Khaled', email: 'noor@example.com', phone: '+201778899001', role: 'user', status: 'active', ordersCount: 8, totalSpent: '$112.00', joinedDate: '2026-03-05', lastLogin: '2026-07-10 20:15', verified: true },
]

const PAGE_SIZE = 5

export function UsersPage() {
  const { t } = useLocale()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [sortKey, setSortKey] = useState('username')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState<User | null>(null)
  const [showDelete, setShowDelete] = useState<User | null>(null)
  const [showDetails, setShowDetails] = useState<User | null>(null)

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  let filtered = USERS.filter((u) => {
    const q = search.toLowerCase()
    const matchesSearch = u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.firstName.toLowerCase().includes(q) || u.lastName.toLowerCase().includes(q)
    const matchesRole = !roleFilter || u.role === roleFilter
    const matchesStatus = !statusFilter || u.status === statusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

  filtered.sort((a, b) => {
    const aVal = String((a as any)[sortKey] ?? '')
    const bVal = String((b as any)[sortKey] ?? '')
    const cmp = aVal.localeCompare(bVal)
    return sortDir === 'asc' ? cmp : -cmp
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const columns: Column<User>[] = [
    { key: 'username', label: t('users.fields.username'), sortable: true },
    { key: 'firstName', label: t('users.fields.firstName'), sortable: true, render: (u) => `${u.firstName} ${u.lastName}` },
    { key: 'email', label: t('users.fields.email'), sortable: true },
    { key: 'role', label: t('users.fields.role'), sortable: true, render: (u) => <StatusBadge status={u.role} /> },
    { key: 'status', label: t('common.status'), sortable: true, render: (u) => <StatusBadge status={u.status} /> },
    { key: 'ordersCount', label: t('users.fields.ordersCount'), sortable: true },
    { key: 'joinedDate', label: t('users.fields.joinedDate'), sortable: true },
    { key: 'id', label: t('common.actions'), render: (u) => (
      <div className="action-btns">
        <button className="btn btn-sm btn-outline" onClick={(e) => { e.stopPropagation(); setShowDetails(u) }}>{t('common.view')}</button>
        <button className="btn btn-sm btn-outline" onClick={(e) => { e.stopPropagation(); setShowEdit(u) }}>{t('common.edit')}</button>
        <button className="btn btn-sm btn-danger" onClick={(e) => { e.stopPropagation(); setShowDelete(u) }}>{t('common.delete')}</button>
      </div>
    ) },
  ]

  return (
    <div className="page-content">
      <PageHeader title={t('users.title')} subtitle={t('users.subtitle')}>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ {t('users.createUser')}</button>
      </PageHeader>

      <div className="stats-grid">
        <StatCard label={t('users.totalUsers')} value="10" change="+3" direction="up" icon="👥" iconBg="var(--info-bg)" />
        <StatCard label={t('users.newThisMonth')} value="2" change="+1" direction="up" icon="📈" iconBg="var(--success-bg)" />
        <StatCard label={t('users.verified')} value="8" change="80%" direction="up" icon="✅" iconBg="var(--success-bg)" />
        <StatCard label={t('users.unverified')} value="2" change="20%" direction="down" icon="❌" iconBg="var(--warning-bg)" />
      </div>

      <div className="card">
        <div className="card-header">
          <div className="toolbar">
            <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1) }} />
            <FilterBar
              filters={[
                { label: t('users.fields.role'), value: roleFilter, options: [
                  { label: t('users.roles.user'), value: 'user' },
                  { label: t('users.roles.admin'), value: 'admin' },
                  { label: t('users.roles.moderator'), value: 'moderator' },
                  { label: t('users.roles.restaurantOwner'), value: 'restaurantOwner' },
                ], onChange: (v) => { setRoleFilter(v); setPage(1) } },
                { label: t('common.status'), value: statusFilter, options: [
                  { label: t('common.active'), value: 'active' },
                  { label: t('common.inactive'), value: 'inactive' },
                  { label: t('common.blocked'), value: 'blocked' },
                ], onChange: (v) => { setStatusFilter(v); setPage(1) } },
              ]}
              onClear={() => { setRoleFilter(''); setStatusFilter(''); setPage(1) }}
            />
          </div>
        </div>
        <DataTable
          columns={columns}
          data={paged}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
          onRowClick={(u) => setShowDetails(u)}
        />
        <PaginationUI
          currentPage={page}
          totalPages={totalPages}
          totalItems={filtered.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title={t('users.createUser')} size="lg">
        <div className="form-grid">
          {['firstName', 'lastName', 'username', 'email', 'phone'].map((f) => (
            <div key={f} className="form-group">
              <label className="form-label">{(t as any)(`users.fields.${f}`)}</label>
              <input className="form-input" placeholder={`Enter ${f}`} />
            </div>
          ))}
          <div className="form-group">
            <label className="form-label">{t('users.fields.role')}</label>
            <select className="form-input">
              <option>{t('users.roles.user')}</option>
              <option>{t('users.roles.moderator')}</option>
              <option>{t('users.roles.restaurantOwner')}</option>
              <option>{t('users.roles.admin')}</option>
            </select>
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={() => setShowCreate(false)}>{t('common.cancel')}</button>
          <button className="btn btn-primary" onClick={() => setShowCreate(false)}>{t('common.save')}</button>
        </div>
      </Modal>

      <Modal open={!!showEdit} onClose={() => setShowEdit(null)} title={t('users.editUser')} size="lg">
        {showEdit && (
          <>
            <div className="form-grid">
              {['firstName', 'lastName', 'username', 'email', 'phone'].map((f) => (
                <div key={f} className="form-group">
                  <label className="form-label">{(t as any)(`users.fields.${f}`)}</label>
                  <input className="form-input" defaultValue={(showEdit as any)[f]} />
                </div>
              ))}
              <div className="form-group">
                <label className="form-label">{t('users.fields.role')}</label>
                <select className="form-input" defaultValue={showEdit.role}>
                  <option value="user">{t('users.roles.user')}</option>
                  <option value="moderator">{t('users.roles.moderator')}</option>
                  <option value="restaurantOwner">{t('users.roles.restaurantOwner')}</option>
                  <option value="admin">{t('users.roles.admin')}</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">{t('common.status')}</label>
                <select className="form-input" defaultValue={showEdit.status}>
                  <option value="active">{t('common.active')}</option>
                  <option value="inactive">{t('common.inactive')}</option>
                  <option value="blocked">{t('common.blocked')}</option>
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

      <Modal open={!!showDetails} onClose={() => setShowDetails(null)} title={t('users.userDetails')} size="lg">
        {showDetails && (
          <div className="details-grid">
            <div className="details-field"><span className="details-label">{t('users.fields.username')}</span><span>{showDetails.username}</span></div>
            <div className="details-field"><span className="details-label">{t('users.fields.firstName')}</span><span>{showDetails.firstName} {showDetails.lastName}</span></div>
            <div className="details-field"><span className="details-label">{t('users.fields.email')}</span><span>{showDetails.email}</span></div>
            <div className="details-field"><span className="details-label">{t('users.fields.phone')}</span><span>{showDetails.phone}</span></div>
            <div className="details-field"><span className="details-label">{t('users.fields.role')}</span><span><StatusBadge status={showDetails.role} /></span></div>
            <div className="details-field"><span className="details-label">{t('common.status')}</span><span><StatusBadge status={showDetails.status} /></span></div>
            <div className="details-field"><span className="details-label">{t('users.fields.ordersCount')}</span><span>{showDetails.ordersCount}</span></div>
            <div className="details-field"><span className="details-label">{t('users.fields.totalSpent')}</span><span>{showDetails.totalSpent}</span></div>
            <div className="details-field"><span className="details-label">{t('users.fields.joinedDate')}</span><span>{showDetails.joinedDate}</span></div>
            <div className="details-field"><span className="details-label">{t('users.fields.lastLogin')}</span><span>{showDetails.lastLogin}</span></div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!showDelete}
        title={t('common.delete')}
        message={`${t('common.confirmDelete')} (${showDelete?.username})`}
        onConfirm={() => setShowDelete(null)}
        onCancel={() => setShowDelete(null)}
      />
    </div>
  )
}
