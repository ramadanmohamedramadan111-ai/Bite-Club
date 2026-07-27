import { create } from 'zustand'
import { orderService, type ApiLiveOrder, type HistoryFilters } from '../lib/orderService'

export type { ApiLiveOrder as Order }

type Meta = {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

interface OrderStore {
  orders: ApiLiveOrder[]
  historyOrders: ApiLiveOrder[]
  historyMeta: Meta
  isLoading: boolean
  error: string | null

  fetchLiveOrders: (query?: string) => Promise<void>
  fetchHistoryOrders: (page?: number, filters?: HistoryFilters) => Promise<void>
}

const DEFAULT_META: Meta = { current_page: 1, last_page: 1, per_page: 15, total: 0 }

export const useOrderStore = create<OrderStore>((set) => ({
  orders: [],
  historyOrders: [],
  historyMeta: DEFAULT_META,
  isLoading: false,
  error: null,

  fetchLiveOrders: async (query?: string) => {
    set({ isLoading: true, error: null })
    try {
      const orders = await orderService.getLiveOrders(query)
      set({ orders })
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to load live orders' })
    } finally {
      set({ isLoading: false })
    }
  },

  fetchHistoryOrders: async (page = 1, filters: HistoryFilters = {}) => {
    set({ isLoading: true, error: null })
    try {
      const { items, meta } = await orderService.getHistoryOrders(page, filters)
      set({ historyOrders: items, historyMeta: meta })
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to load order history' })
    } finally {
      set({ isLoading: false })
    }
  },
}))
