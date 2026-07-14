'use server';

import { actionClient } from '@/lib/safe-action';
import { createRestaurantRegisterSchema } from '@/schemas/auth/restaurant-register-schema';
import { ApiResponse } from '@/types/api/api-response';
import { RestaurantRegistrationResponse } from '@/types/auth/auth';
import { serverFetch } from '@/utils/server-fetch';
import { getTranslations } from 'next-intl/server';

export const registerRestaurantAction = actionClient
  .inputSchema(async () => {
    const t = await getTranslations('forms.registerRestaurant');
    return createRestaurantRegisterSchema(t);
  })
  .action(async ({ parsedInput }) => {
    console.log('Parsed input:', parsedInput);
    const response = await serverFetch<
      ApiResponse<RestaurantRegistrationResponse>
    >('/restaurant/register', 'POST', {
      body: parsedInput,
    });

    return response;
  });

