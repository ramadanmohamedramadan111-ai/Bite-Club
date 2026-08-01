import { api } from './api'
import type { RestaurantReport } from '../types/ai'

export const aiService = {
  getReports: () =>
    api
      .get<{ data: RestaurantReport[] }>('/restaurant/reports')
      .then((r) => r.data.data),
}

