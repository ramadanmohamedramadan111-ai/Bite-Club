'use client';

import type { Cart } from '@/types/cart/cart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useTranslations } from 'next-intl';

type Summary = {
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  total: number;
  requiresDeposit: boolean;
  depositAmount: number;
  remainingAmount: number;
};

type Props = {
  cart: Cart;
  summary: Summary;
  fulfillmentType: 'delivery' | 'pickup';
};

export default function OrderSummary({
  cart,
  summary,
  fulfillmentType,
}: Props) {
  const t = useTranslations('checkout');
  return (
    <Card className="sticky top-20">
      <CardHeader>
        <CardTitle className="text-base">{t('orderSummary')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div>
            <p className="font-semibold text-base">{cart.restaurant?.name || 'Restaurant'}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {fulfillmentType}
            </p>
          </div>
        </div>

        <Separator />

        <div className="max-h-64 space-y-3 overflow-y-auto">
          {cart.items.map((item) => (
            <div key={item.id} className="space-y-1 text-sm">
              <div className="flex justify-between gap-3">
                <span className="font-medium text-foreground/90">
                  {item.quantity}x {item.item_name}
                </span>
                <span className="shrink-0 font-semibold text-foreground/90">
                  {item.total_price.toFixed(2)} EGP
                </span>
              </div>
              {item.notes && (
                <p className="text-xs text-muted-foreground italic">
                  Note: {item.notes}
                </p>
              )}
            </div>
          ))}
        </div>

        <Separator />

        <dl className="space-y-2.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">{t('subtotal')}</dt>
            <dd className="font-medium text-foreground">{summary.subtotal.toFixed(2)} EGP</dd>
          </div>
          {fulfillmentType === 'delivery' && (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{t('deliveryFee')}</dt>
              <dd className="font-medium text-foreground">{summary.deliveryFee.toFixed(2)} EGP</dd>
            </div>
          )}
          {summary.serviceFee > 0 && (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{t('serviceFee')}</dt>
              <dd className="font-medium text-foreground">{summary.serviceFee.toFixed(2)} EGP</dd>
            </div>
          )}
        </dl>

        <Separator />

        {summary.requiresDeposit ? (
          <dl className="space-y-2.5 text-sm">
            <div className="flex justify-between text-base font-bold text-primary">
              <span>{t('requiredDeposit')}</span>
              <span>{summary.depositAmount.toFixed(2)} EGP</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t('remainingOnDelivery')}</span>
              <span>{summary.remainingAmount.toFixed(2)} EGP</span>
            </div>
          </dl>
        ) : (
          <div className="flex justify-between text-base font-bold">
            <span>{t('total')}</span>
            <span>{summary.total.toFixed(2)} EGP</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


