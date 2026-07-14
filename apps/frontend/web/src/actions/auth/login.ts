'use server';

import { actionClient } from '@/lib/safe-action';
import { createUserLoginSchema } from '@/schemas/auth/user-login-schema';
import { ApiResponse } from '@/types/api/api-response';
import { UserLoginResponse } from '@/types/auth/auth';
import { serverFetch } from '@/utils/server-fetch';
import { getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';

async function setAuthCookie(token: string) {
  const cookieStore = await cookies();

  cookieStore.set('accessToken', token, {
    httpOnly: true,
    secure: false, // local development
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export const loginUserAction = actionClient
  .inputSchema(async () => {
    const t = await getTranslations('forms.login');
    return createUserLoginSchema(t);
  })
  .action(async ({ parsedInput }) => {
    const response = await serverFetch<ApiResponse<UserLoginResponse>>(
      '/user/login',
      'POST',
      {
        body: parsedInput,
      },
    );

    await setAuthCookie(response.data.access_token);

    return response;
  });

