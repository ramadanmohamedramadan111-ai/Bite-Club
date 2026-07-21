import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Download, UserPlus, TrendingUp, TrendingDown, Pencil, Trash2 } from 'lucide-react'
import { Table } from '../../components/common/Table'
import type { Column } from '../../components/common/Table'
import { Pagination } from '../../components/common/Pagination'
import { DeleteModal } from '../../components/common/DeleteModal'
import { FormModal } from '../../components/common/FormModal'
import { useCustomerStore, customerSchema } from '../../store/customerStore'
import type { Customer } from '../../store/customerStore'
import { z } from 'zod'

const segBadge = (s: string) =>
  s === 'VIP' ? 'bg-purple-100 text-purple-700' : s === 'FREQUENT' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'

const avatarColors = ['bg-orange-200 text-orange-700','bg-blue-200 text-blue-700','bg-green-200 text-green-700','bg-purple-200 text-purple-700','bg-pink-200 text-pink-700','bg-yellow-200 text-yellow-700','bg-teal-200 text-teal-700','bg-red-200 text-red-700']

const initials = (name: string) => name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()

export function CustomersPage() {
  const { t } = useTranslation()
  const { customers: rawCustomers, addCustomer, updateCustomer, deleteCustomer } = useCustomerStore()
  const [searchParams] = useSearchParams()
  const [currentPage, setCurrentPage] = useState(1)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState<Customer | null>(null)

  const query = (searchParams.get('q') || '').toLowerCase()
  const customers = rawCustomers.filter(c => 
    c.name.toLowerCase().includes(query) || 
    c.email.toLowerCase().includes(query) ||
    c.phone.includes(query)
  )
  const [showDeleteModal, setShowDeleteModal] = useState<Customer | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '', segment: 'NEW' as 'VIP' | 'FREQUENT' | 'NEW' })

  const handleCreateCustomer = () => {
    try {
      const validatedCustomer = customerSchema.parse({
        name: newCustomer.name,
        email: newCustomer.email,
        phone: newCustomer.phone,
        orders: 0,
        spend: 0,
        segment: newCustomer.segment,
      })
      
      addCustomer(validatedCustomer)
      setNewCustomer({ name: '', email: '', phone: '', segment: 'NEW' })
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

  const handleEditCustomer = () => {
    if (showEditModal) {
      try {
        const validatedCustomer = customerSchema.parse(showEditModal)
        updateCustomer(showEditModal.id!, validatedCustomer)
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

  const handleDeleteCustomer = () => {
    if (showDeleteModal) {
      deleteCustomer(showDeleteModal.id!)
      setShowDeleteModal(null)
    }
  }

  const columns: Column<typeof customers[0]>[] = [
    {
      header: t('customerName'),
      key: 'name',
      render: (c, idx) => (
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${avatarColors[idx % avatarColors.length]}`}>{initials(c.name)}</div>
          <div>
            <p className="font-semibold text-gray-800 dark:text-white">{c.name}</p>
            <p className="text-xs text-gray-400 dark:text-slate-500">{c.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: t('phoneNumber'),
      key: 'phone',
      render: (c) => c.phone,
    },
    {
      header: t('totalOrders'),
      key: 'orders',
      render: (c) => c.orders,
    },
    {
      header: t('spendEgp'),
      key: 'spend',
      render: (c) => c.spend.toLocaleString(),
    },
    {
      header: t('lastOrder'),
      key: 'lastOrder',
      render: (c) => c.lastOrder,
    },
    {
      header: t('segment'),
      key: 'segment',
      render: (c) => <span className={`inline-block rounded-full px-3 py-0.5 text-xs font-bold ${segBadge(c.segment)}`}>{c.segment}</span>,
    },
    {
      header: t('actions'),
      key: 'actions',
      render: (c) => (
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setShowEditModal(c)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition dark:hover:bg-slate-700"
          >
            <Pencil size={14} />
          </button>
          <button 
            onClick={() => setShowDeleteModal(c)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition dark:hover:bg-red-950/20"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6 mx-auto w-full">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('customerDatabase')}</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{t('customerDatabaseSub')}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:border-brand-orange hover:text-brand-orange transition dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
            <Download size={14} /> {t('exportCSV')}
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-xl bg-brand-orange px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition"
          >
            <UserPlus size={14} /> {t('newCustomer')}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase">{t('filters')}:</span>
          <button className="rounded-full bg-brand-orange px-4 py-1.5 text-xs font-semibold text-white">{t('allSegments')}</button>
          <label className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-slate-300 cursor-pointer">
            <input type="checkbox" className="rounded border-gray-300" /> {t('lastOrder30Days')}
          </label>
        </div>
        <span className="text-xs text-gray-400 dark:text-slate-500 whitespace-nowrap">Showing 1 – 20 of 1,240</span>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden dark:border-slate-700 dark:bg-slate-900">
        <Table
          columns={columns}
          data={customers}
          keyExtractor={(row) => row.id}
        />
        <Pagination
          currentPage={currentPage}
          totalPages={62}
          onPageChange={setCurrentPage}
          showingText="Showing 1 – 20 of 1,240"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: t('newCustomersMonth'), value: '148',     change: '+12%', up: true,  icon: UserPlus    },
          { label: t('retentionRate'),     value: '68.4%',   change: '+2.4%', up: true, icon: TrendingUp  },
          { label: t('avgSpendUser'),      value: 'EGP 2,840', change: '-4%', up: false, icon: TrendingDown },
        ].map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-400">{s.label}</p>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-brand-orange dark:bg-orange-900/20"><Icon size={15} /></div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
              <p className={`mt-1 text-xs font-semibold ${s.up ? 'text-green-600' : 'text-red-500'}`}>{s.up ? '↑' : '↓'} {s.change} {t('vsLastMonth')}</p>
            </div>
          )
        })}
      </div>

      {/* Create Customer Modal */}
      <FormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={t('newCustomer')}
        onSave={handleCreateCustomer}
        saveDisabled={!newCustomer.name || !newCustomer.email || !newCustomer.phone}
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('customerName')}</label>
          <input
            type="text"
            value={newCustomer.name}
            onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
            placeholder="e.g., Ahmed Mansour"
            className={`w-full rounded-xl border px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500 ${validationErrors.name ? 'border-red-500' : 'border-gray-200'}`}
          />
          {validationErrors.name && <p className="text-xs text-red-500 mt-1">{validationErrors.name}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('email')}</label>
          <input
            type="email"
            value={newCustomer.email}
            onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
            placeholder="e.g., ahmed@example.com"
            className={`w-full rounded-xl border px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500 ${validationErrors.email ? 'border-red-500' : 'border-gray-200'}`}
          />
          {validationErrors.email && <p className="text-xs text-red-500 mt-1">{validationErrors.email}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('phoneNumber')}</label>
          <input
            type="text"
            value={newCustomer.phone}
            onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
            placeholder="e.g., +20 100 234 5678"
            className={`w-full rounded-xl border px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500 ${validationErrors.phone ? 'border-red-500' : 'border-gray-200'}`}
          />
          {validationErrors.phone && <p className="text-xs text-red-500 mt-1">{validationErrors.phone}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('segment')}</label>
          <select
            value={newCustomer.segment}
            onChange={(e) => setNewCustomer({ ...newCustomer, segment: e.target.value as 'VIP' | 'FREQUENT' | 'NEW' })}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="NEW">NEW</option>
            <option value="FREQUENT">FREQUENT</option>
            <option value="VIP">VIP</option>
          </select>
        </div>
      </FormModal>

      {/* Edit Customer Modal */}
      <FormModal
        isOpen={!!showEditModal}
        onClose={() => setShowEditModal(null)}
        title={t('editCustomer')}
        onSave={handleEditCustomer}
      >
        {showEditModal && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('customerName')}</label>
              <input
                type="text"
                value={showEditModal.name}
                onChange={(e) => setShowEditModal({ ...showEditModal, name: e.target.value })}
                className={`w-full rounded-xl border px-4 py-2.5 text-sm text-gray-700 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 ${validationErrors.name ? 'border-red-500' : 'border-gray-200'}`}
              />
              {validationErrors.name && <p className="text-xs text-red-500 mt-1">{validationErrors.name}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('email')}</label>
              <input
                type="email"
                value={showEditModal.email}
                onChange={(e) => setShowEditModal({ ...showEditModal, email: e.target.value })}
                className={`w-full rounded-xl border px-4 py-2.5 text-sm text-gray-700 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 ${validationErrors.email ? 'border-red-500' : 'border-gray-200'}`}
              />
              {validationErrors.email && <p className="text-xs text-red-500 mt-1">{validationErrors.email}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('phoneNumber')}</label>
              <input
                type="text"
                value={showEditModal.phone}
                onChange={(e) => setShowEditModal({ ...showEditModal, phone: e.target.value })}
                className={`w-full rounded-xl border px-4 py-2.5 text-sm text-gray-700 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 ${validationErrors.phone ? 'border-red-500' : 'border-gray-200'}`}
              />
              {validationErrors.phone && <p className="text-xs text-red-500 mt-1">{validationErrors.phone}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('segment')}</label>
              <select
                value={showEditModal.segment}
                onChange={(e) => setShowEditModal({ ...showEditModal, segment: e.target.value as 'VIP' | 'FREQUENT' | 'NEW' })}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="NEW">NEW</option>
                <option value="FREQUENT">FREQUENT</option>
                <option value="VIP">VIP</option>
              </select>
            </div>
          </>
        )}
      </FormModal>

      {/* Delete Customer Modal */}
      <DeleteModal
        isOpen={!!showDeleteModal}
        onClose={() => setShowDeleteModal(null)}
        title={t('deleteCustomer')}
        itemName={showDeleteModal?.name || ''}
        onConfirm={handleDeleteCustomer}
      />
    </div>
  )
}
