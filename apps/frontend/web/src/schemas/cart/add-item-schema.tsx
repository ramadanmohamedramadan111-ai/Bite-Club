import z from 'zod';
import { idSchema } from '../common/id-schema';

export const addCartItemSchema = z.object({
  restaurant_id: idSchema,
  item_id: idSchema,
  quantity: idSchema,
  notes: z.string().optional(),
});

