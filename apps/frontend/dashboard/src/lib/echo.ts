import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

let echoInstance: Echo<'reverb'> | null = null

export function getEcho(token?: string | null): Echo<'reverb'> {
  if (echoInstance) {
    return echoInstance
  }

  ;(window as unknown as { Pusher: typeof Pusher }).Pusher = Pusher

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string
  const reverbKey = (import.meta.env.VITE_REVERB_APP_KEY as string) || ''
  const reverbHost = (import.meta.env.VITE_REVERB_HOST as string) || window.location.hostname
  const reverbPort = Number(import.meta.env.VITE_REVERB_PORT ?? 8081)
  const reverbScheme = (import.meta.env.VITE_REVERB_SCHEME as string) || 'http'

  echoInstance = new Echo({
    broadcaster: 'reverb',
    key: reverbKey,
    wsHost: reverbHost,
    wsPort: reverbPort,
    wssPort: reverbPort,
    forceTLS: reverbScheme === 'https',
    enabledTransports: ['ws', 'wss'],
    authEndpoint: `${apiBaseUrl}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        Accept: 'application/json',
      },
    },
  })

  return echoInstance
}

export function disconnectEcho(): void {
  echoInstance?.disconnect()
  echoInstance = null
}
