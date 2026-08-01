import { api } from './api'
import type { HistoryFilters, LiveOrderListResponse, OrderHistoryResponse } from '../types/orders'

export const orderService = {
  getLiveOrders: (search?: string) => {
    const params: Record<string, string> = {}
    if (search) params.search = search
    return api.get<LiveOrderListResponse>('/restaurant/orders/live', { params }).then((r) => r.data.data)
  },

  getHistoryOrders: (page: number = 1, filters: HistoryFilters = {}) => {
    const params: Record<string, string | number> = { page }
    if (filters.status)     params.status     = filters.status
    if (filters.order_type) params.order_type = filters.order_type
    if (filters.from_date)  params.from_date  = filters.from_date
    if (filters.to_date)    params.to_date    = filters.to_date
    if (filters.search)     params.search     = filters.search
    return api.get<OrderHistoryResponse>('/restaurant/orders/history', { params })
      .then((r) => ({ items: r.data.data, meta: r.data.meta }))
  },
}
