import { api } from './api'
import type { NotificationListResponse, UnreadCountResponse } from '../types/notifications'

export const notificationService = {
  getNotifications: (page: number = 1, perPage: number = 15) => {
    return api
      .get<NotificationListResponse>('/restaurant/notifications', { params: { page, per_page: perPage } })
      .then((r) => r.data.data)
  },

  getUnreadCount: () => {
    return api
      .get<UnreadCountResponse>('/restaurant/notifications/unread-count')
      .then((r) => r.data.data.count)
  },

  markAsRead: (id: string) => {
    return api.patch(`/restaurant/notifications/${id}/mark-as-read`).then(() => undefined)
  },

  markAllAsRead: () => {
    return api.post('/restaurant/notifications/mark-all-as-read').then(() => undefined)
  },
}
