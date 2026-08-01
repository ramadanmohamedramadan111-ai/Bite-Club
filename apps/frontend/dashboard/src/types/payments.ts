export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'completed'

export type PaymentMethod = 'cash' | 'card' | 'online' | 'wallet'

export type PaymentType = 'full' | 'partial'

export type PaymentUser = {
  id: number
  name: string
  email: string
}

export type Payment = {
  id: number
  order_id: number | null
  transaction_id: string | null
  payment_type: PaymentType
  payment_method: PaymentMethod
  amount: string
  status: PaymentStatus
  created_at: string
  user?: PaymentUser
}

export type PaymentStatistics = {
  total_paid: number
  total_pending: number
  total_failed: number
}

export type PaymentMeta = {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export type PaymentsParams = {
  page?: number
  per_page?: number
  status?: PaymentStatus
  payment_method?: PaymentMethod
  from_date?: string
  to_date?: string
}

export type PaymentsResponse = {
  success: boolean
  message: string
  data: {
    data: Payment[]
    meta: PaymentMeta
  }
}

export type PaymentStatisticsResponse = {
  success: boolean
  message: string
  data: PaymentStatistics
}
