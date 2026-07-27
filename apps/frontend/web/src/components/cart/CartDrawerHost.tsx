'use client';

import CartDrawer from '@/components/cart/CartDrawer';
import { useCartDrawerStore } from '@/stores/cart-drawer';
import {
  IndividualCartItemResponse,
  IndividualCartResponse,
} from '@/types/cart';

export default function CartDrawerHost() {
  const open = useCartDrawerStore((state) => state.open);
  const closeDrawer = useCartDrawerStore((state) => state.closeDrawer);

  return <CartDrawer open={open} onClose={closeDrawer} />;
}

