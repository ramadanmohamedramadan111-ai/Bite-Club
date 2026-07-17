import { api } from './api'
import type { ApiCategory, ApiMenuItem } from '../store/menuTypes'

// ─── Category responses ───────────────────────────────────────────────────────

type CategoryListResponse = {
  success: boolean
  data: {
    items: ApiCategory[]
    meta: {
      current_page: number
      last_page: number
      per_page: number
      total: number
    }
  }
}
type CategoryResponse     = { success: boolean; data: ApiCategory }

// ─── Item responses ───────────────────────────────────────────────────────────

type ItemListResponse = {
  success: boolean
  data: {
    items: ApiMenuItem[]
    meta: {
      current_page: number
      last_page: number
      per_page: number
      total: number
    }
  }
}
type ItemResponse     = { success: boolean; data: ApiMenuItem }

// ─── Menu Categories ─────────────────────────────────────────────────────────

export const menuCategoryService = {
  index: () =>
    api.get<CategoryListResponse>('/restaurant/menu-categories').then((r) => r.data.data.items),

  store: (payload: { title: string; icon_name: string; short_description: string; visibility?: 'visible' | 'hidden' }) =>
    api.post<CategoryResponse>('/restaurant/menu-categories', payload).then((r) => r.data.data),

  update: (id: number, payload: { title: string; icon_name: string; short_description: string; visibility?: 'visible' | 'hidden' }) =>
    api.put<CategoryResponse>(`/restaurant/menu-categories/${id}`, payload).then((r) => r.data.data),

  updateVisibility: (id: number, visibility: 'visible' | 'hidden') =>
    api.put<CategoryResponse>(`/restaurant/menu-categories/${id}/visibility`, { visibility }).then((r) => r.data.data),

  destroy: (id: number) =>
    api.delete(`/restaurant/menu-categories/${id}`),
}

// ─── Menu Items ───────────────────────────────────────────────────────────────

export const menuItemService = {
  index: (params?: { menu_category_id?: number; page?: number }) =>
    api.get<ItemListResponse>('/restaurant/menu-items', { params })
      .then((r) => ({ items: r.data.data.items, meta: r.data.data.meta })),

  store: (payload: {
    title: string
    description: string
    price: number
    menu_category_id: number
    availability: 'available' | 'unavailable'
    image: File
  }) => {
    const form = new FormData()
    form.append('title', payload.title)
    form.append('description', payload.description)
    form.append('price', String(payload.price))
    form.append('menu_category_id', String(payload.menu_category_id))
    form.append('availability', payload.availability)
    form.append('image', payload.image)
    return api.post<ItemResponse>('/restaurant/menu-items', form).then((r) => r.data.data)
  },

  update: (id: number, payload: {
    title: string
    description: string
    price: number
    menu_category_id: number
    availability: 'available' | 'unavailable'
    image?: File | null
  }) => {
    const form = new FormData()
    form.append('title', payload.title)
    form.append('description', payload.description)
    form.append('price', String(payload.price))
    form.append('menu_category_id', String(payload.menu_category_id))
    form.append('availability', payload.availability)
    if (payload.image) form.append('image', payload.image)
    return api.post<ItemResponse>(`/restaurant/menu-items/${id}`, form).then((r) => r.data.data)
  },

  updateAvailability: (id: number, availability: 'available' | 'unavailable') =>
    api.put<ItemResponse>(`/restaurant/menu-items/${id}/availability`, { availability }).then((r) => r.data.data),

  destroy: (id: number) =>
    api.delete(`/restaurant/menu-items/${id}`),
}
