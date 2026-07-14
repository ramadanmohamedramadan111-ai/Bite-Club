'use server';

import { actionClient } from '@/lib/safe-action';
import { serverFetch } from '@/utils/server-fetch';
import { getTranslations } from 'next-intl/server';
import { ApiResponse } from '@/types/api/api-response';
import { z } from 'zod';

export const resetPasswordAction = actionClient
  .inputSchema(async () => {
    const t = await getTranslations('forms.newPassword.fields');
    return z.object({
      email: z.string().email(),
      password: z.string().min(8, t('password.errors.minLength')),
      confirmPassword: z.string(),
    }).refine((data) => data.password === data.confirmPassword, {
      path: ['confirmPassword'],
      message: t('confirmPassword.errors.mismatch'),
    });
  })
  .action(async ({ parsedInput }) => {
    const response = await serverFetch<ApiResponse<unknown>>(
      '/user/reset-password',
      'POST',
      {
        body: {
          email: parsedInput.email,
          password: parsedInput.password,
          password_confirmation: parsedInput.confirmPassword,
        },
      },
    );

    return response;
  });
