'use client';

import { useTranslations } from 'next-intl';
import { Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { useRouter } from '@/i18n/navigation';
import { useAction } from 'next-safe-action/hooks';
import { cn, getMediaUrl } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  removeItemFromGroupOrderSessionAction,
  updateItemQuantityGroupOrderSessionAction,
  removeGuestItemFromGroupOrderAction,
  updateGuestItemQuantityGroupOrderAction,
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
  const tg = useTranslations('groups');
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

  const { execute: removeGuestItem } = useAction(
    removeGuestItemFromGroupOrderAction,
    {
      onSuccess: () => {
        toast.success('Item removed');
      },
      onError: ({ error }) => {
        toast.error(error.serverError?.message ?? 'Failed to remove item');
      },
    },
  );

  const { execute: updateGuestQty } = useAction(
    updateGuestItemQuantityGroupOrderAction,
    {
      onSuccess: () => {},
      onError: ({ error }) => {
        toast.error(error.serverError?.message ?? 'Failed to update quantity');
      },
    },
  );

  const handleUpdateQty = (cartItemId: number, newQty: number, isGuest: boolean, memberUserId: number) => {
    if (isGuest) {
      updateGuestQty({
        group_order_id: sessionId,
        item_id: cartItemId,
        user_id: memberUserId,
        quantity: newQty,
      });
    } else {
      updateQty({
        group_order_id: sessionId,
        item_id: cartItemId,
        quantity: newQty,
      });
    }
  };

  const handleRemove = (cartItemId: number, isGuest: boolean, memberUserId: number) => {
    if (isGuest) {
      removeGuestItem({
        group_order_id: sessionId,
        item_id: cartItemId,
        user_id: memberUserId,
      });
    } else {
      removeItem({
        group_order_id: sessionId,
        item_id: cartItemId,
      });
    }
  };

  const isCurrentUser = (member: any) => {
    if (member.user.is_guest) {
      if (typeof window !== 'undefined') {
        return String(member.user.id) === localStorage.getItem('user_id');
      }
      return false;
    }
    return member.user.id === currentUserId;
  };

  return (
    <div className="space-y-4">
      {membersSummary.map((member: any) => (
        <div
          key={member.user.id}
          className={cn(
            'space-y-3 rounded-xl border p-4',
            isCurrentUser(member) && 'border-primary/50',
          )}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Avatar className="size-6 rounded-full shrink-0">
                <AvatarImage src={getMediaUrl(member.user.profile_image)} className="object-cover" />
                <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                  {member.user.name[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <p className="font-medium flex items-center gap-1.5 flex-wrap">
                <span className="truncate max-w-[170px] flex items-center gap-1">
                  <span>{member.user.name}</span>
                  {member.user.is_guest && (
                    <span className="text-muted-foreground text-[10px] font-normal">({tg('guest')})</span>
                  )}
                  {isCurrentUser(member) && (
                    <span className="text-muted-foreground text-[10px] font-normal">({t('you')})</span>
                  )}
                </span>
                <span className="text-sm font-normal text-muted-foreground">
                  ({member.user_total.toFixed(2)} {t('egp')})
                </span>
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {member.items.map((cartItem: any) => (
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
                          handleUpdateQty(cartItem.id, cartItem.quantity - 1, !!member.user.is_guest, member.user.id)
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
                          handleUpdateQty(cartItem.id, cartItem.quantity + 1, !!member.user.is_guest, member.user.id)
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
                        handleRemove(cartItem.id, !!member.user.is_guest, member.user.id)
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

