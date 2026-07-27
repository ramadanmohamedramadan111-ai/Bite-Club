'use client';

import { useTranslations } from 'next-intl';
import { Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { useRouter } from '@/i18n/navigation';
import { useAction } from 'next-safe-action/hooks';
import { cn } from '@/lib/utils';
import {
  removeItemFromGroupOrderSessionAction,
  updateItemQuantityGroupOrderSessionAction,
} from '@/actions/group-order';
import type { GroupOrderCartSession } from '@/types/group-order';

type Props = {
  membersSummary: GroupOrderCartSession['members_summary'];
  sessionId: number;
  currentUserId?: number | null;
};

export default function GroupCartItemsList({
  membersSummary,
  sessionId,
  currentUserId,
}: Props) {
  const t = useTranslations('common');
  const router = useRouter();

  const { execute: removeItem } = useAction(
    removeItemFromGroupOrderSessionAction,
    {
      onSuccess: () => {
        toast.success('Item removed');
      },
      onError: ({ error }) => {
        toast.error(error.serverError?.message ?? 'Failed to remove item');
      },
    },
  );

  const { execute: updateQty } = useAction(
    updateItemQuantityGroupOrderSessionAction,
    {
      onSuccess: () => {},
      onError: ({ error }) => {
        toast.error(error.serverError?.message ?? 'Failed to update quantity');
      },
    },
  );

  return (
    <div className="space-y-4">
      {membersSummary.map((member) => (
        <div
          key={member.user.id}
          className={cn(
            'space-y-3 rounded-xl border p-4',
            member.user.id === currentUserId && 'border-primary/50',
          )}>
          <div className="flex items-center justify-between gap-3">
            <p className="font-medium">
              {member.user.name}
              <span className="ms-2 text-sm text-muted-foreground">
                {member.user_total.toFixed(2)} {t('egp')}
              </span>
            </p>
          </div>

          <div className="space-y-3">
            {member.items.map((cartItem) => (
              <div
                key={cartItem.id}
                className="space-y-2 rounded-xl border p-4">
                <div className="flex justify-between gap-4">
                  <div className="min-w-0 space-y-2">
                    <p className="font-medium">{cartItem.item.title}</p>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        disabled={cartItem.quantity <= 1}
                        onClick={() =>
                          updateQty({
                            group_order_id: sessionId,
                            item_id: cartItem.id,
                            quantity: cartItem.quantity - 1,
                          })
                        }>
                        <Minus className="size-4" />
                      </Button>
                      <span className="min-w-6 text-center text-sm font-medium">
                        {cartItem.quantity}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        onClick={() =>
                          updateQty({
                            group_order_id: sessionId,
                            item_id: cartItem.id,
                            quantity: cartItem.quantity + 1,
                          })
                        }>
                        <Plus className="size-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold">
                      {cartItem.total_price.toFixed(2)} {t('egp')}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        removeItem({
                          group_order_id: sessionId,
                          item_id: cartItem.id,
                        })
                      }
                      className="mt-1 text-sm text-destructive hover:underline">
                      {t('remove')}
                    </button>
                  </div>
                </div>

                {cartItem.notes && (
                  <p className="text-sm text-muted-foreground">
                    {t('note')} {cartItem.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

