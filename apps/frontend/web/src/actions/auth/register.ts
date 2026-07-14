'use server';

import { actionClient } from '@/lib/safe-action';
import { createUserRegisterSchema } from '@/schemas/auth/user-register-schema';
import { ApiResponse } from '@/types/api/api-response';
import { UserRegistrationResponse } from '@/types/auth/auth';
import { serverFetch } from '@/utils/server-fetch';
import { getTranslations } from 'next-intl/server';

export const registerUserAction = actionClient
  .inputSchema(async () => {
    const t = await getTranslations('forms.register');
    return createUserRegisterSchema(t);
  })
  .action(async ({ parsedInput }) => {
    const response = await serverFetch<ApiResponse<UserRegistrationResponse>>(
      '/user/register',
      'POST',
      {
        body: parsedInput,
      },
    );

    return response;
  });

