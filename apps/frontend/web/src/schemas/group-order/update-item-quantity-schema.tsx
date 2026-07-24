import z from 'zod';
import { idSchema } from '../common/id-schema';

export const updateGroupCartItemQuantitySchema = z.object({
  group_order_id: idSchema,
  item_id: idSchema,
  quantity: idSchema,
});

