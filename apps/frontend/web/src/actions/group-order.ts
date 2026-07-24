'use server';
import { actionClient } from '@/lib/safe-action';
import { idSchema } from '@/schemas/common/id-schema';
import { addGroupCartItemSchema } from '@/schemas/group-order/add-item-schema';
import { createGroupOrderSessionSchema } from '@/schemas/group-order/create-group-order-session-schema';
import { removeGroupCartItemSchema } from '@/schemas/group-order/remove-item-schema';
import { ApiResponse } from '@/types/api/api-response';
import {
  GroupOrderCartItemResponse,
  GroupOrderSessionSuccessResponse,
} from '@/types/group-order/group-order';
import { getUserId } from '@/utils/api-helpers';
import { serverFetch } from '@/utils/server-fetch';
import { updateTag } from 'next/cache';

export const createGroupOrderSessionAction = actionClient
  .inputSchema(createGroupOrderSessionSchema)
  .action(async ({ parsedInput }) => {
    const userId = await getUserId();
    const response = await serverFetch<
      ApiResponse<GroupOrderSessionSuccessResponse>
    >('/user/group-orders', 'POST', {
      body: parsedInput,
    });

    updateTag(`groups-sessions-${userId}`);

    return response;
  });

export const addItemToGroupOrderSessionAction = actionClient
  .inputSchema(addGroupCartItemSchema)
  .action(async ({ parsedInput }) => {
    const { group_order_id, item_id, quantity, notes } = parsedInput;
    const userId = await getUserId();
    const response = await serverFetch<ApiResponse<GroupOrderCartItemResponse>>(
      `/user/group-orders/${group_order_id}/items`,
      'POST',
      {
        body: {
          item_id,
          quantity,
          notes,
        },
      },
    );

    updateTag(`groups-sessions-${userId}`);

    return response;
  });

export const removeItemFromGroupOrderSessionAction = actionClient
  .inputSchema(removeGroupCartItemSchema)
  .action(async ({ parsedInput }) => {
    const { group_order_id, item_id } = parsedInput;
    const userId = await getUserId();
    const response = await serverFetch<ApiResponse<null>>(
      `/user/group-orders/${group_order_id}/items/${item_id}`,
      'DELETE',
    );

    updateTag(`groups-sessions-${userId}`);

    return response;
  });
