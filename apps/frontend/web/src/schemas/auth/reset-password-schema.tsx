import { useTranslations } from 'next-intl';
import { z } from 'zod';

export function createResetPasswordSchema(
  t: ReturnType<typeof useTranslations>,
) {
  return z
    .object({
      email: z.string().email(),
      password: z.string().min(8, t('fields.password.errors.minLength')),
      password_confirmation: z.string(),
    })
    .refine((data) => data.password === data.password_confirmation, {
      path: ['password_confirmation'],
      message: t('fields.confirmPassword.errors.mismatch'),
    });
}

export type ResetPasswordSchema = z.infer<
  ReturnType<typeof createResetPasswordSchema>
>;

