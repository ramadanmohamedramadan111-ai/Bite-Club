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

    updateTag(`group-order-sessions-${userId}`);
    updateTag(`group-order-sessions`);

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

    updateTag(`group-order-session-${group_order_id}`);
    updateTag(`group-order-sessions-${userId}`);

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

    updateTag(`group-order-session-${group_order_id}`);
    updateTag(`group-order-sessions-${userId}`);

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

    updateTag(`group-order-session-${group_order_id}`);
    updateTag(`group-order-sessions-${userId}`);

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

    updateTag(`group-order-sessions-${userId}`);

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

    updateTag(`group-order-sessions-${userId}`);

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

    updateTag(`group-order-session-${parsedInput}`);
    updateTag(`group-order-sessions-${userId}`);
    updateTag(`group-order-sessions`);

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

    updateTag(`group-order-session-${group_order_id}`);
    updateTag(`group-order-sessions-${userId}`);
    updateTag(`group-order-sessions`);
    updateTag(`wallet-${userId}`);
    updateTag(`streak-${userId}`);

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

    updateTag(`group-order-session-${parsedInput}`);
    updateTag(`group-order-sessions-${userId}`);
    updateTag(`group-order-sessions`);

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

    updateTag(`group-order-session-${parsedInput}`);
    updateTag(`group-order-sessions-${userId}`);

    return response;
  });

export const revalidateGroupOrderSessionAction = actionClient
  .inputSchema(z.object({ sessionId: z.string() }))
  .action(async ({ parsedInput }) => {
    const { sessionId } = parsedInput;
    updateTag(`group-order-session-${sessionId}`);
    return { success: true };
  });

export const addGuestItemToGroupOrderAction = actionClient
  .inputSchema(
    z.object({
      group_order_id: z.number(),
      user_id: z.number(),
      user_name: z.string(),
      item_id: z.number(),
      quantity: z.number(),
      notes: z.string().optional(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { group_order_id, user_id, user_name, item_id, quantity, notes } = parsedInput;
    const response = await serverFetch<ApiResponse<any>>(
      `/user/group-orders/${group_order_id}/guest/items`,
      'POST',
      {
        body: {
          user_id: user_id.toString(),
          user_name,
          item_id,
          quantity,
          notes,
        },
      },
    );

    updateTag(`group-order-session-${group_order_id}`);

    return response;
  });

export const updateGuestItemQuantityGroupOrderAction = actionClient
  .inputSchema(
    z.object({
      group_order_id: z.number(),
      item_id: z.number(),
      user_id: z.number(),
      quantity: z.number(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { group_order_id, item_id, user_id, quantity } = parsedInput;
    const response = await serverFetch<ApiResponse<null>>(
      `/user/group-orders/${group_order_id}/guest/items/${item_id}`,
      'PUT',
      {
        body: {
          user_id: user_id.toString(),
          quantity,
        },
      },
    );

    updateTag(`group-order-session-${group_order_id}`);

    return response;
  });

export const removeGuestItemFromGroupOrderAction = actionClient
  .inputSchema(
    z.object({
      group_order_id: z.number(),
      item_id: z.number(),
      user_id: z.number(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { group_order_id, item_id, user_id } = parsedInput;
    const response = await serverFetch<ApiResponse<null>>(
      `/user/group-orders/${group_order_id}/guest/items/${item_id}`,
      'DELETE',
      {
        body: {
          user_id: user_id.toString(),
        },
      },
    );

    updateTag(`group-order-session-${group_order_id}`);

    return response;
  });

export const clearGuestItemsGroupOrderAction = actionClient
  .inputSchema(
    z.object({
      group_order_id: z.number(),
      user_id: z.number(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { group_order_id, user_id } = parsedInput;
    const response = await serverFetch<ApiResponse<null>>(
      `/user/group-orders/${group_order_id}/guest/items`,
      'DELETE',
      {
        body: {
          user_id: user_id.toString(),
        },
      },
    );

    updateTag(`group-order-session-${group_order_id}`);

    return response;
  });

export const mergeGuestItemsAction = actionClient
  .inputSchema(
    z.object({
      group_orders: z.array(
        z.object({
          id: z.number(),
          name: z.string(),
        }),
      ),
      user_id: z.number(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { group_orders, user_id } = parsedInput;
    const response = await serverFetch<ApiResponse<null>>(
      '/user/group-orders/guest/merge',
      'POST',
      {
        body: {
          group_orders,
          user_id: user_id.toString(),
        },
      },
    );

    group_orders.forEach((go) => {
      updateTag(`group-order-session-${go.id}`);
    });

    const currentUserId = await getUserId();
    if (currentUserId) {
      updateTag(`group-order-sessions-${currentUserId}`);
      updateTag(`group-order-sessions`);
    }

    return response;
  });
