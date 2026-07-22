import type { CartItem, CartSummary } from '@/lib/const-data';
import { groupCartItemsByUser } from '@/utils/cart-grouping';
import { Separator } from '@/components/ui/separator';

type Props = {
  items: CartItem[];
  summary: CartSummary;
};

export default function GroupCartTotals({ items, summary }: Props) {
  const userGroups = groupCartItemsByUser(items);

  return (
    <div className="space-y-3 text-sm">
      <div className="space-y-2">
        <p className="font-medium">By member</p>
        {userGroups.map((group) => (
          <div key={group.key} className="flex justify-between">
            <span className="text-muted-foreground">{group.name}</span>
            <span>{group.subtotal.toFixed(2)} EGP</span>
          </div>
        ))}
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{summary.subtotal.toFixed(2)} EGP</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Delivery fee</span>
          <span>{summary.deliveryFee.toFixed(2)} EGP</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tax</span>
          <span>{summary.tax.toFixed(2)} EGP</span>
        </div>
        {summary.discount > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Discount
              {summary.appliedRedemptionTitle
                ? ` (${summary.appliedRedemptionTitle})`
                : ''}
            </span>
            <span>-{summary.discount.toFixed(2)} EGP</span>
          </div>
        )}
      </div>

      <Separator />

      <div className="flex justify-between text-base font-semibold">
        <span>Total</span>
        <span>{summary.total.toFixed(2)} EGP</span>
      </div>
    </div>
  );
}

