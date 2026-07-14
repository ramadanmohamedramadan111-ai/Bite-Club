'use server';

import { z } from 'zod';
import { actionClient } from '@/lib/safe-action';
import { serverFetch } from '@/utils/server-fetch';
import { ApiResponse } from '@/types/api/api-response';

export const verifyResetOtpAction = actionClient
  .inputSchema(
    z.object({
      email: z.string().email(),
      otp: z.string().length(6),
    }),
  )
  .action(async ({ parsedInput }) => {
    const response = await serverFetch<ApiResponse<unknown>>(
      '/user/verify-reset-otp',
      'POST',
      {
        body: parsedInput,
      },
    );

    return response;
  });

