'use server';

import { actionClient } from '@/lib/safe-action';
import { serverFetch } from '@/utils/server-fetch';
import { getTranslations } from 'next-intl/server';
import { z } from 'zod';
import { ApiResponse } from '@/types/api';
import { cookies } from 'next/headers';
import { createUserLoginSchema } from '@/schemas/auth/user-login-schema';
import {
  RestaurantRegistrationResponse,
  UserLoginResponse,
  UserRegistrationResponse,
} from '@/types/auth';
import { createForgotPasswordSchema } from '@/schemas/auth/forget-password-schema';
import { createRestaurantRegisterSchema } from '@/schemas/auth/restaurant-register-schema';
import { createUserRegisterSchema } from '@/schemas/auth/user-register-schema';
import { createResetPasswordSchema } from '@/schemas/auth/reset-password-schema';
import { verifyResetOTPSchema } from '@/schemas/auth/verify-reset-otp-schema';
import { resendVerificationSchema } from '@/schemas/auth/resend-verification-schema';

async function setAuthCookie(token: string) {
  const cookieStore = await cookies();

  cookieStore.set('accessToken', token, {
    httpOnly: true,
    secure: false, // local development
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export const forgotPasswordAction = actionClient
  .inputSchema(async () => {
    const t = await getTranslations('forms.forgetPassword.fields');
    return createForgotPasswordSchema(t);
  })
  .action(async ({ parsedInput }) => {
    const response = await serverFetch<ApiResponse<unknown>>(
      '/user/forgot-password',
      'POST',
      {
        body: parsedInput,
      },
    );

    return response;
  });

export const loginUserAction = actionClient
  .inputSchema(async () => {
    const t = await getTranslations('forms.login');
    const loginSchema = createUserLoginSchema(t);

    return z.object({
      email: loginSchema.shape.email,
      password: loginSchema.shape.password,
      guestCart: z
        .object({
          restaurant_id: z.number(),
          items: z.array(
            z.object({
              item_id: z.number(),
              quantity: z.number().min(1),
              notes: z.string().nullable().optional(),
            }),
          ),
        })
        .optional(),
    });
  })
  .action(async ({ parsedInput }) => {
    const response = await serverFetch<ApiResponse<UserLoginResponse>>(
      '/user/login',
      'POST',
      {
        body: {
          email: parsedInput.email,
          password: parsedInput.password,
        },
      },
    );

    await setAuthCookie(response.data.access_token);

    if (parsedInput.guestCart) {
      try {
        await serverFetch<ApiResponse<null>>('/user/cart/merge', 'POST', {
          body: parsedInput.guestCart,
        });
      } catch (error) {
        console.error('Failed to merge guest cart:', error);
      }
    }

    return response;
  });

export const logoutUserAction = actionClient.action(async () => {
  const cookieStore = await cookies();
  let res;
  try {
    res = await serverFetch<ApiResponse<{ message: string }>>(
      '/user/logout',
      'POST',
      {
        skipRefresh: true,
      },
    );
  } finally {
    cookieStore.delete('accessToken');
  }

  return res;
});

export const registerRestaurantAction = actionClient
  .inputSchema(async () => {
    const t = await getTranslations('forms.registerRestaurant');
    return createRestaurantRegisterSchema(t);
  })
  .action(async ({ parsedInput }) => {
    const response = await serverFetch<
      ApiResponse<RestaurantRegistrationResponse>
    >('/restaurant/register', 'POST', {
      body: parsedInput,
    });

    return response;
  });

export const registerUserAction = actionClient
  .inputSchema(async () => {
    const t = await getTranslations('forms.register');
    return createUserRegisterSchema(t);
  })
  .action(async ({ parsedInput }) => {
    const response = await serverFetch<ApiResponse<UserRegistrationResponse>>(
      '/user/register',
      'POST',
      {
        body: parsedInput,
      },
    );

    console.log('RESPONSE', response);

    return response;
  });

export const resetPasswordAction = actionClient
  .inputSchema(async () => {
    const t = await getTranslations('forms.newPassword.fields');
    return createResetPasswordSchema(t);
  })
  .action(async ({ parsedInput }) => {
    const response = await serverFetch<ApiResponse<unknown>>(
      '/user/reset-password',
      'POST',
      {
        body: parsedInput,
      },
    );

    return response;
  });

export const verifyResetOtpAction = actionClient
  .inputSchema(verifyResetOTPSchema)
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

export const verifyEmailAction = actionClient
  .inputSchema(verifyResetOTPSchema)
  .action(async ({ parsedInput }) => {
    const response = await serverFetch<ApiResponse<unknown>>(
      '/user/verify-email',
      'POST',
      {
        body: parsedInput,
      },
    );

    return response;
  });

export const resendVerificationAction = actionClient
  .inputSchema(resendVerificationSchema)
  .action(async ({ parsedInput }) => {
    const response = await serverFetch<ApiResponse<unknown>>(
      '/user/resend-verification',
      'POST',
      {
        body: parsedInput,
      },
    );

    return response;
  });

