import { useTranslations } from 'next-intl';
import { z } from 'zod';

export function createForgotPasswordSchema(
  t: ReturnType<typeof useTranslations>,
) {
  return z.object({
    email: z.string().email(t('fields.email.errors.invalid')),
  });
}

export type ForgotPasswordSchema = z.infer<
  ReturnType<typeof createForgotPasswordSchema>
>;

