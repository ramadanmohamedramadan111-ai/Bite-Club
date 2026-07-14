import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { Filter, Plus, Pencil, Trash2, Copy, Utensils } from 'lucide-react'
import { Link } from 'react-router-dom'

const burgerItems = [
  { id: 1, name: 'Signature Wagyu Burger', nameAr: 'برجر واجيو فاخر', price: 450, available: true,  badge: 'bestSeller' },
  { id: 2, name: 'Double Smash Burger',    nameAr: 'دبل سماش برجر',   price: 320, available: true,  badge: null        },
  { id: 3, name: 'Spicy Zinger Tower',     nameAr: 'سبيسي زنجر تاور', price: 280, available: false, badge: 'soldOut'   },
]

const appetizerItems = [
  { id: 4, name: 'Truffle Parmesan Fries', nameAr: 'بطاطس تراقل بارميزان', price: 120, active: true },
  { id: 5, name: 'Mozzarella Sticks',      nameAr: 'أصابع الموزاريلا',     price: 145, active: true },
]

export function MenuPage() {
  const { t } = useTranslation()
  const [avail, setAvail] = useState<Record<number, boolean>>(
    Object.fromEntries(burgerItems.map((i) => [i.id, i.available]))
  )
  const [activeCat, setActiveCat] = useState('all')
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
          <button className="flex items-center gap-2 rounded-xl bg-brand-orange px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition">
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
                <button className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow text-gray-500 hover:text-brand-orange dark:bg-slate-700"><Pencil size={12} /></button>
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <p className="font-bold text-sm text-gray-900 dark:text-white">{item.name}</p>
                  <span className="text-sm font-bold text-brand-orange">{item.price} EGP</span>
                </div>
                <p className="text-xs text-gray-400 mb-3">{item.nameAr}</p>
                <div className="flex items-center justify-between">
                  <button onClick={() => setAvail((p) => ({ ...p, [item.id]: !p[item.id] }))}
                    className={`flex items-center gap-2 text-xs font-semibold ${avail[item.id] ? 'text-green-600' : 'text-gray-400'}`}>
                    <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${avail[item.id] ? 'bg-brand-orange' : 'bg-gray-200 dark:bg-slate-600'}`}>
                      <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${avail[item.id] ? 'translate-x-4' : 'translate-x-1'}`} />
                    </span>
                    {avail[item.id] ? t('available') : t('unavailable')}
                  </button>
                  <div className="flex gap-1.5">
                    <button className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-red-400 hover:text-red-500 dark:border-slate-600"><Trash2 size={12} /></button>
                    <button className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-brand-orange hover:text-brand-orange dark:border-slate-600"><Copy size={12} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-brand-orange/40 bg-white p-6 text-center hover:border-brand-orange hover:bg-orange-50/50 transition dark:bg-slate-900 min-h-[260px]">
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
                  <td className="px-5 py-4"><span className="rounded-full bg-blue-100 px-3 py-0.5 text-xs font-semibold text-blue-600">{item.active ? t('active') : t('inactive')}</span></td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-brand-orange hover:text-brand-orange dark:border-slate-600"><Pencil size={13} /></button>
                      <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-brand-orange hover:text-brand-orange dark:border-slate-600"><Copy size={13} /></button>
                      <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-red-400 hover:text-red-500 dark:border-slate-600"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
