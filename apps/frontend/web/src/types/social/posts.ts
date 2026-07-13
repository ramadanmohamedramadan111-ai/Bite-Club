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
    image: string;
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
