import { useTranslations } from 'next-intl';
import { z } from 'zod';

export function createNewPasswordSchema(t: ReturnType<typeof useTranslations>) {
  return z
    .object({
      password: z.string().min(8, t('password.errors.minLength')),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      path: ['confirmPassword'],
      message: t('confirmPassword.errors.mismatch'),
    });
}

export function useNewPasswordSchema() {
  const t = useTranslations('forms.newPassword.fields');

  return createNewPasswordSchema(t);
}

export type NewPasswordSchema = z.infer<
  ReturnType<typeof createNewPasswordSchema>
>;
