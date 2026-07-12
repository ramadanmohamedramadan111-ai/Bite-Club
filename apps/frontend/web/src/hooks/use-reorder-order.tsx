'use client';

import { useAddToIndividualCart } from '@/hooks/use-add-to-individual-cart';
import type { Order } from '@/types/orders/order';

export function useReorderOrder() {
  const { addFromOrder, dialog } = useAddToIndividualCart();

  function requestReorder(order: Order) {
    addFromOrder(order, { redirect: true });
  }

  return {
    requestReorder,
    reorderDialog: dialog,
  };
}
