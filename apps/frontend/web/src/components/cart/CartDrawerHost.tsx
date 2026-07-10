'use client';

import CartDrawer from '@/components/cart/CartDrawer';
import { useCartDrawerStore } from '@/stores/cart-drawer';

export default function CartDrawerHost() {
  const open = useCartDrawerStore((state) => state.open);
  const closeDrawer = useCartDrawerStore((state) => state.closeDrawer);

  return <CartDrawer open={open} onClose={closeDrawer} />;
}
