import type { DashboardAnalytics } from './analytics'

export type RestaurantProfile = {
  id: number
  name: string
  description: string | null
  phone_number: string
  address: string
  logo_url: string | null
  cover_image_url: string | null
  category_id: number | null
}

export type OpeningHour = {
  day_of_week: number
  opens_at: string | null
  closes_at: string | null
  is_closed: boolean
}

export type RestaurantSettings = {
  id: number
  restaurant_id: number
  is_open: boolean
  accept_orders: boolean
  delivery_enabled: boolean
  pickup_enabled: boolean
  latitude: string
  longitude: string
  delivery_radius: string
  delivery_fee_per_km: string
  deposit_threshold: string
  deposit_percentage: string
  kashier_api_key: string | null
  kashier_merchant_id: string | null
  kashier_webhook_secret: string | null
  updated_at: string
}

export type ProfileResponse = {
  success: boolean
  message: string
  data: RestaurantProfile
}

export type OpeningHoursResponse = {
  success: boolean
  message: string
  data: OpeningHour[]
}

export type SettingsResponse = {
  success: boolean
  message: string
  data: RestaurantSettings
}

export type DashboardAnalyticsResponse = {
  success: boolean
  message: string
  data: DashboardAnalytics
}

export type UpdateProfilePayload = {
  name?: string
  description?: string
  phone_number?: string
  address?: string
  category_id?: number | null
  logo?: File | null
  cover_image?: File | null
}

export type UpdateSettingsPayload = Partial<Omit<RestaurantSettings, 'id' | 'restaurant_id' | 'updated_at'>>
