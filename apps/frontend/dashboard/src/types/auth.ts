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
  data?: unknown
}

export type RefreshResponse = {
  success: boolean
  message: string
  data: {
    access_token: string
    token_type: string
    expires_in: number
  }
}
