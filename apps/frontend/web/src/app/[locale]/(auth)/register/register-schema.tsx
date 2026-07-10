import { useTranslations } from 'next-intl';
import { z } from 'zod';

function createRegisterSchema(t: ReturnType<typeof useTranslations>) {
  return z
    .object({
      firstName: z.string().trim().min(2, t('firstName.errors.minLength')),
      lastName: z.string().trim().min(2, t('lastName.errors.minLength')),
      email: z.email(t('email.errors.invalid')),
      username: z
        .string()
        .trim()
        .min(3, t('username.errors.minLength'))
        .max(30, t('username.errors.maxLength'))
        .regex(/^[a-zA-Z0-9_]+$/, t('username.errors.invalid')),

      mobileNumber: z
        .string()
        .trim()
        .regex(/^\+?[0-9]{10,15}$/, t('phoneNumber.errors.invalid')),

      gender: z.enum(['male', 'female'], {
        message: t('gender.errors.required'),
      }),

      dob: z.string().min(1, t('dateOfBirth.errors.required')),

      password: z.string().min(8, t('password.errors.minLength')),

      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      path: ['confirmPassword'],
      message: t('confirmPassword.errors.mismatch'),
    });
}

export function useRegisterSchema() {
  const t = useTranslations('forms.register.fields');

  return createRegisterSchema(t);
}

export type RegisterSchema = z.infer<ReturnType<typeof createRegisterSchema>>;

