export type RestaurantLocation = {
  address: string;
  latitude: number;
  longitude: number;
};

export type RestaurantDetail = {
  id: number;
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
