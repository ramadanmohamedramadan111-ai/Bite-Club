/**
 * Realtime Echo client & notification store for the mobile app.
 *
 * The web frontend's broadcasting auth is handled by a Next.js API route
 * that does local HMAC-SHA256 signing (see apps/frontend/web/src/app/api/
 * broadcasting/auth/route.ts). The Laravel backend's /broadcasting/auth
 * endpoint uses the "web" middleware (session auth), which doesn't work
 * with Bearer tokens.
 *
 * For mobile, we replicate the same HMAC signing logic in a custom Pusher
 * authorizer function, using crypto-js for the HMAC computation.
 */
import CryptoJS from 'crypto-js';
import { Audio } from 'expo-av';
import { useEffect } from 'react';
import { create } from 'zustand';

import {
  API_BASE_URL,
  REVERB_APP_KEY,
  REVERB_HOST,
  REVERB_PORT,
} from '@/lib/config';
import type { RealtimeNotification } from '@/lib/types';
import { useAuthStore } from '@/stores/auth';

// ─── Module resolution (CJS require to bypass Metro ESM interop issues) ───

const EchoModule = require('laravel-echo');
const Echo: any = EchoModule.default ?? EchoModule;

const PusherModule = require('pusher-js');
const Pusher: any = PusherModule.Pusher ?? PusherModule.default ?? PusherModule;

// The Reverb app secret — same value the web frontend uses for HMAC signing
const REVERB_APP_SECRET = 'j2mthdcxfa5lymyt8zho';

// Startup diagnostics
console.log(
  '[Echo] Module resolution:',
  'Echo=',
  typeof Echo === 'function' ? `✅ class` : `❌ ${typeof Echo}`,
  'Pusher=',
  typeof Pusher === 'function' ? `✅ class` : `❌ ${typeof Pusher}`,
);

// ─── Notifications Zustand store ──────────────────────────────────────────
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
  decrementUnread: () =>
    set((s) => ({ unreadCount: Math.max(0, s.unreadCount - 1) })),
}));

let sound: Audio.Sound | null = null;
export async function playNotificationSound() {
  try {
    if (!sound) {
      const { sound: loadedSound } = await Audio.Sound.createAsync(
        require('@/assets/sounds/notification.mp3'),
      );

      sound = loadedSound;
    }

    await sound.replayAsync();
  } catch (e) {
    console.error('Failed to play notification sound', e);
  }
}

// ─── Custom Pusher authorizer (HMAC signing, same as web Next.js route) ───
function createAuthorizer(
  token: string | null,
  guest?: { id: string; name: string } | null,
) {
  return (channel: any, _options: any) => ({
    authorize: async (
      socketId: string,
      callback: (error: any, authData: any) => void,
    ) => {
      try {
        const channelName: string = channel.name;
        console.log(
          '[Echo] Authorizing channel:',
          channelName,
          'socket:',
          socketId,
        );

        if (channelName.startsWith('presence-')) {
          // Presence channels need user info
          let userData: { user_id: string; user_info: any };

          if (token) {
            // Authenticated user — fetch from API
            const meRes = await fetch(`${API_BASE_URL}/user/me`, {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
              },
            });

            if (!meRes.ok) {
              console.error('[Echo] ❌ /user/me failed:', meRes.status);
              callback(new Error('Auth failed'), null);
              return;
            }

            const meData = await meRes.json();
            const user = meData.data;
            userData = {
              user_id: String(user.id),
              user_info: {
                id: user.id,
                name: `${user.first_name} ${user.last_name}`,
              },
            };
          } else if (guest) {
            // Guest path — mirror web's X-Guest-ID / X-Guest-Name handling
            userData = {
              user_id: String(guest.id),
              user_info: {
                id: guest.id,
                name: guest.name,
                is_guest: true,
              },
            };
          } else {
            console.error('[Echo] ❌ No identity for presence channel');
            callback(new Error('Auth failed'), null);
            return;
          }

          const channelData = JSON.stringify(userData);

          const stringToSign = `${socketId}:${channelName}:${channelData}`;
          const hash = CryptoJS.HmacSHA256(
            stringToSign,
            REVERB_APP_SECRET,
          ).toString(CryptoJS.enc.Hex);

          console.log('[Echo] ✅ Presence auth for', channelName);
          callback(null, {
            auth: `${REVERB_APP_KEY}:${hash}`,
            channel_data: channelData,
          });
        } else {
          if (!token) {
            // Guests cannot join private channels
            console.error('[Echo] ❌ Guests cannot join private channels');
            callback(new Error('Guests cannot join private channels'), null);
            return;
          }

          // Private channels — just sign socket_id:channel_name
          const stringToSign = `${socketId}:${channelName}`;
          const hash = CryptoJS.HmacSHA256(
            stringToSign,
            REVERB_APP_SECRET,
          ).toString(CryptoJS.enc.Hex);

          console.log('[Echo] ✅ Private auth for', channelName);
          callback(null, {
            auth: `${REVERB_APP_KEY}:${hash}`,
          });
        }
      } catch (err: any) {
        console.error('[Echo] ❌ Auth error:', err?.message || err);
        callback(err, null);
      }
    },
  });
}

// ─── Echo singleton ───────────────────────────────────────────────────────
let echoInstance: any = null;
let currentToken: string | null = null;
let currentGuestKey: string | null = null;

