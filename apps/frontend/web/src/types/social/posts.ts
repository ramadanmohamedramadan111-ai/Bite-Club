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
  image: string;
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
