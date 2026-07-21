'use client';

import { Copy } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/_cart';
import { useSessionStore } from '@/stores/session';
import type { CartItem } from '@/types/cart/_cart';
import { getItemOwnerKey, groupCartItemsByUser } from '@/utils/cart-grouping';

import CartItemRow from './CartItemRow';

type Props = {
  items: CartItem[];
  onUpdateQuantity: (cartItemId: string, quantity: number) => void;
  onRemove: (cartItemId: string) => void;
  compact?: boolean;
};

export default function GroupCartItemsList({
  items,
  onUpdateQuantity,
  onRemove,
  compact = false,
}: Props) {
  const cloneUserOrder = useCartStore((state) => state.cloneUserOrder);
  const sessionId = useSessionStore((state) => state.sessionId);
  const guestName = useSessionStore((state) => state.name);

  const currentUserKey = getItemOwnerKey({
    sessionId: sessionId ?? undefined,
    name: guestName ?? undefined,
  });

  const userGroups = groupCartItemsByUser(items);

  function handleClone(sourceOwnerKey: string, sourceName: string) {
    cloneUserOrder(sourceOwnerKey, {
      sessionId: sessionId ?? undefined,
      name: guestName ?? undefined,
    });
    toast.success(`Cloned ${sourceName}'s order`);
  }

  return (
    <div className="space-y-4">
      {userGroups.map((group) => {
        const isCurrentUser = group.key === currentUserKey;

        return (
          <div key={group.key} className="space-y-3 rounded-xl border p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium">
                  {group.name}
                  {isCurrentUser && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      (You)
                    </span>
                  )}
                </p>
                <p className="text-sm text-muted-foreground">
                  {group.subtotal.toFixed(2)} EGP
                </p>
              </div>

              {!isCurrentUser && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => handleClone(group.key, group.name)}>
                  <Copy className="size-3.5" />
                  Clone
                </Button>
              )}
            </div>

            <div className={compact ? 'space-y-2' : 'space-y-3'}>
              {group.items.map((item) => (
                <CartItemRow
                  key={item.cartItemId}
                  item={item}
                  isGroupCart={false}
                  onUpdateQuantity={onUpdateQuantity}
                  onRemove={onRemove}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

