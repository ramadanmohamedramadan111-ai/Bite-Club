'use client';

import { ShoppingCart } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { getLangDir } from 'rtl-detect';
import { useCartStore } from '@/stores/cart';
import { useCartDrawerStore } from '@/stores/cart-drawer';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
};

export default function CartButton({ className }: Props) {
  const locale = useLocale();
  const direction = getLangDir(locale);
  const isRtl = direction === 'rtl';
  const t = useTranslations('common');
  const cart = useCartStore((state) => state.cart);

  const items = cart?.items;
  const itemsCount = items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
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
      aria-label={t('cartWithItems', { count: itemsCount })}>
      <ShoppingCart className="size-5" />
      {itemsCount > 0 && (
        <span className={cn('absolute -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground', isRtl ? '-left-0.5' : '-right-0.5')}>
          {itemsCount > 99 ? '99+' : itemsCount}
        </span>
      )}
    </Button>
  );
}

