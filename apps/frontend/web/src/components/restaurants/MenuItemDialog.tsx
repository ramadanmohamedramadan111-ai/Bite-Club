'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCartStore } from '@/lib/const-data';
import MenuItemCustomizer, { type OrderingContext } from './MenuItemCustomizer';
import type {
  ClientMenuItem,
  RestaurantType,
} from '@/types/restaurant/restaurant';

type Props = {
  item: ClientMenuItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurant: RestaurantType;
  orderingContext?: OrderingContext;
  isAuthenticated: boolean;
};

export default function MenuItemDialog({
  restaurant,
  item,
  open,
  onOpenChange,
  orderingContext = 'restaurant',
  isAuthenticated,
}: Props) {
  const cart = useCartStore((state) => state.cart);
  const cartType =
    orderingContext === 'group-order' &&
    cart?.type === 'group' &&
    cart.restaurantId === String(restaurant.id)
      ? 'group'
      : 'individual';

  if (!item) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{item.name}</DialogTitle>
        </DialogHeader>
        <MenuItemCustomizer
          key={item.id}
          item={item}
          variant="dialog"
          restaurant={restaurant}
          cartType={cartType}
          orderingContext={orderingContext}
          onAddToCart={() => onOpenChange(false)}
          isAuthenticated={isAuthenticated}
        />
      </DialogContent>
    </Dialog>
  );
}

