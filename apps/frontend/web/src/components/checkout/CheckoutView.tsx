'use client';

import { useEffect, useMemo, useState } from 'react';
import { Bike, CreditCard, ShoppingBag, Wallet, AlertCircle } from 'lucide-react';

import { useRouter } from '@/i18n/navigation';
import { useCartStore } from '@/stores/cart';
import { useAuthStore } from '@/stores/auth';
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
} from '@/actions/checkout';
import { clearIndividualCartAction } from '@/actions/cart';
import { toast } from 'sonner';
import { CheckoutPreviewResponse } from '@/types/checkout/checkout';
import { RestaurantType } from '@/types/restaurant/restaurant';
import { ApiResponse } from '@/types/api/api-response';
import { useQuery } from '@tanstack/react-query';
import { clientFetch } from '@/utils/client-fetch';

type FulfillmentType = 'delivery' | 'pickup';
type PaymentMethod = 'cod' | 'visa';

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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [error, setError] = useState<string | null>(null);
  const [orderNotes, setOrderNotes] = useState('');


  const { data: restaurantResponse, isPending: isLoadingRestaurant } = useQuery({
    queryKey: ['restaurant-details', cart?.restaurant?.id],
    enabled: !!cart?.restaurant?.id,
    queryFn: () =>
      clientFetch<ApiResponse<RestaurantType>>(
        `/api/restaurants/${cart?.restaurant?.id}`,
      ),
  });


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
          setError(data?.message || 'Selected location is out of the delivery zone.');
        }
      },
      onError: ({ error }) => {
        setCheckoutPreview(null);
        setError(
          error.serverError?.message || 'Selected location is out of the delivery zone.',
        );
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
          setError(data?.message || 'Failed to fetch pickup preview.');
        }
      },
      onError: ({ error }) => {
        setCheckoutPreview(null);
        setError(
          error.serverError?.message || 'Failed to fetch pickup preview.',
        );
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
        });
      } else {
        setCheckoutPreview(null);
      }
    } else if (fulfillmentType === 'pickup') {
      previewPickupExecute({
        order_type: 'pickup',
      });
    }
  }, [
    fulfillmentType,
    location,
    previewDeliveryExecute,
    previewPickupExecute,
  ]);


  const summary = useMemo(() => {
    if (checkoutPreview) {
      return {
        subtotal: checkoutPreview.financials.subtotal,
        deliveryFee: checkoutPreview.financials.delivery_fee,
        serviceFee: checkoutPreview.financials.service_fee,
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
      total: cart?.subtotal || 0,
      requiresDeposit: false,
      depositAmount: 0,
      remainingAmount: 0,
    };
  }, [cart, checkoutPreview]);

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">
          Add items from a restaurant menu before checking out.
        </p>
        <Button asChild className="mt-6">
          <Link href="/restaurants">Browse restaurants</Link>
        </Button>
      </div>
    );
  }

  if (isLoadingRestaurant) {
    return (
      <div className="container mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center text-center">
        <h1 className="text-xl font-medium">Loading checkout details...</h1>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="container mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold">Restaurant not found</h1>
        <p className="mt-2 text-muted-foreground">
          We couldn&apos;t load details for this order.
        </p>
        <Button asChild className="mt-6">
          <Link href="/restaurants">Browse restaurants</Link>
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
      label: 'Delivery',
      icon: Bike,
      disabled: !restaurant.delivery_enabled,
    },
    {
      value: 'pickup',
      label: 'Pickup',
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
    !!error;



  const handlePlaceOrder = () => {
    setError(null);

    if (fulfillmentType === 'delivery' && !location) {
      setError('Please select a delivery address before placing your order.');
      return;
    }

    if (isAuthenticated) {
      clearCartExecute();
    } else {
      clearCart();
    }

    if (paymentMethod === 'visa') {
      router.push('/visa');
      return;
    }

    router.push('/restaurants');
  };

  return (
    <div className="container mx-auto space-y-8 ">
      <div>
        <h1 className="text-3xl font-bold">Checkout</h1>
        <p className="mt-1 text-muted-foreground">
          Complete your order from {cart.restaurant?.name || 'Restaurant'}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          {availableFulfillment.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Delivery Options</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-1 rounded-lg border bg-muted/40 p-1">
                  {availableFulfillment.map((option) => {
                    const Icon = option.icon;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFulfillmentType(option.value)}
                        className={cn(
                          'flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition',
                          fulfillmentType === option.value
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground',
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
            <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-destructive flex items-start gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
              <AlertCircle className="size-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">Delivery Area Restriction</h4>
                <p className="text-sm mt-1 opacity-90">{error}</p>
              </div>
            </div>
          )}


          {fulfillmentType === 'pickup' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Pickup Location</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Pick up your order from:
                </p>
                <p className="mt-1 font-medium">
                  {restaurant.address || 'Restaurant Address'}
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Order Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                placeholder="Add special instructions (e.g. gate code, floor number, cutlery preference)..."
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payment Method</CardTitle>

            </CardHeader>
            <CardContent>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(value) =>
                  setPaymentMethod(value as PaymentMethod)
                }
                className="space-y-3">
                <div className="flex items-center gap-3 rounded-lg border p-4">
                  <RadioGroupItem value="cod" id="payment-cod" />
                  <Label
                    htmlFor="payment-cod"
                    className="flex flex-1 cursor-pointer items-center gap-3 font-normal">
                    <Wallet className="size-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        On{' '}
                        {fulfillmentType === 'delivery' ? 'Delivery' : 'Pickup'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Pay with cash when you receive your order
                      </p>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center gap-3 rounded-lg border p-4">
                  <RadioGroupItem value="visa" id="payment-visa" />
                  <Label
                    htmlFor="payment-visa"
                    className="flex flex-1 cursor-pointer items-center gap-3 font-normal">
                    <CreditCard className="size-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Visa</p>
                      <p className="text-sm text-muted-foreground">
                        Pay securely with your card
                      </p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="button"
            size="lg"
            className="w-full sm:w-auto"
            onClick={handlePlaceOrder}
            disabled={disabledCondition}>
            Place order ·{' '}
            {summary.requiresDeposit
              ? summary.depositAmount.toFixed(2)
              : summary.total.toFixed(2)}{' '}
            EGP
          </Button>
        </div>

        <OrderSummary
          cart={cart}
          summary={summary}
          fulfillmentType={fulfillmentType}
        />
      </div>
    </div>
  );
}
