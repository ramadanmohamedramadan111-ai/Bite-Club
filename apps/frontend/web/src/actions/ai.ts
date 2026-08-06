'use server';
import { actionClient } from '@/lib/safe-action';
import { createAddToCartAiSchema } from '@/schemas/ai/add-to-cart-ai-schema';
import { createAiMessageSchema } from '@/schemas/ai/ai-message-schema';
import { SmartWaiterAddToCartResponse, SmartWaiterResponse } from '@/types/ai';
import { ApiResponse } from '@/types/api';
import { getUserId } from '@/utils/api-helpers';
import { serverFetch } from '@/utils/server-fetch';
import { getTranslations } from 'next-intl/server';
import { updateTag } from 'next/cache';

export const smartWaiterSendChatAction = actionClient
  .inputSchema(async () => {
    const t = await getTranslations('ai');
    return createAiMessageSchema(t);
  })
  .action(async ({ parsedInput }) => {
    const userId = await getUserId();
    const response = await serverFetch<ApiResponse<SmartWaiterResponse>>(
      '/ai/smart-waiter/chat',
      'POST',
      {
        body: parsedInput,
      },
    );

    updateTag(`cart-${userId}`);

    return response;
  });

export const smartWaiterAddToCartAction = actionClient
  .inputSchema(async () => {
    const t = await getTranslations('ai');
    return createAddToCartAiSchema(t);
  })
  .action(async ({ parsedInput }) => {
    const userId = await getUserId();
    const response = await serverFetch<
      ApiResponse<SmartWaiterAddToCartResponse>
    >('/ai/smart-waiter/add-to-cart', 'POST', {
      body: parsedInput,
    });

    updateTag(`cart-${userId}`);

  });

export const getSmartWaiterRemainingAction = actionClient
  .action(async () => {
    const response = await serverFetch<
      ApiResponse<{ remaining_messages: number; max_messages: number }>
    >('/ai/smart-waiter/remaining', 'GET');

    return response;
  });


