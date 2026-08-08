'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Bike,
  CreditCard,
  ShoppingBag,
  Wallet,
  AlertCircle,
  Coins,
  Check,
} from 'lucide-react';

import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useCartStore } from '@/stores/cart';
import { useAuthStore } from '@/stores/auth';
import { useGamificationStore } from '@/stores/gamification';
import type { SavedLocation } from '@/components/location/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { Link } from '@/i18n/navigation';
import CheckoutDeliveryAddress from './CheckoutDeliveryAddress';
import OrderSummary from './OrderSummary';
import { useAction } from 'next-safe-action/hooks';
import {
  checkoutPreviewDeliveryAction,
  checkoutPreviewPickupAction,
  checkoutPayAction,
} from '@/actions/checkout';
import { clearIndividualCartAction } from '@/actions/cart';
import { toast } from 'sonner';
import { CheckoutPreviewResponse } from '@/types/checkout';
import { RestaurantType } from '@/types/restaurant';
import { ApiResponse } from '@/types/api';
import { useQuery } from '@tanstack/react-query';
import { clientFetch } from '@/utils/client-fetch';

type FulfillmentType = 'delivery' | 'pickup';
type PaymentMethod = 'full_online' | 'full_cash' | 'split_payment';

type Props = {
  initialLocation: SavedLocation | null;
};

function getDefaultFulfillment(
  delivery: boolean,
  pickup: boolean,
): FulfillmentType {
  if (delivery) return 'delivery';
  if (pickup) return 'pickup';
  return 'delivery';
}

