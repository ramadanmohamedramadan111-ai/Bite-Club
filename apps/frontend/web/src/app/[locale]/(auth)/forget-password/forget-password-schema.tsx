import { useTranslations } from 'next-intl';
import { z } from 'zod';

export function createForgotPasswordSchema(
  t: ReturnType<typeof useTranslations>,
) {
  return z.object({
    email: z.string().email(t('email.errors.invalid')),
  });
}

export function useForgotPasswordSchema() {
  const t = useTranslations('forms.forgetPassword.fields');

  return createForgotPasswordSchema(t);
}

export type ForgotPasswordSchema = z.infer<
  ReturnType<typeof createForgotPasswordSchema>
>;

