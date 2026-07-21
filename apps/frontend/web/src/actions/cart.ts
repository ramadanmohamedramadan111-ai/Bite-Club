'use server';

import { actionClient } from '@/lib/safe-action';
import { addCartItemSchema } from '@/schemas/cart/add-item-schema';
import { updateCartItemQuantitySchema } from '@/schemas/cart/update-item-quantity-schema';
import { idSchema } from '@/schemas/common/id-schema';
import { ApiResponse } from '@/types/api/api-response';
import { getUserId } from '@/utils/api-helpers';
import { serverFetch } from '@/utils/server-fetch';
import { updateTag } from 'next/cache';

export const addIndividualCartItemAction = actionClient
  .inputSchema(addCartItemSchema)
  .action(async ({ parsedInput }) => {
    const userId = await getUserId();

    const response = await serverFetch<ApiResponse<null>>(
      '/user/cart/items',
      'POST',
      {
        body: parsedInput,
      },
    );

    updateTag(`cart-${userId}`);

    return response;
  });

export const updateIndividualCartItemQuantityAction = actionClient
  .inputSchema(updateCartItemQuantitySchema)
  .action(async ({ parsedInput }) => {
    const userId = await getUserId();
    const { id, quantity } = parsedInput;

    const response = await serverFetch<ApiResponse<null>>(
      `/user/cart/items/${id}`,
      'PUT',
      {
        body: {
          quantity,
        },
      },
    );

    updateTag(`cart-${userId}`);

    return response;
  });

export const removeIndividualCartItemAction = actionClient
  .inputSchema(idSchema)
  .action(async ({ parsedInput }) => {
    const userId = await getUserId();

    const response = await serverFetch<ApiResponse<null>>(
      `/user/cart/items/${parsedInput}`,
      'DELETE',
    );

    updateTag(`cart-${userId}`);

    return response;
  });

export const clearIndividualCartAction = actionClient.action(async () => {
  const userId = await getUserId();

  const response = await serverFetch<ApiResponse<null>>('/user/cart', 'DELETE');

  updateTag(`cart-${userId}`);

  return response;
});

