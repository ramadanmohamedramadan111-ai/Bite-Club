import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { Plus, Pencil, Trash2, Search, ArrowLeft, X, ArrowRight } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

interface Category {
  id: string
  name: string
  nameAr: string
  description: string
  icon: string
  itemsCount: number
  visible: boolean
}

const CATEGORIES: Category[] = [
  { 
    id: '1', 
    name: 'Signature Burgers', 
    nameAr: 'برجر المميزة',
    description: 'Premium hand-crafted burgers with unique toppings',
    icon: '🍔', 
    itemsCount: 8, 
    visible: true 
  },
  { 
    id: '2', 
    name: 'Appetizers', 
    nameAr: 'المقبلات',
    description: 'Start your meal with our delicious appetizers',
    icon: '🍟', 
    itemsCount: 12, 
    visible: true 
  },
  { 
    id: '3', 
    name: 'Desserts', 
    nameAr: 'الحلويات',
    description: 'Sweet treats to end your meal perfectly',
    icon: '🍰', 
    itemsCount: 5, 
    visible: true 
  },
  { 
    id: '4', 
    name: 'Refreshments', 
    nameAr: 'المشروبات',
    description: 'Cold and hot beverages for every taste',
    icon: '🥤', 
    itemsCount: 15, 
    visible: true 
  },
]

export function CategoriesPage() {
  const { t, i18n } = useTranslation()
  const [search, setSearch] = useState('')
  const [categories, setCategories] = useState<Category[]>(CATEGORIES)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState<Category | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState<Category | null>(null)
  const [newCategory, setNewCategory] = useState({ name: '', nameAr: '', description: '', icon: '🍔' })
  const navigate = useNavigate()

  const filteredCategories = categories.filter((c) => {
    const q = search.toLowerCase()
    return c.name.toLowerCase().includes(q) || c.nameAr.includes(q) || c.description.toLowerCase().includes(q)
  })

  const toggleVisibility = (id: string) => {
    setCategories(prev => prev.map(c => 
      c.id === id ? { ...c, visible: !c.visible } : c
    ))
  }

  const handleCreateCategory = () => {
    if (newCategory.name && newCategory.nameAr) {
      const category: Category = {
        id: String(categories.length + 1),
        name: newCategory.name,
        nameAr: newCategory.nameAr,
        description: newCategory.description,
        icon: newCategory.icon,
        itemsCount: 0,
        visible: true
      }
      setCategories([...categories, category])
      setNewCategory({ name: '', nameAr: '', description: '', icon: '🍔' })
      setShowCreateModal(false)
    }
  }

  const totalCategories = categories.length
  const liveCategories = categories.filter(c => c.visible).length
  const totalMenuItems = categories.reduce((sum, c) => sum + c.itemsCount, 0)

  return (
    <div className="flex flex-col gap-6 mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
         <button
          onClick={() => navigate('/menu')}
          className="flex items-center gap-3 py-2.5 text-sm font-semibold text-gray-500 hover:text-brand-orange transition dark:text-slate-400 self-start shrink-0"
        >
         {i18n.language === 'en' ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
        </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('categoryManagement')}</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{t('categoryManagementSub')}</p>
          </div>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-xl bg-brand-orange px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition"
        >
          <Plus size={14} /> {t('addNewCategory')}
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder={t('searchCategories')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500"
        />
      </div>

      {/* Category Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {filteredCategories.map((category) => (
          <div key={category.id} className="rounded-xl border border-gray-100 bg-white shadow-sm p-5 hover:border-brand-orange hover:shadow-md transition dark:border-slate-700 dark:bg-slate-900">
            {/* Card Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-orange-100 text-2xl dark:bg-orange-900/30">
                {category.icon}
              </div>
              <div className="flex gap-1.5">
                <button 
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-brand-orange hover:text-brand-orange dark:border-slate-600"
                  onClick={() => setShowEditModal(category)}
                >
                  <Pencil size={13} />
                </button>
                <button 
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-red-400 hover:text-red-500 dark:border-slate-600"
                  onClick={() => setShowDeleteModal(category)}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            {/* Category Name */}
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">{category.name}</h3>
            <p className="text-xs text-gray-400 mb-4">{category.nameAr}</p>

            {/* Description */}
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4 line-clamp-2 min-h-[40px]">
              {category.description}
            </p>

            {/* Card Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-700">
              <div>
                <span className="text-lg font-bold text-gray-900 dark:text-white">{category.itemsCount}</span>
                <span className="text-xs text-gray-400 ml-1">{t('menuItems')}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{t('visible')}</span>
                <button
                  onClick={() => toggleVisibility(category.id)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${category.visible ? 'bg-brand-orange' : 'bg-gray-200 dark:bg-slate-600'}`}
                >
                  <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${category.visible ? 'translate-x-4' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white p-5 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{t('totalCategories')}</p>
          <p className="text-3xl font-bold text-brand-orange">{totalCategories}</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-5 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{t('liveOnMenu')}</p>
          <p className="text-3xl font-bold text-brand-orange">{liveCategories}</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-5 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{t('totalMenuItems')}</p>
          <p className="text-3xl font-bold text-brand-orange">{totalMenuItems}</p>
        </div>
      </div>

      {/* Create Category Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('addNewCategory')}</h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('categoryName')}</label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="e.g., Signature Burgers"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('categoryNameAr')}</label>
                <input
                  type="text"
                  value={newCategory.nameAr}
                  onChange={(e) => setNewCategory({ ...newCategory, nameAr: e.target.value })}
                  placeholder="مثال: برجر مميز"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500"
                  dir="rtl"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('categoryDescription')}</label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  placeholder="Brief description of this category..."
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500 resize-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('categoryIcon')}</label>
                <div className="flex gap-2">
                  {['🍔', '🍕', '🍣', '🥗', '🍰', '🥤', '🌮', '🍛'].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setNewCategory({ ...newCategory, icon: emoji })}
                      className={`h-12 w-12 rounded-xl border-2 text-2xl transition ${newCategory.icon === emoji ? 'border-brand-orange bg-orange-50 dark:bg-orange-900/20' : 'border-gray-200 bg-white hover:border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-slate-500'}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleCreateCategory}
                disabled={!newCategory.name || !newCategory.nameAr}
                className="flex-1 rounded-xl bg-brand-orange px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
