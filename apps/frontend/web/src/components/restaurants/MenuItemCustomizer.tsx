'use client';

import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';

import ConfirmDialog from '@/components/shared/ConfirmationDialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/stores/cart';
import type {
  ClientMenuItem,
  RestaurantType,
} from '@/types/restaurant/restaurant';

import { Field, FieldLabel } from '../ui/field';
import { Input } from '../ui/input';
import { useAction } from 'next-safe-action/hooks';
import { addIndividualCartItemAction } from '@/actions/cart';
import { CartItem } from '@/types/cart/cart';

export type OrderingContext = 'group-order' | 'restaurant';

type Props = {
  item: ClientMenuItem;
  variant?: 'dialog' | 'page';
  onAddToCart?: () => void;
  cartType: 'individual' | 'group';
  orderingContext?: OrderingContext;
  restaurant: RestaurantType;
  isAuthenticated: boolean;
};

function calculateTotal(item: ClientMenuItem, quantity: number): number {
  const total = item.price;
  return total * quantity;
}

function isSelectionValid(item: ClientMenuItem): boolean {
  return item.available;
}

export default function MenuItemCustomizer({
  item,
  variant = 'dialog',
  restaurant,
  onAddToCart,
  cartType = 'individual',
  orderingContext = 'restaurant',
  isAuthenticated,
}: Props) {
  const t = useTranslations('restaurants');
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [leaveGroupDialogOpen, setLeaveGroupDialogOpen] = useState(false);
  const [replaceCartDialogOpen, setReplaceCartDialogOpen] = useState(false);

  const total = useMemo(() => calculateTotal(item, quantity), [item, quantity]);

  const canAddToCart = isSelectionValid(item);

  const cart = useCartStore((state) => state.cart);
  const setCart = useCartStore((state) => state.setCart);
  const addItem = useCartStore((state) => state.addItem);

  const addItemToCart = () => {
    const normalizedItem: CartItem = {
      id: item.id,
      item_id: item.id,
      quantity,
      notes: specialInstructions,
      item_name: item.name,
      unit_price: item.price,
      total_price: item.price * quantity,
    };

    if (!isAuthenticated) {
      addItem(
        {
          id: restaurant.id,
          name: restaurant.name,
        },
        normalizedItem,
      );
    } else {
      addToIndividualCart({
        ...normalizedItem,
        restaurant_id: item.restaurantId,
      });
    }

    onAddToCart?.();
  };

  function handleAddToCart() {
    if (!canAddToCart) return;

    if (!isAuthenticated && cart && cart.restaurant.id !== restaurant.id) {
      setReplaceCartDialogOpen(true);
      return;
    }

    addItemToCart();
  }

  const {
    execute: addToIndividualCart,
    isExecuting: isExecutingAddToIndividualCart,
  } = useAction(addIndividualCartItemAction, {
    onSuccess: ({ data }) => {
      toast.success(data.message);
    },
    onError: ({ error }) => {
      toast.error(error.serverError?.message);
    },
  });

  const disabledConditions = isExecutingAddToIndividualCart || !item.available;

  return (
    <>
      <div className={cn('space-y-5', variant === 'page' && '')}>
        <div
          className={cn(
            'relative overflow-hidden rounded-xl',
            variant === 'dialog' ? 'h-44' : 'h-56',
          )}>
          <Image
            // src={item.image}
            src={'/a'}
            alt={item.name}
            fill
            className="object-cover"
          />
          {!item.available && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="rounded-full bg-background px-4 py-2 text-sm font-medium">
                {t('currentlyUnavailable')}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-xl font-semibold">{item.name}</h2>
            <div className="text-right">
              <p className="text-lg font-semibold">
                {item.price.toFixed(2)} EGP
              </p>
              {item.originalPrice && (
                <p className="text-sm text-muted-foreground line-through">
                  {item.originalPrice.toFixed(2)} EGP
                </p>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{item.description}</p>
          <p className="text-xs text-muted-foreground">
            {t('prepTime', { time: item.preparationTime })}
            {item.stock !== undefined ? ` · ${t('stockLeft', { stock: item.stock })}` : ''}
          </p>
        </div>

        {item.options.length > 0 && <Separator />}

        <div className="space-y-5">
          <div>
            <Field>
              <FieldLabel htmlFor="instructions">
                {t('specialInstructions')}
              </FieldLabel>
              <Input
                id="instructions"
                type="text"
                placeholder={t('specialInstructionsPlaceholder')}
                value={specialInstructions}
                disabled={disabledConditions}
                onChange={(event) => setSpecialInstructions(event.target.value)}
              />
            </Field>
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 rounded-lg border p-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={quantity <= 1 || disabledConditions}
              onClick={() =>
                setQuantity((current) => Math.max(1, current - 1))
              }>
              <Minus className="size-4" />
            </Button>
            <span className="w-8 text-center text-sm font-medium">
              {quantity}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={disabledConditions}
              onClick={() => setQuantity((current) => current + 1)}>
              <Plus className="size-4" />
            </Button>
          </div>

          <Button
            type="button"
            className="flex-1"
            disabled={disabledConditions}
            onClick={handleAddToCart}>
            {t('addToCart', { total: total.toFixed(2) })}
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={leaveGroupDialogOpen}
        onOpenChange={setLeaveGroupDialogOpen}
        title={t('leaveGroupOrderTitle')}
        description={t('leaveGroupOrderDesc')}
        confirmText={t('orderIndividually')}
        onConfirm={() => onAddToCart && onAddToCart()}
      />

      <ConfirmDialog
        open={replaceCartDialogOpen}
        onOpenChange={setReplaceCartDialogOpen}
        title={t('replaceCartTitle')}
        description={t('replaceCartDesc', { current: cart?.restaurant.name, new: restaurant.name })}
        confirmText={t('replaceCart')}
        cancelText={t('keepCurrentCart')}
        onConfirm={() => {
          addItemToCart();
          setReplaceCartDialogOpen(false);
        }}
      />
    </>
  );
}

