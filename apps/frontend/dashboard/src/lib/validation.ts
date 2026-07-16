import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().trim().email('invalidEmail'),
  password: z.string().min(8, 'invalidPassword'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('invalidEmail'),
})

export const resetPasswordSchema = z
  .object({
    email: z.string().trim().email('invalidEmail'),
    token: z.string().min(1, 'invalidToken'),
    password: z.string().min(8, 'invalidPassword'),
    password_confirmation: z.string().min(8, 'invalidPassword'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'passwordMismatch',
    path: ['password_confirmation'],
  })

export type LoginFormValues = z.infer<typeof loginSchema>
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>
