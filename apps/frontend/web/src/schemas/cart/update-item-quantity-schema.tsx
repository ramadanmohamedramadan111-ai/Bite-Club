import z from 'zod';
import { idSchema } from '../common/id-schema';

export const updateCartItemQuantitySchema = z.object({
  id: idSchema,
  quantity: idSchema,
});

