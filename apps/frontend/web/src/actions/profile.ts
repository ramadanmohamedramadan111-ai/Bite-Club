'use server';

import { actionClient } from '@/lib/safe-action';
import { createEditUserSchema } from '@/schemas/profile/edit-user-schema';
import { ApiResponse } from '@/types/api/api-response';
import { getUserId } from '@/utils/api-helpers';
import { serverFetch } from '@/utils/server-fetch';
import { getTranslations } from 'next-intl/server';
import { updateTag } from 'next/cache';

export const editUserAction = actionClient
  .inputSchema(async () => {
    const t = await getTranslations('forms.editUser');
    return createEditUserSchema(t);
  })
  .action(async ({ parsedInput }) => {
    const userId = await getUserId();
    const response = await serverFetch<ApiResponse<null>>(
      '/user/profile',
      'POST',
      {
        body: { ...parsedInput, _method: 'PATCH' },
      },
    );

    updateTag(`users-${userId}`);

    return response;
  });

