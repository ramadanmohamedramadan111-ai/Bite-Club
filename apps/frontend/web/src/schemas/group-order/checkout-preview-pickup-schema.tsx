import z from 'zod';
import { idSchema } from '../common/id-schema';

export const checkoutGroupPreviewPickupSchema = z.object({
  group_order_id: idSchema,
  order_type: z.enum(['pickup']),
});

