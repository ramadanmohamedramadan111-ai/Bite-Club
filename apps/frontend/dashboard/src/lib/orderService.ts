import { api } from './api'

export type ApiLiveOrder = {
  id: string
  order_type: string
  status: string
  customer: {
    id: number | null
    name: string | null
    phone_number: string | null
  }
  financials: {
    subtotal: number
    delivery_fee: number
    service_fee: number
    total: number
  }
  items: Array<{
    id: number
    item_id: number
    item_name: string
    quantity: number
    price: number
    total_price: number
    notes: string | null
  }>
  payments: Array<{
    id: number
    payment_type: string
    payment_method: string
    amount: number
    status: string
  }>
  created_at: string
  time_ago: string
}

type LiveOrderListResponse = {
  success: boolean
  data: ApiLiveOrder[]
}

type OrderHistoryResponse = {
  success: boolean
  data: ApiLiveOrder[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export type HistoryFilters = {
  status?: string
  order_type?: string
  from_date?: string
  to_date?: string
  query?: string
}

export const orderService = {
  getLiveOrders: (query?: string) => {
    const params: Record<string, string> = {}
    if (query) params.query = query
    return api.get<LiveOrderListResponse>('/restaurant/orders/live', { params }).then((r) => r.data.data)
  },

  getHistoryOrders: (page: number = 1, filters: HistoryFilters = {}) => {
    // Strip out empty strings so they don't get sent as query params
    const params: Record<string, string | number> = { page }
    if (filters.status)     params.status     = filters.status
    if (filters.order_type) params.order_type = filters.order_type
    if (filters.from_date)  params.from_date  = filters.from_date
    if (filters.to_date)    params.to_date    = filters.to_date
    if (filters.query)      params.query      = filters.query
    return api.get<OrderHistoryResponse>('/restaurant/orders/history', { params })
      .then((r) => ({ items: r.data.data, meta: r.data.meta }))
  },
}
