import { z } from 'zod';
import { FRIENDS_TABS } from '@/types/social/friends';

export const idSchema = z.number().positive();

