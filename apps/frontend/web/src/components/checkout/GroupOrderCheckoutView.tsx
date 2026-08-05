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
import { getSavedLocation } from '@/utils/map';
import { Spinner } from '@/components/ui/spinner';
import {
  checkoutGroupPreviewDeliveryAction,
  checkoutGroupPreviewPickupAction,
  checkoutGroupPayAction,
} from '@/actions/group-order';
import type { GroupOrderCartSession } from '@/types/group-order';
import type { CheckoutPreviewResponse } from '@/types/checkout';
import { Link } from '@/i18n/navigation';

type Props = {
  sessionId: number;
  sessionCart: GroupOrderCartSession;
  currentUserId: number | null;
};

type FulfillmentType = 'delivery' | 'pickup';
type PaymentMethod = 'full_online' | 'full_cash' | 'split_payment';

function getMemberTotal(
  member: GroupOrderCartSession['members_summary'][number],
): number {
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
  const isHost =
    currentUserId !== null && sessionCart.host.id === currentUserId;
  const membersSummary = sessionCart.members_summary;
  const totalItems = membersSummary.reduce((sum, m) => sum + m.items.length, 0);

  const [location, setLocation] = useState<SavedLocation | null>(() => {
    if (typeof window !== 'undefined') {
      return getSavedLocation();
    }
    return null;
  });
  const [fulfillmentType, setFulfillmentType] =
    useState<FulfillmentType>('pickup');
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>('full_cash');
  const [error, setError] = useState<string | null>(null);
  const [orderNotes, setOrderNotes] = useState('');
  const [checkoutPreview, setCheckoutPreview] =
    useState<CheckoutPreviewResponse | null>(null);

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
            router.push(`/group-order/${sessionId}/details`);
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
  }, [
    fulfillmentType,
    location,
    previewDeliveryExecute,
    previewPickupExecute,
    sessionId,
  ]);

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
        <Button asChild className="mt-6 rounded-xl">
          <Link href={`/group-order/${sessionId}`}>Back to group order</Link>
        </Button>
      </div>
    );
  }

  if (!isHost) {
    return (
      <div className="container mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{t('title')}</h1>
        <p className="mt-2 text-muted-foreground">
          {t('subtitle', { restaurant: sessionCart.restaurant.name })}
        </p>
        <div className="mt-8 rounded-2xl border border-border/40 bg-card p-6 shadow-xs select-none">
          <p className="text-sm text-muted-foreground font-medium">
            Waiting for the host ({sessionCart.host.name}) to finalize the
            order.
          </p>
        </div>
      </div>
    );
  }

  const disabledCondition =
    isPreviewingDelivery ||
    isPreviewingPickup ||
    isPlacingOrder ||
    !checkoutPreview ||
    !!error;

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
      {/* Title Header with bottom accent line */}
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">{t('title')}</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {t('subtitle', { restaurant: sessionCart.restaurant.name })}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b border-border/30 pb-4">
              <CardTitle className="text-base font-bold">
                {t('deliveryOptions')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="grid grid-cols-2 gap-2 bg-muted/45 border border-border/40 p-1.5 rounded-2xl max-w-md">
                {(
                  [
                    { value: 'pickup', label: t('pickup'), icon: ShoppingBag },
                    { value: 'delivery', label: t('delivery'), icon: Bike },
                  ] as {
                    value: FulfillmentType;
                    label: string;
                    icon: typeof Bike;
                  }[]
                ).map((option) => {
                  const Icon = option.icon;
                  const isActive = fulfillmentType === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setFulfillmentType(option.value);
                        setCheckoutPreview(null);
                      }}
                      className={cn(
                        'flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-sm font-bold transition-all duration-300 cursor-pointer shadow-xs select-none',
                        isActive
                          ? 'bg-background border border-border/30 text-primary shadow-xs'
                          : 'text-muted-foreground hover:bg-background/40 hover:text-foreground',
                      )}>
                      <Icon className="size-4" />
                      {option.label}
                    </button>
                  );
                })}
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
            <div className="animate-in fade-in slide-in-from-top-1 flex items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/10 p-4 sm:p-5 text-destructive duration-200 shadow-xs">
              <AlertCircle className="mt-0.5 size-5 shrink-0" />
              <div>
                <h4 className="text-sm font-bold">
                  {t('deliveryAreaRestriction')}
                </h4>
                <p className="mt-1.5 text-xs sm:text-sm opacity-90 leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {fulfillmentType === 'pickup' && (
            <Card>
              <CardHeader className="border-b border-border/30 pb-4">
                <CardTitle className="text-base font-bold">
                  {t('pickupLocation')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5">
                <p className="text-sm text-muted-foreground">
                  {t('pickupFrom')}
                </p>
                <p className="mt-1 font-bold text-foreground">
                  {sessionCart.restaurant.name}
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="border-b border-border/30 pb-4">
              <CardTitle className="text-base font-bold">{t('orderNotes')}</CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <textarea
                placeholder={t('orderNotesPlaceholder')}
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="flex min-h-[100px] w-full resize-none rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-border/30 pb-4">
              <CardTitle className="text-base font-bold">{t('paymentMethod')}</CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <RadioGroup
                value={paymentMethod}
                onValueChange={(value) =>
                  setPaymentMethod(value as PaymentMethod)
                }
                className="space-y-3.5">
                
                {/* Full Cash Payment */}
                <div
                  className={cn(
                    'flex items-center gap-3 rounded-2xl border p-4.5 transition-all duration-300 shadow-xs cursor-pointer',
                    summary.requiresDeposit
                      ? 'bg-muted/40 opacity-65 border-border/40 cursor-not-allowed'
                      : paymentMethod === 'full_cash'
                        ? 'border-primary bg-primary/5 shadow-xs'
                        : 'border-border/60 hover:border-border hover:bg-muted/30',
                  )}>
                  <RadioGroupItem
                    value="full_cash"
                    id="payment-full-cash"
                    disabled={summary.requiresDeposit}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="payment-full-cash"
                    className={cn(
                      'flex flex-1 cursor-pointer items-start gap-3.5 font-normal select-none',
                      summary.requiresDeposit && 'cursor-not-allowed',
                    )}>
                    <Wallet className={cn("size-5 mt-0.5", paymentMethod === 'full_cash' ? "text-primary" : "text-muted-foreground")} />
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-foreground">
                          {t('fullCashOnDelivery')}
                        </p>
                        {summary.requiresDeposit && (
                          <span className="rounded bg-destructive/10 px-2 py-0.5 text-3xs font-bold text-destructive border border-destructive/20">
                            {t('unavailable')}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {summary.requiresDeposit
                          ? t('depositRequired')
                          : t('fullCashDesc')}
                      </p>
                    </div>
                  </Label>
                </div>

                {/* Full Online Payment */}
                <div
                  className={cn(
                    'flex items-center gap-3 rounded-2xl border p-4.5 transition-all duration-300 shadow-xs cursor-pointer',
                    paymentMethod === 'full_online'
                      ? 'border-primary bg-primary/5 shadow-xs'
                      : 'border-border/60 hover:border-border hover:bg-muted/30',
                  )}>
                  <RadioGroupItem
                    value="full_online"
                    id="payment-full-online"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="payment-full-online"
                    className="flex flex-1 cursor-pointer items-start gap-3.5 font-normal select-none">
                    <CreditCard className={cn("size-5 mt-0.5", paymentMethod === 'full_online' ? "text-primary" : "text-muted-foreground")} />
                    <div className="flex-1 space-y-0.5">
                      <p className="font-bold text-foreground">
                        {t('payFullOnline')}
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {t('payFullOnlineDesc', {
                          total: summary.total.toFixed(2),
                        })}
                      </p>
                    </div>
                  </Label>
                </div>

                {/* Split Payment */}
                {summary.requiresDeposit && (
                  <div
                    className={cn(
                      'flex items-center gap-3 rounded-2xl border p-4.5 transition-all duration-300 shadow-xs cursor-pointer',
                      paymentMethod === 'split_payment'
                        ? 'border-primary bg-primary/5 shadow-xs'
                        : 'border-border/60 hover:border-border hover:bg-muted/30',
                    )}>
                    <RadioGroupItem
                      value="split_payment"
                      id="payment-split-payment"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="payment-split-payment"
                      className="flex flex-1 cursor-pointer items-start gap-3.5 font-normal select-none">
                      <Coins className={cn("size-5 mt-0.5", paymentMethod === 'split_payment' ? "text-primary" : "text-muted-foreground")} />
                      <div className="flex-1 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-foreground">
                            {t('splitPayment')}
                          </p>
                          <span className="rounded bg-primary/10 px-2 py-0.5 text-3xs font-bold text-primary border border-primary/20">
                            {t('recommended')}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
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
            <p className="text-sm text-destructive font-semibold">{error}</p>
          )}

          <Button
            type="button"
            size="lg"
            className="w-full sm:w-auto rounded-xl font-bold h-11 text-sm shadow-md cursor-pointer"
            onClick={handlePlaceOrder}
            disabled={disabledCondition}>
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

        <Card className="sticky top-24 h-fit">
          <CardHeader className="border-b border-border/30 pb-4">
            <CardTitle className="text-base font-bold">
              {t('groupOrderSummary')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-5">
            <div className="flex items-center gap-3">
              <div>
                <p className="text-base font-bold text-foreground leading-tight">
                  {sessionCart.restaurant.name}
                </p>
                <p className="text-xs capitalize text-muted-foreground mt-0.5">
                  {fulfillmentType}
                </p>
              </div>
            </div>

            <Separator />

            <div className="max-h-64 space-y-4 overflow-y-auto">
              {membersSummary.map((member) => {
                const memberTotal = getMemberTotal(member);
                return (
                  <div key={member.user.id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold text-foreground">{member.user.name}</span>
                      <span className="font-semibold text-muted-foreground text-xs">
                        {memberTotal.toFixed(2)} EGP
                      </span>
                    </div>
                    <div className="space-y-1.5 pl-2 border-l border-border/40 ml-1.5">
                      {member.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between gap-2 text-xs text-muted-foreground">
                          <span className="truncate">
                            {item.quantity}x {item.item.title}
                          </span>
                          <span className="shrink-0 font-medium">
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

            {isPreviewingDelivery || isPreviewingPickup || !checkoutPreview ? (
              <div className="py-6 flex flex-col items-center justify-center space-y-3 text-center">
                <Spinner className="size-6 text-primary" />
                <p className="text-xs text-muted-foreground">
                  {fulfillmentType === 'delivery' && !location
                    ? t('selectAddressToPreview') || 'Select a delivery address to calculate totals'
                    : t('calculatingTotals') || 'Calculating order totals...'}
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
                        <span className="text-xs font-normal text-muted-foreground">
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
      </div>
    </div>
  );
}
