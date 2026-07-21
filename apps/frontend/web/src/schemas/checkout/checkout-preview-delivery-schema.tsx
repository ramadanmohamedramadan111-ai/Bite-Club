import z from 'zod';

export const checkoutPreviewDeliverySchema = z.object({
  order_type: z.enum(['delivery']),
  lat: z.number(),
  long: z.number(),
});

