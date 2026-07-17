import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Pencil, Trash2, Search, ArrowLeft, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { DeleteModal } from '../../components/common/DeleteModal'
import { FormModal } from '../../components/common/FormModal'
import { useCategoryStore } from '../../store/categoryStore'
import type { ApiCategory } from '../../store/menuTypes'

type CategoryForm = {
  title: string
  icon_name: string
  short_description: string
  visibility: 'visible' | 'hidden'
}

const EMPTY_FORM: CategoryForm = {
  title: '',
  icon_name: '',
  short_description: '',
  visibility: 'visible',
}

export function CategoriesPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const {
    categories, isLoading,
    fetchCategories, addCategory, updateCategory, toggleVisibility, deleteCategory,
  } = useCategoryStore()

  const [search, setSearch]           = useState('')
  const [showCreate, setShowCreate]   = useState(false)
  const [editTarget, setEditTarget]   = useState<ApiCategory | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ApiCategory | null>(null)
  const [form, setForm]               = useState<CategoryForm>(EMPTY_FORM)
  const [isSaving, setIsSaving]       = useState(false)

  useEffect(() => { fetchCategories() }, [])

  const filtered = categories.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.short_description.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => { setForm(EMPTY_FORM); setShowCreate(true) }

  const openEdit = (cat: ApiCategory) => {
    setForm({
      title: cat.title,
      icon_name: cat.icon_name,
      short_description: cat.short_description,
      visibility: cat.visibility,
    })
    setEditTarget(cat)
  }

  const handleSaveCreate = async () => {
    if (!form.title.trim()) return
    setIsSaving(true)
    try {
      await addCategory(form)
      toast.success(t('categoryCreated'))
      setShowCreate(false)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('errorOccurred'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveEdit = async () => {
    if (!editTarget || !form.title.trim()) return
    setIsSaving(true)
    try {
      await updateCategory(editTarget.id, form)
      toast.success(t('categoryUpdated'))
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
      await deleteCategory(deleteTarget.id)
      toast.success(t('categoryDeleted'))
      setDeleteTarget(null)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('errorOccurred'))
    }
  }

  // Shared form fields used in both create and edit modals
  const formFields = (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
          {t('categoryName')}
        </label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="e.g., Main Courses"
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
          {t('categoryIcon')}
          <span className="ml-1 text-xs text-gray-400 normal-case font-normal">(FontAwesome class e.g. fa-hamburger)</span>
        </label>
        <input
          type="text"
          value={form.icon_name}
          onChange={(e) => setForm({ ...form, icon_name: e.target.value })}
          placeholder="fa-hamburger"
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
          {t('categoryDescription')}
        </label>
        <textarea
          value={form.short_description}
          onChange={(e) => setForm({ ...form, short_description: e.target.value })}
          placeholder="Brief description..."
          rows={3}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
          {t('visible')}
        </label>
        <div className="flex gap-3">
          {(['visible', 'hidden'] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setForm({ ...form, visibility: v })}
              className={`flex-1 rounded-xl border-2 py-2 text-sm font-semibold capitalize transition ${
                form.visibility === v
                  ? 'border-brand-orange bg-orange-50 text-brand-orange dark:bg-orange-900/20'
                  : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
    </>
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/menu')}
            className="py-2.5 text-sm font-semibold text-gray-500 hover:text-brand-orange transition dark:text-slate-400"
          >
            {i18n.language === 'ar' ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('categoryManagement')}</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{t('categoryManagementSub')}</p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-brand-orange px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition shrink-0"
        >
          <Plus size={14} /> {t('addNewCategory')}
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder={t('searchCategories')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md ps-10 pe-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500"
        />
      </div>

      {/* Loading spinner */}
      {isLoading && (
        <div className="flex justify-center py-16">
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-brand-orange border-t-transparent" />
        </div>
      )}

      {/* Category cards */}
      {!isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((cat) => (
            <div key={cat.id} className="rounded-xl border border-gray-100 bg-white shadow-sm p-5 hover:border-brand-orange hover:shadow-md transition dark:border-slate-700 dark:bg-slate-900">
              {/* Card header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/30">
                  <i className={`fa ${cat.icon_name} text-2xl text-brand-orange`} />
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => openEdit(cat)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-brand-orange hover:text-brand-orange dark:border-slate-600"
                  ><Pencil size={13} /></button>
                  <button
                    onClick={() => setDeleteTarget(cat)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-red-400 hover:text-red-500 dark:border-slate-600"
                  ><Trash2 size={13} /></button>
                </div>
              </div>

              <h3 className="font-bold text-gray-900 dark:text-white mb-1">{cat.title}</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-4 line-clamp-2 min-h-[40px]">{cat.short_description}</p>

              {/* Card footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-700">
                <div className="flex flex-col">
                  <span className="text-base font-bold text-gray-900 dark:text-white">{cat.total_items}</span>
                  <span className="text-xs text-gray-400">{t('menuItems')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{t('visible')}</span>
                  <button
                    onClick={() => toggleVisibility(cat.id, cat.visibility)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${cat.visibility === 'visible' ? 'bg-brand-orange' : 'bg-gray-200 dark:bg-slate-600'}`}
                  >
                    <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${cat.visibility === 'visible' ?  'translate-x-4' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Empty state */}
          {filtered.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-400">
              <p className="text-sm">{t('noCategoriesFound')}</p>
            </div>
          )}
        </div>
      )}

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: t('totalCategories'), value: categories.length },
          { label: t('liveOnMenu'),      value: categories.filter((c) => c.visibility === 'visible').length },
          { label: t('totalMenuItems'),  value: categories.reduce((s, c) => s + c.total_items, 0) },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-gray-100 bg-white p-5 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{stat.label}</p>
            <p className="text-3xl font-bold text-brand-orange">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      <FormModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title={t('addNewCategory')}
        onSave={handleSaveCreate}
        saveDisabled={isSaving || !form.title.trim()}
      >
        {formFields}
      </FormModal>

      {/* Edit Modal */}
      <FormModal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        title={t('editCategory')}
        onSave={handleSaveEdit}
        saveDisabled={isSaving || !form.title.trim()}
      >
        {formFields}
      </FormModal>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={t('deleteCategory')}
        itemName={deleteTarget?.title ?? ''}
      />
    </div>
  )
}
