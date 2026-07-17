import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight, Copy, Filter, Pencil, Plus, Trash2, Utensils } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { DeleteModal } from '../../components/common/DeleteModal'
import { FormModal } from '../../components/common/FormModal'
import { useMenuStore } from '../../store/menuStore'
import { useCategoryStore } from '../../store/categoryStore'
import type { ApiMenuItem } from '../../store/menuTypes'

type ItemForm = {
  title: string
  description: string
  price: string
  menu_category_id: string
  availability: 'available' | 'unavailable'
  image: File | null
}

const EMPTY_FORM: ItemForm = {
  title: '',
  description: '',
  price: '',
  menu_category_id: '',
  availability: 'available',
  image: null,
}

export function MenuPage() {
  const { t } = useTranslation()
  const { items, meta, isLoading, fetchItems, addItem, updateItem, deleteItem, toggleAvailability } = useMenuStore()
  const { categories, fetchCategories } = useCategoryStore()

  const [activeCatId, setActiveCatId]   = useState<'all' | number>('all')
  const [page, setPage]                 = useState(1)
  const [showCreate, setShowCreate]     = useState(false)
  const [editTarget, setEditTarget]     = useState<ApiMenuItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ApiMenuItem | null>(null)
  const [form, setForm]                 = useState<ItemForm>(EMPTY_FORM)
  const [isSaving, setIsSaving]         = useState(false)

  useEffect(() => { fetchCategories() }, [])

  useEffect(() => {
    fetchItems({
      menu_category_id: activeCatId === 'all' ? undefined : activeCatId,
      page,
    })
  }, [activeCatId, page])

  const handleTabChange = (id: 'all' | number) => {
    setActiveCatId(id)
    setPage(1)
  }

  const openCreate = () => {
    setForm({ ...EMPTY_FORM, menu_category_id: categories[0] ? String(categories[0].id) : '' })
    setShowCreate(true)
  }

  const openEdit = (item: ApiMenuItem) => {
    setForm({
      title: item.title,
      description: item.description,
      price: String(item.price),
      menu_category_id: String(item.menu_category_id),
      availability: item.availability,
      image: null,
    })
    setEditTarget(item)
  }

  const handleSaveCreate = async () => {
    if (!form.title.trim() || !form.price || !form.menu_category_id || !form.image) {
      toast.error(t('fillAllFields'))
      return
    }
    setIsSaving(true)
    try {
      await addItem({
        title: form.title,
        description: form.description,
        price: parseFloat(form.price),
        menu_category_id: parseInt(form.menu_category_id),
        availability: form.availability,
        image: form.image,
      })
      toast.success(t('itemCreated'))
      setShowCreate(false)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('errorOccurred'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveEdit = async () => {
    if (!editTarget || !form.title.trim() || !form.price) return
    setIsSaving(true)
    try {
      await updateItem(editTarget.id, {
        title: form.title,
        description: form.description,
        price: parseFloat(form.price),
        menu_category_id: parseInt(form.menu_category_id),
        availability: form.availability,
        image: form.image,
      })
      toast.success(t('itemUpdated'))
      setEditTarget(null)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('errorOccurred'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteItem(deleteTarget.id)
      toast.success(t('itemDeleted'))
      setDeleteTarget(null)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('errorOccurred'))
    }
  }

  const formFields = (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('itemName')}</label>
        <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="e.g., Signature Wagyu Burger"
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('description')}</label>
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Brief description..." rows={3} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500 resize-none" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('price')}</label>
          <input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
            placeholder="0.00"
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('category')}</label>
          <select value={form.menu_category_id} onChange={(e) => setForm({ ...form, menu_category_id: e.target.value })}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
            <option value="">{t('selectCategory')}</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('availability')}</label>
        <div className="flex gap-3">
          {(['available', 'unavailable'] as const).map((v) => (
            <button key={v} type="button" onClick={() => setForm({ ...form, availability: v })}
              className={`flex-1 rounded-xl border-2 py-2 text-sm font-semibold capitalize transition ${form.availability === v ? 'border-brand-orange bg-orange-50 text-brand-orange dark:bg-orange-900/20' : 'border-gray-200 bg-white text-gray-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
              {t(v)}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
          {t('image')}
          {editTarget && <span className="ml-1 text-xs text-gray-400 font-normal normal-case">({t('leaveEmptyToKeep')})</span>}
        </label>
        <input type="file" accept="image/*" onChange={(e) => setForm({ ...form, image: e.target.files?.[0] ?? null })}
          className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-orange file:px-3 file:py-1 file:text-xs file:font-semibold file:text-white hover:file:opacity-90 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200" />
        {form.image && <p className="mt-1 text-xs text-gray-400">{form.image.name}</p>}
      </div>
    </>
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('menuManagement')}</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{t('menuManagementSub')}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link to="/menu/categories"
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:border-brand-orange hover:text-brand-orange transition dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
            <Utensils size={14} /> {t('categoryManagement')}
          </Link>
          <button className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:border-brand-orange hover:text-brand-orange transition dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
            <Filter size={14} /> {t('filter')}
          </button>
          <button onClick={openCreate}
            className="flex items-center gap-2 rounded-xl bg-brand-orange px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition">
            <Plus size={14} /> {t('createNewItem')}
          </button>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => handleTabChange('all')}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${activeCatId === 'all' ? 'bg-brand-orange text-white' : 'border border-gray-200 bg-white text-gray-600 hover:border-brand-orange dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
          {t('allItems')}
        </button>
        {categories.map((cat) => (
          <button key={cat.id} onClick={() => handleTabChange(cat.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${activeCatId === cat.id ? 'bg-brand-orange text-white' : 'border border-gray-200 bg-white text-gray-600 hover:border-brand-orange dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
            {cat.title}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-16">
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-brand-orange border-t-transparent" />
        </div>
      )}

      {/* Cards grid */}
      {!isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden dark:border-slate-700 dark:bg-slate-900">
              {/* Image area */}
              <div className="relative h-44 bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
                {item.image_url
                  ? <img src={item.image_url} alt={item.title} className="h-full w-full object-cover" />
                  : <span className="text-xs text-gray-400">img</span>
                }
                {/* Edit button top-right */}
                <button onClick={() => openEdit(item)}
                  className="absolute top-2 end-2 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow text-gray-500 hover:text-brand-orange dark:bg-slate-700 dark:text-slate-300">
                  <Pencil size={12} />
                </button>
              </div>

              {/* Body */}
              <div className="p-3">
                <div className="flex items-start justify-between gap-2 mb-0.5">
                  <p className="font-bold text-sm text-gray-900 dark:text-white leading-snug">{item.title}</p>
                  <div className="text-start shrink-0">
                    <span className="text-sm font-bold text-brand-orange">{item.price}</span>
                    <span className="block text-[10px] font-semibold text-brand-orange">EGP</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mb-3">{item.category.title}</p>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  {/* Availability toggle */}
                  <button
                    onClick={() => toggleAvailability(item.id, item.availability)}
                    className={`flex items-center gap-2 text-xs font-semibold ${item.availability === 'available' ? 'text-green-600' : 'text-gray-400'}`}
                  >
                    <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${item.availability === 'available' ? 'bg-brand-orange' : 'bg-gray-200 dark:bg-slate-600'}`}>
                      <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${item.availability === 'available' ? 'translate-x-4' : 'translate-x-1'}`} />
                    </span>
                    {item.availability === 'available' ? t('available') : t('unavailable')}
                  </button>

                  {/* Action buttons */}
                  <div className="flex gap-1.5">
                    <button onClick={() => setDeleteTarget(item)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-red-400 hover:text-red-500 dark:border-slate-600">
                      <Trash2 size={12} />
                    </button>
                    <button className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-brand-orange hover:text-brand-orange dark:border-slate-600">
                      <Copy size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Add New Item card */}
          <button onClick={openCreate}
            className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-brand-orange/40 bg-white p-6 text-center hover:border-brand-orange hover:bg-orange-50/50 transition dark:bg-slate-900 min-h-[260px]">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-brand-orange/50 text-brand-orange mb-3">
              <Plus size={20} />
            </div>
            <p className="text-sm font-bold text-gray-700 dark:text-slate-200">{t('addNewItem')}</p>
            <p className="text-xs text-gray-400 mt-1">
              {activeCatId !== 'all' ? categories.find((c) => c.id === activeCatId)?.title : t('menuManagement')}
            </p>
          </button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-gray-400 gap-2">
          <Utensils size={32} className="text-gray-300" />
          <p className="text-sm">{t('noItemsFound')}</p>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && meta.last_page > 1 && (
        <div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-slate-700">
          <p className="text-sm text-gray-500 dark:text-slate-400">
            {t('page')} {meta.current_page} {t('of')} {meta.last_page} — {meta.total} {t('items')}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={meta.current_page === 1}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition hover:border-brand-orange hover:text-brand-orange disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-600 dark:text-slate-400"
            ><ChevronLeft size={16} /></button>

            {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)}
                className={`flex h-9 w-9 items-center justify-center rounded-xl border text-sm font-semibold transition ${p === meta.current_page ? 'border-brand-orange bg-brand-orange text-white' : 'border-gray-200 text-gray-600 hover:border-brand-orange hover:text-brand-orange dark:border-slate-600 dark:text-slate-300'}`}>
                {p}
              </button>
            ))}

            <button
              onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
              disabled={meta.current_page === meta.last_page}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition hover:border-brand-orange hover:text-brand-orange disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-600 dark:text-slate-400"
            ><ChevronRight size={16} /></button>
          </div>
        </div>
      )}

      {/* Modals */}
      <FormModal isOpen={showCreate} onClose={() => setShowCreate(false)} title={t('createNewItem')} onSave={handleSaveCreate} saveDisabled={isSaving || !form.title.trim() || !form.price || !form.image}>
        {formFields}
      </FormModal>
      <FormModal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title={t('editItem')} onSave={handleSaveEdit} saveDisabled={isSaving || !form.title.trim() || !form.price}>
        {formFields}
      </FormModal>
      <DeleteModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title={t('deleteItem')} itemName={deleteTarget?.title ?? ''} />
    </div>
  )
}
