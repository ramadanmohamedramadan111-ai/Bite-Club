'use client';

import { useCartStore } from '@/stores/cart';
import { Cart } from '@/types/cart/cart';
import { useEffect } from 'react';

export function CartInitializer({ cart }: { cart: Cart | null }) {
  const setCart = useCartStore((s) => s.setCart);

  useEffect(() => {
    setCart(cart);
  }, [cart, setCart]);

  return null;
}
