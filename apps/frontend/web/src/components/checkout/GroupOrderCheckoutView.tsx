'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Bike, ShoppingBag, CreditCard, Eye } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  checkoutGroupPreviewDeliveryAction,
  checkoutGroupPreviewPickupAction,
  checkoutGroupPayAction,
} from '@/actions/group-order';
import type { GroupOrderCartSession } from '@/types/group-order/group-order';
import type { CheckoutPreviewResponse } from '@/types/checkout/checkout';
import { Link } from '@/i18n/navigation';

type Props = {
  sessionId: number;
  sessionCart: GroupOrderCartSession;
  currentUserId: number | null;
};

type FulfillmentType = 'delivery' | 'pickup';

function getMemberTotal(member: GroupOrderCartSession['members_summary'][number]): number {
  return member.items.reduce((sum, item) => sum + item.total_price, 0);
}

export default function GroupOrderCheckoutView({
  sessionId,
  sessionCart,
  currentUserId,
}: Props) {
  const t = useTranslations('checkout');
  const tc = useTranslations('common');
  const router = useRouter();

  const isHost = currentUserId !== null && sessionCart.host.id === currentUserId;

  const [fulfillment, setFulfillment] = useState<FulfillmentType>('pickup');
  const [preview, setPreview] = useState<CheckoutPreviewResponse | null>(null);

  const membersSummary = sessionCart.members_summary;
  const totalItems = membersSummary.reduce((sum, m) => sum + m.items.length, 0);

  const { execute: previewDelivery, isExecuting: isPreviewing } = useAction(
    checkoutGroupPreviewDeliveryAction,
    {
      onSuccess: ({ data }) => {
        if (data?.data) {
          setPreview(data.data);
        }
      },
      onError: ({ error }) => {
        toast.error(error.serverError?.message ?? 'Failed to get preview');
      },
    },
  );

  const { execute: previewPickup, isExecuting: isPreviewingPickup } = useAction(
    checkoutGroupPreviewPickupAction,
    {
      onSuccess: ({ data }) => {
        if (data?.data) {
          setPreview(data.data);
        }
      },
      onError: ({ error }) => {
        toast.error(error.serverError?.message ?? 'Failed to get preview');
      },
    },
  );

  const { execute: placeOrder, isExecuting: isPlacing } = useAction(
    checkoutGroupPayAction,
    {
      onSuccess: ({ data }) => {
        toast.success(t('orderPlaced'));
        if (data?.data?.payment_url) {
          router.push(data.data.payment_url);
        } else {
          router.push('/orders/active');
        }
      },
      onError: ({ error }) => {
        toast.error(error.serverError?.message ?? t('failedToPlaceOrder'));
      },
    },
  );

  function handlePreview() {
    if (fulfillment === 'delivery') {
      previewDelivery({ group_order_id: sessionId, order_type: 'delivery', lat: 0, long: 0 });
    } else {
      previewPickup({ group_order_id: sessionId, order_type: 'pickup' });
    }
  }

  function handlePlaceOrder() {
    if (fulfillment === 'delivery') {
      placeOrder({
        group_order_id: sessionId,
        order_type: 'delivery',
        lat: 0,
        long: 0,
        payment_option_id: 'full_online',
      });
    } else {
      placeOrder({
        group_order_id: sessionId,
        order_type: 'pickup',
        payment_option_id: 'full_online',
      });
    }
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-8 py-8">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="mt-1 text-muted-foreground">
          {t('subtitle', { restaurant: sessionCart.restaurant.name })}
        </p>
      </div>

      {totalItems === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-lg font-medium">{t('yourCartIsEmpty')}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('emptyCartDesc')}
            </p>
              <Button asChild className="mt-6">
              <Link href={`/group-order/${sessionId}`}>
                Back to group order
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('orderSummary')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {membersSummary.map((member) => {
                const memberTotal = getMemberTotal(member);
                return (
                  <div key={member.user.id}>
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-semibold">{member.user.name}</h3>
                      <span className="font-semibold">
                        {memberTotal.toFixed(2)} {tc('egp')}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {member.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-lg border px-4 py-3 text-sm"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-medium">
                              {item.item.title}
                              <span className="ml-2 text-muted-foreground">
                                x{item.quantity}
                              </span>
                            </p>
                            {item.notes && (
                              <p className="text-xs text-muted-foreground">
                                {tc('note')} {item.notes}
                              </p>
                            )}
                          </div>
                          <span className="ml-4 shrink-0 text-muted-foreground">
                            {item.total_price.toFixed(2)} {tc('egp')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              <Separator />

              <div className="space-y-2">
                {membersSummary.map((member) => (
                  <div key={member.user.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {member.user.name}
                    </span>
                    <span>
                      {getMemberTotal(member).toFixed(2)} {tc('egp')}
                    </span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>{tc('total')}</span>
                <span>
                  {sessionCart.total_amount.toFixed(2)} {tc('egp')}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t('deliveryOptions')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={fulfillment}
                onValueChange={(val: string) => {
                  setFulfillment(val as FulfillmentType);
                  setPreview(null);
                }}
                className="grid grid-cols-2 gap-4"
              >
                <Label
                  htmlFor="fulfillment-pickup"
                  className="flex cursor-pointer items-center gap-3 rounded-xl border p-4 has-[[data-state=checked]]:border-primary"
                >
                  <RadioGroupItem value="pickup" id="fulfillment-pickup" />
                  <div>
                    <div className="flex items-center gap-2 font-medium">
                      <ShoppingBag className="size-4" />
                      {t('pickup')}
                    </div>
                  </div>
                </Label>

                <Label
                  htmlFor="fulfillment-delivery"
                  className="flex cursor-pointer items-center gap-3 rounded-xl border p-4 has-[[data-state=checked]]:border-primary"
                >
                  <RadioGroupItem value="delivery" id="fulfillment-delivery" />
                  <div>
                    <div className="flex items-center gap-2 font-medium">
                      <Bike className="size-4" />
                      {t('delivery')}
                    </div>
                  </div>
                </Label>
              </RadioGroup>
            </CardContent>
          </Card>

          {preview && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t('paymentMethod')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t('subtotal')}
                    </span>
                    <span>
                      {preview.financials.subtotal.toFixed(2)} {tc('egp')}
                    </span>
                  </div>
                  {preview.financials.delivery_fee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t('deliveryFee')}
                      </span>
                      <span>
                        {preview.financials.delivery_fee.toFixed(2)}{' '}
                        {tc('egp')}
                      </span>
                    </div>
                  )}
                  {preview.financials.service_fee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t('serviceFee')}
                      </span>
                      <span>
                        {preview.financials.service_fee.toFixed(2)} {tc('egp')}
                      </span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>{t('total')}</span>
                    <span>
                      {preview.financials.total.toFixed(2)} {tc('egp')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-wrap items-center gap-4">
            {isHost && !preview && (
              <Button
                size="lg"
                variant="default"
                disabled={isPreviewing || isPreviewingPickup}
                onClick={handlePreview}
                className="gap-2"
              >
                <Eye className="size-4" />
                Generate Preview
              </Button>
            )}

            {isHost && preview && (
              <Button
                size="lg"
                disabled={isPlacing}
                onClick={handlePlaceOrder}
                className="gap-2"
              >
                <CreditCard className="size-4" />
                {t('placeOrder')}
              </Button>
            )}

            {!isHost && (
              <p className="text-sm text-muted-foreground">
                Waiting for the host ({sessionCart.host.name}) to finalize the order.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
