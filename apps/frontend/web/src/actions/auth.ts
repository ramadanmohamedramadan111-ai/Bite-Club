'use server';

import { actionClient } from '@/lib/safe-action';
import { serverFetch } from '@/utils/server-fetch';
import { getTranslations } from 'next-intl/server';
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
    return createUserLoginSchema(t);
  })
  .action(async ({ parsedInput }) => {
    const response = await serverFetch<ApiResponse<UserLoginResponse>>(
      '/user/login',
      'POST',
      {
        body: parsedInput,
      },
    );

    await setAuthCookie(response.data.access_token);

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

