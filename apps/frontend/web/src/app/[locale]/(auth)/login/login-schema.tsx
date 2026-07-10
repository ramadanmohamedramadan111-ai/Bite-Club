import { useTranslations } from 'next-intl';
import { z } from 'zod';

export function createLoginSchema(t: ReturnType<typeof useTranslations>) {
  return z.object({
    email: z.string().email(t('email.errors.invalid')),
    password: z.string().min(8, t('password.errors.minLength')),
  });
}

export function useLoginSchema() {
  const t = useTranslations('forms.login.fields');

  return createLoginSchema(t);
}

export type LoginSchema = z.infer<ReturnType<typeof createLoginSchema>>;
