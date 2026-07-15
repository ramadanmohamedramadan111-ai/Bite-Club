'use server';

import { actionClient } from '@/lib/safe-action';
import { idSchema } from '@/schemas/common/id-schema';
import { ApiResponse } from '@/types/api/api-response';
import {
  cancelFriendRequestResponse,
  sendFriendRequestResponse,
} from '@/types/social/friends';
import { getUserId } from '@/utils/api-helpers';
import { serverFetch } from '@/utils/server-fetch';
import { updateTag } from 'next/cache';

const userId = getUserId();

export const sendFriendRequestAction = actionClient
  .inputSchema(idSchema)
  .action(async ({ parsedInput }) => {
    const response = await serverFetch<ApiResponse<sendFriendRequestResponse>>(
      '/friends/request',
      'POST',
      {
        body: {
          user_id: parsedInput,
        },
      },
    );

    await updateTag(`friends-sent-${parsedInput}`);
    await updateTag(`friends-sent-${userId}`);
    await updateTag(`friends-discover-${parsedInput}`);
    await updateTag(`friends-discover-${userId}`);

    return response;
  });

export const cancelFriendRequestAction = actionClient
  .inputSchema(idSchema)
  .action(async ({ parsedInput }) => {
    const response = await serverFetch<
      ApiResponse<cancelFriendRequestResponse>
    >(`/friends/requests/${parsedInput}`, 'DELETE');

    await updateTag(`friends-sent-${parsedInput}`);
    await updateTag(`friends-sent-${userId}`);
    await updateTag(`friends-discover-${parsedInput}`);
    await updateTag(`friends-discover-${userId}`);

    return response;
  });

export const rejectFriendRequestAction = actionClient
  .inputSchema(idSchema)
  .action(async ({ parsedInput }) => {
    const response = await serverFetch<
      ApiResponse<cancelFriendRequestResponse>
    >(`/friends/requests/${parsedInput}/reject`, 'POST');

    await updateTag(`friends-requests-${parsedInput}`);
    await updateTag(`friends-requests-${userId}`);
    await updateTag(`friends-discover-${parsedInput}`);
    await updateTag(`friends-discover-${userId}`);

    return response;
  });

export const removeFriendRequestAction = actionClient
  .inputSchema(idSchema)
  .action(async ({ parsedInput }) => {
    const response = await serverFetch<
      ApiResponse<cancelFriendRequestResponse>
    >(`/friends/${parsedInput}`, 'DELETE');

    await updateTag(`friends-${parsedInput}`);
    await updateTag(`friends-${userId}`);
    await updateTag(`friends-discover-${parsedInput}`);
    await updateTag(`friends-discover-${userId}`);

    return response;
  });

export const acceptFriendRequestAction = actionClient
  .inputSchema(idSchema)
  .action(async ({ parsedInput }) => {
    const response = await serverFetch<ApiResponse<null>>(
      `/friends/requests/${parsedInput}/accept`,
      'POST',
    );

    await updateTag(`friends-${parsedInput}`);
    await updateTag(`friends-${userId}`);
    await updateTag(`friends-requests-${parsedInput}`);
    await updateTag(`friends-requests-${userId}`);
    await updateTag(`friends-discover-${parsedInput}`);
    await updateTag(`friends-discover-${userId}`);

    return response;
  });

