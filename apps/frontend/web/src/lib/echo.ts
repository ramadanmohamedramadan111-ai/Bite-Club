import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

let echoInstance: Echo | null = null;

export function getEcho(token?: string | null): Echo {
  if (typeof window === 'undefined') {
    throw new Error('Echo is only available on the client');
  }

  if (echoInstance) {
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
      },
    },
  });

  return echoInstance;
}

export function disconnectEcho(): void {
  echoInstance?.disconnect();
  echoInstance = null;
}
