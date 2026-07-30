import { useTranslations } from 'next-intl';
import { z } from 'zod';

export function createAiMessageSchema(t: ReturnType<typeof useTranslations>) {
  return z.object({
    conversation_id: z.number().int().positive(t('conversationId.positive')).optional(),
    message: z.string().min(1, t('message.required')),
    locale: z.enum(['ar', 'en'], { message: t('locale.invalid') }),
    latitude: z.number(t('latitude.invalid')),
    longitude: z.number(t('longitude.invalid')),
  });
}

export type AiMessageSchema = z.infer<ReturnType<typeof createAiMessageSchema>>;
