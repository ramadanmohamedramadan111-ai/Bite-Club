export type ApiCategory = {
  id: number
  title: string
  icon_name: string
  short_description: string
  visibility: 'visible' | 'hidden'
  total_items: number
  active_items: number
}

export type ApiMenuItem = {
  id: number
  title: string
  description: string
  price: number
  menu_category_id: number
  availability: 'available' | 'unavailable'
  image_url: string | null
  category: {
    id: number
    title: string
  } | null
}

export type CategoryListResponse = {
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

export type CategoryResponse = {
  success: boolean
  data: ApiCategory
}

export type ItemListResponse = {
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

export type ItemResponse = {
  success: boolean
  data: ApiMenuItem
}

export type MenuCategoryPayload = {
  title: string
  icon_name: string
  short_description: string
  visibility?: 'visible' | 'hidden'
}

export type MenuItemListParams = {
  menu_category_id?: number
  title?: string
  search?: string
  sort_by?: 'title' | 'price' | 'availability'
  sort_dir?: 'asc' | 'desc'
  page?: number
}

export type MenuItemStorePayload = {
  title: string
  description: string
  price: number
  menu_category_id: number
  availability: 'available' | 'unavailable'
  image: File
}

export type MenuItemUpdatePayload = {
  title: string
  description: string
  price: number
  menu_category_id: number
  availability: 'available' | 'unavailable'
  image?: File | null
}
