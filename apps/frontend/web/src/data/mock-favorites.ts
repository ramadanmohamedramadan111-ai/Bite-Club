import { getMenuItemById } from '@/data/restaurant-details';
import type { MenuItem } from '@/types/restaurant/restaurantItem';

export const favoriteMenuItemIds = [1, 3, 4, 6, 9];

export function getFavoriteMenuItems(): MenuItem[] {
  return favoriteMenuItemIds
    .map((id) => getMenuItemById(id))
    .filter((item): item is MenuItem => Boolean(item));
}
