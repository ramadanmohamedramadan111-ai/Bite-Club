import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Receipt } from 'lucide-react'
import toast from 'react-hot-toast'
import { Table } from '../../components/common/Table'
import type { Column } from '../../components/common/Table'
import { Pagination } from '../../components/common/Pagination'
import { useInvoiceStore } from '../../store/invoiceStore'
import type { Invoice, InvoiceStatus } from '../../types/invoices'

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

export function InvoicesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { invoices, meta, isLoading, fetchInvoices, payInvoice } = useInvoiceStore()

  const [filterStatus, setFilterStatus] = useState<InvoiceStatus | ''>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [payingId, setPayingId] = useState<number | null>(null)

  useEffect(() => {
    fetchInvoices(currentPage, { status: filterStatus || undefined })
  }, [currentPage, filterStatus, fetchInvoices])

  const handlePayNow = async (invoice: Invoice, e: React.MouseEvent) => {
    e.stopPropagation()
    setPayingId(invoice.id)
    try {
      const checkoutUrl = await payInvoice(invoice.id)
      window.location.href = checkoutUrl
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('invoicePaymentFailed', 'Failed to start payment.'))
      setPayingId(null)
    }
  }

  const columns: Column<Invoice>[] = [
    {
      header: t('invoiceId', 'INVOICE ID'),
      key: 'id',
      render: (invoice) => <span className="font-bold text-gray-800 dark:text-white">#{invoice.id}</span>,
    },
    {
      header: t('billingPeriod', 'BILLING PERIOD'),
      key: 'billing_period',
      render: (invoice) => (
        <span className="text-sm text-gray-600 dark:text-slate-400">
          {formatDate(invoice.billing_start_date)} — {formatDate(invoice.billing_end_date)}
        </span>
      ),
    },
    {
      header: t('dueDate', 'DUE DATE'),
      key: 'due_date',
      render: (invoice) => <span className="text-sm text-gray-600 dark:text-slate-400">{formatDate(invoice.due_date)}</span>,
    },
    {
      header: t('amount', 'AMOUNT'),
      key: 'amount',
      render: (invoice) => <span className="font-semibold text-gray-800 dark:text-white">{formatCurrency(invoice.amount)}</span>,
    },
    {
      header: t('status', 'STATUS'),
      key: 'status',
      render: (invoice) => (
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusClasses(invoice.status)}`}>
          {invoice.status}
        </span>
      ),
    },
    {
      header: t('action', 'ACTION'),
      key: 'action',
      render: (invoice) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/invoices/${invoice.id}`) }}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:border-brand-orange hover:text-brand-orange transition dark:border-slate-600 dark:text-slate-300"
          >
            {t('viewDetails')}
          </button>
          {invoice.status !== 'paid' && (
            <button
              onClick={(e) => void handlePayNow(invoice, e)}
              disabled={payingId === invoice.id}
              className="rounded-lg bg-brand-orange px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 transition disabled:opacity-60"
            >
              {payingId === invoice.id ? t('processing', 'Processing...') : t('payNow', 'Pay Now')}
            </button>
          )}
        </div>
      ),
    },
  ]

  const from = meta.total === 0 ? 0 : (meta.current_page - 1) * meta.per_page + 1
  const to = Math.min(meta.current_page * meta.per_page, meta.total)

  return (
    <div className="flex flex-col gap-6 mx-auto w-full">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-brand-orange">
          <Receipt size={18} />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('invoicesTitle', 'Invoices')}</h1>
        </div>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          {t('invoicesSubtitle', 'Review your platform commission invoices and settle any dues.')}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-1 min-w-[150px]">
          <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">{t('status', 'Status')}</label>
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value as InvoiceStatus | ''); setCurrentPage(1) }}
            className="appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-brand-orange dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="">{t('allStatuses', 'All Statuses')}</option>
            <option value="unpaid">{t('unpaid', 'Unpaid')}</option>
            <option value="overdue">{t('overdue', 'Overdue')}</option>
            <option value="paid">{t('paid', 'Paid')}</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <span className="h-8 w-8 animate-spin rounded-full border-4 border-brand-orange border-t-transparent" />
          </div>
        ) : (
          <Table
            columns={columns}
            data={invoices}
            keyExtractor={(row) => row.id}
            onRowClick={(row) => navigate(`/invoices/${row.id}`)}
            emptyState={t('noInvoices', 'No invoices found')}
          />
        )}

        {invoices.length > 0 && (
          <Pagination
            currentPage={meta.current_page}
            totalPages={meta.last_page}
            onPageChange={setCurrentPage}
            showingText={t('showingInvoices', `Showing ${from} to ${to} of ${meta.total} invoices`)}
          />
        )}
      </div>
    </div>
  )
}
