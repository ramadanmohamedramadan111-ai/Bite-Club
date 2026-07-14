import { useTranslations } from 'next-intl';
import { z } from 'zod';

export function createUserLoginSchema(t: ReturnType<typeof useTranslations>) {
  return z.object({
    email: z.string().email(t('fields.email.errors.invalid')),
    password: z.string().min(8, t('fields.password.errors.minLength')),
  });
}

export type LoginSchema = z.infer<ReturnType<typeof createUserLoginSchema>>;

