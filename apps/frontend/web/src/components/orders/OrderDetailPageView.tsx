'use client';

import Image from 'next/image';
import { ArrowLeft, CreditCard, MapPin, ShoppingBag, Wallet } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Order } from '@/types/orders/order';
import { OrderStatusBadge } from './OrderStatusBadge';
import OrderLocationMap from './OrderLocationMap';
import { useReorderOrder } from '@/hooks/use-reorder-order';
import { getRestaurantById } from '@/data/restaurant-details';

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

function paymentLabel(method: Order['paymentMethod'], fulfillment: Order['fulfillmentType']) {
  if (method === 'visa') return 'Visa / Card';
  return fulfillment === 'delivery' ? 'Cash on delivery' : 'Cash on pickup';
}

export default function OrderDetailPageView({ order }: { order: Order }) {
  const { requestReorder, reorderDialog } = useReorderOrder();
  const restaurant = getRestaurantById(Number(order.restaurantId));
  const mapLocation =
    order.fulfillmentType === 'delivery' && order.deliveryLocation
      ? order.deliveryLocation
      : order.restaurantLocation;

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
            <h1 className="text-3xl font-bold">Order {order.orderNumber}</h1>
            <p className="mt-1 text-muted-foreground">
              {formatOrderDate(order.orderedAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <OrderStatusBadge status={order.status} />
          <Button onClick={() => requestReorder(order)}>Reorder</Button>
        </div>
      </div>

      <div className="mx-auto grid max-w-4xl gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              <span className="rounded-md bg-secondary px-2 py-0.5 capitalize">
                {order.type} order
              </span>
              <span className="rounded-md bg-secondary px-2 py-0.5 capitalize">
                {order.fulfillmentType}
              </span>
            </div>

            {order.type === 'group' && order.groupMembers ? (
              <div className="space-y-4">
                {order.groupMembers.map((member) => (
                  <div key={member.memberName} className="space-y-2">
                    <p className="text-sm font-medium">{member.memberName}</p>
                    {member.items.map((item) => (
                      <div
                        key={`${member.memberName}-${item.id}`}
                        className="flex justify-between text-sm"
                      >
                        <span>
                          {item.quantity}x {item.name}
                        </span>
                        <span>{item.price * item.quantity} EGP</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.quantity}x {item.name}
                    </span>
                    <span>{item.price * item.quantity} EGP</span>
                  </div>
                ))}
              </div>
            )}

            <Separator />

            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{order.subtotal} EGP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery fee</span>
                <span>{order.deliveryFee} EGP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>{order.tax} EGP</span>
              </div>
              <div className="flex justify-between pt-1 text-base font-semibold">
                <span>Total</span>
                <span>{order.total} EGP</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Restaurant</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="relative h-14 w-14 overflow-hidden rounded-lg">
                <Image
                  src={order.restaurantImage}
                  alt={order.restaurantName}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-medium">{order.restaurantName}</p>
                <p className="text-sm text-muted-foreground">
                  {order.restaurantAddress}
                </p>
              </div>
            </div>
            {restaurant && (
              <Link href={`/restaurants/${restaurant.id}`}>
                <Button variant="outline" size="sm">
                  View restaurant
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {order.fulfillmentType === 'delivery'
                ? 'Delivery location'
                : 'Pickup location'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                {order.fulfillmentType === 'delivery'
                  ? order.deliveryAddress
                  : order.restaurantAddress}
              </span>
            </div>
            <OrderLocationMap location={mapLocation} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm">
              {order.paymentMethod === 'visa' ? (
                <CreditCard className="h-4 w-4" />
              ) : order.fulfillmentType === 'delivery' ? (
                <Wallet className="h-4 w-4" />
              ) : (
                <ShoppingBag className="h-4 w-4" />
              )}
              <span>{paymentLabel(order.paymentMethod, order.fulfillmentType)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {reorderDialog}
    </div>
  );
}
