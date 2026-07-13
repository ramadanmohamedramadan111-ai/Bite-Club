export const restaurantCategories = [
  'Italian',
  'Pizza',
  'Burgers',
  'Fast Food',
  'Asian',
  'Seafood',
  'Desserts',
] as const;

export type RestaurantCategory = (typeof restaurantCategories)[number];

export const categoryEmojis: Record<RestaurantCategory, string> = {
  Italian: '🍝',
  Pizza: '🍕',
  Burgers: '🍔',
  'Fast Food': '🍟',
  Asian: '🍜',
  Seafood: '🦐',
  Desserts: '🍰',
};
