import { PostItem } from '@/types/social/posts';

export interface PastOrder {
  id: string;
  restaurantId: string;
  restaurantName: string;
  restaurantAddress: string;
  restaurantImage: string;
  items: PostItem[];
  totalPrice: number;
  orderedAt: string;
  image: string;
}
