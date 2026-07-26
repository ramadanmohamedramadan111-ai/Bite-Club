'use client';

import { ShoppingCart, Users } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { getLangDir } from 'rtl-detect';
import { useGroupOrderSessionsStore } from '@/stores/group-order-sessions';
import { useGroupOrderDrawerStore } from '@/stores/group-order-drawer';
import { useCartDrawerStore } from '@/stores/cart-drawer';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
};

export default function GroupOrderSessionsButton({ className }: Props) {
  const locale = useLocale();
  const direction = getLangDir(locale);
  const isRtl = direction === 'rtl';
  const t = useTranslations('groups');
  const sessions = useGroupOrderSessionsStore((state) => state.sessions);
  const open = useGroupOrderDrawerStore((state) => state.open);
  const openDrawer = useGroupOrderDrawerStore((state) => state.openDrawer);
  const closeDrawer = useGroupOrderDrawerStore((state) => state.closeDrawer);
  const closeCartDrawer = useCartDrawerStore((state) => state.closeDrawer);

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
          closeCartDrawer();
          openDrawer();
        }
      }}
      aria-label={t('activeGroupOrders')}>
      <span className="relative inline-flex items-center justify-center">
        <ShoppingCart className="size-5" />
        <span className="absolute -bottom-1 -right-1 flex size-3.5 items-center justify-center rounded-full bg-accent-foreground text-accent">
          <Users className="size-2.5" />
        </span>
      </span>
      {sessions.length > 0 && (
        <span
          className={cn(
            'absolute -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground',
            isRtl ? '-left-0.5' : '-right-0.5',
          )}>
          {sessions.length > 99 ? '99+' : sessions.length}
        </span>
      )}
    </Button>
  );
}

