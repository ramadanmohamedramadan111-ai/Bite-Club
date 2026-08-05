'use client';

import { useEffect } from 'react';
import { useAction } from 'next-safe-action/hooks';
import { mergeGuestItemsAction } from '@/actions/group-order';
import { toast } from 'sonner';

export default function MergeGuestCarts() {
  const { execute: mergeGuestCarts } = useAction(mergeGuestItemsAction, {
    onSuccess: () => {
      localStorage.removeItem('group_orders');
      localStorage.removeItem('user_id');
      toast.success('Guest items merged successfully!');
    },
    onError: ({ error }) => {
      console.error('Failed to merge guest items:', error.serverError?.message);
    },
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const groupOrdersStr = localStorage.getItem('group_orders');
    const userIdStr = localStorage.getItem('user_id');

    if (groupOrdersStr && userIdStr) {
      try {
        const groupOrders = JSON.parse(groupOrdersStr);
        const userId = parseInt(userIdStr);

        if (Array.isArray(groupOrders) && groupOrders.length > 0 && !isNaN(userId)) {
          mergeGuestCarts({
            group_orders: groupOrders.map((go: any) => ({
              id: Number(go.id),
              name: String(go.name),
            })),
            user_id: userId,
          });
        }
      } catch (e) {
        console.error('Error parsing localStorage guest items:', e);
      }
    }
  }, [mergeGuestCarts]);

  return null;
}
