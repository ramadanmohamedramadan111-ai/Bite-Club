import axios from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '../store/authStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL as string,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean }

let refreshPromise: Promise<string> | null = null

function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    const currentToken = useAuthStore.getState().token
    refreshPromise = axios
      .post(
        `${import.meta.env.VITE_API_BASE_URL as string}/restaurant/refresh`,
        null,
        { headers: { Authorization: `Bearer ${currentToken}`, Accept: 'application/json' } }
      )
      .then((res) => {
        const newToken = res.data?.data?.access_token as string
        useAuthStore.getState().setToken(newToken)
        return newToken
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryableConfig | undefined
    const hadActiveSession = !!useAuthStore.getState().token

    if (
      error.response?.status === 401 &&
      hadActiveSession &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/restaurant/refresh')
    ) {
      originalRequest._retry = true
      const newToken = await refreshAccessToken().catch(() => null)
      if (newToken) {
        originalRequest.headers = originalRequest.headers ?? {}
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      }
    }

    const responseData = error.response?.data

    const validationErrors = responseData?.errors as Record<string, string[]> | undefined
    const validationMessage = validationErrors
      ? Object.values(validationErrors).map((msgs) => msgs?.[0]).filter(Boolean).join('\n')
      : ''

    const message =
      (validationMessage || undefined) ??
      responseData?.message ??
      error.message ??
      'Something went wrong'

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
