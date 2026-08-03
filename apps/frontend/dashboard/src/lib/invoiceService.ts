import { api } from './api'
import type {
  InvoiceDetailsResponse,
  InvoiceFilters,
  InvoiceListResponse,
  PayInvoiceResponse,
} from '../types/invoices'

export const invoiceService = {
  getInvoices: (page: number = 1, perPage: number = 15, filters: InvoiceFilters = {}) => {
    const params: Record<string, string | number> = { page, per_page: perPage }
    if (filters.status) params.status = filters.status
    return api.get<InvoiceListResponse>('/restaurant/invoices', { params }).then((r) => r.data.data)
  },

  getInvoice: (id: number | string) => {
    return api.get<InvoiceDetailsResponse>(`/restaurant/invoices/${id}`).then((r) => r.data.data)
  },

  payInvoice: (id: number | string) => {
    return api
      .post<PayInvoiceResponse>(`/restaurant/invoices/${id}/pay`)
      .then((r) => r.data.data.checkout_url)
  },
}
