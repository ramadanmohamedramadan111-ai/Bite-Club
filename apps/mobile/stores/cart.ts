import { create } from 'zustand';
import { getItem, setItem, removeItem } from '@/lib/storage';
import type { Cart, MenuItem } from '@/lib/types';

type CartStore = {
  cart: Cart | null;
  addItem: (
    restaurantId: number,
    restaurantName: string,
    item: MenuItem,
    quantity: number,
    notes?: string
  ) => void;
  removeItem: (itemId: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  hydrate: () => Promise<void>;
};

const CART_STORAGE_KEY = 'biteclub_guest_cart';

export const useCartStore = create<CartStore>((set) => ({
  cart: null,

  addItem: (restaurantId, restaurantName, item, quantity, notes) => {
    set((state) => {
      let currentCart = state.cart;

      if (currentCart && currentCart.restaurant.id !== restaurantId) {
        currentCart = null;
      }

      const items = currentCart ? [...currentCart.items] : [];
      const existingIdx = items.findIndex((i) => i.item_id === item.id);

      if (existingIdx > -1) {
        const existingItem = items[existingIdx];
        items[existingIdx] = {
          ...existingItem,
          quantity,
          total_price: item.price * quantity,
          notes,
        };
      } else {
        items.push({
          id: item.id,
          item_id: item.id,
          quantity,
          notes,
          item_name: item.title,
          unit_price: item.price,
          total_price: item.price * quantity,
        });
      }

      const subtotal = items.reduce((sum, i) => sum + i.total_price, 0);

      const nextCart: Cart = {
        id: restaurantId,
        restaurant: { id: restaurantId, name: restaurantName },
        subtotal,
        items,
      };

      setItem(CART_STORAGE_KEY, JSON.stringify(nextCart));
      return { cart: nextCart };
    });
  },

  removeItem: (itemId) => {
    set((state) => {
      const currentCart = state.cart;
      if (!currentCart) return {};

      const items = currentCart.items.filter((i) => i.item_id !== itemId);

      if (items.length === 0) {
        removeItem(CART_STORAGE_KEY);
        return { cart: null };
      }

      const subtotal = items.reduce((sum, i) => sum + i.total_price, 0);
      const nextCart: Cart = {
        ...currentCart,
        subtotal,
        items,
      };

      setItem(CART_STORAGE_KEY, JSON.stringify(nextCart));
      return { cart: nextCart };
    });
  },

  updateQuantity: (id, quantity) => {
    set((state) => {
      const currentCart = state.cart;
      if (!currentCart) return {};

      const items = currentCart.items.map((i) => {
        if (i.id === id || i.item_id === id) {
          return {
            ...i,
            quantity,
            total_price: i.unit_price * quantity,
          };
        }
        return i;
      });

      const subtotal = items.reduce((sum, i) => sum + i.total_price, 0);
      const nextCart: Cart = {
        ...currentCart,
        subtotal,
        items,
      };

      setItem(CART_STORAGE_KEY, JSON.stringify(nextCart));
      return { cart: nextCart };
    });
  },

  clearCart: () => {
    removeItem(CART_STORAGE_KEY);
    set({ cart: null });
  },

  hydrate: async () => {
    const data = await getItem(CART_STORAGE_KEY);
    if (data) {
      try {
        set({ cart: JSON.parse(data) });
      } catch {
        // ignore
      }
    }
  },
}));
