import { z } from 'zod';

export const checkoutPaySchema = z.discriminatedUnion('order_type', [
  z.object({
    order_type: z.literal('delivery'),
    lat: z.number(),
    long: z.number(),
    payment_option_id: z.enum(['full_online', 'full_cash', 'split_payment']),
    notes: z.string().optional(),
  }),
  z.object({
    order_type: z.literal('pickup'),
    payment_option_id: z.enum(['full_online', 'full_cash', 'split_payment']),
    notes: z.string().optional(),
  }),
]);

