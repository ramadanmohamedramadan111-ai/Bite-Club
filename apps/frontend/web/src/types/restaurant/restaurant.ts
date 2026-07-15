export type RestaurantLocation = {
  address: string;
  latitude: number;
  longitude: number;
};

export type RestaurantDetail = {
  id: number;
  // name: string;
  email: string;
  phone_number: string;
  category_id: number;
  category: RestaurantCategory;
  // description: string;
  logo_url: string;
  cover_image_uri: string;
  address: string;
  status: string;
  average_rating: string;
  total_orders_count: number;

  // isFavorite
  // reviewsCount
  // categories??
  // location??
  // delivery
  // pickup
  // creditCard
  // isAvailable
  // deliveryTime
  // deliveryPrice
  // scannedMenu
  // minimumOrder
  // openingHours

  logo: string;
  coverImage: string;
  isFavorite: boolean;
  rating: number;
  reviewsCount: number;
  name: string;
  categories: string[];
  delivery: boolean;
  pickup: boolean;
  creditCard: boolean;
  isAvailable: boolean;
  minDeliveryTime: number;
  maxDeliveryTime: number;
  minDeliveryPrice: number;
  maxDeliveryPrice: number;
  scannedMenu: string;
  minimumOrder: number;
  location: RestaurantLocation;
  openingHours: Record<string, string>;
  phoneNumber: string;
  description: string;
};

export type RestaurantReview = {
  id: number;
  user: {
    name: string;
    avatar: string;
  };
  rating: number;
  comment: string;
  date: string;
};

export interface RestaurantCategory {
  id: number;
  name: string;
  slug: string;
}

