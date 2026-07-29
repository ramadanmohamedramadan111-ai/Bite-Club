export type SmartWaiterItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

export interface SmartWaiterResponse {
  restaurant_id: number;
  restaurant_name: string;
  reply: string;
  total_price: number;
  items: SmartWaiterItem &
    {
      why: string;
    }[];
}

export interface SmartWaiterAddToCartResponse {
  cart_updated: boolean;
  cart_item_count: number;
  total_price: number;
  restaurant_id: number;
  restaurant_name: string;
  added_items: SmartWaiterItem[];
}
