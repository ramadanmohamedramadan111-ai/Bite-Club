export type DashboardPeriod = 'today' | 'week' | 'month' | 'year'

export type DashboardSummary = {
  revenue: number
  orders: number
}

export type DashboardCustomer = {
  id: number
  name: string
  phone_number: string
}

export type DashboardFinancials = {
  subtotal: number
  delivery_fee: number
  service_fee: number
  total: number
}

export type DashboardOrderItem = {
  id: number
  item_id: number
  item_name: string
  quantity: number
  price: number
  total_price: number
  notes: string | null
}

export type DashboardPayment = {
  id: number
  payment_type: string
  payment_method: string
  amount: number
  status: string
}

export type DashboardOrder = {
  id: number
  order_type: string
  status: string
  customer: DashboardCustomer
  financials: DashboardFinancials
  items: DashboardOrderItem[]
  payments: DashboardPayment[]
  created_at: string
  time_ago: string
}

export type DashboardReview = {
  id: number
  user: {
    id: number
    name: string
    profile_image: string | null
  }
  rating: number
  comment: string
  created_at: string
}

export type DashboardAnalytics = {
  summary: DashboardSummary
  pending_orders: number
  average_rating: number
  latest_orders: DashboardOrder[]
  recent_reviews: DashboardReview[]
  restaurant_status: {
    is_open: boolean
    accepting_orders: boolean
  }
}
