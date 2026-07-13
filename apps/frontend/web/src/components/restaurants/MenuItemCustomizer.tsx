'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';

import ConfirmDialog from '@/components/shared/ConfirmationDialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/stores/cart';
import { useSessionStore } from '@/stores/session';
import type {
  ItemOptionGroup,
  MenuItem,
} from '@/types/restaurant/restaurantItem';
import type { RestaurantDetail } from '@/types/restaurant/restaurant';
import { Field, FieldLabel } from '../ui/field';
import { Input } from '../ui/input';

type Selections = Record<string, string | string[]>;

export type OrderingContext = 'group-order' | 'restaurant';

type Props = {
  item: MenuItem;
  variant?: 'dialog' | 'page';
  onAddToCart?: () => void;
  cartType: 'individual' | 'group';
  orderingContext?: OrderingContext;
  restaurant: RestaurantDetail;
};

function getInitialSelections(options: ItemOptionGroup[]): Selections {
  const selections: Selections = {};

  options.forEach((group) => {
    if (group.type === 'single' && group.options.length > 0) {
      selections[group.id] = group.options[0].id;
    } else if (group.type === 'multiple') {
      selections[group.id] = [];
    }
  });

  return selections;
}

function calculateTotal(
  item: MenuItem,
  selections: Selections,
  quantity: number,
): number {
  let total = item.price;

  item.options.forEach((group) => {
    const selected = selections[group.id];

    if (group.type === 'single' && typeof selected === 'string') {
      const option = group.options.find((entry) => entry.id === selected);
      total += option?.price ?? 0;
    }

    if (group.type === 'multiple' && Array.isArray(selected)) {
      selected.forEach((optionId) => {
        const option = group.options.find((entry) => entry.id === optionId);
        total += option?.price ?? 0;
      });
    }
  });

  return total * quantity;
}

function isSelectionValid(item: MenuItem, selections: Selections): boolean {
  return item.options.every((group) => {
    const selected = selections[group.id];

    if (!group.required) {
      return true;
    }

    if (group.type === 'single') {
      return typeof selected === 'string' && selected.length > 0;
    }

    return Array.isArray(selected) && selected.length > 0;
  });
}

