'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import MenuItemCustomizer from './MenuItemCustomizer';
import type { ClientMenuItem, RestaurantType } from '@/types/restaurant';

type Props = {
  item: ClientMenuItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurant: RestaurantType;
  isAuthenticated: boolean;
};

export default function MenuItemDialog({
  restaurant,
  item,
  open,
  onOpenChange,
  isAuthenticated,
}: Props) {
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
          onAddToCart={() => onOpenChange(false)}
          isAuthenticated={isAuthenticated}
        />
      </DialogContent>
    </Dialog>
  );
}

