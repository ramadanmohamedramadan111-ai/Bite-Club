'use client';

import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { OrderResponse } from '@/types/orders/order';
import { OrderStatusBadge } from './OrderStatusBadge';

function formatOrderDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(date));
}

function formatItemsInline(order: OrderResponse) {
  return order.items
    .map((item) => `${item.quantity}x ${item.item_name}`)
    .join(' · ');
}

export default function OrderCard({ order }: { order: OrderResponse }) {
  return (
    <Card className="p-4">
      <div className="flex gap-4">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-semibold">{order.restaurant.name}</p>
              <p className="text-xs text-muted-foreground">
                {order.time_ago || formatOrderDate(order.created_at)}
              </p>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>

          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="rounded-md bg-secondary px-2 py-0.5 capitalize">
              {order.order_type}
            </span>
            <span className="font-medium text-foreground">
              {order.financials.total} EGP
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
          </div>
        </div>
      </div>
    </Card>
  );
}
