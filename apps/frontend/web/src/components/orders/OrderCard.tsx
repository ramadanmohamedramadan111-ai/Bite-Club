'use client';

import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { Order } from '@/types/orders/order';
import { OrderStatusBadge } from './OrderStatusBadge';
import { useReorderOrder } from '@/hooks/use-reorder-order';

function formatOrderDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(date));
}

function formatItemsInline(order: Order) {
  return order.items
    .map((item) => `${item.quantity}x ${item.name}`)
    .join(' · ');
}

export default function OrderCard({ order }: { order: Order }) {
  const { requestReorder, reorderDialog } = useReorderOrder();

  return (
    <>
      <Card className="p-4">
        <div className="flex gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
            <Image
              src={order.restaurantImage}
              alt={order.restaurantName}
              fill
              className="object-cover"
            />
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold">{order.restaurantName}</p>
                <p className="text-xs text-muted-foreground">
                  {formatOrderDate(order.orderedAt)}
                </p>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>

            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="rounded-md bg-secondary px-2 py-0.5 capitalize">
                {order.type}
              </span>
              <span className="rounded-md bg-secondary px-2 py-0.5 capitalize">
                {order.fulfillmentType}
              </span>
              <span className="font-medium text-foreground">
                {order.total} EGP
              </span>
            </div>

            <p className="line-clamp-2 text-sm text-muted-foreground">
              {formatItemsInline(order)}
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <Link href={`/orders/${order.id}`}>
                <Button variant="outline" size="sm">
                  View details
                </Button>
              </Link>
              <Button size="sm" onClick={() => requestReorder(order)}>
                Reorder
              </Button>
            </div>
          </div>
        </div>
      </Card>
      {reorderDialog}
    </>
  );
}
