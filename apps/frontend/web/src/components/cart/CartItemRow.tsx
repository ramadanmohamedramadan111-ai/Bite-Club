'use client';

import { useLocale, useTranslations } from 'next-intl';
import { getLangDir } from 'rtl-detect';
import { Minus, Plus } from 'lucide-react';
import type { CartItem } from '@/lib/const-data';
import { Button } from '@/components/ui/button';

type Props = {
  item: CartItem;
  isGroupCart: boolean;
  onUpdateQuantity: (cartItemId: string, quantity: number) => void;
  onRemove: (cartItemId: string) => void;
};

export default function CartItemRow({
  item,
  isGroupCart,
  onUpdateQuantity,
  onRemove,
}: Props) {
  const locale = useLocale();
  const direction = getLangDir(locale);
  const isRtl = direction === 'rtl';
  const t = useTranslations('common');
  return (
    <div className="space-y-2 rounded-xl border p-4">
      <div className="flex justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <p className="font-medium">{item.name}</p>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              disabled={item.quantity <= 1}
              onClick={() =>
                onUpdateQuantity(item.cartItemId, item.quantity - 1)
              }>
              <Minus className="size-4" />
            </Button>
            <span className="min-w-6 text-center text-sm font-medium">
              {item.quantity}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={() =>
                onUpdateQuantity(item.cartItemId, item.quantity + 1)
              }>
              <Plus className="size-4" />
            </Button>
          </div>
        </div>

        <div className={isRtl ? 'text-left' : 'text-right'}>
          <p className="font-semibold">{item.totalPrice.toFixed(2)} {t('egp')}</p>
          <button
            type="button"
            onClick={() => onRemove(item.cartItemId)}
            className="mt-1 text-sm text-destructive hover:underline">
            {t('remove')}
          </button>
        </div>
      </div>

      {item.selectedOptions.length > 0 && (
        <ul className="text-sm text-muted-foreground">
          {item.selectedOptions.map((option) => (
            <li key={option.optionId}>
              {option.groupName}: {option.optionName}
              {option.price > 0 && (
                <span> (+{option.price.toFixed(2)} {t('egp')})</span>
              )}
            </li>
          ))}
        </ul>
      )}

      {item.specialInstructions && (
        <p className="text-sm text-muted-foreground">
          {t('note')} {item.specialInstructions}
        </p>
      )}

      {isGroupCart && item.addedBy?.name && (
        <p className="text-xs text-muted-foreground">
          {t('addedBy', { name: item.addedBy.name })}
        </p>
      )}
    </div>
  );
}

