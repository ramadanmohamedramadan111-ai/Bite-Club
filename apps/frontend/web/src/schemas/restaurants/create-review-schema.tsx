import { useTranslations } from 'next-intl';
import { z } from 'zod';

export function createReviewSchema(t: ReturnType<typeof useTranslations>) {
  return z.object({
    rating: z
      .number()
      .int()
      .min(1, t('rating.min'))
      .max(5, t('rating.max')),
    comment: z.string().min(1, t('comment.required')),
    restaurant_id: z.number().positive(t('restaurantId.positive')),
  });
}

export type ReviewSchema = z.infer<ReturnType<typeof createReviewSchema>>;
