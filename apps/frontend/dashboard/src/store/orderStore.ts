import { create } from 'zustand'
import { orderService, type ApiLiveOrder } from '../lib/orderService'

export type { ApiLiveOrder as Order }

interface OrderStore {
  orders: ApiLiveOrder[]
  isLoading: boolean
  error: string | null

  fetchLiveOrders: () => Promise<void>
}

export const useOrderStore = create<OrderStore>((set) => ({
  orders: [],
  isLoading: false,
  error: null,

  fetchLiveOrders: async () => {
    set({ isLoading: true, error: null })
    try {
      const orders = await orderService.getLiveOrders()
      set({ orders })
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to load live orders' })
    } finally {
      set({ isLoading: false })
    }
  },
}))
