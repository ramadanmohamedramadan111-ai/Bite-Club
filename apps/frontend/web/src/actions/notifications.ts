'use server';

import { actionClient } from '@/lib/safe-action';
import { idStringSchema } from '@/schemas/common/id-string-schema';
import { ApiResponse } from '@/types/api';
import { getUserId } from '@/utils/api-helpers';
import { serverFetch } from '@/utils/server-fetch';
import { updateTag } from 'next/cache';

export const markNotificationAsReadAction = actionClient
  .inputSchema(idStringSchema)
  .action(async ({ parsedInput }) => {
    const response = await serverFetch<ApiResponse<null>>(
      `/user/notifications/${parsedInput}/mark-as-read`,
      'PATCH',
    );

    await revalidateNotifications();

    return response;
  });

export const markAllNotificationsAsReadAction = actionClient.action(
  async () => {
    const response = await serverFetch<ApiResponse<null>>(
      `/user/notifications/mark-all-as-read`,
      'POST',
    );

    await revalidateNotifications();

    return response;
  },
);

export const revalidateNotifications = async () => {
  try {
    const userId = await getUserId();
    console.log('[revalidateNotifications] Invalidating tags for userId:', userId);
    updateTag(`notifications-${userId}`);
    updateTag(`notifications-count-${userId}`);
    updateTag(`notifications-recent-${userId}`);
    console.log('[revalidateNotifications] Tags invalidated successfully.');
  } catch (error) {
    console.error('[revalidateNotifications] Error during revalidation:', error);
  }
};
