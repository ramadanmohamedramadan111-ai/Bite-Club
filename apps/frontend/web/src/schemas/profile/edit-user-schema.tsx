import { useTranslations } from 'next-intl';
import { z } from 'zod';

export function createEditUserSchema(t: ReturnType<typeof useTranslations>) {
  return z.object({
    first_name: z
      .string()
      .trim()
      .min(2, t('fields.firstName.errors.minLength')),
    last_name: z.string().trim().min(2, t('fields.lastName.errors.minLength')),
    username: z
      .string()
      .trim()
      .min(3, t('fields.username.errors.minLength'))
      .max(30, t('fields.username.errors.maxLength'))
      .regex(/^[a-zA-Z0-9_]+$/, t('fields.username.errors.invalid')),

    profile_image: z
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

export type UserEditSchema = z.infer<ReturnType<typeof createEditUserSchema>>;

