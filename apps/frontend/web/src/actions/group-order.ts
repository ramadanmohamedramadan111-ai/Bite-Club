'use server';
import { actionClient } from '@/lib/safe-action';
import { z } from 'zod';
import { idSchema } from '@/schemas/common/id-schema';
import { addGroupCartItemSchema } from '@/schemas/group-order/add-item-schema';
import { checkoutGroupPaySchema } from '@/schemas/group-order/checkout-payment-schema';
import { checkoutGroupPreviewDeliverySchema } from '@/schemas/group-order/checkout-preview-delivery-schema';
import { checkoutGroupPreviewPickupSchema } from '@/schemas/group-order/checkout-preview-pickup-schema';
import { createGroupOrderSessionSchema } from '@/schemas/group-order/create-group-order-session-schema';
import { removeGroupCartItemSchema } from '@/schemas/group-order/remove-item-schema';
import { updateGroupCartItemQuantitySchema } from '@/schemas/group-order/update-item-quantity-schema';
import { ApiResponse } from '@/types/api';
import {
  CheckoutPaymentResponse,
  CheckoutPreviewResponse,
} from '@/types/checkout';
import {
  GroupOrderCartItemResponse,
  GroupOrderSessionSuccessResponse,
} from '@/types/group-order';
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

export const updateItemQuantityGroupOrderSessionAction = actionClient
  .inputSchema(updateGroupCartItemQuantitySchema)
  .action(async ({ parsedInput }) => {
    const { group_order_id, item_id, quantity } = parsedInput;
    const userId = await getUserId();
    const response = await serverFetch<ApiResponse<null>>(
      `/user/group-orders/${group_order_id}/items/${item_id}`,
      'PUT',
      {
        body: {
          quantity,
        },
      },
    );

    updateTag(`groups-sessions-${userId}`);

    return response;
  });

// HOST ONLY
export const checkoutGroupPreviewDeliveryAction = actionClient
  .inputSchema(checkoutGroupPreviewDeliverySchema)
  .action(async ({ parsedInput }) => {
    const userId = await getUserId();
    const { group_order_id, lat, long, order_type } = parsedInput;

    const response = await serverFetch<ApiResponse<CheckoutPreviewResponse>>(
      `/user/group-orders/${group_order_id}/preview`,
      'POST',
      {
        body: {
          order_type,
          lat,
          long,
        },
      },
    );

    updateTag(`groups-sessions-${userId}`);

    return response;
  });

// HOST ONLY
export const checkoutGroupPreviewPickupAction = actionClient
  .inputSchema(checkoutGroupPreviewPickupSchema)
  .action(async ({ parsedInput }) => {
    const userId = await getUserId();
    const { group_order_id, order_type } = parsedInput;

    const response = await serverFetch<ApiResponse<CheckoutPreviewResponse>>(
      `/user/group-orders/${group_order_id}/preview`,
      'POST',
      {
        body: {
          order_type,
        },
      },
    );

    updateTag(`groups-sessions-${userId}`);

    return response;
  });

// HOST ONLY
export const unlockGroupAction = actionClient
  .inputSchema(idSchema)
  .action(async ({ parsedInput }) => {
    const userId = await getUserId();

    const response = await serverFetch<ApiResponse<CheckoutPreviewResponse>>(
      `/user/group-orders/${parsedInput}/unlock`,
      'POST',
    );

    updateTag(`groups-sessions-${userId}`);

    return response;
  });

// HOST ONLY
export const checkoutGroupPayAction = actionClient
  .inputSchema(checkoutGroupPaySchema)
  .action(async ({ parsedInput }) => {
    const userId = await getUserId();
    const { group_order_id, ...body } = parsedInput;

    const response = await serverFetch<ApiResponse<CheckoutPaymentResponse>>(
      `/user/group-orders/${group_order_id}/place`,
      'POST',
      {
        body: body,
      },
    );

    updateTag(`groups-sessions-${userId}`);

    return response;
  });

// HOST ONLY
export const cancelGroupAction = actionClient
  .inputSchema(idSchema)
  .action(async ({ parsedInput }) => {
    const userId = await getUserId();

    const response = await serverFetch<ApiResponse<null>>(
      `/user/group-orders/${parsedInput}/cancel`,
      'POST',
    );

    updateTag(`groups-sessions-${userId}`);

    return response;
  });

export const clearMyItemsGroupOrderAction = actionClient
  .inputSchema(idSchema)
  .action(async ({ parsedInput }) => {
    const userId = await getUserId();

    const response = await serverFetch<ApiResponse<null>>(
      `/user/group-orders/${parsedInput}/items`,
      'DELETE',
    );

    updateTag(`groups-sessions-${userId}`);

    return response;
  });

export const revalidateGroupOrderSessionAction = actionClient
  .inputSchema(z.object({ sessionId: z.string() }))
  .action(async ({ parsedInput }) => {
    const { sessionId } = parsedInput;
    updateTag(`group-order-session-${sessionId}`);
    return { success: true };
  });

