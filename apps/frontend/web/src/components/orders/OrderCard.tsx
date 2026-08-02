'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { XCircle, ShoppingBag, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useAction } from 'next-safe-action/hooks';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ConfirmDialog from '@/components/shared/ConfirmationDialog';
import type { OrderResponse } from '@/types/order';
import { cancelOrder } from '@/actions/order';
import { OrderStatusBadge } from './OrderStatusBadge';
import { getMediaUrl } from '@/lib/utils';
import Image from 'next/image';

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
  const t = useTranslations('common');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const { execute: executeCancel, isExecuting: isCancelling } = useAction(
    cancelOrder,
    {
      onSuccess: () => {
        toast.success(t('orderCancelled'));
      },
      onError: ({ error }) => {
        console.log('ERROR', error);
        toast.error(error.serverError?.message ?? 'Failed to cancel order');
      },
    },
  );

  const isPending = order.status === 'pending';
  const hasFullCashPayment = order.payments?.some(
    (p) => p.payment_method === 'cash',
  );
  const showCancel = isPending && hasFullCashPayment;

  const initials = order.restaurant.name.charAt(0).toUpperCase();

  return (
    <Card className="p-5 border border-border/40 hover:border-border/85 hover:shadow-md transition-all duration-300">
      <div className="flex gap-4">
        {/* Left Side: Restaurant Logo/Initials Box */}
        <div className="relative flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-orange-500/10 text-primary font-bold text-lg border border-primary/20 shrink-0 shadow-xs select-none overflow-hidden">
          {order.restaurant.logo_url ? (
            <Image
              src={getMediaUrl(order.restaurant.logo_url)!}
              alt={order.restaurant.name}
              fill
              className="object-cover"
            />
          ) : (
            <span>{initials}</span>
          )}
        </div>

        {/* Right Side: Order Info details */}
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h4 className="font-bold text-base text-foreground leading-tight">{order.restaurant.name}</h4>
              <p className="text-xs text-muted-foreground mt-1">
                {order.time_ago || formatOrderDate(order.created_at)}
              </p>
            </div>
            <OrderStatusBadge status={order.status} className="shrink-0" />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-md bg-accent/60 px-2 py-0.5 font-semibold text-muted-foreground capitalize">
              <ShoppingBag className="size-3" />
              <span>{order.order_type}</span>
            </span>
            <span className="font-bold text-foreground bg-primary/5 text-primary border border-primary/10 rounded-md px-2 py-0.5">
              {order.financials.total} EGP
            </span>
          </div>

          <p className="line-clamp-2 text-sm text-foreground/80 leading-normal font-medium bg-accent/20 rounded-xl p-3 border border-border/10">
            {formatItemsInline(order)}
          </p>

          <div className="flex flex-wrap gap-2 pt-1.5">
            <Link href={`/orders/${order.id}`} className="cursor-pointer">
              <Button variant="outline" size="sm" className="gap-1.5 rounded-lg">
                <Eye className="size-4" />
                {t('viewDetails')}
              </Button>
            </Link>
            
            {showCancel && (
              <Button
                variant="destructive"
                size="sm"
                className="gap-1.5 rounded-lg cursor-pointer"
                onClick={() => setCancelDialogOpen(true)}
              >
                <XCircle className="size-4" />
                {t('cancelOrder')}
              </Button>
            )}
          </div>

          <ConfirmDialog
            open={cancelDialogOpen}
            onOpenChange={setCancelDialogOpen}
            title={t('cancelOrderTitle')}
            description={t('cancelOrderDesc')}
            confirmText={t('cancelOrderConfirm')}
            cancelText={t('goBack')}
            onConfirm={() => executeCancel(order.id)}
            isLoading={isCancelling}
          />
        </div>
      </div>
    </Card>
  );
}
