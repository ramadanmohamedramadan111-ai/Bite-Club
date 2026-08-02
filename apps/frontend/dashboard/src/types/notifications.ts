export type NotificationType =
  | 'new_order_received'
  | 'order_cancelled_by_user'
  | 'invoice_generated'
  | 'invoice_paid'
  | 'restaurant_suspended'
  | 'restaurant_reactivated'

export type ApiNotification = {
  id: string
  data: {
    type: NotificationType
    title: string
    body: string
    action_url: string
    order_id?: number | null
    invoice_id?: number | null
  }
  read_at: string | null
  created_at: string
  updated_at: string
}

export type NotificationMeta = {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export type NotificationListResponse = {
  success: boolean
  data: {
    items: ApiNotification[]
    meta: NotificationMeta
  }
}

export type UnreadCountResponse = {
  success: boolean
  data: {
    count: number
  }
}
