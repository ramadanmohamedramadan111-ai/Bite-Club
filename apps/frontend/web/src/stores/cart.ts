import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Cart, CartStore } from '@/types/cart/cart';

let tempId = 1;

const getTempId = () => tempId++;

const calculateSubtotal = (items: Cart['items']) =>
  items.reduce((sum, item) => sum + item.total_price, 0);

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      cart: null,

      setCart: (cart) => set({ cart }),

      addItem: (restaurant, item) =>
        set((state) => {
          // No cart yet
          if (!state.cart) {
            const cartItem = {
              ...item,
              id: getTempId(),
            };

            return {
              cart: {
                id: getTempId(),
                restaurant,
                subtotal: cartItem.total_price,
                items: [cartItem],
              },
            };
          }

          // Different restaurant -> replace cart
          if (state.cart.restaurant.id !== restaurant.id) {
            const cartItem = {
              ...item,
              id: getTempId(),
            };

            return {
              cart: {
                id: getTempId(),
                restaurant,
                subtotal: cartItem.total_price,
                items: [cartItem],
              },
            };
          }

          const existing = state.cart.items.find(
            (i) => i.item_id === item.item_id,
          );

          let items;

          if (existing) {
            items = state.cart.items.map((i) =>
              i.item_id === item.item_id
                ? {
                    ...i,
                    quantity: i.quantity + item.quantity,
                    notes: item.notes,
                    total_price: (i.quantity + item.quantity) * i.unit_price,
                  }
                : i,
            );
          } else {
            items = [
              ...state.cart.items,
              {
                ...item,
                id: getTempId(),
              },
            ];
          }

          return {
            cart: {
              ...state.cart,
              items,
              subtotal: calculateSubtotal(items),
            },
          };
        }),

      updateQuantity: (itemId, quantity) =>
        set((state) => {
          if (!state.cart) return state;

          const items = state.cart.items.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  quantity,
                  total_price: quantity * item.unit_price,
                }
              : item,
          );

          return {
            cart: {
              ...state.cart,
              items,
              subtotal: calculateSubtotal(items),
            },
          };
        }),

      removeItem: (itemId) =>
        set((state) => {
          if (!state.cart) return state;

          const items = state.cart.items.filter((item) => item.id !== itemId);

          if (items.length === 0) {
            return { cart: null };
          }

          return {
            cart: {
              ...state.cart,
              items,
              subtotal: calculateSubtotal(items),
            },
          };
        }),

      clearCart: () => set({ cart: null }),
    }),
    {
      name: 'guest-cart',
    },
  ),
);

