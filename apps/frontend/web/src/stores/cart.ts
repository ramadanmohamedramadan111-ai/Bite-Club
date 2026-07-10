import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type {
  Cart,
  CartItem,
  CartMember,
  GroupCart,
  IndividualCart,
} from '@/types/cart/cart';

type CartSummary = {
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
};

type CartStore = {
  cart: Cart | null;

  // Cart lifecycle
  setCart: (cart: Cart) => void;
  clearCart: () => void;

  // Create carts
  createIndividualCart: (data: {
    restaurantId: string;
    restaurantName: string;
    restaurantImage?: string;
    userId?: string;
    sessionId?: string;
  }) => void;

  createGroupCart: (data: {
    restaurantId: string;
    restaurantName: string;
    restaurantImage?: string;
    groupCart: GroupCart['groupSession'];
    userId?: string;
    sessionId?: string;
    owner: CartMember;
  }) => void;

  // Items
  addItem: (item: CartItem) => void;

  removeItem: (cartItemId: string) => void;

  updateQuantity: (cartItemId: string, quantity: number) => void;

  // Group
  addMember: (member: CartMember) => void;

  updateMemberIdentity: (sessionId: string, userId: string) => void;

  // Replace cart (your policy)
  replaceCart: (cart: Cart) => void;

  getSummary: () => CartSummary;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: null,

      setCart: (cart) =>
        set({
          cart,
        }),

      clearCart: () =>
        set({
          cart: null,
        }),

      createIndividualCart: ({
        restaurantId,
        restaurantName,
        restaurantImage,
        userId,
        sessionId,
      }) =>
        set({
          cart: {
            id: crypto.randomUUID(),

            type: 'individual',

            status: 'active',

            restaurantId,
            restaurantName,
            restaurantImage,

            userId,
            sessionId,

            items: [],

            members: [],
          },
        }),

      createGroupCart: ({
        restaurantId,
        restaurantName,
        restaurantImage,
        groupCart,
        userId,
        sessionId,
        owner,
      }) =>
        set({
          cart: {
            id: crypto.randomUUID(),

            type: 'group',

            status: 'active',

            restaurantId,
            restaurantName,
            restaurantImage,

            userId,
            sessionId,

            groupSession: groupCart,

            members: [owner],

            items: [],
          },
        }),

      getSummary: () => {
        const cart = get().cart;

        if (!cart) {
          return {
            subtotal: 0,
            deliveryFee: 0,
            tax: 0,
            discount: 0,
            total: 0,
          };
        }

        const subtotal = cart.items.reduce(
          (sum, item) => sum + item.totalPrice,
          0,
        );

        const deliveryFee = cart.restaurantDeliveryFee || 0;

        const tax = 3;

        const discount = 0;

        return {
          subtotal,

          deliveryFee,

          tax,

          discount,

          total: subtotal + deliveryFee + tax - discount,
        };
      },

      addItem: (item) =>
        set((state) => {
          if (!state.cart) {
            return state;
          }

          const existingItem = state.cart.items.find(
            (cartItem) => cartItem.configurationKey === item.configurationKey,
          );

          let items: CartItem[];

          if (existingItem) {
            items = state.cart.items.map((cartItem) =>
              cartItem.configurationKey === item.configurationKey
                ? {
                    ...cartItem,

                    quantity: cartItem.quantity + item.quantity,

                    totalPrice:
                      (cartItem.quantity + item.quantity) * cartItem.unitPrice,
                  }
                : cartItem,
            );
          } else {
            items = [...state.cart.items, item];
          }

          return {
            cart: {
              ...state.cart,
              items,
            },
          };
        }),

      removeItem: (cartItemId) =>
        set((state) => {
          if (!state.cart) {
            return state;
          }

          return {
            cart: {
              ...state.cart,

              items: state.cart.items.filter(
                (item) => item.cartItemId !== cartItemId,
              ),
            },
          };
        }),

      updateQuantity: (cartItemId, quantity) =>
        set((state) => {
          if (!state.cart) {
            return state;
          }

          return {
            cart: {
              ...state.cart,

              items: state.cart.items.map((item) =>
                item.cartItemId === cartItemId
                  ? {
                      ...item,

                      quantity,

                      totalPrice: item.unitPrice * quantity,
                    }
                  : item,
              ),
            },
          };
        }),

      addMember: (member) =>
        set((state) => {
          if (!state.cart || state.cart.type !== 'group') {
            return state;
          }

          return {
            cart: {
              ...state.cart,

              members: [...state.cart.members, member],
            },
          };
        }),

      updateMemberIdentity: (sessionId, userId) =>
        set((state) => {
          if (!state.cart) {
            return state;
          }

          if (state.cart.type !== 'group') {
            return state;
          }

          return {
            cart: {
              ...state.cart,

              members: state.cart.members.map((member) =>
                member.sessionId === sessionId
                  ? {
                      ...member,

                      sessionId: undefined,

                      userId,
                    }
                  : member,
              ),

              items: state.cart.items.map((item) =>
                item.addedBy?.sessionId === sessionId
                  ? {
                      ...item,

                      addedBy: {
                        userId,
                        name: item.addedBy.name,
                      },
                    }
                  : item,
              ),
            },
          };
        }),

      replaceCart: (cart) =>
        set({
          cart,
        }),
    }),

    {
      name: 'biteclub-cart',
    },
  ),
);

