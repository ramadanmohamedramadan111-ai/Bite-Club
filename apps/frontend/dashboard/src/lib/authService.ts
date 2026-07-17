import { api } from './api'

export type LoginResponse = {
  success: boolean
  message: string
  data: {
    access_token: string
    token_type: string
    expires_in: number
    restaurant: {
      id: number
      name: string
      email: string
      phone_number: string
      address: string
      status: string
      logo_url: string | null
    }
  }
}

export const authService = {
  login: (email: string, password: string) =>
    api.post<LoginResponse>('/restaurant/login', { email, password })
      .then((res) => res.data),
  logout: () =>
    api.post('/restaurant/logout'),

  forgotPassword: (email: string) =>
    api.post('/restaurant/forgot-password', { email }),

  resetPassword: (email: string, token: string, password: string, password_confirmation: string) =>
    api.post('/restaurant/reset-password', { email, token, password, password_confirmation }),
}
