import type { Cart, CartItem } from '@/lib/const-data';
import type { OrderResponse, OrderItem } from '@/types/orders/order';
import type { PostItem } from '@/types/social/posts';
import { useCartStore } from '@/lib/const-data';

export type CartAddConflict =
  | 'different_restaurant'
  | 'group_order_same_restaurant'
  | null;

export type RestaurantCartTarget = {
  restaurantId: string;
  restaurantName: string;
  restaurantImage?: string;
  restaurantDeliveryFee?: number;
};

export function convertOrderItemToCartItem(item: OrderItem): CartItem {
  return {
    cartItemId: `cart-${item.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    itemId: item.id,
    name: item.item_name,
    quantity: item.quantity,
    basePrice: Number(item.price),
    unitPrice: Number(item.price),
    totalPrice: Number(item.price) * item.quantity,
    configurationKey: item.id,
    selectedOptions: [],
  };
}

export function convertPostItemToCartItem(item: PostItem): CartItem {
  return {
    cartItemId: `cart-${item.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    itemId: item.id,
    name: item.name,
    quantity: item.quantity,
    basePrice: item.price,
    unitPrice: item.price,
    totalPrice: item.price * item.quantity,
    configurationKey: item.id,
    selectedOptions: [],
  };
}

export function getCartAddConflict(
  cart: Cart | null,
  target: RestaurantCartTarget,
): CartAddConflict {
  if (!cart) {
    return null;
  }

  if (cart.type === 'group' && cart.restaurantId === target.restaurantId) {
    return 'group_order_same_restaurant';
  }

  if (cart.restaurantId !== target.restaurantId) {
    return 'different_restaurant';
  }

  return null;
}

export function needsNewIndividualCart(
  cart: Cart | null,
  target: RestaurantCartTarget,
): boolean {
  if (!cart) {
    return true;
  }

  return getCartAddConflict(cart, target) !== null;
}

export function executeAddItemsToIndividualCart(
  target: RestaurantCartTarget,
  items: CartItem[],
  { replaceCart = false }: { replaceCart?: boolean } = {},
) {
  const cartStore = useCartStore.getState();

  if (replaceCart) {
    cartStore.clearCart();
  }

  const currentCart = useCartStore.getState().cart;

  if (!currentCart || currentCart.restaurantId !== target.restaurantId) {
    cartStore.createIndividualCart(target);
  }

  for (const item of items) {
    cartStore.addItem(item);
  }
}

export function orderToCartTarget(order: OrderResponse): RestaurantCartTarget {
  return {
    restaurantId: String(order.restaurant.id),
    restaurantName: order.restaurant.name,
  };
}

export function orderToCartItems(order: OrderResponse): CartItem[] {
  return order.items.map(convertOrderItemToCartItem);
}

export function executeReorder(order: OrderResponse) {
  const cartStore = useCartStore.getState();
  const target = orderToCartTarget(order);
  const conflict = getCartAddConflict(cartStore.cart, target);

  executeAddItemsToIndividualCart(target, orderToCartItems(order), {
    replaceCart: conflict !== null,
  });
}

// Backward-compatible aliases
export type ReorderConflict = CartAddConflict;

export function getReorderConflict(
  cart: Cart | null,
  order: OrderResponse,
): ReorderConflict {
  return getCartAddConflict(cart, orderToCartTarget(order));
}
