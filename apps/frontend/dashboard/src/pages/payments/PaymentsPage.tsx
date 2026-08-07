import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertCircle, CheckCircle2, Clock3, CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'
import { paymentService } from '../../lib/paymentService'
import type { Payment, PaymentStatistics } from '../../types/payments'
import { Table } from '../../components/common/Table'
import type { Column } from '../../components/common/Table'
import { usePageTitle } from '../../hooks/usePageTitle'

const formatCurrency = (value: string | number) =>
  new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
  }).format(Number(value)) + ' EGP'

const formatDate = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

const getStatusClasses = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'paid':
    case 'completed':
      return 'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-500'
    case 'pending':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-600'
    case 'failed':
      return 'bg-red-100 text-red-600 dark:bg-red-950/20 dark:text-red-500'
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-400'
  }
}

const getTypeClasses = (paymentType: string) => {
  switch (paymentType?.toLowerCase()) {
    case 'full':
      return 'bg-orange-50 text-brand-orange dark:bg-orange-950/20'
    case 'partial':
      return 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-500'
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-400'
  }
}

export function PaymentsPage() {
  const { t } = useTranslation()
  usePageTitle(t('paymentsTitle', 'Payments'))
  const [payments, setPayments] = useState<Payment[]>([])
  const [stats, setStats] = useState<PaymentStatistics>({ total_paid: 0, total_pending: 0, total_failed: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const [{ data }, statistics] = await Promise.all([
          paymentService.getPayments(),
          paymentService.getStatistics(),
        ])
        if (!isMounted) return
        setPayments(data)
        setStats(statistics)
      } catch (err) {
        if (!isMounted) return
        setError(err instanceof Error ? err.message : t('errorOccurred', 'An error occurred.'))
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    void load()
    return () => { isMounted = false }
  }, [t])

  const columns: Column<Payment>[] = [
    {
      header: t('paymentId', 'PAYMENT ID'),
      key: 'id',
      render: (payment) => <span className="font-semibold text-gray-800 dark:text-white">#{payment.id}</span>,
    },
    {
      header: t('orderId', 'ORDER ID'),
      key: 'order_id',
      render: (payment) => <span className="font-medium text-gray-700 dark:text-slate-300">{payment.order_id ?? '-'}</span>,
    },
    {
      header: t('customer', 'CUSTOMER'),
      key: 'user',
      render: (payment) => (
        <div>
          <p className="font-semibold text-gray-800 dark:text-white">{payment.user?.name || t('guest', 'Guest')}</p>
          <p className="text-xs text-gray-400 dark:text-slate-500">{payment.user?.email || '-'}</p>
        </div>
      ),
    },
    {
      header: t('paymentMethod', 'PAYMENT METHOD'),
      key: 'payment_method',
      render: (payment) => (
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold capitalize text-gray-700 dark:bg-slate-800 dark:text-slate-300">
          {payment.payment_method || '-'}
        </span>
      ),
    },
    {
      header: t('paymentType', 'PAYMENT TYPE'),
      key: 'payment_type',
      render: (payment) => (
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${getTypeClasses(payment.payment_type)}`}>
          {payment.payment_type || '-'}
        </span>
      ),
    },
    {
      header: t('amount', 'AMOUNT'),
      key: 'amount',
      render: (payment) => <span className="font-semibold text-gray-800 dark:text-white">{formatCurrency(payment.amount)}</span>,
    },
    {
      header: t('status', 'STATUS'),
      key: 'status',
      render: (payment) => (
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClasses(payment.status)}`}>
          {payment.status || '-'}
        </span>
      ),
    },
    {
      header: t('date', 'DATE'),
      key: 'created_at',
      render: (payment) => <span className="text-sm text-gray-600 dark:text-slate-400">{formatDate(payment.created_at)}</span>,
    },
  ]

  const summaryCards = [
    {
      key: 'paid',
      label: t('totalPaid', 'Total Paid'),
      value: formatCurrency(stats.total_paid),
      icon: CheckCircle2,
      tone: 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-500',
    },
    {
      key: 'pending',
      label: t('totalPending', 'Total Pending'),
      value: formatCurrency(stats.total_pending),
      icon: Clock3,
      tone: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-600',
    },
    {
      key: 'failed',
      label: t('totalFailed', 'Total Failed'),
      value: formatCurrency(stats.total_failed),
      icon: AlertCircle,
      tone: 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-500',
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-brand-orange">
          <CreditCard size={18} />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('paymentsTitle', 'Payments')}</h1>
        </div>
        <p className="text-sm text-gray-500 dark:text-slate-400">{t('paymentsSubtitle', 'Review payments, status updates, and transaction history.')}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {summaryCards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.key} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className={`inline-flex rounded-xl p-2 ${card.tone}`}>
                <Icon size={18} />
              </div>
              <p className="mt-4 text-sm font-medium text-gray-500 dark:text-slate-400">{card.label}</p>
              <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">{card.value}</p>
            </div>
          )
        })}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 overflow-hidden">
        <div className="border-b border-gray-100 px-5 py-4 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('paymentHistory', 'Payment History')}</h2>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <span className="h-8 w-8 animate-spin rounded-full border-4 border-brand-orange border-t-transparent" />
          </div>
        ) : error ? (
          <div className="px-5 py-10 text-center text-sm text-red-500">{error}</div>
        ) : (
          <Table
            columns={columns}
            data={payments}
            keyExtractor={(payment) => payment.id}
            emptyState={t('noPayments', 'No payments found')}
          />
        )}
      </div>
    </div>
  )
}
