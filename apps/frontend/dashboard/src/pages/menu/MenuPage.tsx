import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { Filter, Plus, Pencil, Trash2, Copy, Utensils } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DeleteModal } from '../../components/common/DeleteModal'
import { FormModal } from '../../components/common/FormModal'
import { useMenuStore, menuItemSchema } from '../../store/menuStore'
import type { MenuItem } from '../../store/menuStore'
import { z } from 'zod'

export function MenuPage() {
  const { t } = useTranslation()
  const { items, addItem, updateItem, deleteItem, toggleAvailability } = useMenuStore()
  const [activeCat, setActiveCat] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState<MenuItem | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState<MenuItem | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [newItem, setNewItem] = useState({ 
    name: '', 
    nameAr: '', 
    description: '', 
    price: '', 
    category: 'burgers' as 'burgers' | 'appetizers' | 'beverages' | 'desserts', 
    image: '', 
    badge: null as 'bestSeller' | 'soldOut' | null 
  })
  const filteredItems = activeCat === 'all' ? items : items.filter(item => item.category === activeCat)
  const burgerItems = filteredItems.filter(item => item.category === 'burgers')
  const appetizerItems = filteredItems.filter(item => item.category === 'appetizers')

  const handleCreateItem = () => {
    try {
      const validatedItem = menuItemSchema.parse({
        name: newItem.name,
        nameAr: newItem.nameAr,
        description: newItem.description,
        price: parseFloat(newItem.price),
        category: newItem.category,
        image: newItem.image,
        available: true,
        badge: newItem.badge,
      })
      
      addItem(validatedItem)
      setNewItem({ name: '', nameAr: '', description: '', price: '', category: 'burgers' as 'burgers' | 'appetizers' | 'beverages' | 'desserts', image: '', badge: null })
      setValidationErrors({})
      setShowCreateModal(false)
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {}
        error.issues.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0] as string] = err.message
          }
        })
        setValidationErrors(errors)
      }
    }
  }

  const handleEditItem = () => {
    if (showEditModal) {
      try {
        const validatedItem = menuItemSchema.parse(showEditModal)
        updateItem(showEditModal.id!, validatedItem)
        setShowEditModal(null)
        setValidationErrors({})
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errors: Record<string, string> = {}
          error.issues.forEach((err) => {
            if (err.path[0]) {
              errors[err.path[0] as string] = err.message
            }
          })
          setValidationErrors(errors)
        }
      }
    }
  }

  const handleDeleteItem = () => {
    if (showDeleteModal) {
      deleteItem(showDeleteModal.id!)
      setShowDeleteModal(null)
    }
  }

  const catTabs = [
    { key: 'all', label: t('allItems') },
    { key: 'burgers', label: t('signatureBurgers') },
    { key: 'appetizers', label: t('appetizers') },
    { key: 'beverages', label: t('beverages') },
    { key: 'desserts', label: t('dessertsCategory') },
  ]

  return (
    <div className="flex flex-col gap-6  mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('menuManagement')}</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{t('menuManagementSub')}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link 
            to="/menu/categories"
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:border-brand-orange hover:text-brand-orange transition dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
          >
            <Utensils size={14} /> {t('categoryManagement')}
          </Link>
          <button className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:border-brand-orange hover:text-brand-orange transition dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
            <Filter size={14} /> {t('filter')}
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-xl bg-brand-orange px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition"
          >
            <Plus size={14} /> {t('createNewItem')}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {catTabs.map((c) => (
          <button key={c.key} onClick={() => setActiveCat(c.key)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${activeCat === c.key ? 'bg-brand-orange text-white' : 'border border-gray-200 bg-white text-gray-600 hover:border-brand-orange dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Burger cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900 dark:text-white">{t('signatureBurgers')}</span>
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-600">4 {t('items')}</span>
          </div>
          <button className="text-sm font-semibold text-brand-orange hover:underline">{t('reorderItems')}</button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {burgerItems.map((item) => (
            <div key={item.id} className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden dark:border-slate-700 dark:bg-slate-900">
              <div className="relative h-44 bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
                <span className="text-xs text-gray-400">img</span>
                {item.badge && (
                  <span className={`absolute top-2 left-2 rounded px-2 py-0.5 text-[10px] font-bold ${item.badge === 'soldOut' ? 'bg-red-600 text-white' : 'bg-brand-orange text-white'}`}>{t(item.badge)}</span>
                )}
                <button 
                  onClick={() => setShowEditModal(item)}
                  className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow text-gray-500 hover:text-brand-orange dark:bg-slate-700"
                ><Pencil size={12} /></button>
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <p className="font-bold text-sm text-gray-900 dark:text-white">{item.name}</p>
                  <span className="text-sm font-bold text-brand-orange">{item.price} EGP</span>
                </div>
                <p className="text-xs text-gray-400 mb-3">{item.nameAr}</p>
                <div className="flex items-center justify-between">
                  <button 
                    onClick={() => toggleAvailability(item.id)}
                    className={`flex items-center gap-2 text-xs font-semibold ${item.available ? 'text-green-600' : 'text-gray-400'}`}
                  >
                    <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${item.available ? 'bg-brand-orange' : 'bg-gray-200 dark:bg-slate-600'}`}>
                      <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${item.available ? 'translate-x-4' : 'translate-x-1'}`} />
                    </span>
                    {item.available ? t('available') : t('unavailable')}
                  </button>
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => setShowDeleteModal(item)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-red-400 hover:text-red-500 dark:border-slate-600"
                    ><Trash2 size={12} /></button>
                    <button className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-brand-orange hover:text-brand-orange dark:border-slate-600"><Copy size={12} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-brand-orange/40 bg-white p-6 text-center hover:border-brand-orange hover:bg-orange-50/50 transition dark:bg-slate-900 min-h-[260px]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-brand-orange/50 text-brand-orange mb-3"><Plus size={20} /></div>
            <p className="text-sm font-bold text-gray-700 dark:text-slate-200">{t('addNewItem')}</p>
            <p className="text-xs text-gray-400 mt-1">{t('signatureBurgers')}</p>
          </button>
        </div>
      </div>

      {/* Appetizers table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900 dark:text-white">{t('appetizers')}</span>
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-600">12 {t('items')}</span>
          </div>
          <button className="text-sm font-semibold text-brand-orange hover:underline">{t('reorderItems')}</button>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden dark:border-slate-700 dark:bg-slate-900">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
              <tr>
                {[t('itemImage'), t('nameCategory'), t('price'), t('status'), t('actions')].map((h) => (
                  <th key={h} className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
              {appetizerItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition">
                  <td className="px-5 py-4"><div className="h-12 w-12 rounded-xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center"><span className="text-[10px] text-gray-400">img</span></div></td>
                  <td className="px-5 py-4">
                    <p className="font-bold text-gray-800 dark:text-white">{item.name}</p>
                    <p className="text-xs text-gray-400">{t('appetizers')} • {item.nameAr}</p>
                  </td>
                  <td className="px-5 py-4 font-bold text-brand-orange">{item.price} EGP</td>
                  <td className="px-5 py-4"><span className={`rounded-full bg-blue-100 px-3 py-0.5 text-xs font-semibold text-blue-600 ${item.available ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>{item.available ? t('available') : t('unavailable')}</span></td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setShowEditModal(item)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-brand-orange hover:text-brand-orange dark:border-slate-600"
                      ><Pencil size={13} /></button>
                      <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-brand-orange hover:text-brand-orange dark:border-slate-600"><Copy size={13} /></button>
                      <button 
                        onClick={() => setShowDeleteModal(item)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-red-400 hover:text-red-500 dark:border-slate-600"
                      ><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Menu Item Modal */}
      <FormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={t('createNewItem')}
        onSave={handleCreateItem}
        saveDisabled={!newItem.name || !newItem.nameAr || !newItem.price}
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('itemName')}</label>
          <input
            type="text"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            placeholder="e.g., Signature Wagyu Burger"
            className={`w-full rounded-xl border px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500 ${validationErrors.name ? 'border-red-500' : 'border-gray-200'}`}
          />
          {validationErrors.name && <p className="text-xs text-red-500 mt-1">{validationErrors.name}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('itemNameAr')}</label>
          <input
            type="text"
            value={newItem.nameAr}
            onChange={(e) => setNewItem({ ...newItem, nameAr: e.target.value })}
            placeholder="مثال: برجر واجيو فاخر"
            className={`w-full rounded-xl border px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500 ${validationErrors.nameAr ? 'border-red-500' : 'border-gray-200'}`}
            dir="rtl"
          />
          {validationErrors.nameAr && <p className="text-xs text-red-500 mt-1">{validationErrors.nameAr}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('description')}</label>
          <textarea
            value={newItem.description}
            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            placeholder="Brief description of this item..."
            rows={3}
            className={`w-full rounded-xl border px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500 resize-none ${validationErrors.description ? 'border-red-500' : 'border-gray-200'}`}
          />
          {validationErrors.description && <p className="text-xs text-red-500 mt-1">{validationErrors.description}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('price')}</label>
            <input
              type="number"
              value={newItem.price}
              onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
              placeholder="0"
              className={`w-full rounded-xl border px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500 ${validationErrors.price ? 'border-red-500' : 'border-gray-200'}`}
            />
            {validationErrors.price && <p className="text-xs text-red-500 mt-1">{validationErrors.price}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('category')}</label>
            <select
              value={newItem.category}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value as 'burgers' | 'appetizers' | 'beverages' | 'desserts' })}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="burgers">{t('signatureBurgers')}</option>
              <option value="appetizers">{t('appetizers')}</option>
              <option value="beverages">{t('beverages')}</option>
              <option value="desserts">{t('dessertsCategory')}</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('badge')}</label>
          <div className="flex gap-2">
            {[
              { value: null, label: 'None' },
              { value: 'bestSeller', label: 'Best Seller' },
              { value: 'soldOut', label: 'Sold Out' }
            ].map((badge) => (
              <button
                key={badge.value}
                onClick={() => setNewItem({ ...newItem, badge: badge.value as 'bestSeller' | 'soldOut' | null })}
                className={`flex-1 rounded-xl border-2 px-3 py-2 text-xs font-semibold transition ${newItem.badge === badge.value ? 'border-brand-orange bg-orange-50 dark:bg-orange-900/20 text-brand-orange' : 'border-gray-200 bg-white hover:border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-slate-500 text-gray-600 dark:text-slate-300'}`}
              >
                {badge.label}
              </button>
            ))}
          </div>
        </div>
      </FormModal>

      {/* Edit Menu Item Modal */}
      <FormModal
        isOpen={!!showEditModal}
        onClose={() => setShowEditModal(null)}
        title={t('editItem')}
        onSave={handleEditItem}
      >
        {showEditModal && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('itemName')}</label>
              <input
                type="text"
                value={showEditModal.name}
                onChange={(e) => setShowEditModal({ ...showEditModal, name: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('itemNameAr')}</label>
              <input
                type="text"
                value={showEditModal.nameAr}
                onChange={(e) => setShowEditModal({ ...showEditModal, nameAr: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                dir="rtl"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('description')}</label>
              <textarea
                value={showEditModal.description}
                onChange={(e) => setShowEditModal({ ...showEditModal, description: e.target.value })}
                rows={3}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('price')}</label>
                <input
                  type="number"
                  value={showEditModal.price}
                  onChange={(e) => setShowEditModal({ ...showEditModal, price: parseFloat(e.target.value) })}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('category')}</label>
                <select
                  value={showEditModal.category}
                  onChange={(e) => setShowEditModal({ ...showEditModal, category: e.target.value as 'burgers' | 'appetizers' | 'beverages' | 'desserts' })}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value="burgers">{t('signatureBurgers')}</option>
                  <option value="appetizers">{t('appetizers')}</option>
                  <option value="beverages">{t('beverages')}</option>
                  <option value="desserts">{t('dessertsCategory')}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('badge')}</label>
              <div className="flex gap-2">
                {[
                  { value: null, label: 'None' },
                  { value: 'bestSeller', label: 'Best Seller' },
                  { value: 'soldOut', label: 'Sold Out' }
                ].map((badge) => (
                  <button
                    key={badge.value}
                    onClick={() => setShowEditModal({ ...showEditModal, badge: badge.value as 'bestSeller' | 'soldOut' | null })}
                    className={`flex-1 rounded-xl border-2 px-3 py-2 text-xs font-semibold transition ${showEditModal.badge === badge.value ? 'border-brand-orange bg-orange-50 dark:bg-orange-900/20 text-brand-orange' : 'border-gray-200 bg-white hover:border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-slate-500 text-gray-600 dark:text-slate-300'}`}
                  >
                    {badge.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </FormModal>

      {/* Delete Menu Item Modal */}
      <DeleteModal
        isOpen={!!showDeleteModal}
        onClose={() => setShowDeleteModal(null)}
        onConfirm={handleDeleteItem}
        title={t('deleteItem')}
        itemName={showDeleteModal?.name || ''}
      />
    </div>
  )
}