export default function CheckoutView({ initialLocation }: Props) {
  const router = useRouter();
  const cart = useCartStore((state) => state.cart);
  const clearCart = useCartStore((state) => state.clearCart);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [location, setLocation] = useState<SavedLocation | null>(
    initialLocation,
  );
  const [fulfillmentType, setFulfillmentType] =
    useState<FulfillmentType>('delivery');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/checkout');
    }
  }, [isAuthenticated, router]);
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>('full_cash');
  const [error, setError] = useState<string | null>(null);
  const [orderNotes, setOrderNotes] = useState('');
  const [pointsInput, setPointsInput] = useState('');
  const [appliedPoints, setAppliedPoints] = useState<number | null>(null);
  const wallet = useGamificationStore((s) => s.wallet);
  const t = useTranslations('checkout');
  const tc = useTranslations('common');

  const { data: restaurantResponse, isPending: isLoadingRestaurant } = useQuery(
    {
      queryKey: ['restaurant-details', cart?.restaurant?.id],
      enabled: !!cart?.restaurant?.id,
      queryFn: () =>
        clientFetch<ApiResponse<RestaurantType>>(
          `/api/restaurants/${cart?.restaurant?.id}`,
        ),
    },
  );

  const restaurant = restaurantResponse?.data || null;

  const [checkoutPreview, setCheckoutPreview] =
    useState<CheckoutPreviewResponse | null>(null);

  const { execute: previewDeliveryExecute, isExecuting: isPreviewingDelivery } =
    useAction(checkoutPreviewDeliveryAction, {
      onSuccess: ({ data }) => {
        if (data?.success && data.data) {
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
    useAction(checkoutPreviewPickupAction, {
      onSuccess: ({ data }) => {
        if (data?.success && data.data) {
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

  const { execute: clearCartExecute, isExecuting: isClearingCart } = useAction(
    clearIndividualCartAction,
    {
      onSuccess: () => {
        clearCart();
      },
    },
  );

  const { execute: placeOrderExecute, isExecuting: isPlacingOrder } = useAction(
    checkoutPayAction,
    {
      onSuccess: ({ data }) => {
        if (data?.success && data.data) {
          const requiresOnlinePayment =
            paymentMethod === 'full_online' || paymentMethod === 'split_payment';
          if (requiresOnlinePayment && !data.data.payment_url) {
            setError(t('onlinePaymentNotActivated'));
            return;
          }
          if (data.data.payment_url) {
            window.location.href = data.data.payment_url;
          } else {
            clearCart();
            toast.success(data.message || t('orderPlaced'));
            router.push(`/orders/${data.data.order_id}`);
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
    if (!restaurant) return;
    setFulfillmentType(
      getDefaultFulfillment(
        restaurant.delivery_enabled,
        restaurant.pickup_enabled,
      ),
    );
  }, [restaurant]);

  useEffect(() => {
    setError(null);

    if (fulfillmentType === 'delivery') {
      if (location) {
        previewDeliveryExecute({
          order_type: 'delivery',
          lat: Number(location.lat),
          long: Number(location.lng),
          points: appliedPoints ?? undefined,
        });
      } else {
        setCheckoutPreview(null);
      }
    } else if (fulfillmentType === 'pickup') {
      previewPickupExecute({
        order_type: 'pickup',
        points: appliedPoints ?? undefined,
      });
    }
  }, [
    fulfillmentType,
    location,
    appliedPoints,
    previewDeliveryExecute,
    previewPickupExecute,
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
      subtotal: cart?.subtotal || 0,
      deliveryFee: 0,
      serviceFee: 0,
      discountAmount: 0,
      pointsRedeemed: 0,
      total: cart?.subtotal || 0,
      requiresDeposit: false,
      depositAmount: 0,
      remainingAmount: 0,
    };
  }, [cart, checkoutPreview]);

  useEffect(() => {
    if (summary.requiresDeposit) {
      if (paymentMethod === 'full_cash') {
        setPaymentMethod('split_payment');
      }
    } else {
      if (paymentMethod === 'split_payment') {
        setPaymentMethod('full_cash');
      }
    }
  }, [summary.requiresDeposit, paymentMethod]);

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold">{t('yourCartIsEmpty')}</h1>
        <p className="mt-2 text-muted-foreground">{t('emptyCartDesc')}</p>
        <Button asChild className="mt-6 rounded-xl">
          <Link href="/restaurants">{tc('browseRestaurants')}</Link>
        </Button>
      </div>
    );
  }

  if (isLoadingRestaurant) {
    return (
      <div className="container mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center text-center">
        <h1 className="text-xl font-medium">{t('loading')}</h1>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="container mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold">{t('restaurantNotFound')}</h1>
        <p className="mt-2 text-muted-foreground">
          {t('restaurantNotFoundDesc')}
        </p>
        <Button asChild className="mt-6 rounded-xl">
          <Link href="/restaurants">{tc('browseRestaurants')}</Link>
        </Button>
      </div>
    );
  }

  const fulfillmentOptions: {
    value: FulfillmentType;
    label: string;
    icon: typeof Bike;
    disabled: boolean;
  }[] = [
    {
      value: 'delivery',
      label: t('delivery'),
      icon: Bike,
      disabled: !restaurant.delivery_enabled,
    },
    {
      value: 'pickup',
      label: t('pickup'),
      icon: ShoppingBag,
      disabled: !restaurant.pickup_enabled,
    },
  ];

  const availableFulfillment = fulfillmentOptions.filter(
    (option) => !option.disabled,
  );

  const disabledCondition =
    isPreviewingDelivery ||
    isPreviewingPickup ||
    isClearingCart ||
    isLoadingRestaurant ||
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
        order_type: 'delivery',
        lat: Number(location.lat),
        long: Number(location.lng),
        payment_option_id: paymentMethod,
        notes: orderNotes || undefined,
        points: appliedPoints ?? undefined,
      });
    } else {
      placeOrderExecute({
        order_type: 'pickup',
        payment_option_id: paymentMethod,
        notes: orderNotes || undefined,
        points: appliedPoints ?? undefined,
      });
    }
  };

  return (
    <div className="container mx-auto space-y-8">
      {/* Title block with bottom accent line */}
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">{t('title')}</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {t('subtitle', { restaurant: cart.restaurant?.name || 'Restaurant' })}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          {availableFulfillment.length > 0 && (
            <Card>
              <CardHeader className="border-b border-border/30 pb-4">
                <CardTitle className="text-base font-bold">
                  {t('deliveryOptions')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5">
                <div className="grid grid-cols-2 gap-2 bg-muted/45 border border-border/40 p-1.5 rounded-2xl max-w-md">
                  {availableFulfillment.map((option) => {
                    const Icon = option.icon;
                    const isActive = fulfillmentType === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFulfillmentType(option.value)}
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
          )}

          {fulfillmentType === 'delivery' && (
            <CheckoutDeliveryAddress
              location={location}
              onLocationChange={setLocation}
            />
          )}

          {fulfillmentType === 'delivery' && error && (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 sm:p-5 text-destructive flex items-start gap-3 animate-in fade-in slide-in-from-top-1 duration-200 shadow-xs">
              <AlertCircle className="size-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">
                  {t('deliveryAreaRestriction')}
                </h4>
                <p className="text-xs sm:text-sm mt-1.5 opacity-90 leading-relaxed">{error}</p>
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
                  {restaurant.address || t('restaurantAddress')}
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
                className="flex min-h-[100px] w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-border/30 pb-4">
              <CardTitle className="text-base font-bold">{t('redeemPoints')}</CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              {appliedPoints !== null ? (
                <div className="flex items-center justify-between rounded-xl border border-green-500/25 bg-green-500/5 px-4 py-3.5 shadow-xs">
                  <div className="flex items-center gap-2">
                    <Check className="size-4.5 text-green-600" />
                    <span className="text-sm font-bold text-green-700 dark:text-green-400">
                      {t('pointsApplied', { count: appliedPoints })}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedPoints(null);
                      setPointsInput('');
                    }}
                    className="text-xs font-bold text-destructive hover:underline cursor-pointer">
                    {t('remove')}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    max={wallet?.balance ?? 0}
                    placeholder={t('pointsPlaceholder')}
                    value={pointsInput}
                    onChange={(e) => setPointsInput(e.target.value)}
                    className="flex h-10 w-full max-w-[240px] rounded-xl border border-input bg-transparent px-3.5 py-1.5 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                  <Button
                    type="button"
                    size="sm"
                    className="rounded-xl h-10 px-4 font-bold text-xs"
                    disabled={!pointsInput || Number(pointsInput) < 1}
                    onClick={() => {
                      const val = Math.floor(Number(pointsInput));
                      if (val > 0 && (!wallet || val <= wallet.balance)) {
                        setAppliedPoints(val);
                      }
                    }}>
                    {t('apply')}
                  </Button>
                </div>
              )}
              {wallet && appliedPoints === null && (
                <p className="text-xs text-muted-foreground">
                  {t('availableBalance', {
                    balance: wallet.balance.toLocaleString(),
                  })}
                </p>
              )}
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
                      ? 'opacity-65 bg-muted/40 border-border/40 cursor-not-allowed'
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
                      'flex flex-1 items-start gap-3.5 font-normal cursor-pointer select-none',
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

          {error && <p className="text-sm text-destructive font-semibold">{error}</p>}

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

        <OrderSummary
          cart={cart}
          summary={summary}
          fulfillmentType={fulfillmentType}
          isLoading={isPreviewingDelivery || isPreviewingPickup || !checkoutPreview}
          hasLocation={!!location}
        />
      </div>
    </div>
  );
}
