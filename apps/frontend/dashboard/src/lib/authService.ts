import { api } from './api'

export type LoginResponse = {
  token: string
  data?: {
    name?: string
    email?: string
  }
}

export const authService = {
  login: (email: string, password: string) =>
    api.post<LoginResponse>('/restaurant/login', { email, password }),

  logout: (token: string) =>
    api.post<void>('/restaurant/logout', {}, token),

  forgotPassword: (email: string) =>
    api.post<void>('/restaurant/forgot-password', { email }),

  resetPassword: (email: string, token: string, password: string, password_confirmation: string) =>
    api.post<void>('/restaurant/reset-password', { email, token, password, password_confirmation }),
}
