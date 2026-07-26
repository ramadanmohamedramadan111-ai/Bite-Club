import z from 'zod';
import { useTranslations } from 'next-intl';

export function createSendUserPointsSchema(
  t: ReturnType<typeof useTranslations>,
) {
  return z.object({
    receiver_id: z.number().positive(),
    points: z.number().positive().min(10, t('fields.points.errors.min')),
    note: z.string().optional(),
  });
}

export type SendUserPointsSchema = z.infer<
  ReturnType<typeof createSendUserPointsSchema>
>;
