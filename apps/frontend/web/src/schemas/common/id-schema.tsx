import { z } from 'zod';
import { FRIENDS_TABS } from '@/types/friends';

export const idSchema = z.number().positive();

