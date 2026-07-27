import { z } from 'zod';

export function parseSearchParams<T>(
  schema: z.ZodSchema<T>,
  rawParams: Record<string, string | string[] | undefined>,
): { success: true; data: T } | { success: false } {
  const normalized: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(rawParams)) {
    if (Array.isArray(value)) {
      normalized[key] = value[0];
    } else {
      normalized[key] = value;
    }
  }
  const result = schema.safeParse(normalized);
  if (result.success) return { success: true, data: result.data };
  return { success: false };
}

export const PaginatedParams = z.object({
  page: z.coerce.number().int().positive().optional(),
  per_page: z.coerce.number().int().positive().optional(),
});

export const SearchPaginatedParams = PaginatedParams.extend({
  search: z.string().optional(),
});

export const RestaurantListParams = z.object({
  page: z.coerce.number().int().positive().optional(),
  category: z.string().optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  delivery: z.string().optional(),
  pickup: z.string().optional(),
  availableOnly: z.string().optional(),
  search: z.string().optional(),
  sort: z.string().optional(),
});

export const ReferrerParams = z.object({
  referrer_code: z.string().optional(),
});
