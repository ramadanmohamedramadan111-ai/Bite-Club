import { api } from './api'
import type {
  PaymentsParams,
  PaymentsResponse,
  PaymentStatisticsResponse,
  Payment,
  PaymentStatistics,
  PaymentMeta,
} from '../types/payments'

export const paymentService = {
  getPayments: (params?: PaymentsParams): Promise<{ data: Payment[]; meta: PaymentMeta }> =>
    api.get<PaymentsResponse>('/restaurant/payments', { params })
      .then((r) => r.data.data),

  getStatistics: (): Promise<PaymentStatistics> =>
    api.get<PaymentStatisticsResponse>('/restaurant/payments/statistics')
      .then((r) => r.data.data),
}
