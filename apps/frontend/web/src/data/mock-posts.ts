import { Post } from '@/types/social/posts';

export const mockPosts: Post[] = [
  {
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
      address: 'Downtown, Cairo',
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
    ],
    caption:
      'Best burger in town! The smash burger is absolutely incredible, melts in your mouth with perfectly crispy edges. Highly recommend! 🍔✨',
    image:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=800&fit=crop',
    likeCount: 324,
    commentCount: 45,
    createdAt: '2026-07-11T10:30:00Z',
    isLiked: false,
  },
  {
    id: '2',
    authorId: '2',
    author: {
      id: '2',
      name: 'Sarah Jenkins',
      username: 'sarah_eats_of',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    },
    restaurantId: 'rest-2',
    restaurant: {
      id: 'rest-2',
      name: 'Omakase Room',
      address: 'Zamalek, Cairo',
      image:
        'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=200&h=200&fit=crop',
    },
    items: [
      {
        id: 'item-3',
        name: 'Assorted Sushi Platter',
        price: 480,
        quantity: 1,
      },
      {
        id: 'item-4',
        name: 'Spicy Tuna Roll',
        price: 120,
        quantity: 2,
      },
      {
        id: 'item-5',
        name: 'Green Tea',
        price: 40,
        quantity: 1,
      },
    ],
    caption:
      'Fresh fish, incredible presentation, and an unforgettable experience. The chef really knows their craft! 🍣🎎',
    image:
        'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=800&fit=crop',
    likeCount: 521,
    commentCount: 87,
    createdAt: '2026-07-10T18:45:00Z',
    isLiked: true,
  },
  {
    id: '3',
    authorId: '3',
    author: {
      id: '3',
      name: 'Mike Chen',
      username: 'mikechen_eats',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    },
    restaurantId: 'rest-3',
    restaurant: {
      id: 'rest-3',
      name: 'Pizzeria Napoletana',
      address: 'New Cairo',
      image:
        'https://images.unsplash.com/photo-1595521624481-10ee8944813d?w=200&h=200&fit=crop',
    },
    items: [
      {
        id: 'item-6',
        name: 'Margherita Pizza',
        price: 220,
        quantity: 1,
      },
      {
        id: 'item-7',
        name: 'Tiramisu',
        price: 85,
        quantity: 1,
      },
    ],
    caption:
      'Authentic Italian pizza with wood-fired crust. This place is a hidden gem! The mozzarella is fresh and the sauce is perfection. 🍕🇮🇹',
    image:
        'https://images.unsplash.com/photo-1595521624481-10ee8944813d?w=800&h=800&fit=crop',
    likeCount: 289,
    commentCount: 52,
    createdAt: '2026-07-09T19:20:00Z',
    isLiked: false,
  },
  {
    id: '4',
    authorId: '4',
    author: {
      id: '4',
      name: 'Emma Rodriguez',
      username: 'emma_eats',
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    },
    restaurantId: 'rest-4',
    restaurant: {
      id: 'rest-4',
      name: 'Sightglass Coffee',
      address: 'Downtown, Cairo',
      image:
        'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=200&h=200&fit=crop',
    },
    items: [
      {
        id: 'item-8',
        name: 'Cortado',
        price: 65,
        quantity: 2,
      },
      {
        id: 'item-9',
        name: 'Croissant',
        price: 55,
        quantity: 1,
      },
    ],
    caption:
      'Perfect morning ritual ☕ The cortado is smooth and creamy, paired with a buttery golden croissant. This is how mornings should feel!',
    image:
        'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800&h=800&fit=crop',
    likeCount: 458,
    commentCount: 76,
    createdAt: '2026-07-08T09:15:00Z',
    isLiked: false,
  },
  {
    id: '5',
    authorId: '5',
    author: {
      id: '5',
      name: 'James Wilson',
      username: 'james_foodie',
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    },
    restaurantId: 'rest-5',
    restaurant: {
      id: 'rest-5',
      name: 'Wagyu House',
      address: 'Maadi, Cairo',
      image:
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop',
    },
    items: [
      {
        id: 'item-10',
        name: 'A5 Wagyu Steak',
        price: 890,
        quantity: 1,
      },
      {
        id: 'item-11',
        name: 'Garlic Butter Lobster',
        price: 450,
        quantity: 1,
      },
      {
        id: 'item-12',
        name: 'Premium Sake',
        price: 280,
        quantity: 1,
      },
    ],
    caption:
      'Once in a lifetime dining experience! The A5 Wagyu melts like butter, the lobster is succulent, and the sake pairs perfectly. Worth every penny! 🥩✨',
    image:
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=800&fit=crop',
    likeCount: 612,
    commentCount: 98,
    createdAt: '2026-07-07T20:00:00Z',
    isLiked: true,
  },
  {
    id: '6',
    authorId: '1',
    author: {
      id: '1',
      name: 'Alex Rivera',
      username: 'alex_rivera',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    },
    restaurantId: 'rest-6',
    restaurant: {
      id: 'rest-6',
      name: 'Taco Fiesta',
      address: 'Downtown, Cairo',
      image:
        'https://images.unsplash.com/photo-1565722051839-1c72aaaea872?w=200&h=200&fit=crop',
    },
    items: [
      {
        id: 'item-13',
        name: 'Carne Asada Tacos',
        price: 150,
        quantity: 3,
      },
      {
        id: 'item-14',
        name: 'Guacamole & Chips',
        price: 95,
        quantity: 1,
      },
      {
        id: 'item-15',
        name: 'Agua Fresca',
        price: 45,
        quantity: 2,
      },
    ],
    caption:
      'Authentic Mexican street food vibes! The tacos are loaded with perfectly seasoned meat and fresh toppings. My new favorite spot! 🌮🔥',
    image:
        'https://images.unsplash.com/photo-1565722051839-1c72aaaea872?w=800&h=800&fit=crop',
    likeCount: 356,
    commentCount: 63,
    createdAt: '2026-07-06T17:30:00Z',
    isLiked: false,
  },
  {
    id: '7',
    authorId: '2',
    author: {
      id: '2',
      name: 'Sarah Jenkins',
      username: 'sarah_eats_of',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    },
    restaurantId: 'rest-7',
    restaurant: {
      id: 'rest-7',
      name: 'Sugar & Spice Bakery',
      address: 'Heliopolis, Cairo',
      image:
        'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&h=200&fit=crop',
    },
    items: [
      {
        id: 'item-16',
        name: 'Banana Bread',
        price: 75,
        quantity: 1,
      },
      {
        id: 'item-17',
        name: 'Chocolate Brownies',
        price: 65,
        quantity: 2,
      },
      {
        id: 'item-18',
        name: 'Cappuccino',
        price: 60,
        quantity: 1,
      },
    ],
    caption:
      'Homemade goodness in every bite! The banana bread is moist and flavorful, and the brownies are fudgy perfection. 🍰😋',
    image:
        'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&h=800&fit=crop',
    likeCount: 478,
    commentCount: 71,
    createdAt: '2026-07-05T15:45:00Z',
    isLiked: false,
  },
  {
    id: '8',
    authorId: '3',
    author: {
      id: '3',
      name: 'Mike Chen',
      username: 'mikechen_eats',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    },
    restaurantId: 'rest-8',
    restaurant: {
      id: 'rest-8',
      name: 'Ramen Ya',
      address: 'Downtown, Cairo',
      image:
        'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=200&h=200&fit=crop',
    },
    items: [
      {
        id: 'item-19',
        name: 'Tonkotsu Ramen',
        price: 180,
        quantity: 1,
      },
      {
        id: 'item-20',
        name: 'Pork Gyoza',
        price: 110,
        quantity: 1,
      },
      {
        id: 'item-21',
        name: 'Matcha Ice Cream',
        price: 85,
        quantity: 1,
      },
    ],
    caption:
      'Soul-warming ramen perfection! The broth is rich, the noodles are chewy, and the gyoza are crispy on the outside, tender on the inside. 🍜❤️',
    image:
        'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=800&fit=crop',
    likeCount: 534,
    commentCount: 82,
    createdAt: '2026-07-04T12:00:00Z',
    isLiked: true,
  },
];

export function getMockPosts(limit: number = 10, offset: number = 0): Post[] {
  return mockPosts.slice(offset, offset + limit);
}
