import type { CartSummary } from '@/types/cart/cart';
import { Separator } from '@/components/ui/separator';

type Props = {
  summary: CartSummary;
};

export default function CartTotals({ summary }: Props) {
  return (
    <div className="space-y-2 text-sm">
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
      <Separator />
      <div className="flex justify-between text-base font-semibold">
        <span>Total</span>
        <span>{summary.total.toFixed(2)} EGP</span>
      </div>
    </div>
  );
}
