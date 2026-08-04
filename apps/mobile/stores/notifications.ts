import EchoModule from 'laravel-echo/dist/echo.js';
import PusherModule from 'pusher-js';

const Echo = (EchoModule as unknown as { default?: typeof EchoModule }).default ?? EchoModule;
type EchoClient = InstanceType<typeof EchoModule>;
const Pusher = (
  PusherModule as unknown as { default?: { Pusher?: typeof PusherModule }; Pusher?: typeof PusherModule }
).default?.Pusher ?? (PusherModule as unknown as { Pusher?: typeof PusherModule }).Pusher ?? PusherModule;
import { useEffect } from 'react';
import { create } from 'zustand';

import { API_BASE_URL, REVERB_HOST, REVERB_PORT, REVERB_APP_KEY } from '@/lib/config';
import { useAuthStore } from '@/stores/auth';
import type { RealtimeNotification } from '@/lib/types';

type NotificationsStore = {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  incrementUnread: (n?: number) => void;
  decrementUnread: () => void;
};

export const useNotificationsStore = create<NotificationsStore>((set) => ({
  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: count }),
  incrementUnread: (n = 1) => set((s) => ({ unreadCount: s.unreadCount + n })),
  decrementUnread: () => set((s) => ({ unreadCount: Math.max(0, s.unreadCount - 1) })),
}));

let echo: EchoClient | null = null;

export function getEcho(): EchoClient | null {
  if (!echo) {
    const token = useAuthStore.getState().token;
    if (!token) return null;
    echo = new Echo({
      broadcaster: 'reverb',
      key: REVERB_APP_KEY,
      wsHost: REVERB_HOST,
      wsPort: REVERB_PORT,
      forceTLS: false,
      enabledTransports: ['ws', 'wss'],
      Pusher,
      authEndpoint: `${API_BASE_URL}/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      },
    });
  }
  return echo;
}

export function disconnectEcho(): void {
  echo?.disconnect();
  echo = null;
}

export function useRealtimeOrder(orderId: number, onStatusUpdated: () => void) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated || !orderId) return;
    const instance = getEcho();
    if (!instance) return;

    const channelName = `order.${orderId}`;
    const channel = instance.private(channelName);

    channel.listen('.order.status.updated', () => {
      onStatusUpdated();
    });

    return () => {
      instance.leave(channelName);
    };
  }, [isAuthenticated, orderId]); // eslint-disable-line react-hooks/exhaustive-deps
}

export function useRealtimeNotifications(onNotification: (n: RealtimeNotification) => void) {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const instance = getEcho();
    if (!instance) return;

    const channelName = `App.Models.User.${user.id}`;
    const channel = instance.private(channelName);

    channel.notification((notification: RealtimeNotification) => {
      onNotification(notification);
    });

    return () => {
      instance.leave(channelName);
    };
  }, [isAuthenticated, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps
}

export function useRealtimeGroupOrder(
  sessionId: number,
  onEventTriggered: (event: string, data?: any) => void
) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated || !sessionId) return;
    const instance = getEcho();
    if (!instance) return;

    const channelName = `group-order.${sessionId}`;
    const channel = instance.join(channelName);

    channel.here((users: any[]) => {
      onEventTriggered('here', users);
    });

    channel.joining((user: any) => {
      onEventTriggered('joining', user);
    });

    channel.leaving((user: any) => {
      onEventTriggered('leaving', user);
    });

    const events = [
      'item.added',
      'item.quantity.updated',
      'item.removed',
      'user.items.cleared',
      'order.locked',
      'order.unlocked',
      'order.cancelled',
      'order.placed'
    ];

    events.forEach((evt) => {
      channel.listen(`.${evt}`, (data: any) => {
        onEventTriggered(evt, data);
      });
    });

    return () => {
      instance.leave(channelName);
    };
  }, [isAuthenticated, sessionId]); // eslint-disable-line react-hooks/exhaustive-deps
}

