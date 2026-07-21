import z from 'zod';

export const checkoutPreviewPickupSchema = z.object({
  order_type: z.enum(['pickup']),
});

