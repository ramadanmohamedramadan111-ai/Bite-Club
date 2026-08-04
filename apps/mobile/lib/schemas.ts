import { z } from 'zod';

export type TFunc = (key: string) => string;

export const createLoginSchema = (t: TFunc) =>
  z.object({
    email: z.string().trim().min(1, t('validation.emailRequired')).email(t('validation.emailInvalid')),
    password: z.string().min(8, t('validation.passwordMin')),
  });
export type LoginValues = z.infer<ReturnType<typeof createLoginSchema>>;

export const createRegisterSchema = (t: TFunc) =>
  z
    .object({
      first_name: z.string().trim().min(2, t('validation.firstNameMin')),
      last_name: z.string().trim().min(2, t('validation.lastNameMin')),
      email: z.string().trim().min(1, t('validation.emailRequired')).email(t('validation.emailInvalid')),
      username: z
        .string()
        .trim()
        .min(3, t('validation.usernameMin'))
        .max(30, t('validation.usernameMax'))
        .regex(/^[a-zA-Z0-9_]+$/, t('validation.usernameChars')),
      phone_number: z.string().trim().regex(/^\+?[0-9]{10,15}$/, t('validation.phoneInvalid')),
      gender: z.enum(['male', 'female'], { message: t('validation.genderRequired') }),
      date_of_birth: z.string().min(1, t('validation.dobRequired')),
      password: z.string().min(8, t('validation.passwordMin')),
      password_confirmation: z.string(),
      referrer_code: z.string().trim().optional().or(z.literal('')),
    })
    .refine((data) => data.password === data.password_confirmation, {
      path: ['password_confirmation'],
      message: t('validation.passwordsMatch'),
    });
export type RegisterValues = z.infer<ReturnType<typeof createRegisterSchema>>;

export const createRestaurantRegisterSchema = (t: TFunc) =>
  z
    .object({
      name: z.string().trim().min(2, t('validation.restaurantNameMin')),
      email: z.string().trim().min(1, t('validation.emailRequired')).email(t('validation.emailInvalid')),
      phone_number: z.string().trim().regex(/^\+?[0-9]{10,15}$/, t('validation.phoneInvalid')),
      category_id: z
        .number({ message: t('validation.categoryRequired') })
        .int()
        .positive(t('validation.categoryRequired')),
      description: z.string().trim().min(10, t('validation.descriptionMin')),
      address: z.string().trim().min(5, t('validation.addressMin')),
      password: z.string().min(8, t('validation.passwordMin')),
      password_confirmation: z.string(),
    })
    .refine((data) => data.password === data.password_confirmation, {
      path: ['password_confirmation'],
      message: t('validation.passwordsMatch'),
    });
export type RestaurantRegisterValues = z.infer<ReturnType<typeof createRestaurantRegisterSchema>>;

export const createForgotPasswordSchema = (t: TFunc) =>
  z.object({
    email: z.string().trim().min(1, t('validation.emailRequired')).email(t('validation.emailInvalid')),
  });
export type ForgotPasswordValues = z.infer<ReturnType<typeof createForgotPasswordSchema>>;

export const createVerifyOtpSchema = (t: TFunc) =>
  z.object({
    otp: z.string().length(6, t('fp.otpInvalid')),
  });
export type VerifyOtpValues = z.infer<ReturnType<typeof createVerifyOtpSchema>>;

export const createResetPasswordSchema = (t: TFunc) =>
  z
    .object({
      password: z.string().min(8, t('validation.passwordMin')),
      password_confirmation: z.string(),
    })
    .refine((data) => data.password === data.password_confirmation, {
      path: ['password_confirmation'],
      message: t('validation.passwordsMatch'),
    });
export type ResetPasswordValues = z.infer<ReturnType<typeof createResetPasswordSchema>>;