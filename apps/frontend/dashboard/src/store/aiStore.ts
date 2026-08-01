import { create } from 'zustand'
import i18n from '../i18n'
import { aiService } from '../lib/aiService'
import type { AiReport } from '../types/ai'

type AiState = {
  report: AiReport | null
  isLoading: boolean
  error: string | null
  generate: () => Promise<void>
  reset: () => void
}

export const useAiStore = create<AiState>((set) => ({
  report: null,
  isLoading: false,
  error: null,

  generate: async () => {
    set({ isLoading: true, error: null })
    try {
      const locale = i18n.language || 'en'
      const data = await aiService.generateReport(locale)
      set({ report: data })
    } catch {
      set({ error: 'Failed to generate AI analysis. Please try again.' })
    } finally {
      set({ isLoading: false })
    }
  },

  reset: () => set({ report: null, error: null }),
}))
