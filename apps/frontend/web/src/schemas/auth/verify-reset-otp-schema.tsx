import z from 'zod';

export const verifyResetOTPSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

