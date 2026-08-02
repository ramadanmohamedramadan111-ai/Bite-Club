export interface Notification {
  id: string;
  notifiable_id: number;
  data: {
    type: string;
    title: string;
    body: string;
    action_url: string;
    order_id: number | null;
    restaurant_name: string | null;
  };
  read_at: null | string;
  created_at: string;
  updated_at: string;
}

export interface UnreadNotificationsCount {
  count: number;
}

