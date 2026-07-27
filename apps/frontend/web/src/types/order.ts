export interface OrderItem {
  id: string;
  item_id: string;
  item_name: string;
  quantity: number;
  price: string;
  notes: string;
}

export interface OrderResponse {
  id: number;
  order_type: 'delivery' | 'pickup';
  status: string;
  restaurant: { id: number; name: string };
  financials: {
    subtotal: number;
    delivery_fee: number;
    service_fee: number;
    total: number;
  };
  items: OrderItem[];
  payments: {
    id: number;
    payment_type: string;
    payment_method: string;
    amount: number;
    status: string;
  }[];
  created_at: string;
  time_ago: string;
}

export interface TrackingStep {
  status: string;
  label: string;
  state: 'active' | 'pending' | 'completed';
}

export interface OrderDetails extends OrderResponse {
  tracking: {
    is_cancelled: boolean;
    current_step: number;
    total_steps: number;
    steps: TrackingStep[];
  };
}

export interface OrderLocation {
  address: string;
  latitude: number;
  longitude: number;
}

export type Order = {
  id: number;
  order_type: 'delivery' | 'pickup';
  subtotal: string;
  delivery_fee: string;
  service_fee: string;
  total: string;
  items: OrderItem[];
  caption: string;
  likes_count: number;
  copy_count: number;
  is_liked_by_user: boolean;
  status: 'approved';
  published_at: string;
  expires_at: string;
  created_at: string;
};
