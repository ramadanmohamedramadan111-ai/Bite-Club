'use server';

import { actionClient } from '@/lib/safe-action';
import { ApiResponse } from '@/types/api/api-response';
import { serverFetch } from '@/utils/server-fetch';
import { cookies } from 'next/headers';

export const logoutUserAction = actionClient.action(async () => {
  const cookieStore = await cookies();

  const res = await serverFetch<ApiResponse<{ message: string }>>(
    '/user/logout',
    'POST',
    {
      skipRefresh: true,
    },
  );

  cookieStore.delete('accessToken');

  return res;
});

