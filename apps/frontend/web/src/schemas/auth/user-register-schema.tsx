import { useTranslations } from 'next-intl';
import { z } from 'zod';

export function createUserRegisterSchema(
  t: ReturnType<typeof useTranslations>,
) {
  return z
    .object({
      first_name: z
        .string()
        .trim()
        .min(2, t('fields.firstName.errors.minLength')),
      last_name: z
        .string()
        .trim()
        .min(2, t('fields.lastName.errors.minLength')),
      email: z.email(t('fields.email.errors.invalid')),
      username: z
        .string()
        .trim()
        .min(3, t('fields.username.errors.minLength'))
        .max(30, t('fields.username.errors.maxLength'))
        .regex(/^[a-zA-Z0-9_]+$/, t('fields.username.errors.invalid')),

      phone_number: z
        .string()
        .trim()
        .regex(/^\+?[0-9]{10,15}$/, t('fields.phoneNumber.errors.invalid')),

      gender: z.enum(['male', 'female'], {
        message: t('fields.gender.errors.required'),
      }),

      date_of_birth: z.string().min(1, t('fields.dateOfBirth.errors.required')),

      password: z.string().min(8, t('fields.password.errors.minLength')),

      password_confirmation: z.string(),
    })
    .refine((data) => data.password === data.password_confirmation, {
      path: ['password_confirmation'],
      message: t('fields.confirmPassword.errors.mismatch'),
    });
}

export type UserRegisterSchema = z.infer<
  ReturnType<typeof createUserRegisterSchema>
>;

