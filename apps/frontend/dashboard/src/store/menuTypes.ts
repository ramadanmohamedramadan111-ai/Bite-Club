// Shapes returned by the API — snake_case as the backend sends them

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
