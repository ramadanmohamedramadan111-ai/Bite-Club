'use server';

import { actionClient } from '@/lib/safe-action';
import { idSchema } from '@/schemas/common/id-schema';
import { createCreateGroupSchema } from '@/schemas/groups/create-group-schema';
import { ApiResponse } from '@/types/api/api-response';
import { GroupType } from '@/types/groups/groups';
import { getUserId } from '@/utils/api-helpers';
import { serverFetch } from '@/utils/server-fetch';
import { getTranslations } from 'next-intl/server';
import { updateTag } from 'next/cache';
import { z } from 'zod';

export const createGroupAction = actionClient
  .inputSchema(async () => {
    const t = await getTranslations('forms.createGroup');
    return createCreateGroupSchema(t);
  })
  .action(async ({ parsedInput }) => {
    const userId = await getUserId();
    const response = await serverFetch<ApiResponse<GroupType>>(
      '/groups',
      'POST',
      {
        body: parsedInput,
      },
    );

    updateTag(`groups-${userId}`);

    return response;
  });

export const updateGroupAction = actionClient
  .inputSchema(async () => {
    const t = await getTranslations('forms.createGroup');
    return createCreateGroupSchema(t).extend({ id: idSchema });
  })
  .action(async ({ parsedInput }) => {
    const { id, ...body } = parsedInput;

    const response = await serverFetch<ApiResponse<GroupType>>(
      `/groups/${id}`,
      'PATCH',
      {
        body: body,
      },
    );

    updateTag(`groups-${id}`);

    return response;
  });

export const toggleJoinGroupAction = actionClient
  .inputSchema(
    z.object({
      id: z.number().positive(),
      allow_join_by_link: z.boolean(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { id, allow_join_by_link } = parsedInput;
    const response = await serverFetch<ApiResponse<GroupType>>(
      `/groups/${id}/join-settings`,
      'PATCH',
      {
        body: {
          allow_join_by_link,
        },
      },
    );

    updateTag(`groups-${id}`);

    return response;
  });

export const deleteGroupAction = actionClient
  .inputSchema(idSchema)
  .action(async ({ parsedInput }) => {
    const response = await serverFetch<ApiResponse<GroupType>>(
      `/groups/${parsedInput}`,
      'DELETE',
    );

    updateTag(`groups`);

    return response;
  });

export const leaveGroupAction = actionClient
  .inputSchema(idSchema)
  .action(async ({ parsedInput }) => {
    const response = await serverFetch<ApiResponse<GroupType>>(
      `/groups/${parsedInput}/leave`,
      'POST',
    );

    updateTag(`groups`);

    return response;
  });

