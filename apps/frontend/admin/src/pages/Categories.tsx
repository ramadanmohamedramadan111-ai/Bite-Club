import { useState, useEffect } from 'react'
import { useLocale } from '../contexts/LocaleContext'
import { PageHeader } from '../components/PageHeader'
import { SearchBar } from '../components/SearchBar'
import { DataTable, type Column } from '../components/DataTable'
import { PaginationUI } from '../components/PaginationUI'
import { Modal } from '../components/Modal'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { StatCard } from '../components/StatCard'
import api from '../lib/api'

interface Category {
  id: string | number
  name: string
  slug: string
}

const PAGE_SIZE = 5

export function CategoriesPage() {
  const { t } = useLocale()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sortKey, setSortKey] = useState('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const [showCreate, setShowCreate] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createSlug, setCreateSlug] = useState('')

  const [showEdit, setShowEdit] = useState<Category | null>(null)
  const [editName, setEditName] = useState('')
  const [editSlug, setEditSlug] = useState('')

  const [showDetails, setShowDetails] = useState<Category | null>(null)
  const [showDelete, setShowDelete] = useState<Category | null>(null)

  // Fetch categories from the backend API
  const fetchCategories = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await api.get('/admin/restaurant-categories', { params: { all: true } })
      const items = response.data?.data?.items || []
      setCategories(items)
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || 'Failed to fetch categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const handleOpenEdit = (c: Category) => {
    setShowEdit(c)
    setEditName(c.name)
    setEditSlug(c.slug || '')
    setFormError('')
  }

  const handleOpenCreate = () => {
    setShowCreate(true)
    setCreateName('')
    setCreateSlug('')
    setFormError('')
  }

  // Create a new category
  const handleCreate = async () => {
    if (!createName.trim()) {
      setFormError('Category name is required')
      return
    }
    setSaving(true)
    setFormError('')
    try {
      await api.post('/admin/restaurant-categories', {
        name: createName.trim(),
        slug: createSlug.trim() || undefined,
      })
      setShowCreate(false)
      fetchCategories()
    } catch (err: any) {
      console.error(err)
      const validationErrors = err.response?.data?.errors
      if (validationErrors) {
        const messages = Object.values(validationErrors).flat().join(', ')
        setFormError(messages)
      } else {
        setFormError(err.response?.data?.message || 'Failed to create category')
      }
    } finally {
      setSaving(false)
    }
  }

  // Edit/Update an existing category
  const handleUpdate = async () => {
    if (!showEdit) return
    if (!editName.trim()) {
      setFormError('Category name is required')
      return
    }
    setSaving(true)
    setFormError('')
    try {
      await api.put(`/admin/restaurant-categories/${showEdit.id}`, {
        name: editName.trim(),
        slug: editSlug.trim() || undefined,
      })
      setShowEdit(null)
      fetchCategories()
    } catch (err: any) {
      console.error(err)
      const validationErrors = err.response?.data?.errors
      if (validationErrors) {
        const messages = Object.values(validationErrors).flat().join(', ')
        setFormError(messages)
      } else {
        setFormError(err.response?.data?.message || 'Failed to update category')
      }
    } finally {
      setSaving(false)
    }
  }

  // Delete category
  const handleDelete = async () => {
    if (!showDelete) return
    try {
      await api.delete(`/admin/restaurant-categories/${showDelete.id}`)
      setShowDelete(null)
      fetchCategories()
    } catch (err: any) {
      console.error(err)
      alert(err.response?.data?.message || 'Failed to delete category')
    }
  }

  // Local filtering & sorting
  const filtered = categories.filter((c) => {
    const q = search.toLowerCase()
    return (c.name || '').toLowerCase().includes(q) || (c.slug || '').toLowerCase().includes(q)
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
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: t('categories.fields.name'), sortable: true },
    { key: 'slug', label: t('categories.fields.slug'), sortable: true },
    {
      key: 'id',
      label: t('common.actions'),
      render: (c) => (
        <div className="action-btns">
          <button
            className="btn btn-sm btn-outline"
            onClick={(e) => {
              e.stopPropagation()
              setShowDetails(c)
            }}
          >
            {t('common.details')}
          </button>
          <button
            className="btn btn-sm btn-outline"
            onClick={(e) => {
              e.stopPropagation()
              handleOpenEdit(c)
            }}
          >
            {t('common.edit')}
          </button>
          <button
            className="btn btn-sm btn-danger"
            onClick={(e) => {
              e.stopPropagation()
              setShowDelete(c)
            }}
          >
            {t('common.delete')}
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="page-content">
      <PageHeader title={t('categories.title')} subtitle={t('categories.subtitle')}>
        <button className="btn btn-primary" onClick={handleOpenCreate}>
          + {t('categories.createCategory')}
        </button>
      </PageHeader>

      <div className="stats-grid">
        <StatCard
          label={t('categories.totalCategories')}
          value={loading ? '...' : categories.length.toString()}
          change=""
          icon="📂"
          iconBg="var(--info-bg)"
        />
      </div>

      {error && (
        <div
          style={{
            background: 'var(--danger-bg)',
            border: '1px solid var(--danger)',
            color: 'var(--danger)',
            padding: '12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '13px',
            fontWeight: '500',
            marginBottom: '16px',
          }}
        >
          {error}
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <SearchBar
            value={search}
            onChange={(v) => {
              setSearch(v)
              setPage(1)
            }}
          />
        </div>
        <DataTable
          columns={columns}
          data={paged}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
          onRowClick={(c) => setShowDetails(c)}
          loading={loading}
        />
        <PaginationUI
          currentPage={page}
          totalPages={totalPages}
          totalItems={filtered.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title={t('categories.createCategory')} size="md">
        {formError && (
          <div
            style={{
              background: 'var(--danger-bg)',
              border: '1px solid var(--danger)',
              color: 'var(--danger)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              fontWeight: '500',
              marginBottom: '15px',
            }}
          >
            {formError}
          </div>
        )}
        <div className="form-grid two-col">
          <div className="form-group">
            <label className="form-label">{t('categories.fields.name')}</label>
            <input
              className="form-input"
              placeholder="Category name"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              disabled={saving}
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t('categories.fields.slug')}</label>
            <input
              className="form-input"
              placeholder="category-slug (optional)"
              value={createSlug}
              onChange={(e) => setCreateSlug(e.target.value)}
              disabled={saving}
            />
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={() => setShowCreate(false)} disabled={saving}>
            {t('common.cancel')}
          </button>
          <button className="btn btn-primary" onClick={handleCreate} disabled={saving}>
            {saving ? 'Saving...' : t('common.save')}
          </button>
        </div>
      </Modal>

      <Modal open={!!showEdit} onClose={() => setShowEdit(null)} title={t('categories.editCategory')} size="md">
        {showEdit && (
          <>
            {formError && (
              <div
                style={{
                  background: 'var(--danger-bg)',
                  border: '1px solid var(--danger)',
                  color: 'var(--danger)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13px',
                  fontWeight: '500',
                  marginBottom: '15px',
                }}
              >
                {formError}
              </div>
            )}
            <div className="form-grid two-col">
              <div className="form-group">
                <label className="form-label">{t('categories.fields.name')}</label>
                <input
                  className="form-input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  disabled={saving}
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t('categories.fields.slug')}</label>
                <input
                  className="form-input"
                  value={editSlug}
                  onChange={(e) => setEditSlug(e.target.value)}
                  disabled={saving}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowEdit(null)} disabled={saving}>
                {t('common.cancel')}
              </button>
              <button className="btn btn-primary" onClick={handleUpdate} disabled={saving}>
                {saving ? 'Saving...' : t('common.save')}
              </button>
            </div>
          </>
        )}
      </Modal>

      <Modal open={!!showDetails} onClose={() => setShowDetails(null)} title={t('categories.categoryDetails')} size="md">
        {showDetails && (
          <div className="details-grid">
            <div className="details-field">
              <span className="details-label">{t('common.id') || 'ID'}</span>
              <span>{showDetails.id}</span>
            </div>
            <div className="details-field">
              <span className="details-label">{t('categories.fields.name')}</span>
              <span>{showDetails.name}</span>
            </div>
            <div className="details-field">
              <span className="details-label">{t('categories.fields.slug')}</span>
              <span>{showDetails.slug || '-'}</span>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!showDelete}
        title={t('common.delete')}
        message={`${t('common.confirmDelete')} (${showDelete?.name})`}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(null)}
      />
    </div>
  )
}
