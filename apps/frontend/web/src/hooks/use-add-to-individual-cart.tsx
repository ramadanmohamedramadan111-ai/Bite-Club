'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import ConfirmDialog from '@/components/shared/ConfirmationDialog';
import { useCartStore } from '@/stores/cart';
import type { Order } from '@/types/orders/order';
import type { Post } from '@/types/social/posts';
import {
  convertPostItemToCartItem,
  executeAddItemsToIndividualCart,
  getCartAddConflict,
  orderToCartItems,
  orderToCartTarget,
  type CartAddConflict,
  type RestaurantCartTarget,
} from '@/utils/add-to-individual-cart';
import type { CartItem } from '@/types/cart/cart';

const conflictCopy: Record<
  Exclude<CartAddConflict, null>,
  { title: string; description: string; confirmText: string }
> = {
  different_restaurant: {
    title: 'Replace your current cart?',
    description:
      'You have items from another restaurant in your cart. Continuing will clear your current cart and start a new one.',
    confirmText: 'Replace cart',
  },
  group_order_same_restaurant: {
    title: 'Leave group order?',
    description:
      'You have an active group order for this restaurant. Continuing will start a new individual cart and remove you from the group order.',
    confirmText: 'Order individually',
  },
};

type PendingAdd = {
  target: RestaurantCartTarget;
  items: CartItem[];
  redirect: boolean;
};

type AddOptions = {
  redirect?: boolean;
};

export function useAddToIndividualCart() {
  const router = useRouter();
  const cart = useCartStore((state) => state.cart);
  const [pendingAdd, setPendingAdd] = useState<PendingAdd | null>(null);
  const [conflictType, setConflictType] = useState<CartAddConflict>(null);

  function requestAdd(
    target: RestaurantCartTarget,
    items: CartItem[],
    options: AddOptions = {},
  ) {
    const redirect = options.redirect ?? false;
    const conflict = getCartAddConflict(cart, target);

    if (conflict) {
      setPendingAdd({ target, items, redirect });
      setConflictType(conflict);
      return;
    }

    executeAddItemsToIndividualCart(target, items);

    if (redirect) {
      router.push('/cart');
    }
  }

  function addFromOrder(order: Order, options?: AddOptions) {
    requestAdd(orderToCartTarget(order), orderToCartItems(order), options);
  }

  function addFromPost(post: Post, options?: AddOptions) {
    requestAdd(
      {
        restaurantId: post.restaurantId,
        restaurantName: post.restaurant.name,
        restaurantImage: post.restaurant.image,
      },
      post.items.map(convertPostItemToCartItem),
      options,
    );
  }

  function confirmAdd() {
    if (pendingAdd) {
      executeAddItemsToIndividualCart(pendingAdd.target, pendingAdd.items, {
        replaceCart: true,
      });

      if (pendingAdd.redirect) {
        router.push('/cart');
      }
    }

    setPendingAdd(null);
    setConflictType(null);
  }

  function cancelAdd() {
    setPendingAdd(null);
    setConflictType(null);
  }

  const dialog = conflictType ? (
    <ConfirmDialog
      open={Boolean(conflictType)}
      onOpenChange={(open) => {
        if (!open) cancelAdd();
      }}
      title={conflictCopy[conflictType].title}
      description={conflictCopy[conflictType].description}
      confirmText={conflictCopy[conflictType].confirmText}
      onConfirm={confirmAdd}
    />
  ) : null;

  return {
    addFromOrder,
    addFromPost,
    requestAdd,
    dialog,
  };
}
