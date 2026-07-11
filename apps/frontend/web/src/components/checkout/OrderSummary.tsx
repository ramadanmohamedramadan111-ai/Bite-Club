import Image from 'next/image';
import type { Cart } from '@/types/cart/cart';
import { groupCartItemsByUser } from '@/utils/cart-grouping';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

type Summary = {
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
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
  const isGroupCart = cart.type === 'group';
  const userGroups = isGroupCart ? groupCartItemsByUser(cart.items) : [];

  return (
    <Card className="sticky top-20">
      <CardHeader>
        <CardTitle className="text-base">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          {cart.restaurantImage && (
            <div className="relative size-12 overflow-hidden rounded-lg">
              <Image
                src={cart.restaurantImage}
                alt={cart.restaurantName}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div>
            <p className="font-medium">{cart.restaurantName}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {isGroupCart ? 'Group order · ' : ''}
              {fulfillmentType}
            </p>
          </div>
        </div>

        <Separator />

        {isGroupCart ? (
          <div className="max-h-64 space-y-4 overflow-y-auto">
            {userGroups.map((group) => (
              <div key={group.key} className="space-y-2">
                <div className="flex items-center justify-between text-sm font-medium">
                  <span>{group.name}</span>
                  <span>{group.subtotal.toFixed(2)} EGP</span>
                </div>
                <div className="space-y-2 pl-2">
                  {group.items.map((item) => (
                    <div key={item.cartItemId} className="space-y-1 text-sm">
                      <div className="flex justify-between gap-3">
                        <span>
                          {item.quantity}x {item.name}
                        </span>
                        <span className="shrink-0 font-medium">
                          {item.totalPrice.toFixed(2)} EGP
                        </span>
                      </div>
                      {item.selectedOptions.length > 0 && (
                        <ul className="text-xs text-muted-foreground">
                          {item.selectedOptions.map((option) => (
                            <li key={option.optionId}>
                              {option.groupName}: {option.optionName}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="max-h-64 space-y-3 overflow-y-auto">
            {cart.items.map((item) => (
              <div key={item.cartItemId} className="space-y-1 text-sm">
                <div className="flex justify-between gap-3">
                  <span>
                    {item.quantity}x {item.name}
                  </span>
                  <span className="shrink-0 font-medium">
                    {item.totalPrice.toFixed(2)} EGP
                  </span>
                </div>
                {item.selectedOptions.length > 0 && (
                  <ul className="text-xs text-muted-foreground">
                    {item.selectedOptions.map((option) => (
                      <li key={option.optionId}>
                        {option.groupName}: {option.optionName}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        <Separator />

        {isGroupCart && (
          <>
            <dl className="space-y-2 text-sm">
              <p className="font-medium">By member</p>
              {userGroups.map((group) => (
                <div key={group.key} className="flex justify-between">
                  <dt className="text-muted-foreground">{group.name}</dt>
                  <dd>{group.subtotal.toFixed(2)} EGP</dd>
                </div>
              ))}
            </dl>
            <Separator />
          </>
        )}

        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd>{summary.subtotal.toFixed(2)} EGP</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Delivery fee</dt>
            <dd>{summary.deliveryFee.toFixed(2)} EGP</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Tax</dt>
            <dd>{summary.tax.toFixed(2)} EGP</dd>
          </div>
          {summary.discount > 0 && (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Discount</dt>
              <dd>-{summary.discount.toFixed(2)} EGP</dd>
            </div>
          )}
        </dl>

        <Separator />

        <div className="flex justify-between text-base font-semibold">
          <span>Total</span>
          <span>{summary.total.toFixed(2)} EGP</span>
        </div>
      </CardContent>
    </Card>
  );
}
