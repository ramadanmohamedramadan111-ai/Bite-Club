import { useTranslations } from 'next-intl';
import { z } from 'zod';

export function createCreateGroupSchema(t: ReturnType<typeof useTranslations>) {
  return z.object({
    name: z.string().min(2, t('fields.name.errors.minLength')),

    description: z.string().min(2, t('fields.description.errors.minLength')),

    image: z
      .instanceof(File)
      .optional()
      .refine((file) => !file || file.type.startsWith('image/'), {
        message: t('fields.image.errors.invalid'),
      })
      .refine((file) => !file || file.size <= 5 * 1024 * 1024, {
        message: t('fields.image.errors.maxSize'),
      }),
  });
}

export type CreateGroupSchema = z.infer<
  ReturnType<typeof createCreateGroupSchema>
>;
