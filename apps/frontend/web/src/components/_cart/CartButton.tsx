'use client';

import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/stores/_cart';
import { useCartDrawerStore } from '@/stores/cart-drawer';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
};

export default function CartButton({ className }: Props) {
  const itemCount = useCartStore(
    (state) =>
      state.cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0,
  );
  const openDrawer = useCartDrawerStore((state) => state.openDrawer);
  const closeDrawer = useCartDrawerStore((state) => state.closeDrawer);
  const open = useCartDrawerStore((state) => state.open);

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn('relative', className)}
      onClick={() => {
        if (open) {
          closeDrawer();
        } else {
          openDrawer();
        }
      }}
      aria-label={`Cart with ${itemCount} items`}>
      <ShoppingCart className="size-5" />
      {itemCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </Button>
  );
}

