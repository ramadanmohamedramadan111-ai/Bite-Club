import { z } from 'zod';
import { idSchema } from '../common/id-schema';

export const createGroupOrderSessionSchema = z.object({
  group_id: idSchema,
  restaurant_id: idSchema,
});

