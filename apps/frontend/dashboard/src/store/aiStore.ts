import { create } from 'zustand'
import { aiService } from '../lib/aiService'
import type { RestaurantReport } from '../types/ai'

type AiState = {
  reports: RestaurantReport[]
  isLoading: boolean
  error: string | null
  fetchReports: () => Promise<void>
  reset: () => void
}

export const useAiStore = create<AiState>((set) => ({
  reports: [],
  isLoading: false,
  error: null,

  fetchReports: async () => {
    set({ isLoading: true, error: null })
    try {
      const data = await aiService.getReports()
      set({ reports: data })
    } catch {
      set({ error: 'Failed to load restaurant reports. Please try again.' })
    } finally {
      set({ isLoading: false })
    }
  },

  reset: () => set({ reports: [], error: null }),
}))

