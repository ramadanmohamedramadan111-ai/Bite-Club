import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { Download, UserPlus, TrendingUp, TrendingDown, MoreVertical } from 'lucide-react'
import { Table } from '../../components/common/Table'
import type { Column } from '../../components/common/Table'
import { Pagination } from '../../components/common/Pagination'

const customers = [
  { id: 1, name: 'Ahmed Mansour', email: 'ahmed.m@example.com',  phone: '+20 100 234 5678', orders: 42, spend: 12450, lastOrder: 'Oct 24, 2023', segment: 'VIP'      },
  { id: 2, name: 'Laila Hassan',  email: 'laila.h@outlook.com',  phone: '+20 112 889 4432', orders: 18, spend: 5120,  lastOrder: 'Oct 22, 2023', segment: 'FREQUENT' },
  { id: 3, name: 'Omar Zaki',     email: 'omar_z@webmail.com',   phone: '+20 155 001 9988', orders: 1,  spend: 850,   lastOrder: 'Oct 25, 2023', segment: 'NEW'      },
  { id: 4, name: 'Nour Adel',     email: 'nour.a@email.com',     phone: '+20 101 234 5670', orders: 9,  spend: 2100,  lastOrder: 'Oct 21, 2023', segment: 'FREQUENT' },
  { id: 5, name: 'Sara Mostafa',  email: 'sara.m@email.com',     phone: '+20 102 234 5671', orders: 6,  spend: 1450,  lastOrder: 'Oct 20, 2023', segment: 'FREQUENT' },
  { id: 6, name: 'Karim Fathy',   email: 'karim.f@email.com',    phone: '+20 103 234 5672', orders: 4,  spend: 980,   lastOrder: 'Oct 18, 2023', segment: 'NEW'      },
  { id: 7, name: 'Hana Ibrahim',  email: 'hana.i@email.com',     phone: '+20 104 234 5673', orders: 15, spend: 3600,  lastOrder: 'Oct 23, 2023', segment: 'FREQUENT' },
  { id: 8, name: 'Youssef Ali',   email: 'youss.a@email.com',    phone: '+20 105 234 5674', orders: 31, spend: 8200,  lastOrder: 'Oct 24, 2023', segment: 'VIP'      },
]

const segBadge = (s: string) =>
  s === 'VIP' ? 'bg-purple-100 text-purple-700' : s === 'FREQUENT' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'

const avatarColors = ['bg-orange-200 text-orange-700','bg-blue-200 text-blue-700','bg-green-200 text-green-700','bg-purple-200 text-purple-700','bg-pink-200 text-pink-700','bg-yellow-200 text-yellow-700','bg-teal-200 text-teal-700','bg-red-200 text-red-700']

const initials = (name: string) => name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()

export function CustomersPage() {
  const { t } = useTranslation()
  const [currentPage, setCurrentPage] = useState(1)

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
      render: () => (
        <button className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition dark:hover:bg-slate-700">
          <MoreVertical size={15} />
        </button>
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
          <button className="flex items-center gap-2 rounded-xl bg-brand-orange px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition">
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
    </div>
  )
}
