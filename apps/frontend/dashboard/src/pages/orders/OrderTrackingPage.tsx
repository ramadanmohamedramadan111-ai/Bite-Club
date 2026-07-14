import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Printer,
  User,
  CreditCard,
  CheckCircle,
  Clock,
  MapPin,
  Truck,
  ChevronDown,
  ExternalLink,
  Star,
  Zap,
  ArrowRight,
} from 'lucide-react'

// Mock orders keyed by ID – replace with real API call
const mockOrders: Record<string, any> = {
  'BC-1024': {
    id: '#BC-1024',
    status: 'Preparing',
    customer: {
      name: 'Sarah Chen',
      phone: '+20 100 293 8472',
      type: 'Loyalty Member',
      address: '15 Shagaret El Dor St, Zamalek, Cairo, Egypt',
    },
    payment: { method: 'Visa Ending in 4242', status: 'PAID', transactionId: 'TXN-9823104' },
    items: [
      {
        id: 1,
        name: 'Signature Wagyu Burger',
        variant: 'Medium Rare • No Onions',
        extra: '+ Extra Truffle Mayo',
        qty: 1,
        unitPrice: 280,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=80&h=80&fit=crop',
      },
      {
        id: 2,
        name: 'Truffle Sweet Potato Fries',
        variant: 'Large Portion • Rosemary Salt',
        qty: 1,
        unitPrice: 85,
        image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=80&h=80&fit=crop',
      },
      {
        id: 3,
        name: 'House Crafted Soda',
        variant: 'Passion Fruit & Mint • Iced',
        qty: 1,
        unitPrice: 45,
        image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=80&h=80&fit=crop',
      },
    ],
    subtotal: 410,
    tax: 57.4,
    deliveryFee: 25,
    total: 450,
    driver: 'Mohamed H.',
    deliveryDistance: '2.4 km from Kitchen',
    lifecycle: [
      { key: 'placed',     label: 'Order Placed',     time: '11:30 AM', detail: 'Via Mobile App (Android)',  done: true,  current: false },
      { key: 'accepted',   label: 'Accepted',          time: '11:35 AM', detail: 'By Kitchen Terminal 1',    done: true,  current: false },
      { key: 'preparing',  label: 'Preparing',         time: '11:45 AM', detail: 'Estimated 12 mins left',   done: false, current: true  },
      { key: 'ready',      label: 'Ready for Pickup',  time: '',         detail: 'Awaiting completion',       done: false, current: false },
    ],
  },
  'BC-1025': {
    id: '#BC-1025',
    status: 'Ready',
    customer: { name: 'Ahmed Hassan', phone: '+20 112 443 1290', type: 'Regular', address: '22 Tahrir Square, Maadi, Cairo' },
    payment: { method: 'Cash on Delivery', status: 'UNPAID', transactionId: 'N/A' },
    items: [
      { id: 1, name: 'Grilled Salmon', variant: 'With Garlic Butter', qty: 2, unitPrice: 380, image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=80&h=80&fit=crop' },
      { id: 2, name: 'Caesar Salad',   variant: 'Extra Croutons',      qty: 1, unitPrice: 120, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=80&h=80&fit=crop'  },
    ],
    subtotal: 880, tax: 123.2, deliveryFee: 30, total: 1033.2,
    driver: 'Karim A.',
    deliveryDistance: '3.1 km from Kitchen',
    lifecycle: [
      { key: 'placed',    label: 'Order Placed',    time: '12:00 PM', detail: 'Via Website',           done: true,  current: false },
      { key: 'accepted',  label: 'Accepted',         time: '12:04 PM', detail: 'By Kitchen Terminal 2', done: true,  current: false },
      { key: 'preparing', label: 'Preparing',        time: '12:10 PM', detail: 'Done',                  done: true,  current: false },
      { key: 'ready',     label: 'Ready for Pickup', time: '12:25 PM', detail: 'Waiting for driver',    done: false, current: true  },
    ],
  },
}

const statusColors: Record<string, string> = {
  Preparing: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
  Ready:     'bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400',
  Completed: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400',
  Cancelled: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400',
}

export function OrderTrackingPage() {
  const { t , i18n } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const order = (id && mockOrders[id]) || mockOrders['BC-1024']

  const [currentStatus, setCurrentStatus] = useState<string>(order.status)
  const [kitchenView, setKitchenView] = useState(true)

  return (
    <div className="flex flex-col gap-6 w-full">

      {/* ── Page Header ─────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center gap-3 py-2.5 text-sm font-semibold text-gray-500 hover:text-brand-orange transition dark:text-slate-400 self-start shrink-0"
        >
         {i18n.language === 'en' ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
          {t('backToOrders', 'Back to Orders')} 
        </button>

        <div className="flex flex-1 items-center gap-3 min-w-0">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">
            {t('order', 'Order')} {order.id}
          </h1>
          <span className={`shrink-0 rounded-full px-3 text-xs font-bold ${statusColors[currentStatus] ?? statusColors.Preparing}`}>
            {currentStatus.toUpperCase()}
          </span>
        </div>

        <button className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 self-start sm:self-auto shrink-0">
          <Printer size={15} />
          {t('printReceipt', 'Print Receipt')}
        </button>
      </div>

      {/* ── Top Info Row ─────────────────────────────── */}
      <div className="grid gap-5 lg:grid-cols-3">

        {/* Customer Info */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 dark:text-white">{t('customerInfo', 'Customer Info')}</h2>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 dark:bg-slate-800">
              <User size={15} className="text-gray-400 dark:text-slate-500" />
            </div>
          </div>

          <div className="space-y-3.5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">
                {t('customerName', 'Customer Name')}
              </p>
              <p className="mt-0.5 font-bold text-gray-900 dark:text-white">{order.customer.name}</p>
            </div>

            <div className="flex gap-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">
                  {t('phone', 'Phone')}
                </p>
                <p className="mt-0.5 text-sm font-medium text-gray-700 dark:text-slate-300">{order.customer.phone}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">
                  {t('type', 'Type')}
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-sm font-bold text-brand-orange">
                  <Star size={11} fill="currentColor" />
                  {order.customer.type}
                </p>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">
                {t('deliveryAddress', 'Delivery Address')}
              </p>
              <p className="mt-0.5 text-sm leading-relaxed text-gray-700 dark:text-slate-300">
                {order.customer.address}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 dark:text-white">{t('paymentDetails', 'Payment Details')}</h2>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 dark:bg-slate-800">
              <CreditCard size={15} className="text-gray-400 dark:text-slate-500" />
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-gray-100 dark:border-slate-800 p-3 mb-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500 text-white">
              <CreditCard size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">METHOD</p>
              <p className="mt-0.5 text-sm font-bold text-gray-800 dark:text-white">{order.payment.method}</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">STATUS</p>
              <span className={`mt-1 inline-flex items-center gap-1.5 text-sm font-bold ${
                order.payment.status === 'PAID' ? 'text-green-600' : 'text-gray-400 dark:text-slate-500'
              }`}>
                <CheckCircle size={13} />
                {order.payment.status}
              </span>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">TRANSACTION ID</p>
              <p className="mt-1 text-sm font-bold text-gray-800 dark:text-white">{order.payment.transactionId}</p>
            </div>
          </div>
        </div>

        {/* Live Actions */}
        <div className="rounded-2xl bg-gradient-to-br from-brand-orange to-orange-700 p-5 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-5">
            <Zap size={16} fill="currentColor" className="text-orange-200" />
            <h2 className="font-bold">{t('liveActions', 'Live Actions')}</h2>
          </div>

          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-orange-200">
            {t('updateOrderStatus', 'UPDATE ORDER STATUS')}
          </p>

          <div className="relative mb-3">
            <select
              value={currentStatus}
              onChange={(e) => setCurrentStatus(e.target.value)}
              className="w-full appearance-none rounded-xl border border-white/30 bg-white/20 px-4 py-3 text-sm font-semibold text-white outline-none backdrop-blur-sm cursor-pointer"
            >
              <option value="Preparing" className="text-gray-900 bg-white">Preparing (Current)</option>
              <option value="Ready"     className="text-gray-900 bg-white">Ready for Pickup</option>
              <option value="Completed" className="text-gray-900 bg-white">Completed</option>
              <option value="Cancelled" className="text-gray-900 bg-white">Cancelled</option>
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/70" />
          </div>
        </div>
      </div>

      {/* ── Bottom Row ───────────────────────────────── */}
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">

        {/* Order Items */}
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">

          {/* Items header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <h2 className="font-bold text-gray-900 dark:text-white">{t('orderItems', 'Order Items')}</h2>
              <span className="rounded-full bg-orange-50 dark:bg-orange-950/20 px-2.5 py-0.5 text-xs font-bold text-brand-orange">
                {order.items.length} {t('items', 'Items')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                {t('kitchenView', 'Kitchen View')}
              </span>
              <button
                onClick={() => setKitchenView((v) => !v)}
                aria-label="Toggle kitchen view"
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  kitchenView ? 'bg-brand-orange' : 'bg-gray-200 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                    kitchenView ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Items table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-50 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">
                    {t('itemDetails', 'ITEM DETAILS')}
                  </th>
                  <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">
                    {t('qty', 'QTY')}
                  </th>
                  <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">
                    {t('unitPrice', 'UNIT PRICE')}
                  </th>
                  <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">
                    {t('subtotalCol', 'SUBTOTAL')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                {order.items.map((item: any, idx: number) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-12 w-12 rounded-xl object-cover"
                          />
                          <span className="absolute -top-1.5 -left-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-orange text-[10px] font-bold text-white">
                            {idx + 1}
                          </span>
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{item.name}</p>
                          <p className="text-xs font-medium text-brand-orange">{item.variant}</p>
                          {item.extra && (
                            <p className="text-xs text-gray-400 dark:text-slate-500">{item.extra}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center font-bold text-gray-800 dark:text-white">
                      {item.qty}
                    </td>
                    <td className="px-4 py-4 text-right text-gray-600 dark:text-slate-300">
                      {item.unitPrice} EGP
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-gray-900 dark:text-white">
                      {item.qty * item.unitPrice} EGP
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="border-t border-gray-100 dark:border-slate-800 px-5 py-5">
            <div className="ml-auto max-w-xs space-y-2.5">
              {[
                { label: t('subtotalLabel', 'Subtotal'),        value: order.subtotal.toFixed(2) },
                { label: t('serviceTax', 'Service Tax (14%)'),  value: order.tax.toFixed(2) },
                { label: t('deliveryFee', 'Delivery Fee'),       value: order.deliveryFee.toFixed(2) },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between text-sm text-gray-500 dark:text-slate-400">
                  <span>{row.label}</span>
                  <span>{row.value} EGP</span>
                </div>
              ))}
              <div className="flex items-center justify-between border-t border-gray-100 dark:border-slate-800 pt-3">
                <span className="text-base font-extrabold text-gray-900 dark:text-white">{t('total', 'TOTAL')}</span>
                <span className="text-xl font-extrabold text-brand-orange">{order.total.toFixed(2)} EGP</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel: Lifecycle + Map */}
        <div className="flex flex-col gap-5">

          {/* Life-cycle */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900 dark:text-white">{t('lifeCycle', 'Life-cycle')}</h2>
              <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold text-brand-orange dark:bg-orange-950/20">
                {t('liveTracking', 'LIVE TRACKING')}
              </span>
            </div>

            <div className="space-y-0">
              {order.lifecycle.map((step: any, idx: number) => {
                const isLast = idx === order.lifecycle.length - 1
                return (
                  <div key={step.key} className="flex gap-3">
                    {/* Icon + connector line */}
                    <div className="flex flex-col items-center">
                      <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 z-10 ${
                        step.done
                          ? 'border-green-500 bg-green-500'
                          : step.current
                          ? 'border-brand-orange bg-brand-orange'
                          : 'border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900'
                      }`}>
                        {step.done ? (
                          <CheckCircle size={13} className="text-white" />
                        ) : step.current ? (
                          <div className="h-2.5 w-2.5 rounded-full bg-white" />
                        ) : (
                          <div className="h-2 w-2 rounded-full bg-gray-300 dark:bg-slate-600" />
                        )}
                      </div>
                      {!isLast && (
                        <div className={`my-1 w-0.5 flex-1 min-h-[28px] ${
                          step.done ? 'bg-green-400' : 'bg-gray-150 dark:bg-slate-800'
                        }`} />
                      )}
                    </div>

                    {/* Text */}
                    <div className={`${isLast ? 'pb-0' : 'pb-4'}`}>
                      <div className="flex items-baseline gap-2">
                        <p className={`text-sm font-bold ${
                          step.current
                            ? 'text-brand-orange'
                            : step.done
                            ? 'text-gray-800 dark:text-white'
                            : 'text-gray-400 dark:text-slate-500'
                        }`}>
                          {step.label}
                        </p>
                        {step.time && (
                          <span className={`text-xs font-bold ${
                            step.current ? 'text-brand-orange' : 'text-gray-400 dark:text-slate-500'
                          }`}>
                            {step.time}
                          </span>
                        )}
                      </div>
                      <p className={`mt-0.5 flex items-center gap-1 text-xs ${
                        step.current ? 'text-orange-400' : 'text-gray-400 dark:text-slate-500'
                      }`}>
                        {step.current && <Clock size={10} />}
                        {step.detail}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Map */}
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
            {/* Map area */}
            <div className="relative h-44 bg-gradient-to-br from-emerald-50 via-teal-100 to-cyan-100 dark:from-slate-800 dark:via-slate-750 dark:to-slate-700">
              {/* Street grid */}
              <div
                className="absolute inset-0 opacity-25"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              />
              {/* Roads */}
              <div className="absolute top-1/2 inset-x-0 h-4 -translate-y-1/2 bg-white/50 dark:bg-white/10" />
              <div className="absolute left-1/3 inset-y-0 w-4 bg-white/50 dark:bg-white/10" />

              {/* Zoom controls */}
              <div className="absolute right-3 top-3 flex flex-col gap-1">
                {['+', '−'].map((label) => (
                  <button
                    key={label}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-white dark:bg-slate-700 shadow text-gray-600 dark:text-slate-200 text-xs font-bold hover:bg-gray-50 dark:hover:bg-slate-600"
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Driver pin */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-orange shadow-lg shadow-orange-300/40 dark:shadow-orange-900/30">
                  <MapPin size={20} className="text-white" fill="white" />
                </div>
                <div className="mx-auto mt-[-4px] h-2 w-2 rotate-45 bg-brand-orange" />
              </div>

              {/* Driver label */}
              <div className="absolute bottom-3 left-3">
                <div className="flex items-center gap-1.5 rounded-full bg-white dark:bg-slate-800 px-2.5 py-1 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-bold text-gray-700 dark:text-slate-200">
                    Driver: {order.driver}
                  </span>
                </div>
              </div>
            </div>

            {/* Map footer */}
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">
                  {t('deliveryDistance', 'DELIVERY DISTANCE')}
                </p>
                <p className="mt-0.5 text-sm font-bold text-gray-800 dark:text-white">
                  {order.deliveryDistance}
                </p>
              </div>
              <button className="flex items-center gap-1.5 text-xs font-bold text-brand-orange hover:underline">
                {t('viewMap', 'View Map')}
                <ExternalLink size={11} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
