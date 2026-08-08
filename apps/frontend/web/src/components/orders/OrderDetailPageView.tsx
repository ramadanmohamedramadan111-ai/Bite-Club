'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { getEcho } from '@/lib/echo';
import { useRouter } from '@/i18n/navigation';
import {
  ArrowLeft,
  CreditCard,
  ShoppingBag,
  Wallet,
  XCircle,
  Clock,
  ReceiptText,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAction } from 'next-safe-action/hooks';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import ConfirmDialog from '@/components/shared/ConfirmationDialog';
import type { OrderDetails } from '@/types/order';
import { cancelOrder, revalidateOrderDetailsAction } from '@/actions/order';
import { OrderStatusBadge } from './OrderStatusBadge';
import { cn, getMediaUrl } from '@/lib/utils';
import Image from 'next/image';

function formatOrderDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(date));
}

export default function OrderDetailPageView({
  order,
  token,
}: {
  order: OrderDetails;
  token: string | null;
}) {
  const t = useTranslations('orderDetail');
  const tc = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const { execute: revalidateOrder } = useAction(revalidateOrderDetailsAction, {
    onSuccess: async () => {},
  });

  // Laravel Echo WebSocket Listener for order status updates
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const echo = getEcho(token);

    const channelName = `order.${order.id}`;
    console.log(`[Echo] Joining private channel: ${channelName}`);

    const channel = echo.private(channelName);

    channel.listen('.order.status.updated', (data: any) => {
      console.log('[Echo] Order status updated event received:', data);

      // Toast message
      toast.success(
        locale === 'ar'
          ? 'تم تحديث حالة الطلب بنجاح!'
          : 'Order status has been updated successfully!',
      );

      // Revalidate fetching of order status
      revalidateOrder({ orderId: String(order.id) });
    });

    return () => {
      console.log(`[Echo] Leaving private channel: ${channelName}`);
      echo.leave(channelName);
    };
  }, [order.id, token, locale, revalidateOrder]);

  const { execute: executeCancel, isExecuting: isCancelling } = useAction(
    cancelOrder,
    {
      onSuccess: () => {
        toast.success(tc('orderCancelled'));
      },
      onError: ({ error }) => {
        toast.error(error.serverError?.message ?? 'Failed to cancel order');
      },
    },
  );

  const isPending = order.status === 'pending';
  const hasFullCashPayment = order.payments?.some(
    (p) => p.payment_method === 'cash',
  );
  const hasOnlinePayment = order.payments?.some(
    (p) => p.payment_method === 'online',
  );
  const showCancel = isPending && hasFullCashPayment && !hasOnlinePayment;
  const showRefund = isPending && hasOnlinePayment;

  function paymentLabel(method: string, orderType: string) {
    if (method === 'online') return tc('onlinePayment');
    if (orderType === 'pickup') return tc('cashOnPickup');
    return tc('cashOnDelivery');
  }

  const initials = order.restaurant.name.charAt(0).toUpperCase();

  return (
    <div className="container mx-auto space-y-8">
      {/* Title & Actions Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/30 pb-6">
        <div className="flex items-center gap-4">
          <Link href="/orders" className="cursor-pointer">
            <Button
              variant="outline"
              size="icon"
              className="rounded-xl border-border/50 bg-background/50 hover:bg-background">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {t('orderNumber', { id: order.id })}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 flex items-center gap-1.5 font-medium">
              <Clock className="size-4" />
              <span>{formatOrderDate(order.created_at)}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <OrderStatusBadge
            status={order.status}
            className="px-3.5 py-1 text-sm"
          />
          {showCancel && (
            <Button
              variant="destructive"
              size="sm"
              className="gap-1.5 rounded-xl cursor-pointer"
              onClick={() => setCancelDialogOpen(true)}>
              <XCircle className="size-4" />
              {tc('cancelOrder')}
            </Button>
          )}
          {showRefund && (
            <Button
              variant="destructive"
              size="sm"
              className="gap-1.5 rounded-xl cursor-pointer"
              onClick={() => setCancelDialogOpen(true)}>
              <RotateCcw className="size-4" />
              {tc('refundOrder')}
            </Button>
          )}
        </div>
      </div>

      {/* Main Grid Layout split into details + checkout parameters */}
      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* Left Column: Tracking and Items details */}
        <div className="lg:col-span-8 space-y-6">
          {/* Tracking Timeline */}
          {order.tracking && (
            <Card className="border-border/40 shadow-xs">
              <CardHeader className="border-b border-border/30">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Clock className="size-4.5 text-primary" />
                  <span>{t('tracking')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="relative pl-6 space-y-6 after:absolute after:inset-y-1 after:left-1.5 after:w-0.5 after:bg-border/40">
                  {order.tracking.steps.map((step) => (
                    <div
                      key={step.status}
                      className="relative flex items-start gap-4">
                      {/* Outer pulse effect if active and not cancelled/completed */}
                      {step.state === 'active' &&
                        !order.tracking.is_cancelled &&
                        order.status !== 'completed' && (
                          <div className="absolute -left-5 z-10 flex size-3.5 items-center justify-center rounded-full border-2 bg-emerald-500 border-emerald-500 animate-ping opacity-75" />
                        )}
                      {/* Solid indicator dot overlay */}
                      <div
                        className={cn(
                          'absolute -left-5 z-10 size-3.5 rounded-full border-2',
                          order.status === 'completed'
                            ? 'bg-emerald-500 border-emerald-500'
                            : step.state === 'active'
                              ? order.tracking.is_cancelled
                                ? 'bg-rose-500 border-rose-500'
                                : 'bg-emerald-500 border-emerald-500'
                              : step.state === 'completed'
                                ? 'bg-emerald-500 border-emerald-500'
                                : 'bg-background border-border/85',
                        )}
                      />
                      <div className="flex flex-col gap-0.5">
                        <span
                          className={cn(
                            'text-sm font-bold transition-colors',
                            order.status === 'completed'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : step.state === 'active'
                                ? order.tracking.is_cancelled
                                  ? 'text-rose-600 dark:text-rose-400'
                                  : 'text-emerald-600 dark:text-emerald-400'
                                : step.state === 'completed'
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-muted-foreground',
                          )}>
                          {step.label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Restaurant details */}
          <Card className="border-border/40 shadow-xs">
            <CardHeader className="border-b border-border/30">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <ShoppingBag className="size-4.5 text-primary" />
                <span>{t('restaurant')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 flex items-center gap-4">
              <div className="relative flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-orange-500/10 text-primary font-bold text-2xl border border-primary/20 shrink-0 shadow-xs select-none overflow-hidden">
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
              <div>
                <h4 className="font-bold text-lg text-foreground leading-tight">
                  {order.restaurant.name}
                </h4>
                <span className="inline-flex rounded bg-secondary px-2 py-0.5 text-xs font-semibold text-muted-foreground capitalize mt-2">
                  {order.order_type}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Pricing Summary & Payment */}
        <div className="lg:col-span-4 space-y-6">
          {/* Order Summary & Financials */}
          <Card className="border-border/40 shadow-xs">
            <CardHeader className="border-b border-border/30">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <ReceiptText className="size-4.5 text-primary" />
                <span>{t('orderSummary')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between text-sm items-start gap-4">
                    <span className="font-medium text-foreground/90">
                      {item.quantity}x {item.item_name}
                    </span>
                    <span className="font-semibold text-foreground/80 shrink-0">
                      {Number(item.price) * item.quantity} EGP
                    </span>
                  </div>
                ))}
              </div>

              <Separator className="border-border/30" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {tc('subtotal')}
                  </span>
                  <span className="font-semibold">
                    {order.financials.subtotal} EGP
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {tc('deliveryFee')}
                  </span>
                  <span className="font-semibold">
                    {order.financials.delivery_fee} EGP
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {tc('serviceFee')}
                  </span>
                  <span className="font-semibold">
                    {order.financials.service_fee} EGP
                  </span>
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex justify-between items-center text-lg font-bold text-primary shadow-xs">
                <span>{tc('total')}</span>
                <span>{order.financials.total} EGP</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Block */}
          <Card className="border-border/40 shadow-xs">
            <CardHeader className="border-b border-border/30">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Wallet className="size-4.5 text-primary" />
                <span>{t('payment')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-2">
              {order.payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center gap-3 text-sm font-semibold text-foreground/90">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-accent text-muted-foreground border border-border/30 shrink-0">
                    {payment.payment_method === 'online' ? (
                      <CreditCard className="h-4.5 w-4.5" />
                    ) : order.order_type === 'delivery' ? (
                      <Wallet className="h-4.5 w-4.5" />
                    ) : (
                      <ShoppingBag className="h-4.5 w-4.5" />
                    )}
                  </div>
                  <span className="flex-1">
                    {paymentLabel(
                      payment.payment_method,
                      order.order_type,
                    )}
                  </span>
                  <span className="text-muted-foreground">
                    {payment.amount} EGP
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        title={showRefund ? tc('refundOrderTitle') : tc('cancelOrderTitle')}
        description={
          showRefund ? tc('refundOrderDesc') : tc('cancelOrderDesc')
        }
        confirmText={
          showRefund ? tc('refundOrderConfirm') : tc('cancelOrderConfirm')
        }
        cancelText={tc('goBack')}
        onConfirm={() => executeCancel(order.id)}
        isLoading={isCancelling}
      />
    </div>
  );
}

