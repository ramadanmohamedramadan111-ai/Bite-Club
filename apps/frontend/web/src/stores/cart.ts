import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type {
  Cart,
  CartItem,
  CartMember,
  CartMemberReference,
  CartSummary,
  GroupCart,
  IndividualCart,
} from '@/types/cart/cart';
import { getItemOwnerKey, isSameItemOwner } from '@/utils/cart-grouping';
import { buildCartSummary } from '@/utils/cart-summary';
import { usePointsStore } from '@/stores/points';

type GetSummaryOptions = {
  fulfillmentType?: 'delivery' | 'pickup';
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
    restaurantDeliveryFee?: number;
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

  // Redemptions (individual carts only)
  applyRedemption: (redemptionId: string | null) => void;

  // Group
  addMember: (member: CartMember) => void;

  updateMemberIdentity: (sessionId: string, userId: string) => void;

  setMemberReady: (memberId: string, isReady: boolean) => void;

  cloneUserOrder: (
    sourceOwnerKey: string,
    currentUser: CartMemberReference,
  ) => void;

  // Replace cart (your policy)
  replaceCart: (cart: Cart) => void;

  getSummary: (options?: GetSummaryOptions) => CartSummary;
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
        restaurantDeliveryFee,
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
            restaurantDeliveryFee,

            userId,
            sessionId,

            items: [],

            members: [],

            appliedRedemptionId: null,
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

      getSummary: (options) => {
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

        return buildCartSummary(
          cart,
          usePointsStore.getState().redemptions,
          options,
        );
      },

      applyRedemption: (redemptionId) =>
        set((state) => {
          if (!state.cart || state.cart.type !== 'individual') {
            return state;
          }

          return {
            cart: {
              ...state.cart,
              appliedRedemptionId: redemptionId,
            },
          };
        }),

      addItem: (item) =>
        set((state) => {
          if (!state.cart) {
            return state;
          }

          const existingItem =
            state.cart.type === 'group'
              ? state.cart.items.find(
                  (cartItem) =>
                    cartItem.configurationKey === item.configurationKey &&
                    isSameItemOwner(cartItem.addedBy, item.addedBy),
                )
              : state.cart.items.find(
                  (cartItem) =>
                    cartItem.configurationKey === item.configurationKey,
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

      setMemberReady: (memberId, isReady) =>
        set((state) => {
          if (!state.cart || state.cart.type !== 'group') {
            return state;
          }

          return {
            cart: {
              ...state.cart,
              members: state.cart.members.map((member) =>
                member.id === memberId ? { ...member, isReady } : member,
              ),
            },
          };
        }),

      cloneUserOrder: (sourceOwnerKey, currentUser) =>
        set((state) => {
          if (!state.cart || state.cart.type !== 'group') {
            return state;
          }

          const currentUserKey = getItemOwnerKey(currentUser);

          if (sourceOwnerKey === currentUserKey) {
            return state;
          }

          const sourceItems = state.cart.items.filter(
            (item) => getItemOwnerKey(item.addedBy) === sourceOwnerKey,
          );

          if (sourceItems.length === 0) {
            return state;
          }

          const remainingItems = state.cart.items.filter(
            (item) => getItemOwnerKey(item.addedBy) !== currentUserKey,
          );

          const clonedItems = sourceItems.map((item) => ({
            ...item,
            cartItemId: crypto.randomUUID(),
            addedBy: {
              sessionId: currentUser.sessionId,
              userId: currentUser.userId,
              name: currentUser.name,
            },
          }));

          return {
            cart: {
              ...state.cart,
              items: [...remainingItems, ...clonedItems],
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

