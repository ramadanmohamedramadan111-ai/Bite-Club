'use server';

import { actionClient } from '@/lib/safe-action';
import { createSendUserPointsSchema } from '@/schemas/points/send-user-points-schema';
import { ApiResponse } from '@/types/api/api-response';
import { getUserId } from '@/utils/api-helpers';
import { serverFetch } from '@/utils/server-fetch';
import { getTranslations } from 'next-intl/server';
import { updateTag } from 'next/cache';

export const sendGiftAction = actionClient
  .inputSchema(async () => {
    const t = await getTranslations('forms.sendGift');
    return createSendUserPointsSchema(t);
  })
  .action(async ({ parsedInput }) => {
    const userId = await getUserId();
    const response = await serverFetch<ApiResponse<null>>(
      '/wallet/gift',
      'POST',
      {
        body: parsedInput,
      },
    );

    updateTag(`wallet-${userId}`);
    updateTag(`wallet-${parsedInput.receiver_id}`);

    return response;
  });
