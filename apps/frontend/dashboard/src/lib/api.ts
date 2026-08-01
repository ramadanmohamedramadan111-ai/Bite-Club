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
    const message =
      responseData?.message ??
      responseData?.errors?.email?.[0] ??
      error.message ??
      'Something went wrong'

    const shouldForceLogout =
      error.response?.status === 401 ||
      typeof message === 'string' && message.toLowerCase().includes('unauthenticated')

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
