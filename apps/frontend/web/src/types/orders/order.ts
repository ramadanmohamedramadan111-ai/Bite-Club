export type OrderStatus = 'in_progress' | 'delivered' | 'cancelled';

export type OrdersTab = 'all' | 'in_progress' | 'delivered' | 'cancelled';

export type OrderType = 'individual' | 'group';

export type FulfillmentType = 'delivery' | 'pickup';

export type OrderFulfillmentFilter = 'all' | FulfillmentType;

export type OrderTypeFilter = 'all' | OrderType;

export interface OrdersFilterParams {
  tab: OrdersTab;
  fulfillment: OrderFulfillmentFilter;
  type: OrderTypeFilter;
}

export type PaymentMethod = 'cod' | 'visa';

export interface OrderLocation {
  address: string;
  latitude: number;
  longitude: number;
}

export interface OrderItem {
  id: string;
  item_id: string;
  item_name: string;
  quantity: number;
  price: string;
  notes: string;
}

export interface Order {
  id: number;
  order_type: 'delivery' | 'pickup';
  subtotal: string;
  delivery_fee: string;
  service_fee: string;
  total: string;
  items: OrderItem[];
}

