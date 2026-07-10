'use client';

import { useEffect, useMemo, useState } from 'react';
import { Bike, CreditCard, ShoppingBag, Wallet } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import { getRestaurantById } from '@/data/restaurant-details';
import { useCartStore } from '@/stores/cart';
import type { SavedLocation } from '@/components/location/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { Link } from '@/i18n/navigation';
import CheckoutDeliveryAddress from './CheckoutDeliveryAddress';
import OrderSummary from './OrderSummary';

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
  const [location, setLocation] = useState<SavedLocation | null>(
    initialLocation,
  );
  const [fulfillmentType, setFulfillmentType] =
    useState<FulfillmentType>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [error, setError] = useState<string | null>(null);

  const restaurant = useMemo(() => {
    if (!cart) return undefined;
    return getRestaurantById(Number(cart.restaurantId));
  }, [cart]);

  useEffect(() => {
    if (!restaurant) return;
    setFulfillmentType(
      getDefaultFulfillment(restaurant.delivery, restaurant.pickup),
    );
  }, [restaurant]);

  const summary = useMemo(() => {
    if (!cart) {
      return {
        subtotal: 0,
        deliveryFee: 0,
        tax: 0,
        discount: 0,
        total: 0,
      };
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.totalPrice,
      0,
    );

    const deliveryFee =
      fulfillmentType === 'delivery'
        ? cart.restaurantDeliveryFee ?? restaurant?.minDeliveryPrice ?? 0
        : 0;

    const tax = 3;
    const discount = 0;

    return {
      subtotal,
      deliveryFee,
      tax,
      discount,
      total: subtotal + deliveryFee + tax - discount,
    };
  }, [cart, fulfillmentType, restaurant]);

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center text-center">
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

  if (!restaurant) {
    return (
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center text-center">
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
      disabled: !restaurant.delivery,
    },
    {
      value: 'pickup',
      label: 'Pickup',
      icon: ShoppingBag,
      disabled: !restaurant.pickup,
    },
  ];

  const availableFulfillment = fulfillmentOptions.filter(
    (option) => !option.disabled,
  );

  const handlePlaceOrder = () => {
    setError(null);

    if (fulfillmentType === 'delivery' && !location) {
      setError('Please select a delivery address before placing your order.');
      return;
    }

    if (paymentMethod === 'visa') {
      router.push('/visa');
      return;
    }

    // Cash on delivery/pickup — placeholder for future order submission
    router.push('/restaurants');
  };

  return (
    <div className="container mx-auto space-y-8 ">
      <div>
        <h1 className="text-3xl font-bold">Checkout</h1>
        <p className="mt-1 text-muted-foreground">
          Complete your order from {cart.restaurantName}
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
                  {restaurant.location.address}
                </p>
              </CardContent>
            </Card>
          )}

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
                        On {fulfillmentType === 'delivery' ? 'Delivery' : 'Pickup'}
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

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button
            type="button"
            size="lg"
            className="w-full sm:w-auto"
            onClick={handlePlaceOrder}>
            Place order · {summary.total.toFixed(2)} EGP
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
