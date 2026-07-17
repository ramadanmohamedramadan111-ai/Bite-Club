import { create } from 'zustand'
import { menuCategoryService } from '../lib/menuService'
import type { ApiCategory } from './menuTypes'

export type { ApiCategory as Category }

interface CategoryStore {
  categories: ApiCategory[]
  isLoading: boolean
  error: string | null

  fetchCategories: () => Promise<void>
  addCategory: (payload: { title: string; icon_name: string; short_description: string; visibility?: 'visible' | 'hidden' }) => Promise<void>
  updateCategory: (id: number, payload: { title: string; icon_name: string; short_description: string; visibility?: 'visible' | 'hidden' }) => Promise<void>
  toggleVisibility: (id: number, current: 'visible' | 'hidden') => Promise<void>
  deleteCategory: (id: number) => Promise<void>
}

export const useCategoryStore = create<CategoryStore>((set, get) => ({
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    set({ isLoading: true, error: null })
    try {
      const categories = await menuCategoryService.index()
      set({ categories })
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to load categories' })
    } finally {
      set({ isLoading: false })
    }
  },

  addCategory: async (payload) => {
    const created = await menuCategoryService.store(payload)
    set((s) => ({ categories: [...s.categories, created] }))
  },

  updateCategory: async (id, payload) => {
    const updated = await menuCategoryService.update(id, payload)
    set((s) => ({
      categories: s.categories.map((c) => (c.id === id ? updated : c)),
    }))
  },

  toggleVisibility: async (id, current) => {
    const next = current === 'visible' ? 'hidden' : 'visible'
    // optimistic update
    set((s) => ({
      categories: s.categories.map((c) => (c.id === id ? { ...c, visibility: next } : c)),
    }))
    try {
      await menuCategoryService.updateVisibility(id, next)
    } catch {
      // revert on failure
      set((s) => ({
        categories: s.categories.map((c) => (c.id === id ? { ...c, visibility: current } : c)),
      }))
    }
  },

  deleteCategory: async (id) => {
    await menuCategoryService.destroy(id)
    set((s) => ({ categories: s.categories.filter((c) => c.id !== id) }))
  },
}))
