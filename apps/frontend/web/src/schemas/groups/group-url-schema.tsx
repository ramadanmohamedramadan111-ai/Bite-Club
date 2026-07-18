import { GROUP_TABS } from '@/types/groups/groups';
import z from 'zod';

export const groupUrlSchema = z.object({
  tab: z.enum(GROUP_TABS).optional().default('members'),
  search: z.string().trim().optional().default(''),
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(1),
});

