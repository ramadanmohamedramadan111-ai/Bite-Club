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
  name: string;
  price: number;
  quantity: number;
}

export interface OrderMemberItems {
  memberName: string;
  items: OrderItem[];
}

export interface Order {
  id: string;
  orderNumber: string;
  restaurantId: string;
  restaurantName: string;
  restaurantImage: string;
  restaurantAddress: string;
  restaurantLocation: OrderLocation;
  status: OrderStatus;
  type: OrderType;
  fulfillmentType: FulfillmentType;
  paymentMethod: PaymentMethod;
  orderedAt: string;
  items: OrderItem[];
  groupMembers?: OrderMemberItems[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  deliveryAddress?: string;
  deliveryLocation?: OrderLocation;
}
