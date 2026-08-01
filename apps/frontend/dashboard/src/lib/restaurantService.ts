import { api } from './api'
import type { DashboardPeriod } from '../types/analytics'
import type {
  DashboardAnalyticsResponse,
  OpeningHour,
  OpeningHoursResponse,
  ProfileResponse,
  SettingsResponse,
  UpdateProfilePayload,
  UpdateSettingsPayload,
} from '../types/restaurant'

export const restaurantService = {
  getProfile: () =>
    api.get<ProfileResponse>('/restaurant/profile').then((r) => r.data.data),

  updateProfile: (payload: UpdateProfilePayload) => {
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

  updateSettings: (payload: UpdateSettingsPayload) =>
    api.put<SettingsResponse>('/restaurant/settings', payload).then((r) => r.data.data),

  getDashboardAnalytics: (period: DashboardPeriod = 'today') =>
    api.get<DashboardAnalyticsResponse>(`/restaurant/dashboard`, { params: { period } }).then((r) => r.data.data),
}
