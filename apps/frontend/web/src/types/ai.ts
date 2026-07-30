export type SmartWaiterItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

export interface SmartWaiterResponse {
  recommended_restaurant_id: null | number;
  restaurant_name: null | string;
  reply: string;
  total_price: number;
  recommended_menu_item_ids: number[];
  items: SmartWaiterItem &
    {
      why: string;
    }[];
  conversation_id: number;
}

export interface SmartWaiterAddToCartResponse {
  cart_updated: boolean;
  cart_item_count: number;
  total_price: number;
  restaurant_id: number;
  restaurant_name: string;
  added_items: SmartWaiterItem[];
}

