import { z } from 'zod';
import { idSchema } from '../common/id-schema';

export const createGroupOrderSessionSchema = z.object({
  group_id: idSchema.optional().nullable(),
  restaurant_id: idSchema,
  is_anonymous: z.boolean().optional(),
});

