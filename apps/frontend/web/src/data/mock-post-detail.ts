import { Post } from '@/types/social/posts';

export const mockPostDetail: Post = {
  id: '1',
  authorId: '1',
  author: {
    id: '1',
    name: 'Alex Rivera',
    username: 'alex_rivera',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
  },
  restaurantId: 'rest-1',
  restaurant: {
    id: 'rest-1',
    name: 'The Rustic Grill',
    address: '123 Grill Street, Downtown, Cairo',
    image:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop',
  },
  items: [
    {
      id: 'item-1',
      name: 'Classic Smash Burger',
      price: 185,
      quantity: 1,
    },
    {
      id: 'item-2',
      name: 'Truffle Fries',
      price: 80,
      quantity: 2,
    },
    {
      id: 'item-3',
      name: 'Grilled Chicken Sandwich',
      price: 150,
      quantity: 1,
    },
  ],
  caption:
    'Best burger in town! The smash burger is absolutely incredible, melts in your mouth with perfectly crispy edges. The truffle fries are gold and crispy on the outside, fluffy on the inside. The grilled chicken sandwich is juicy and perfectly seasoned. Highly recommend! 🍔✨',
  images: [
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=800&fit=crop',
  ],
  likeCount: 324,
  commentCount: 45,
  createdAt: '2026-07-11T10:30:00Z',
  isLiked: false,
};
