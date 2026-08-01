export type ApiLiveOrder = {
  id: string
  order_type: string
  status: string
  customer: {
    id: number | null
    name: string | null
    phone_number: string | null
  }
  financials: {
    subtotal: number
    delivery_fee: number
    service_fee: number
    total: number
  }
  items: Array<{
    id: number
    item_id: number
    item_name: string
    quantity: number
    price: number
    total_price: number
    notes: string | null
  }>
  payments: Array<{
    id: number
    payment_type: string
    payment_method: string
    amount: number
    status: string
  }>
  created_at: string
  time_ago: string
}

export type HistoryFilters = {
  status?: string
  order_type?: string
  from_date?: string
  to_date?: string
  search?: string
}

export type LiveOrderListResponse = {
  success: boolean
  data: ApiLiveOrder[]
}

export type OrderHistoryResponse = {
  success: boolean
  data: ApiLiveOrder[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}
