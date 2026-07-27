export interface GroupOrderSessionSuccessResponse {
  group_order_id: number;
  status: 'open';
}

export interface GroupOrderCartSession {
  id: number;
  status: 'open' | 'cancelled' | 'locked' | 'completed';
  restaurant: {
    id: number;
    name: string;
    image_url: null | string;
  };
  host: {
    id: number;
    name: string;
  };
  total_amount: number;
  members_summary: {
    user: {
      id: number;
      name: string;
    };
    user_total: number;
    items: {
      id: number;
      item: {
        id: number;
        title: string;
        image_url: string | null;
        price: number;
      };
      quantity: number;
      unit_price: number;
      notes: string;
      total_price: number;
    }[];
  }[];
  created_at: string;
  updated_at: string;
}

export interface GroupOrderCartItemResponse {
  item_id: number;
  quantity: number;
}

export interface CheckoutGroupOrderPreviewResponse {
  cart_id: number;
  order_type: 'delivery' | 'pickup';
  items: {
    item_id: number;
    name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }[];
  financials: {
    subtotal: number;
    delivery_fee: number;
    service_fee: number;
    total: number;
  };
  deposit_rules: {
    requires_deposit: boolean;
    deposit_percentage: number;
    deposit_amount: number;
    remaining_amount: number;
  };
  available_payment_options: {
    id: 'split_payment' | 'full_online';
    title: string;
    description: string;
    required_now: {
      type: 'deposit' | 'remaining' | 'full';
      method: 'online' | 'cash';
      amount: number;
    };
    remaining_upon_delivery?: {
      type: 'deposit' | 'remaining' | 'full';
      method: 'online' | 'cash';
      amount: number;
    };
  }[];
  internal_data: {
    system_commission: number;
  };
}

export interface GroupOrderSession {
  id: number;
  status: 'open' | 'cancelled' | 'locked' | 'completed';
  group_id: number;
  group_name: string;
  restaurant_id: number;
  restaurant_name: string;
}

export interface GroupOrderHistory {
  id: number;
  status: 'completed' | 'cancelled';
  restaurant: {
    id: number;
    name: string;
    image_url: null | string;
  };
  host: {
    id: number;
    name: string;
  };
  total_amount: number;
  members_summary: {
    user: {
      id: number;
      name: string;
    };
    user_total: number;
    items: {
      id: number;
      item: {
        id: number;
        title: string;
        image_url: string | null;
        price: number;
      };
      quantity: number;
      unit_price: number;
      notes: null | string;
      total_price: number;
    }[];
  }[];
  created_at: string;
  updated_at: string;
}

