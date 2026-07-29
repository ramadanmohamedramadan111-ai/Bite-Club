import { useTranslations } from 'next-intl';
import { z } from 'zod';

export function createAddToCartAiSchema(t: ReturnType<typeof useTranslations>) {
  return z.object({
    restaurant_id: z.number().positive(t('restaurantId.positive')),
    items: z
      .array(
        z.object({
          id: z.number().positive(t('items.id.positive')),
          quantity: z.number().positive(t('items.quantity.positive')),
        }),
      )
      .nonempty({ message: t('items.nonempty') }),
  });
}

export type AddToCartAiSchema = z.infer<ReturnType<typeof createAddToCartAiSchema>>;
