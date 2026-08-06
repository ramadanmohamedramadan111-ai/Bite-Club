import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL as string,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Attach token from store to every request automatically
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Normalize error messages so callers always get a plain Error with a message
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const responseData = error.response?.data

    // Laravel 422 responses shape validation errors as { errors: { field: string[] } }.
    // Flatten every field's first message instead of only ever looking at `email`.
    const validationErrors = responseData?.errors as Record<string, string[]> | undefined
    const validationMessage = validationErrors
      ? Object.values(validationErrors).map((msgs) => msgs?.[0]).filter(Boolean).join('\n')
      : ''

    const message =
      (validationMessage || undefined) ??
      responseData?.message ??
      error.message ??
      'Something went wrong'

    // Only force a logout/redirect for a session that was actually authenticated —
    // otherwise a plain wrong-password attempt on the login page (also a 401)
    // reloads the page before the caller ever gets to show the error.
    const hadActiveSession = !!useAuthStore.getState().token
    const shouldForceLogout =
      hadActiveSession &&
      (error.response?.status === 401 ||
        (typeof message === 'string' && message.toLowerCase().includes('unauthenticated')))

    if (shouldForceLogout) {
      useAuthStore.getState().logout()
      if (typeof window !== 'undefined') {
        window.location.assign('/')
      }
    }

    return Promise.reject(new Error(message))
  }
)

export { api }
