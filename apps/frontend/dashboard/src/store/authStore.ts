import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Restaurant = {
  id: number
  name: string
  email: string
  phone_number: string
  address: string
  status: string
  logo_url: string | null
}

type AuthState = {
  isAuthenticated: boolean
  token: string | null
  restaurant: Restaurant | null
  login: (token: string, restaurant: Restaurant) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      token: null,
      restaurant: null,
      login: (token, restaurant) => set({ isAuthenticated: true, token, restaurant }),
      logout: () => set({ isAuthenticated: false, token: null, restaurant: null }),
    }),
    {
      name: 'biteclub-auth',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        restaurant: state.restaurant,
      }),
    }
  )
)
