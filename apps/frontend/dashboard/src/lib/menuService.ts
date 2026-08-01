import { api } from './api'
import type {
  CategoryListResponse,
  CategoryResponse,
  ItemListResponse,
  ItemResponse,
  MenuCategoryPayload,
  MenuItemListParams,
  MenuItemStorePayload,
  MenuItemUpdatePayload,
} from '../types/menu'

// ─── Menu Categories ─────────────────────────────────────────────────────────

export const menuCategoryService = {
  index: (search?: string) =>
    api.get<CategoryListResponse>('/restaurant/menu-categories', {
      params: search ? { search } : {}
    }).then((r) => r.data.data.items || []),

  store: (payload: MenuCategoryPayload) =>
    api.post<CategoryResponse>('/restaurant/menu-categories', payload).then((r) => r.data.data),

  update: (id: number, payload: MenuCategoryPayload) =>
    api.put<CategoryResponse>(`/restaurant/menu-categories/${id}`, payload).then((r) => r.data.data),

  updateVisibility: (id: number, visibility: 'visible' | 'hidden') =>
    api.put<CategoryResponse>(`/restaurant/menu-categories/${id}/visibility`, { visibility }).then((r) => r.data.data),

  destroy: (id: number) =>
    api.delete(`/restaurant/menu-categories/${id}`),
}

// ─── Menu Items ───────────────────────────────────────────────────────────────

export const menuItemService = {
  index: (params?: MenuItemListParams) =>
    api.get<ItemListResponse>('/restaurant/menu-items', {
      params: {
        ...(params?.menu_category_id ? { menu_category_id: params.menu_category_id } : {}),
        ...(params?.title ? { title: params.title } : {}),
        ...(params?.search ? { search: params.search } : {}),
        ...(params?.sort_by ? { sort_by: params.sort_by } : {}),
        ...(params?.sort_dir ? { sort_dir: params.sort_dir } : {}),
        ...(params?.page ? { page: params.page } : {}),
      },
    }).then((r) => ({ items: r.data.data.items || [], meta: r.data.data.meta })),

  store: (payload: MenuItemStorePayload) => {
    const form = new FormData()
    form.append('title', payload.title)
    form.append('description', payload.description)
    form.append('price', String(payload.price))
    form.append('menu_category_id', String(payload.menu_category_id))
    form.append('availability', payload.availability)
    form.append('image', payload.image)
    return api.post<ItemResponse>('/restaurant/menu-items', form, {
      headers: { 'Content-Type': undefined },
    }).then((r) => r.data.data)
  },

  update: (id: number, payload: MenuItemUpdatePayload) => {
    const form = new FormData()
    form.append('title', payload.title)
    form.append('description', payload.description)
    form.append('price', String(payload.price))
    form.append('menu_category_id', String(payload.menu_category_id))
    form.append('availability', payload.availability)
    if (payload.image) form.append('image', payload.image)
    return api.post<ItemResponse>(`/restaurant/menu-items/${id}`, form, {
      headers: { 'Content-Type': undefined },
    }).then((r) => r.data.data)
  },

  updateAvailability: (id: number, availability: 'available' | 'unavailable') =>
    api.put<ItemResponse>(`/restaurant/menu-items/${id}/availability`, { availability }).then((r) => r.data.data),

  destroy: (id: number) =>
    api.delete(`/restaurant/menu-items/${id}`),
}
