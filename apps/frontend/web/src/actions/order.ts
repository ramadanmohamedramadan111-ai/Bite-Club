'use server';

import { actionClient } from '@/lib/safe-action';
import { idSchema } from '@/schemas/common/id-schema';
import { ApiResponse } from '@/types/api/api-response';
import { GroupType } from '@/types/groups/groups';
import { getUserId } from '@/utils/api-helpers';
import { serverFetch } from '@/utils/server-fetch';
import { updateTag } from 'next/cache';

export const reOrderAction = actionClient
  .inputSchema(idSchema)
  .action(async ({ parsedInput }) => {
    const userId = await getUserId();
    const response = await serverFetch<ApiResponse<null>>(
      `/orders/${parsedInput}/reorder`,
      'POST',
    );

    updateTag(`cart-${userId}`);

    return response;
  });

