'use server';

import { actionClient } from '@/lib/safe-action';
import { idSchema } from '@/schemas/common/id-schema';
import { createReviewSchema } from '@/schemas/restaurants/create-review-schema';
import { ApiResponse } from '@/types/api';
import { RestaurantReviewCreateResponse } from '@/types/restaurant';
import { getUserId } from '@/utils/api-helpers';
import { serverFetch } from '@/utils/server-fetch';
import { getTranslations } from 'next-intl/server';
import { updateTag } from 'next/cache';

export const createReviewAction = actionClient
  .inputSchema(async () => {
    const t = await getTranslations('reviews');
    return createReviewSchema(t);
  })
  .action(async ({ parsedInput }) => {
    const { restaurant_id, ...body } = parsedInput;
    const userId = await getUserId();
    const response = await serverFetch<
      ApiResponse<RestaurantReviewCreateResponse>
    >(`/user/restaurants/${restaurant_id}/reviews`, 'POST', {
      body: body,
    });

    updateTag(`restaurant-reviews-${restaurant_id}`);
    updateTag(`restaurant-my-review-${restaurant_id}-${userId}`);
    updateTag(`restaurant-${restaurant_id}`);

    return response;
  });

export const updateReviewAction = actionClient
  .inputSchema(async () => {
    const t = await getTranslations('reviews');
    return createReviewSchema(t);
  })
  .action(async ({ parsedInput }) => {
    const { restaurant_id, ...body } = parsedInput;
    const userId = await getUserId();
    const response = await serverFetch<
      ApiResponse<RestaurantReviewCreateResponse>
    >(`/user/restaurants/${restaurant_id}/reviews`, 'PUT', {
      body: body,
    });

    updateTag(`restaurant-reviews-${restaurant_id}`);
    updateTag(`restaurant-my-review-${restaurant_id}-${userId}`);
    updateTag(`restaurant-${restaurant_id}`);

    return response;
  });

export const deleteReviewAction = actionClient
  .inputSchema(idSchema)
  .action(async ({ parsedInput }) => {
    const restaurant_id = parsedInput;
    const userId = await getUserId();
    const response = await serverFetch<
      ApiResponse<RestaurantReviewCreateResponse>
    >(`/user/restaurants/${restaurant_id}/reviews`, 'DELETE');

    updateTag(`restaurant-reviews-${restaurant_id}`);
    updateTag(`restaurant-my-review-${restaurant_id}-${userId}`);
    updateTag(`restaurant-${restaurant_id}`);

    return response;
  });

export const revalidateLocationAction = async () => {
  const userId = await getUserId();
  updateTag('nearest-guest');
  if (userId) {
    updateTag(`nearest-${userId}`);
  }
};
