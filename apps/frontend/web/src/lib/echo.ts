import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

let echoInstance: Echo<any> | null = null;

export function getEcho(token?: string | null): Echo<any> {
  if (typeof window === 'undefined') {
    throw new Error('Echo is only available on the client');
  }

  const getGuestHeaders = () => {
    const headers: Record<string, string> = {};
    if (typeof window !== 'undefined') {
      const guestId = localStorage.getItem('user_id');
      if (guestId) {
        headers['X-Guest-ID'] = guestId;
      }
      try {
        const groupOrdersStr = localStorage.getItem('group_orders');
        if (groupOrdersStr) {
          const groupOrders = JSON.parse(groupOrdersStr);
          if (Array.isArray(groupOrders) && groupOrders.length > 0) {
            // Find any name or use the first one
            headers['X-Guest-Name'] = groupOrders[0].name;
          }
        }
      } catch (e) {}
    }
    return headers;
  };

  if (echoInstance) {
    if (echoInstance.options?.auth?.headers) {
      echoInstance.options.auth.headers.Authorization = token ? `Bearer ${token}` : '';
      const guestHeaders = getGuestHeaders();
      Object.assign(echoInstance.options.auth.headers, guestHeaders);
    }
    return echoInstance;
  }

  (window as unknown as { Pusher: typeof Pusher }).Pusher = Pusher;

  const wsHost = window.location.hostname;
  const reverbKey =
    process.env.NEXT_PUBLIC_REVERB_APP_KEY || '7shjlvmsslgdjgltf46x';

  echoInstance = new Echo({
    broadcaster: 'reverb',
    key: reverbKey,
    wsHost: wsHost,
    wsPort: 8081,
    wssPort: 8081,
    forceTLS: false,
    enabledTransports: ['ws', 'wss'],
    authEndpoint: '/api/broadcasting/auth',
    auth: {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        Accept: 'application/json',
        ...getGuestHeaders(),
      },
    },
  });

  return echoInstance;
}

export function disconnectEcho(): void {
  echoInstance?.disconnect();
  echoInstance = null;
}
