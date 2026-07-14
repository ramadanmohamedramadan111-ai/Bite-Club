'use server';

import { actionClient } from '@/lib/safe-action';
import { createForgotPasswordSchema } from '@/app/[locale]/(auth)/forget-password/forget-password-schema';
import { serverFetch } from '@/utils/server-fetch';
import { getTranslations } from 'next-intl/server';
import { ApiResponse } from '@/types/api/api-response';

export const forgotPasswordAction = actionClient
  .inputSchema(async () => {
    const t = await getTranslations('forms.forgetPassword.fields');
    return createForgotPasswordSchema(t);
  })
  .action(async ({ parsedInput }) => {
    const response = await serverFetch<ApiResponse<unknown>>(
      '/user/forgot-password',
      'POST',
      {
        body: parsedInput,
      },
    );

    return response;
  });
