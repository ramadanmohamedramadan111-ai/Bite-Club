import { z } from 'zod';
import { FRIENDS_TABS } from '@/types/social/friends';

export const friendsSearchParamsSchema = z.object({
  tab: z.enum(FRIENDS_TABS).optional().default('friends'),
  search: z.string().trim().optional().default(''),
});
