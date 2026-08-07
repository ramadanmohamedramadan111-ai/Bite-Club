import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Calendar, CreditCard, FileText, Hash } from 'lucide-react'
import toast from 'react-hot-toast'
import { Table } from '../../components/common/Table'
import type { Column } from '../../components/common/Table'
import { useInvoiceStore } from '../../store/invoiceStore'
import { usePageTitle } from '../../hooks/usePageTitle'
import type { PlatformDue } from '../../types/invoices'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(value) + ' EGP'

const formatDate = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, { dateStyle: 'medium' })
}

const statusClasses = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'paid':
      return 'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-500'
    case 'overdue':
      return 'bg-red-100 text-red-600 dark:bg-red-950/20 dark:text-red-500'
    case 'unpaid':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-600'
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-400'
  }
}

export function InvoiceDetailsPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { selectedInvoice, isLoading, isPaying, fetchInvoiceDetails, payInvoice } = useInvoiceStore()

  usePageTitle(selectedInvoice ? `${t('invoice', 'Invoice')} #${selectedInvoice.id}` : t('invoicesTitle', 'Invoices'))

  const [isPayingNow, setIsPayingNow] = useState(false)

  useEffect(() => {
    if (id) fetchInvoiceDetails(id)
  }, [id, fetchInvoiceDetails])

  const handlePayNow = async () => {
    if (!id) return
    setIsPayingNow(true)
    try {
      const checkoutUrl = await payInvoice(id)
      window.location.href = checkoutUrl
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('invoicePaymentFailed', 'Failed to start payment.'))
      setIsPayingNow(false)
    }
  }

  if (isLoading || !selectedInvoice) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-brand-orange border-t-transparent" />
      </div>
    )
  }

  const dueColumns: Column<PlatformDue>[] = [
    {
      header: t('orderId', 'ORDER ID'),
      key: 'order_id',
      render: (due) => <span className="font-semibold text-gray-800 dark:text-white">#{due.order_id}</span>,
    },
    {
      header: t('orderTotal', 'ORDER TOTAL'),
      key: 'order_total',
      render: (due) => <span className="text-gray-600 dark:text-slate-400">{due.order.total_price != null ? formatCurrency(due.order.total_price) : '-'}</span>,
    },
    {
      header: t('commissionRate', 'COMMISSION RATE'),
      key: 'commission_rate',
      render: (due) => <span className="text-gray-600 dark:text-slate-400">{due.commission_rate}%</span>,
    },
    {
      header: t('commissionAmount', 'COMMISSION'),
      key: 'commission_amount',
      render: (due) => <span className="text-gray-600 dark:text-slate-400">{formatCurrency(due.commission_amount)}</span>,
    },
    {
      header: t('serviceFee', 'SERVICE FEE'),
      key: 'service_fee',
      render: (due) => <span className="text-gray-600 dark:text-slate-400">{formatCurrency(due.service_fee)}</span>,
    },
    {
      header: t('totalDue', 'TOTAL DUE'),
      key: 'total_due',
      render: (due) => <span className="font-semibold text-gray-800 dark:text-white">{formatCurrency(due.total_due)}</span>,
    },
  ]

  return (
    <div className="flex flex-col gap-6 mx-auto w-full">
      <button
        onClick={() => navigate('/invoices')}
        className="flex w-fit items-center gap-2 text-sm font-semibold text-gray-500 hover:text-brand-orange transition dark:text-slate-400"
      >
        {i18n.language === 'ar' ? <ArrowRight size={16}  /> : <ArrowLeft size={16} />}
        {t('backToInvoices', 'Back to Invoices')}
      </button>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('invoice', 'Invoice')} #{selectedInvoice.id}
              </h1>
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusClasses(selectedInvoice.status)}`}>
                {selectedInvoice.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
              {t('createdOn', 'Created on')} {formatDate(selectedInvoice.created_at)}
            </p>
          </div>

          {selectedInvoice.status !== 'paid' && (
            <button
              onClick={() => void handlePayNow()}
              disabled={isPayingNow || isPaying}
              className="flex items-center gap-2 rounded-xl bg-brand-orange px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition shadow-sm disabled:opacity-60"
            >
              <CreditCard size={16} />
              {isPayingNow ? t('processing', 'Processing...') : t('payNow', 'Pay Now')}
            </button>
          )}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-100 p-4 dark:border-slate-800">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">{t('amount', 'Amount')}</p>
            <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(selectedInvoice.amount)}</p>
          </div>
          <div className="rounded-xl border border-gray-100 p-4 dark:border-slate-800">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
              <Calendar size={12} /> {t('billingPeriod', 'Billing Period')}
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-white">
              {formatDate(selectedInvoice.billing_start_date)} — {formatDate(selectedInvoice.billing_end_date)}
            </p>
          </div>
          <div className="rounded-xl border border-gray-100 p-4 dark:border-slate-800">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
              <Calendar size={12} /> {t('dueDate', 'Due Date')}
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-white">{formatDate(selectedInvoice.due_date)}</p>
          </div>
          <div className="rounded-xl border border-gray-100 p-4 dark:border-slate-800">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
              <Hash size={12} /> {t('paymentGatewayRef', 'Payment Ref')}
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-white">{selectedInvoice.payment_gateway_ref || '-'}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 overflow-hidden">
        <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4 dark:border-slate-800">
          <FileText size={16} className="text-brand-orange" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('platformDues', 'Platform Dues Breakdown')}</h2>
        </div>
        <Table
          columns={dueColumns}
          data={selectedInvoice.platform_dues}
          keyExtractor={(due) => due.id}
          emptyState={t('noPlatformDues', 'No orders in this billing period')}
        />
      </div>
    </div>
  )
}
