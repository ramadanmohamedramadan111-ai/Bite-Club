import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { initialNotifications } from '@/data/mock-notifications';
import type { Notification } from '@/types/notifications/notification';

type NotificationsStore = {
  notifications: Notification[];

  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  getUnreadCount: () => number;
  getRecentNotifications: (limit: number) => Notification[];
};

function sortNotifications(notifications: Notification[]) {
  return [...notifications].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export const useNotificationsStore = create<NotificationsStore>()(
  persist(
    (set, get) => ({
      notifications: initialNotifications,

      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((notification) =>
            notification.id === id
              ? { ...notification, read: true }
              : notification,
          ),
        })),

      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((notification) => ({
            ...notification,
            read: true,
          })),
        })),

      getUnreadCount: () =>
        get().notifications.filter((notification) => !notification.read).length,

      getRecentNotifications: (limit) =>
        sortNotifications(get().notifications).slice(0, limit),
    }),
    { name: 'biteclub-notifications' },
  ),
);

export function useUnreadNotificationCount() {
  return useNotificationsStore(
    (state) =>
      state.notifications.filter((notification) => !notification.read).length,
  );
}
