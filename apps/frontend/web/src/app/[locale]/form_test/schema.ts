import { z } from 'zod';

export const formSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export type FormValues = z.infer<typeof formSchema>;
