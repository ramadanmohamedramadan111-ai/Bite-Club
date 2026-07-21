export type CartItem = {
  id: number;
  item_id: number;
  quantity: number;
  notes?: string;

  item_name: string;
  unit_price: number;
  total_price: number;
};

export type CartRestaurant = {
  id: number;
  name: string;
};

export type Cart = {
  id: number;
  restaurant: CartRestaurant;
  subtotal: number;
  items: CartItem[];
};

export type CartStore = {
  cart: Cart | null;

  setCart: (cart: Cart | null) => void;

  addItem: (restaurant: CartRestaurant, item: CartItem) => void;

  updateQuantity: (itemId: number, quantity: number) => void;

  removeItem: (itemId: number) => void;

  clearCart: () => void;
};

export type IndividualCartResponse = {
  id: number;
  restaurant: CartRestaurant;
  subtotal: number;
  items: IndividualCartItemResponse[];
};

export type IndividualCartItemResponse = {
  id: number;
  item_id: number;
  item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes: string;
};

