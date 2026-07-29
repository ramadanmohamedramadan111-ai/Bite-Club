import { useTranslations } from 'next-intl';
import { z } from 'zod';

export function createAiMessageSchema(t: ReturnType<typeof useTranslations>) {
  return z.object({
    message: z.string().min(1, t('message.required')),
    locale: z.enum(['ar', 'en'], { message: t('locale.invalid') }),
  });
}

export type AiMessageSchema = z.infer<ReturnType<typeof createAiMessageSchema>>;
