import z from 'zod';
import { idSchema } from '../common/id-schema';

export const checkoutGroupPreviewDeliverySchema = z.object({
  group_order_id: idSchema,
  order_type: z.enum(['delivery']),
  lat: z.number(),
  long: z.number(),
});

