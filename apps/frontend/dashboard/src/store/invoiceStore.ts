import { create } from 'zustand'
import { invoiceService } from '../lib/invoiceService'
import type { Invoice, InvoiceDetails, InvoiceFilters, InvoiceMeta } from '../types/invoices'

export type { Invoice, InvoiceDetails }

const DEFAULT_META: InvoiceMeta = { current_page: 1, last_page: 1, per_page: 15, total: 0 }

interface InvoiceStore {
  invoices: Invoice[]
  meta: InvoiceMeta
  selectedInvoice: InvoiceDetails | null
  isLoading: boolean
  isPaying: boolean
  error: string | null

  fetchInvoices: (page?: number, filters?: InvoiceFilters) => Promise<void>
  fetchInvoiceDetails: (id: number | string) => Promise<void>
  payInvoice: (id: number | string) => Promise<string>
}

export const useInvoiceStore = create<InvoiceStore>((set) => ({
  invoices: [],
  meta: DEFAULT_META,
  selectedInvoice: null,
  isLoading: false,
  isPaying: false,
  error: null,

  fetchInvoices: async (page = 1, filters: InvoiceFilters = {}) => {
    set({ isLoading: true, error: null })
    try {
      const { items, meta } = await invoiceService.getInvoices(page, 15, filters)
      set({ invoices: items, meta })
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to load invoices' })
    } finally {
      set({ isLoading: false })
    }
  },

  fetchInvoiceDetails: async (id: number | string) => {
    set({ isLoading: true, error: null, selectedInvoice: null })
    try {
      const invoice = await invoiceService.getInvoice(id)
      set({ selectedInvoice: invoice })
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to load invoice details' })
    } finally {
      set({ isLoading: false })
    }
  },

  payInvoice: async (id: number | string) => {
    set({ isPaying: true, error: null })
    try {
      return await invoiceService.payInvoice(id)
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to start payment' })
      throw e
    } finally {
      set({ isPaying: false })
    }
  },
}))
