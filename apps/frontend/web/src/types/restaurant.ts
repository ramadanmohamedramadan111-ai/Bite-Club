export type RestaurantReview = {
  id: number;
  user: {
    id: number;
    name: string;
    profile_image_url: string;
  };
  rating: number;
  comment: string;
  created_at: string;
};

export interface RestaurantCategory {
  id: number;
  name: string;
  slug: string;
  image_url?: string;
}

export interface TopRestaurant {
  id: number;
  name: string;
  description: string;
  logo_url: string;
  cover_image_url: string;
  distance: number;
  average_rating: string;
  reviews_count: number;
  settings: RestaurantSettings;
}

export interface RestaurantType {
  id: number;
  name: string;
  description: string;
  logo_url: string;
  cover_image_url: string;
  category?: RestaurantCategory;
  address?: string;
  phone_number?: string;
  average_rating: number;
  reviews_count: number;
  delivery_enabled: boolean;
  pickup_enabled: boolean;
  delivery_fee_per_km?: number;
  is_open_now: boolean;
  opening_hours?: OpeningHours[];
  latitude: number;
  longitude: number;
  minimum_order: number;
  scanned_menu?: string;
}

export type RestaurantSettings = {
  is_open: boolean;
  accept_orders: boolean;
  delivery_enabled: boolean;
  pickup_enabled: boolean;
  latitude: string;
  longitude: string;
};

export type OpeningHours = {
  day_of_week: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  opens_at: string;
  closes_at: string;
  is_closed: boolean;
};

export type MenuItems = {
  id: number;
  title: string;
  items_count: number;
  items: MenuItem[];
};

export type MenuItem = {
  id: number;
  title: string;
  description: string;
  price: number;
  is_available: boolean;
  image_url: string;
  options?: [];
};

export type ItemOption = {
  id: string;
  name: string;
  price: number;
};

export type ItemOptionGroup = {
  id: string;
  title: string;
  required: boolean;
  type: 'single' | 'multiple';
  minSelections?: number;
  maxSelections?: number;
  options: ItemOption[];
};

export type ClientMenuItem = {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  categories: string[];
  likesCount: number;
  preparationTime: number;
  available: boolean;
  stock?: number;
  restaurantId: number;
  image: string;
  options: ItemOptionGroup[];
};

export type RestaurantLocation = {
  address: string;
  latitude: number;
  longitude: number;
};

