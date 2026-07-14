import { useTranslations } from 'next-intl';
import { z } from 'zod';

export function createRestaurantRegisterSchema(
  t: ReturnType<typeof useTranslations>,
) {
  return z
    .object({
      name: z.string().trim().min(2, t('fields.name.errors.minLength')),
      email: z.email(t('fields.email.errors.invalid')),

      phone_number: z
        .string()
        .trim()
        .regex(/^\+?[0-9]{10,15}$/, t('fields.phoneNumber.errors.invalid')),

      category_id: z.number(t('fields.category.errors.required')),

      description: z
        .string()
        .trim()
        .min(10, t('fields.description.errors.minLength')),
      address: z.string().trim().min(5, t('fields.address.errors.minLength')),

      password: z.string().min(8, t('fields.password.errors.minLength')),

      password_confirmation: z.string(),
    })
    .refine((data) => data.password === data.password_confirmation, {
      path: ['password_confirmation'],
      message: t('fields.confirmPassword.errors.mismatch'),
    });
}

export type RestaurantRegisterSchema = z.infer<
  ReturnType<typeof createRestaurantRegisterSchema>
>;

