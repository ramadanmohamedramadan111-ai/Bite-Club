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

export type Category = {
  id: number
  name: string
  slug: string
  image_url: string | null
}

export type CategoriesResponse = {
  success: boolean
  message: string
  data: {
    items: Category[]
  }
}

export type RegisterResponse = {
  success: boolean
  message: string
  data?: any
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

  getCategories: () =>
    api.get<CategoriesResponse>('/restaurant/categories?all=true')
      .then((res) => res.data),

  register: (data: {
    name: string
    email: string
    password: string
    password_confirmation: string
    phone_number: string
    address: string
    category_id: number
    description: string
  }) =>
    api.post<RegisterResponse>('/restaurant/register', data)
      .then((res) => res.data),
}
