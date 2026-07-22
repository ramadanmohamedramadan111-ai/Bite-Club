import { Order } from '../orders/order';
import { SocialUser } from './friends';

export type PostType = {
  id: number;
  user: {
    id: number;
    name: string;
    username: string;
    profile_image_url: string | null;
  };
  restaurant: {
    id: number;
    name: string;
    logo_url: string | null;
  };
  images: {
    id: number;
    image_url: string | null;
    position: number;
  }[];
  order: Order;
  caption: string;
  likes_count: number;
  copy_count: number;
  is_liked_by_user: boolean;
  status: 'approved' | 'pending';
  published_at: string;
  expires_at: string;
  created_at: string;
};

export interface Post {
  id: string;
  authorId: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar: string | null;
  };
  restaurantId: string;
  restaurant: {
    id: string;
    name: string;
    address: string;
    image: string | null;
  };
  items: PostItem[];
  caption: string;
  images: string[];
  likeCount: number;
  commentCount: number;
  createdAt: string;
  isLiked?: boolean;
}

export interface PostItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface ActivityFeedPost extends Post {
  timestamp: string;
}

type LegacyPost = Post & { image?: string };

export function getPostImages(post: LegacyPost): string[] {
  if (post.images?.length) {
    return post.images;
  }

  if (post.image) {
    return [post.image];
  }

  return [];
}

export function normalizePost(post: LegacyPost): Post {
  const { image: _image, ...rest } = post;

  return {
    ...rest,
    images: getPostImages(post),
  };
}

