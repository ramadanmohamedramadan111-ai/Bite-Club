import z from 'zod';
import { idSchema } from '../common/id-schema';

export const removeGroupCartItemSchema = z.object({
  group_order_id: idSchema,
  item_id: idSchema,
});