export default function MenuItemCustomizer({
  item,
  variant = 'dialog',
  restaurant,
  onAddToCart,
  cartType = 'individual',
  orderingContext = 'restaurant',
}: Props) {
  const [selections, setSelections] = useState<Selections>(() =>
    getInitialSelections(item.options),
  );
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [leaveGroupDialogOpen, setLeaveGroupDialogOpen] = useState(false);

  const total = useMemo(
    () => calculateTotal(item, selections, quantity),
    [item, selections, quantity],
  );

  const canAddToCart = item.available && isSelectionValid(item, selections);

  const cart = useCartStore((state) => state.cart);
  const setCart = useCartStore((state) => state.setCart);
  const createIndividualCart = useCartStore((state) => state.createIndividualCart);
  const addItem = useCartStore((state) => state.addItem);
  const name = useSessionStore((state) => state.name);
  const sessionId = useSessionStore((state) => state.sessionId);

  const hasActiveGroupCartForRestaurant =
    cart?.type === 'group' &&
    cart.restaurantId === String(restaurant.id) &&
    orderingContext === 'restaurant';

  function buildCartItem() {
    const selectedOptions = item.options.flatMap((group) => {
      const selected = selections[group.id];

      if (group.type === 'single' && typeof selected === 'string') {
        const option = group.options.find((entry) => entry.id === selected);
        return option ? [{ groupId: group.id, ...option }] : [];
      }

      if (group.type === 'multiple' && Array.isArray(selected)) {
        return selected
          .map((optionId) => {
            const option = group.options.find((entry) => entry.id === optionId);
            return option ? { groupId: group.id, ...option } : null;
          })
          .filter(Boolean) as {
          groupId: string;
          id: string;
          name: string;
          price: number;
        }[];
      }

      return [];
    });

    return {
      cartItemId: crypto.randomUUID(),
      itemId: item.id.toString(),
      name: item.name,
      image: item.image,
      quantity,
      basePrice: item.price,
      unitPrice: total / quantity,
      totalPrice: total,
      configurationKey: JSON.stringify(selections),
      selectedOptions: selectedOptions.map((option) => ({
        groupId: option.groupId,
        groupName:
          item.options.find((group) => group.id === option.groupId)?.title || '',
        optionId: option.id,
        optionName: option.name,
        price: option.price,
      })),
      specialInstructions: specialInstructions || undefined,
      addedBy: {
        sessionId: sessionId ?? undefined,
        userId: undefined,
        name: name ?? undefined,
      },
    };
  }

  function performAddToCart() {
    const cartItem = buildCartItem();

    if (hasActiveGroupCartForRestaurant) {
      createIndividualCart({
        restaurantId: String(item.restaurantId),
        restaurantName: restaurant.name,
        restaurantImage: restaurant.logo,
        restaurantDeliveryFee: restaurant.minDeliveryPrice,
        sessionId: sessionId ?? undefined,
      });
    } else if (!cart) {
      setCart({
        id: crypto.randomUUID(),
        type: 'individual',
        status: 'active',
        restaurantId: String(item.restaurantId),
        restaurantName: restaurant.name,
        restaurantImage: restaurant.logo,
        restaurantDeliveryFee: restaurant.minDeliveryPrice,
        userId: undefined,
        sessionId: sessionId ?? undefined,
        members: [],
        items: [],
      });
    }

    addItem(cartItem);

    if (hasActiveGroupCartForRestaurant) {
      toast.success('Left group order. Item added to your individual cart.');
    }

    if (onAddToCart) {
      onAddToCart();
    }
  }

  function handleAddToCart() {
    if (!canAddToCart) {
      return;
    }

    if (hasActiveGroupCartForRestaurant) {
      setLeaveGroupDialogOpen(true);
      return;
    }

    performAddToCart();
  }

  function updateSingleSelection(groupId: string, optionId: string) {
    setSelections((current) => ({ ...current, [groupId]: optionId }));
  }

  function toggleMultipleSelection(
    group: ItemOptionGroup,
    optionId: string,
    checked: boolean,
  ) {
    setSelections((current) => {
      const currentValues = Array.isArray(current[group.id])
        ? (current[group.id] as string[])
        : [];

      if (!checked) {
        return {
          ...current,
          [group.id]: currentValues.filter((value) => value !== optionId),
        };
      }

      if (group.maxSelections && currentValues.length >= group.maxSelections) {
        return current;
      }

      return {
        ...current,
        [group.id]: [...currentValues, optionId],
      };
    });
  }

  return (
    <>
      <div className={cn('space-y-5', variant === 'page' && '')}>
        <div
          className={cn(
            'relative overflow-hidden rounded-xl',
            variant === 'dialog' ? 'h-44' : 'h-56',
          )}>
          <Image src={item.image} alt={item.name} fill className="object-cover" />
          {!item.available && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="rounded-full bg-background px-4 py-2 text-sm font-medium">
                Currently Unavailable
              </span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-xl font-semibold">{item.name}</h2>
            <div className="text-right">
              <p className="text-lg font-semibold">{item.price.toFixed(2)} EGP</p>
              {item.originalPrice && (
                <p className="text-sm text-muted-foreground line-through">
                  {item.originalPrice.toFixed(2)} EGP
                </p>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{item.description}</p>
          <p className="text-xs text-muted-foreground">
            {item.preparationTime} min prep
            {item.stock !== undefined ? ` · ${item.stock} left` : ''}
          </p>
        </div>

        {item.options.length > 0 && <Separator />}

        <div className="space-y-5">
          {item.options.map((group) => (
            <div key={group.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-medium">{group.title}</p>
                <span className="text-xs text-muted-foreground">
                  {group.required ? 'Required' : 'Optional'}
                  {group.maxSelections ? ` · Max ${group.maxSelections}` : ''}
                </span>
              </div>

              {group.type === 'single' ? (
                <RadioGroup
                  value={
                    typeof selections[group.id] === 'string'
                      ? (selections[group.id] as string)
                      : undefined
                  }
                  onValueChange={(value) => updateSingleSelection(group.id, value)}>
                  {group.options.map((option) => (
                    <div key={option.id} className="flex items-center gap-2">
                      <RadioGroupItem
                        value={option.id}
                        id={`${group.id}-${option.id}`}
                      />
                      <Label
                        htmlFor={`${group.id}-${option.id}`}
                        className="flex flex-1 justify-between font-normal">
                        <span>{option.name}</span>
                        {option.price > 0 && (
                          <span>+{option.price.toFixed(2)} EGP</span>
                        )}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <div className="space-y-2">
                  {group.options.map((option) => {
                    const selected = selections[group.id];
                    const checked =
                      Array.isArray(selected) && selected.includes(option.id);

                    return (
                      <div key={option.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`${group.id}-${option.id}`}
                          checked={checked}
                          onCheckedChange={(value) =>
                            toggleMultipleSelection(
                              group,
                              option.id,
                              value === true,
                            )
                          }
                        />
                        <Label
                          htmlFor={`${group.id}-${option.id}`}
                          className="flex flex-1 justify-between font-normal">
                          <span>{option.name}</span>
                          {option.price > 0 && (
                            <span>+{option.price.toFixed(2)} EGP</span>
                          )}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          <div>
            <Field>
              <FieldLabel htmlFor="instructions">Special Instructions</FieldLabel>
              <Input
                id="instructions"
                type="text"
                placeholder="Add any special instructions..."
                value={specialInstructions}
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
              disabled={quantity <= 1}
              onClick={() => setQuantity((current) => Math.max(1, current - 1))}>
              <Minus className="size-4" />
            </Button>
            <span className="w-8 text-center text-sm font-medium">{quantity}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setQuantity((current) => current + 1)}>
              <Plus className="size-4" />
            </Button>
          </div>

          <Button
            type="button"
            className="flex-1"
            disabled={!canAddToCart}
            onClick={handleAddToCart}>
            Add to cart · {total.toFixed(2)} EGP
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={leaveGroupDialogOpen}
        onOpenChange={setLeaveGroupDialogOpen}
        title="Leave group order?"
        description="You have an active group order for this restaurant. Adding this item will start a new individual cart and remove you from the group order."
        confirmText="Order individually"
        onConfirm={performAddToCart}
      />
    </>
  );
}
