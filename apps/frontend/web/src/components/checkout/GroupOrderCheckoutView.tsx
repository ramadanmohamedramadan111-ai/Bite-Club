'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import {
  Bike,
  ShoppingBag,
  CreditCard,
  Wallet,
  AlertCircle,
  Coins,
} from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import CheckoutDeliveryAddress from './CheckoutDeliveryAddress';
import type { SavedLocation } from '@/components/location/types';
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
type PaymentMethod = 'full_online' | 'full_cash' | 'split_payment';

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
  const membersSummary = sessionCart.members_summary;
  const totalItems = membersSummary.reduce((sum, m) => sum + m.items.length, 0);

  const [location, setLocation] = useState<SavedLocation | null>(null);
  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>('pickup');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('full_cash');
  const [error, setError] = useState<string | null>(null);
  const [orderNotes, setOrderNotes] = useState('');
  const [checkoutPreview, setCheckoutPreview] = useState<CheckoutPreviewResponse | null>(null);

  const { execute: previewDeliveryExecute, isExecuting: isPreviewingDelivery } =
    useAction(checkoutGroupPreviewDeliveryAction, {
      onSuccess: ({ data }) => {
        if (data?.data) {
          setCheckoutPreview(data.data);
          setError(null);
        } else {
          setCheckoutPreview(null);
          setError(data?.message || t('outOfDeliveryZone'));
        }
      },
      onError: ({ error }) => {
        setCheckoutPreview(null);
        setError(error.serverError?.message || t('outOfDeliveryZone'));
      },
    });

  const { execute: previewPickupExecute, isExecuting: isPreviewingPickup } =
    useAction(checkoutGroupPreviewPickupAction, {
      onSuccess: ({ data }) => {
        if (data?.data) {
          setCheckoutPreview(data.data);
          setError(null);
        } else {
          setCheckoutPreview(null);
          setError(data?.message || t('failedToFetchPreview'));
        }
      },
      onError: ({ error }) => {
        setCheckoutPreview(null);
        setError(error.serverError?.message || t('failedToFetchPreview'));
      },
    });

  const { execute: placeOrderExecute, isExecuting: isPlacingOrder } = useAction(
    checkoutGroupPayAction,
    {
      onSuccess: ({ data }) => {
        if (data?.data) {
          toast.success(data.message || t('orderPlaced'));
          if (data.data.payment_url) {
            router.push(data.data.payment_url);
          } else {
            router.push('/orders/active');
          }
        } else {
          setError(data?.message || t('failedToPlaceOrder'));
        }
      },
      onError: ({ error }) => {
        setError(error.serverError?.message || t('failedToPlaceOrder'));
      },
    },
  );

  useEffect(() => {
    setError(null);
    if (fulfillmentType === 'delivery') {
      if (location) {
        previewDeliveryExecute({
          group_order_id: sessionId,
          order_type: 'delivery',
          lat: Number(location.lat),
          long: Number(location.lng),
        });
      } else {
        setCheckoutPreview(null);
      }
    } else {
      previewPickupExecute({
        group_order_id: sessionId,
        order_type: 'pickup',
      });
    }
  }, [fulfillmentType, location, previewDeliveryExecute, previewPickupExecute, sessionId]);

  const summary = useMemo(() => {
    if (checkoutPreview) {
      return {
        subtotal: checkoutPreview.financials.subtotal,
        deliveryFee: checkoutPreview.financials.delivery_fee,
        serviceFee: checkoutPreview.financials.service_fee,
        discountAmount: checkoutPreview.financials.discount_amount,
        pointsRedeemed: checkoutPreview.financials.points_redeemed,
        total: checkoutPreview.financials.total,
        requiresDeposit: checkoutPreview.deposit_rules.requires_deposit,
        depositAmount: checkoutPreview.deposit_rules.deposit_amount,
        remainingAmount: checkoutPreview.deposit_rules.remaining_amount,
      };
    }
    return {
      subtotal: sessionCart.total_amount,
      deliveryFee: 0,
      serviceFee: 0,
      discountAmount: 0,
      pointsRedeemed: 0,
      total: sessionCart.total_amount,
      requiresDeposit: false,
      depositAmount: 0,
      remainingAmount: 0,
    };
  }, [checkoutPreview, sessionCart.total_amount]);

  useEffect(() => {
    if (summary.requiresDeposit && paymentMethod === 'full_cash') {
      setPaymentMethod('split_payment');
    } else if (!summary.requiresDeposit && paymentMethod === 'split_payment') {
      setPaymentMethod('full_cash');
    }
  }, [summary.requiresDeposit, paymentMethod]);

  if (totalItems === 0) {
    return (
      <div className="container mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold">{t('yourCartIsEmpty')}</h1>
        <p className="mt-2 text-muted-foreground">{t('emptyCartDesc')}</p>
        <Button asChild className="mt-6">
          <Link href={`/group-order/${sessionId}`}>Back to group order</Link>
        </Button>
      </div>
    );
  }

  if (!isHost) {
    return (
      <div className="container mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="mt-2 text-muted-foreground">{t('subtitle', { restaurant: sessionCart.restaurant.name })}</p>
        <div className="mt-8 rounded-xl border bg-muted/30 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Waiting for the host ({sessionCart.host.name}) to finalize the order.
          </p>
        </div>
      </div>
    );
  }

  const disabledCondition =
    isPreviewingDelivery || isPreviewingPickup || isPlacingOrder || !!error;

  const handlePlaceOrder = () => {
    setError(null);

    if (fulfillmentType === 'delivery') {
      if (!location) {
        setError(t('noAddressForDelivery'));
        return;
      }
      placeOrderExecute({
        group_order_id: sessionId,
        order_type: 'delivery',
        lat: Number(location.lat),
        long: Number(location.lng),
        payment_option_id: paymentMethod,
        notes: orderNotes || undefined,
      });
    } else {
      placeOrderExecute({
        group_order_id: sessionId,
        order_type: 'pickup',
        payment_option_id: paymentMethod,
        notes: orderNotes || undefined,
      });
    }
  };

  return (
    <div className="container mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="mt-1 text-muted-foreground">
          {t('subtitle', { restaurant: sessionCart.restaurant.name })}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('deliveryOptions')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-1 rounded-lg border bg-muted/40 p-1">
                {([
                  { value: 'pickup', label: t('pickup'), icon: ShoppingBag },
                  { value: 'delivery', label: t('delivery'), icon: Bike },
                ] as { value: FulfillmentType; label: string; icon: typeof Bike }[]).map(
                  (option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setFulfillmentType(option.value);
                          setCheckoutPreview(null);
                        }}
                        className={cn(
                          'flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition',
                          fulfillmentType === option.value
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground',
                        )}
                      >
                        <Icon className="size-4" />
                        {option.label}
                      </button>
                    );
                  },
                )}
              </div>
            </CardContent>
          </Card>

          {fulfillmentType === 'delivery' && (
            <CheckoutDeliveryAddress
              location={location}
              onLocationChange={setLocation}
            />
          )}

          {fulfillmentType === 'delivery' && error && (
            <div className="animate-in fade-in slide-in-from-top-1 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-destructive duration-200">
              <AlertCircle className="mt-0.5 size-5 shrink-0" />
              <div>
                <h4 className="text-sm font-semibold">{t('deliveryAreaRestriction')}</h4>
                <p className="mt-1 text-sm opacity-90">{error}</p>
              </div>
            </div>
          )}

          {fulfillmentType === 'pickup' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('pickupLocation')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{t('pickupFrom')}</p>
                <p className="mt-1 font-medium">{sessionCart.restaurant.name}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('orderNotes')}</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                placeholder={t('orderNotesPlaceholder')}
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="flex min-h-[80px] w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('paymentMethod')}</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                className="space-y-3"
              >
                <div
                  className={cn(
                    'flex items-center gap-3 rounded-lg border p-4 transition-all duration-200',
                    summary.requiresDeposit
                      ? 'bg-muted/30 opacity-60'
                      : paymentMethod === 'full_cash'
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'hover:bg-muted/50',
                  )}
                >
                  <RadioGroupItem
                    value="full_cash"
                    id="payment-full-cash"
                    disabled={summary.requiresDeposit}
                  />
                  <Label
                    htmlFor="payment-full-cash"
                    className={cn(
                      'flex flex-1 cursor-pointer items-center gap-3 font-normal',
                      summary.requiresDeposit && 'cursor-not-allowed',
                    )}
                  >
                    <Wallet className="size-5 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-foreground">{t('fullCashOnDelivery')}</p>
                        {summary.requiresDeposit && (
                          <span className="rounded bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
                            {t('unavailable')}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {summary.requiresDeposit ? t('depositRequired') : t('fullCashDesc')}
                      </p>
                    </div>
                  </Label>
                </div>

                <div
                  className={cn(
                    'flex items-center gap-3 rounded-lg border p-4 transition-all duration-200',
                    paymentMethod === 'full_online'
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'hover:bg-muted/50',
                  )}
                >
                  <RadioGroupItem value="full_online" id="payment-full-online" />
                  <Label
                    htmlFor="payment-full-online"
                    className="flex flex-1 cursor-pointer items-center gap-3 font-normal"
                  >
                    <CreditCard className="size-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{t('payFullOnline')}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {t('payFullOnlineDesc', { total: summary.total.toFixed(2) })}
                      </p>
                    </div>
                  </Label>
                </div>

                {summary.requiresDeposit && (
                  <div
                    className={cn(
                      'flex items-center gap-3 rounded-lg border p-4 transition-all duration-200',
                      paymentMethod === 'split_payment'
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'hover:bg-muted/50',
                    )}
                  >
                    <RadioGroupItem value="split_payment" id="payment-split-payment" />
                    <Label
                      htmlFor="payment-split-payment"
                      className="flex flex-1 cursor-pointer items-center gap-3 font-normal"
                    >
                      <Coins className="size-5 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-foreground">{t('splitPayment')}</p>
                          <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                            {t('recommended')}
                          </span>
                        </div>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {t('splitPaymentDesc', {
                            deposit: summary.depositAmount.toFixed(2),
                            remaining: summary.remainingAmount.toFixed(2),
                          })}
                        </p>
                      </div>
                    </Label>
                  </div>
                )}
              </RadioGroup>
            </CardContent>
          </Card>

          {error && !fulfillmentType && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button
            type="button"
            size="lg"
            className="w-full sm:w-auto"
            onClick={handlePlaceOrder}
            disabled={disabledCondition}
          >
            {isPlacingOrder ? (
              t('placingOrder')
            ) : (
              <>
                {paymentMethod === 'split_payment'
                  ? `${t('payDeposit')} · ${summary.depositAmount.toFixed(2)} EGP`
                  : paymentMethod === 'full_online'
                    ? `${t('payNow')} · ${summary.total.toFixed(2)} EGP`
                    : `${t('placeOrder')} · ${summary.total.toFixed(2)} EGP`}
              </>
            )}
          </Button>
        </div>

        <Card className="sticky top-20 h-fit">
          <CardHeader>
            <CardTitle className="text-base">{t('groupOrderSummary')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div>
                <p className="text-base font-semibold">{sessionCart.restaurant.name}</p>
                <p className="text-xs capitalize text-muted-foreground">{fulfillmentType}</p>
              </div>
            </div>

            <Separator />

            <div className="max-h-64 space-y-4 overflow-y-auto">
              {membersSummary.map((member) => {
                const memberTotal = getMemberTotal(member);
                return (
                  <div key={member.user.id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{member.user.name}</span>
                      <span className="text-muted-foreground">
                        {memberTotal.toFixed(2)} EGP
                      </span>
                    </div>
                    <div className="space-y-1.5 pl-2">
                      {member.items.map((item) => (
                        <div key={item.id} className="flex justify-between gap-2 text-xs text-muted-foreground">
                          <span className="truncate">
                            {item.quantity}x {item.item.title}
                          </span>
                          <span className="shrink-0">
                            {item.total_price.toFixed(2)} EGP
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
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
              {summary.discountAmount > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <dt className="flex items-center gap-1.5">
                    {t('discount')}
                    <span className="text-xs font-normal text-muted-foreground">
                      ({t('pointsRedeemed', { count: summary.pointsRedeemed })})
                    </span>
                  </dt>
                  <dd className="font-medium">-{summary.discountAmount.toFixed(2)} EGP</dd>
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
      </div>
    </div>
  );
}
