import type { DashboardAnalytics, DashboardPeriod } from './analytics'
import type { AiReport } from './ai'

export type ReviewExportItem = {
  customer: string
  rating: number
  content: string
  status: string
  date: string
}

export type ExportOrderLineItem = {
  name: string
  qty: number
  unitPrice: number
  totalPrice: number
}

export type ExportOrder = {
  id: string
  status: string
  customer: { name: string; phone: string }
  payments: { method: string; amount: number; status: string }[]
  items: ExportOrderLineItem[]
  subtotal: number
  tax: number
  deliveryFee: number
  total: number
  lifecycle: { label: string; done: boolean; current: boolean }[]
}


export type ExportDashboardPdfOptions = {
  analytics?: DashboardAnalytics | null
  period: DashboardPeriod
  title: string
  report?: AiReport | null
  reviews?: ReviewExportItem[] | null
  order?: ExportOrder | null
}
