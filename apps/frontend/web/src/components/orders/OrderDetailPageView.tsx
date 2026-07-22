'use client';

import { useTranslations } from 'next-intl';
import { ArrowLeft, CreditCard, MapPin, ShoppingBag, Wallet } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { OrderDetails } from '@/types/orders/order';
import { OrderStatusBadge } from './OrderStatusBadge';

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

export default function OrderDetailPageView({ order }: { order: OrderDetails }) {
  const t = useTranslations('orderDetail');
  const tc = useTranslations('common');

  function paymentLabel(method: string) {
    if (method === 'visa') return tc('visaCard');
    return tc('cashOnDelivery');
  }

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/orders">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{t('orderNumber', { id: order.id })}</h1>
            <p className="mt-1 text-muted-foreground">
              {formatOrderDate(order.created_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      <div className="mx-auto grid max-w-4xl gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('orderSummary')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              <span className="rounded-md bg-secondary px-2 py-0.5 capitalize">
                {order.order_type}
              </span>
            </div>

            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.quantity}x {item.item_name}
                  </span>
                  <span>{Number(item.price) * item.quantity} EGP</span>
                </div>
              ))}
            </div>

            <Separator />

            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{tc('subtotal')}</span>
                <span>{order.financials.subtotal} EGP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{tc('deliveryFee')}</span>
                <span>{order.financials.delivery_fee} EGP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{tc('serviceFee')}</span>
                <span>{order.financials.service_fee} EGP</span>
              </div>
              <div className="flex justify-between pt-1 text-base font-semibold">
                <span>{tc('total')}</span>
                <span>{order.financials.total} EGP</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('restaurant')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="font-medium">{order.restaurant.name}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('payment')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm">
              {order.payments[0]?.payment_method === 'visa' ? (
                <CreditCard className="h-4 w-4" />
              ) : order.order_type === 'delivery' ? (
                <Wallet className="h-4 w-4" />
              ) : (
                <ShoppingBag className="h-4 w-4" />
              )}
              <span>{paymentLabel(order.payments[0]?.payment_method ?? 'cash')}</span>
            </div>
          </CardContent>
        </Card>

        {order.tracking && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('tracking')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.tracking.steps.map((step) => (
                  <div key={step.status} className="flex items-center gap-3">
                    <div
                      className={`h-2.5 w-2.5 rounded-full ${
                        step.state === 'active'
                          ? 'bg-primary'
                          : step.state === 'completed'
                            ? 'bg-emerald-500'
                            : 'bg-gray-300'
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        step.state === 'active' ? 'font-medium' : 'text-muted-foreground'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
