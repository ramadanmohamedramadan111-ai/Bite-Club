import { api } from './api'
import type { AiResponse } from '../types/ai'

export const aiService = {
  generateReport: (locale: string) =>
    api
      .post<AiResponse>('/ai/chat', { message: 'Generate report', locale })
      .then((r) => r.data.data),
}