export function getEcho(guest?: { id: string; name: string } | null): any {
  const token = useAuthStore.getState().token;

  const isGuestMode = !token && !!guest;
  const guestKey = guest ? `guest:${guest.id}` : null;

  // No identity → no Echo
  if (!token && !guest) {
    if (echoInstance) disconnectEcho();
    return null;
  }

  // Identity changed → reconnect
  if (echoInstance && !isGuestMode && currentToken !== token) {
    console.log('[Echo] Token changed, reconnecting…');
    disconnectEcho();
  }
  if (echoInstance && isGuestMode && currentGuestKey !== guestKey) {
    console.log('[Echo] Guest identity changed, reconnecting…');
    disconnectEcho();
  }

  // Create the singleton
  if (!echoInstance) {
    if (typeof Echo !== 'function') {
      console.error('[Echo] ❌ Echo is not a constructor:', typeof Echo, Echo);
      return null;
    }
    if (typeof Pusher !== 'function') {
      console.error(
        '[Echo] ❌ Pusher is not a constructor:',
        typeof Pusher,
        Pusher,
      );
      return null;
    }

    if (isGuestMode) {
      currentToken = null;
      currentGuestKey = guestKey;
    } else {
      currentToken = token;
      currentGuestKey = null;
    }
    console.log('[Echo] Creating instance →', REVERB_HOST + ':' + REVERB_PORT);

    try {
      echoInstance = new Echo({
        broadcaster: 'reverb',
        key: REVERB_APP_KEY,
        wsHost: REVERB_HOST,
        wsPort: REVERB_PORT,
        wssPort: REVERB_PORT,
        forceTLS: false,
        enabledTransports: ['ws', 'wss'],
        disableStats: true,
        withoutInterceptors: true,
        Pusher,
        authorizer: createAuthorizer(token, isGuestMode ? guest : null),
      });

      // Wire up connection logging
      const pusher = echoInstance?.connector?.pusher;
      if (pusher?.connection) {
        pusher.connection.bind('state_change', (s: any) => {
          console.log(`[Echo] ${s.previous} → ${s.current}`);
        });
        pusher.connection.bind('connected', () => {
          console.log(
            '[Echo] ✅ Connected — socket',
            pusher.connection.socket_id,
          );
        });
        pusher.connection.bind('error', (err: any) => {
          console.error('[Echo] ❌ Connection error:', err);
        });
      } else {
        console.warn('[Echo] ⚠️ No pusher.connection on connector');
      }
    } catch (err) {
      console.error('[Echo] ❌ Failed to create instance:', err);
      echoInstance = null;
      return null;
    }
  }

  return echoInstance;
}

export function disconnectEcho(): void {
  console.log('[Echo] Disconnecting');
  try {
    echoInstance?.disconnect();
  } catch {
    /* ignore */
  }
  echoInstance = null;
  currentToken = null;
  currentGuestKey = null;
}

// ─── Realtime hooks ───────────────────────────────────────────────────────

/** Subscribe to order-status updates */
export function useRealtimeOrder(orderId: number, onStatusUpdated: () => void) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated || !orderId) return;
    const echo = getEcho();
    if (!echo) return;

    const ch = `order.${orderId}`;
    echo.private(ch).listen('.order.status.updated', () => onStatusUpdated());

    return () => {
      echo.leave(ch);
    };
  }, [isAuthenticated, orderId]); // eslint-disable-line react-hooks/exhaustive-deps
}

/** Subscribe to user notifications (private channel) */
export function useRealtimeNotifications(
  onNotification: (n: RealtimeNotification) => void,
) {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const echo = getEcho();
    if (!echo) return;

    const ch = `App.Models.User.${user.id}`;
    console.log('[Echo] Subscribing to notifications:', ch);

    echo
      .private(ch)
      .notification(async (notification: RealtimeNotification) => {
        console.log('[Echo] 🔔 Notification received:', notification);
        await playNotificationSound();
        onNotification(notification);
      });

    return () => {
      echo.leave(ch);
    };
  }, [isAuthenticated, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps
}

/** Subscribe to group-order presence channel */
export function useRealtimeGroupOrder(
  sessionId: number,
  onEventTriggered: (event: string, data?: any) => void,
  guest?: { id: string; name: string } | null,
) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!sessionId) return;
    if (!isAuthenticated && !guest) return;
    const echo = getEcho(guest);
    if (!echo) {
      console.warn('[Echo] No instance for group order');
      return;
    }

    const ch = `group-order.${sessionId}`;
    console.log('[Echo] Joining presence:', ch);
    const channel = echo.join(ch);

    channel.here((users: any[]) => {
      console.log('[Echo] here:', users.length, 'users');
      onEventTriggered('here', users);
    });
    channel.joining((u: any) => {
      console.log('[Echo] joining:', u);
      onEventTriggered('joining', u);
    });
    channel.leaving((u: any) => {
      console.log('[Echo] leaving:', u);
      onEventTriggered('leaving', u);
    });

    const events = [
      'item.added',
      'item.quantity.updated',
      'item.removed',
      'user.items.cleared',
      'order.locked',
      'order.unlocked',
      'order.cancelled',
      'order.placed',
    ];
    events.forEach((evt) => {
      channel.listen(`.${evt}`, (data: any) => {
        console.log('[Echo] GroupOrder event:', evt, data);
        onEventTriggered(evt, data);
      });
    });

    return () => {
      echo.leave(ch);
    };
  }, [isAuthenticated, sessionId, guest?.id, guest?.name]); // eslint-disable-line react-hooks/exhaustive-deps
}

