import { create } from 'zustand'
import { notificationService } from '../lib/notificationService'
import type { ApiNotification, NotificationMeta } from '../types/notifications'

export type { ApiNotification as Notification }

const DEFAULT_META: NotificationMeta = { current_page: 1, last_page: 1, per_page: 15, total: 0 }

interface NotificationStore {
  notifications: ApiNotification[]
  meta: NotificationMeta
  unreadCount: number
  isLoading: boolean
  error: string | null

  fetchNotifications: (page?: number, perPage?: number) => Promise<void>
  fetchUnreadCount: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  receiveNotification: (notification: ApiNotification) => void
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  meta: DEFAULT_META,
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchNotifications: async (page = 1, perPage = 15) => {
    set({ isLoading: true, error: null })
    try {
      const { items, meta } = await notificationService.getNotifications(page, perPage)
      set({ notifications: items, meta })
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to load notifications' })
    } finally {
      set({ isLoading: false })
    }
  },

  fetchUnreadCount: async () => {
    try {
      const unreadCount = await notificationService.getUnreadCount()
      set({ unreadCount })
    } catch {
      // Silently ignore — the bell icon just keeps its last known count.
    }
  },

  markAsRead: async (id: string) => {
    const target = get().notifications.find((n) => n.id === id)
    if (!target || target.read_at) return

    set({
      notifications: get().notifications.map((n) =>
        n.id === id ? { ...n, read_at: new Date().toISOString() } : n
      ),
      unreadCount: Math.max(0, get().unreadCount - 1),
    })

    try {
      await notificationService.markAsRead(id)
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to mark notification as read' })
    }
  },

  markAllAsRead: async () => {
    const now = new Date().toISOString()
    set({
      notifications: get().notifications.map((n) => (n.read_at ? n : { ...n, read_at: now })),
      unreadCount: 0,
    })

    try {
      await notificationService.markAllAsRead()
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to mark all notifications as read' })
    }
  },

  receiveNotification: (notification: ApiNotification) => {
    set({
      notifications: [notification, ...get().notifications],
      unreadCount: get().unreadCount + 1,
    })
  },
}))
