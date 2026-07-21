'use server';

import { actionClient } from '@/lib/safe-action';
import { checkoutPreviewDeliverySchema } from '@/schemas/checkout/checkout-preview-delivery-schema';
import { checkoutPreviewPickupSchema } from '@/schemas/checkout/checkout-preview-pickup-schema';
import { checkoutPaySchema } from '@/schemas/checkout/checkout-payment-schema';

import { ApiResponse } from '@/types/api/api-response';
import {
  CheckoutPreviewResponse,
  CheckoutPaymentResponse,
} from '@/types/checkout/checkout';
import { getUserId } from '@/utils/api-helpers';
import { serverFetch } from '@/utils/server-fetch';
import { updateTag } from 'next/cache';

export const checkoutPreviewDeliveryAction = actionClient
  .inputSchema(checkoutPreviewDeliverySchema)
  .action(async ({ parsedInput }) => {
    const userId = await getUserId();

    const response = await serverFetch<ApiResponse<CheckoutPreviewResponse>>(
      '/user/checkout/preview',
      'POST',
      {
        body: parsedInput,
      },
    );

    updateTag(`cart-${userId}`);

    return response;
  });

export const checkoutPreviewPickupAction = actionClient
  .inputSchema(checkoutPreviewPickupSchema)
  .action(async ({ parsedInput }) => {
    const userId = await getUserId();

    const response = await serverFetch<ApiResponse<CheckoutPreviewResponse>>(
      '/user/checkout/preview',
      'POST',
      {
        body: parsedInput,
      },
    );

    updateTag(`cart-${userId}`);

    return response;
  });

export const checkoutPayAction = actionClient
  .inputSchema(checkoutPaySchema)
  .action(async ({ parsedInput }) => {
    const userId = await getUserId();

    const response = await serverFetch<ApiResponse<CheckoutPaymentResponse>>(
      '/user/checkout/place',
      'POST',
      {
        body: parsedInput,
      },
    );

    updateTag(`cart-${userId}`);

    return response;
  });

