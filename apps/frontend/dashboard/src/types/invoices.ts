export type InvoiceStatus = 'unpaid' | 'paid' | 'overdue'

export type Invoice = {
  id: number
  amount: number
  billing_start_date: string
  billing_end_date: string
  due_date: string
  status: InvoiceStatus
  payment_gateway_ref: string | null
  created_at: string
}

export type PlatformDue = {
  id: number
  order_id: number
  commission_rate: number
  commission_amount: number
  service_fee: number
  total_due: number
  invoice_status: string
  created_at: string
  order: {
    total_price: number | null
    status: string | null
    created_at: string | null
  }
}

export type InvoiceDetails = Invoice & {
  platform_dues: PlatformDue[]
}

export type InvoiceMeta = {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export type InvoiceFilters = {
  status?: InvoiceStatus
}

export type InvoiceListResponse = {
  success: boolean
  message: string
  data: {
    items: Invoice[]
    meta: InvoiceMeta
  }
}

export type InvoiceDetailsResponse = {
  success: boolean
  message: string
  data: InvoiceDetails
}

export type PayInvoiceResponse = {
  success: boolean
  message: string
  data: {
    checkout_url: string
  }
}
