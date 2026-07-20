import { api } from './api'

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
  day_of_week: number   // 0 = Sunday, 1 = Monday … 6 = Saturday
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
  updated_at: string
}

type ProfileResponse      = { success: boolean; message: string; data: RestaurantProfile }
type OpeningHoursResponse = { success: boolean; message: string; data: OpeningHour[] }
type SettingsResponse     = { success: boolean; message: string; data: RestaurantSettings }

export const restaurantService = {
  getProfile: () =>
    api.get<ProfileResponse>('/restaurant/profile').then((r) => r.data.data),

  updateProfile: (payload: {
    name?: string
    description?: string
    phone_number?: string
    address?: string
    category_id?: number | null
    logo?: File | null
    cover_image?: File | null
  }) => {
    const form = new FormData()
    if (payload.name         !== undefined) form.append('name',         payload.name)
    if (payload.description  !== undefined) form.append('description',  payload.description ?? '')
    if (payload.phone_number !== undefined) form.append('phone_number', payload.phone_number)
    if (payload.address      !== undefined) form.append('address',      payload.address)
    if (payload.category_id  !== undefined && payload.category_id !== null)
      form.append('category_id', String(payload.category_id))
    if (payload.logo)        form.append('logo',        payload.logo)
    if (payload.cover_image) form.append('cover_image', payload.cover_image)

    return api.patch<ProfileResponse>('/restaurant/profile', form, {
      headers: { 'Content-Type': undefined },
    }).then((r) => r.data.data)
  },

  getOpeningHours: () =>
    api.get<OpeningHoursResponse>('/restaurant/settings/opening-hours').then((r) => r.data.data),

  updateOpeningHours: (hours: OpeningHour[]) =>
    api.put<OpeningHoursResponse>('/restaurant/settings/opening-hours', { opening_hours: hours })
      .then((r) => r.data.data),

  getSettings: () =>
    api.get<SettingsResponse>('/restaurant/settings').then((r) => r.data.data),

  updateSettings: (payload: Partial<Omit<RestaurantSettings, 'id' | 'restaurant_id' | 'updated_at'>>) =>
    api.put<SettingsResponse>('/restaurant/settings', payload).then((r) => r.data.data),
}
