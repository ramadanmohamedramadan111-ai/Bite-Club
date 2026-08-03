'use server';

import { actionClient } from '@/lib/safe-action';
import { createEditUserSchema } from '@/schemas/profile/edit-user-schema';
import { ApiResponse } from '@/types/api';
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
    const formData = new FormData();
    formData.append('first_name', parsedInput.first_name);
    formData.append('last_name', parsedInput.last_name);
    formData.append('username', parsedInput.username);
    if (parsedInput.profile_image) {
      formData.append('profile_image', parsedInput.profile_image);
    }

    const response = await serverFetch<ApiResponse<null>>(
      '/user/profile',
      'POST',
      {
        body: formData,
      },
    );

    updateTag(`users-${userId}`);

    return response;
  });

