import { useTranslation } from 'react-i18next'
import { Bell, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react'

const orders = [
  { id: '#BC-1024', customer: 'Sarah Chen',  phone: '+20 100 293 8472', branch: 'Zamalek',   status: 'Preparing', payment: 'Paid',     total: 450,  time: '11:45 AM' },
  { id: '#BC-1025', customer: 'Ahmed Hassan', phone: '+20 112 443 1290', branch: 'Maadi',     status: 'Ready',     payment: 'Unpaid',   total: 1250, time: '12:05 PM' },
  { id: '#BC-1026', customer: 'Mona Zayed',   phone: '+20 105 882 1104', branch: 'New Cairo', status: 'Completed', payment: 'Paid',     total: 320,  time: '12:15 PM' },
  { id: '#BC-1027', customer: 'Omar Khaled',  phone: '+20 120 449 0032', branch: 'Zamalek',   status: 'Cancelled', payment: 'Refunded', total: 180,  time: '12:30 PM' },
]

function statusPill(status: string) {
  switch (status) {
    case 'Preparing':  return 'bg-blue-100 text-blue-600'
    case 'Ready':      return 'bg-orange-100 text-orange-600'
    case 'Completed':  return 'bg-green-100 text-green-700'
    case 'Cancelled':  return 'bg-red-100 text-red-500'
    default:           return 'bg-gray-100 text-gray-500'
  }
}

function paymentColor(p: string) {
  switch (p) {
    case 'Paid':     return 'text-green-600'
    case 'Unpaid':   return 'text-gray-400 dark:text-slate-500'
    case 'Refunded': return 'text-red-500'
    default:         return 'text-gray-400'
  }
}

export function OrdersPage() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-5 mx-auto">

      {/* Incoming order + efficiency */}
      <div className="grid gap-4 xl:grid-cols-[1fr_300px]">
        <div className="flex items-center justify-between gap-4 rounded-xl bg-orange-50 border border-orange-200 px-5 py-4 dark:bg-orange-900/10 dark:border-orange-800/40">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-orange text-white">
              <Bell size={20} />
            </div>
            <div>
              <p className="font-bold text-brand-orange text-base">{t('newIncomingOrder')}</p>
              <p className="text-sm text-gray-600 dark:text-slate-300 mt-0.5">Order #BC-1102 from Cairo Festival City &bull; 3 Items &bull; 680 EGP</p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button className="flex items-center gap-2 rounded-xl bg-brand-orange px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition shadow-sm">
              <CheckCircle size={16} /> {t('accept')}
            </button>
            <button className="flex items-center gap-2 rounded-xl border-2 border-brand-orange px-5 py-2.5 text-sm font-semibold text-brand-orange hover:bg-orange-50 transition dark:hover:bg-orange-900/20">
              <XCircle size={16} /> {t('reject')}
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700 dark:text-slate-200">{t('dailyEfficiency')}</span>
            <span className="text-xl font-bold text-brand-orange">88%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-slate-700 overflow-hidden">
            <div className="h-full rounded-full bg-brand-orange" style={{ width: '88%' }} />
          </div>
          <p className="mt-2.5 text-xs text-gray-400 dark:text-slate-500">{t('avgPrepTime')}: 12.4 min</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-1 min-w-[160px]">
          <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">{t('branch')}</label>
          <select className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-brand-orange dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
            <option>{t('allBranches')}</option>
            <option>Zamalek</option><option>Maadi</option><option>New Cairo</option>
          </select>
        </div>
        <div className="flex flex-col gap-1 min-w-[160px]">
          <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">{t('orderStatus')}</label>
          <select className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-brand-orange dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
            <option>{t('allStatuses')}</option>
            <option>{t('preparing')}</option><option>{t('ready')}</option>
            <option>{t('completed')}</option><option>{t('cancelled')}</option>
          </select>
        </div>
        <div className="flex flex-col gap-1 min-w-[180px]">
          <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">{t('dateRange')}</label>
          <input type="date" defaultValue="2023-10-24"
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-brand-orange dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200" />
        </div>
        <button className="ml-auto flex items-center gap-2 rounded-xl bg-brand-orange px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition shadow-sm">
          {t('applyFilters')}
        </button>
      </div>

      {/* Orders table */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
              <tr>
                {[t('orderHash'), t('customer'), t('branch'), t('type'), t('status'), t('payment'), t('total'), t('date'), t('action')].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition">
                  <td className="px-4 py-4 font-bold text-gray-800 dark:text-white">{o.id}</td>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-gray-800 dark:text-white">{o.customer}</p>
                    <p className="text-xs text-gray-400">{o.phone}</p>
                  </td>
                  <td className="px-4 py-4 text-gray-600 dark:text-slate-300">{o.branch}</td>
                  <td className="px-4 py-4 text-gray-600 dark:text-slate-300">{t('pickup')}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusPill(o.status)}`}>{o.status}</span>
                  </td>
                  <td className={`px-4 py-4 text-sm font-semibold ${paymentColor(o.payment)}`}>{o.payment}</td>
                  <td className="px-4 py-4 font-bold text-gray-800 dark:text-white">{o.total} EGP</td>
                  <td className="px-4 py-4 text-gray-500 dark:text-slate-400">{o.time}</td>
                  <td className="px-4 py-4">
                    <button className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:border-brand-orange hover:text-brand-orange transition dark:border-slate-600 dark:text-slate-300">
                      {t('viewDetails')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-gray-100 dark:border-slate-700 px-5 py-3">
          <span className="text-sm text-gray-500 dark:text-slate-400">Showing 1 to 4 of 128 orders</span>
          <div className="flex items-center gap-1">
            <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-brand-orange hover:text-brand-orange transition dark:border-slate-600"><ChevronLeft size={14} /></button>
            {[1, 2, 3].map((p) => (
              <button key={p} className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold transition ${p === 1 ? 'bg-brand-orange text-white' : 'border border-gray-200 text-gray-600 hover:border-brand-orange hover:text-brand-orange dark:border-slate-600 dark:text-slate-300'}`}>{p}</button>
            ))}
            <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-brand-orange hover:text-brand-orange transition dark:border-slate-600"><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  )
}
