'use client';

import type { Cart } from '@/types/cart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useTranslations } from 'next-intl';
import { Spinner } from '@/components/ui/spinner';

type Summary = {
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  discountAmount: number;
  pointsRedeemed: number;
  total: number;
  requiresDeposit: boolean;
  depositAmount: number;
  remainingAmount: number;
};

type Props = {
  cart: Cart;
  summary: Summary;
  fulfillmentType: 'delivery' | 'pickup';
  isLoading?: boolean;
  hasLocation?: boolean;
};

export default function OrderSummary({
  cart,
  summary,
  fulfillmentType,
  isLoading = false,
  hasLocation = false,
}: Props) {
  const t = useTranslations('checkout');
  return (
    <Card className="sticky top-24 h-fit">
      <CardHeader className="border-b border-border/30 pb-4">
        <CardTitle className="text-base font-bold">{t('orderSummary')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-5">
        <div className="flex items-center gap-3">
          <div>
            <p className="font-bold text-base text-foreground leading-tight">
              {cart.restaurant?.name || 'Restaurant'}
            </p>
            <p className="text-xs text-muted-foreground capitalize mt-0.5">
              {fulfillmentType}
            </p>
          </div>
        </div>

        <Separator />

        <div className="max-h-64 space-y-3.5 overflow-y-auto pr-1">
          {cart.items.map((item) => (
            <div key={item.id} className="space-y-1 text-sm">
              <div className="flex justify-between gap-3">
                <span className="font-medium text-foreground leading-tight">
                  {item.quantity}x {item.item_name}
                </span>
                <span className="shrink-0 font-semibold text-foreground/80 text-xs">
                  {item.total_price.toFixed(2)} EGP
                </span>
              </div>
              {item.notes && (
                <p className="text-3xs text-muted-foreground italic pl-2">
                  Note: "{item.notes}"
                </p>
              )}
            </div>
          ))}
        </div>

        <Separator />

        {isLoading ? (
          <div className="py-6 flex flex-col items-center justify-center space-y-3 text-center">
            <Spinner className="size-6 text-primary" />
            <p className="text-xs text-muted-foreground">
              {fulfillmentType === 'delivery' && !hasLocation
                ? t('selectAddressToPreview')
                : t('calculatingTotals')}
            </p>
          </div>
        ) : (
          <>
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{t('subtotal')}</dt>
                <dd className="font-semibold text-foreground">
                  {summary.subtotal.toFixed(2)} EGP
                </dd>
              </div>
              {fulfillmentType === 'delivery' && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">{t('deliveryFee')}</dt>
                  <dd className="font-semibold text-foreground">
                    {summary.deliveryFee.toFixed(2)} EGP
                  </dd>
                </div>
              )}
              {summary.serviceFee > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">{t('serviceFee')}</dt>
                  <dd className="font-semibold text-foreground">
                    {summary.serviceFee.toFixed(2)} EGP
                  </dd>
                </div>
              )}
              {summary.discountAmount > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <dt className="flex items-center gap-1.5">
                    {t('discount')}
                    <span className="text-xs text-muted-foreground font-normal">
                      ({t('pointsRedeemed', { count: summary.pointsRedeemed })})
                    </span>
                  </dt>
                  <dd className="font-semibold">
                    -{summary.discountAmount.toFixed(2)} EGP
                  </dd>
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
                <span className="text-primary">{summary.total.toFixed(2)} EGP</span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
