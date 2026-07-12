import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().trim().email('invalidEmail'),
  password: z.string().min(8, 'invalidPassword'),
})

export type LoginFormValues = z.infer<typeof loginSchema>
