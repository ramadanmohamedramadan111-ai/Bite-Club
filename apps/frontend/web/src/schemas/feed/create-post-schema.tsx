import { z } from 'zod';
import { TranslationValues } from 'next-intl';

type T = (key: string, values?: TranslationValues) => string;

export const createOrderPostSchema = (t: T) =>
  z.object({
    order_id: z.number().int().positive(),

    caption: z
      .string()
      .trim()
      .min(2, t('fields.caption.minLength'))
      .max(1000, t('fields.caption.maxLength'))
      .optional(),

    images: z
      .array(
        z
          .instanceof(File, {
            message: t('fields.image.invalid'),
          })
          .refine(
            (file) =>
              ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
            {
              message: t('fields.image.invalidType'),
            },
          )
          .refine((file) => file.size <= 5 * 1024 * 1024, {
            message: t('fields.image.maxSize'),
          }),
      )
      .min(1, t('fields.image.minLength'))
      .max(10, t('fields.image.maxLength')),
  });
