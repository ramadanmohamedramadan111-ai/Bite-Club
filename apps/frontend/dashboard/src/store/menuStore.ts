import { create } from 'zustand'
import { menuItemService } from '../lib/menuService'
import type { ApiMenuItem } from './menuTypes'

export type { ApiMenuItem as MenuItem }

type Meta = {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

interface MenuStore {
  items: ApiMenuItem[]
  meta: Meta
  isLoading: boolean
  error: string | null

  fetchItems: (params?: { menu_category_id?: number; page?: number }) => Promise<void>
  addItem: (payload: {
    title: string
    description: string
    price: number
    menu_category_id: number
    availability: 'available' | 'unavailable'
    image: File
  }) => Promise<void>
  updateItem: (id: number, payload: {
    title: string
    description: string
    price: number
    menu_category_id: number
    availability: 'available' | 'unavailable'
    image?: File | null
  }) => Promise<void>
  toggleAvailability: (id: number, current: 'available' | 'unavailable') => Promise<void>
  deleteItem: (id: number) => Promise<void>
}

const DEFAULT_META: Meta = { current_page: 1, last_page: 1, per_page: 15, total: 0 }

export const useMenuStore = create<MenuStore>((set) => ({
  items: [],
  meta: DEFAULT_META,
  isLoading: false,
  error: null,

  fetchItems: async (params) => {
    set({ isLoading: true, error: null })
    try {
      const { items, meta } = await menuItemService.index(params)
      set({ items, meta })
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to load items' })
    } finally {
      set({ isLoading: false })
    }
  },

  addItem: async (payload) => {
    const created = await menuItemService.store(payload)
    set((s) => ({ items: [created, ...s.items], meta: { ...s.meta, total: s.meta.total + 1 } }))
  },

  updateItem: async (id, payload) => {
    const updated = await menuItemService.update(id, payload)
    set((s) => ({ items: s.items.map((i) => (i.id === id ? updated : i)) }))
  },

  toggleAvailability: async (id, current) => {
    const next = current === 'available' ? 'unavailable' : 'available'
    set((s) => ({ items: s.items.map((i) => (i.id === id ? { ...i, availability: next } : i)) }))
    try {
      await menuItemService.updateAvailability(id, next)
    } catch {
      set((s) => ({ items: s.items.map((i) => (i.id === id ? { ...i, availability: current } : i)) }))
    }
  },

  deleteItem: async (id) => {
    await menuItemService.destroy(id)
    set((s) => ({ items: s.items.filter((i) => i.id !== id), meta: { ...s.meta, total: s.meta.total - 1 } }))
  },
}))
