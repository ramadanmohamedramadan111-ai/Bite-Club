import type { MenuItem, RestaurantDetail, RestaurantReview } from '@/types/restaurant/restaurant';


const tokyoKitchen: RestaurantDetail = {
  id: 4,
  logo: 'https://picsum.photos/200/200?4',
  isFavorite: true,
  rating: 5,
  reviewsCount: 200,
  name: 'Tokyo Kitchen',
  categories: ['Asian', 'Seafood'],
  delivery: true,
  pickup: true,
  creditCard: false,
  isAvailable: true,
  minDeliveryTime: 35,
  maxDeliveryTime: 45,
  minDeliveryPrice: 39,
  maxDeliveryPrice: 49,
  scannedMenu: 'https://picsum.photos/800/400?5',
  coverImage: 'https://picsum.photos/800/400?4',
  location: {
    address: '123 Main St, Cityville',
    latitude: 37.7749,
    longitude: -122.4194,
  },
  openingHours: {
    monday: '10:00 AM - 10:00 PM',
    tuesday: '10:00 AM - 10:00 PM',
    wednesday: '10:00 AM - 10:00 PM',
    thursday: '10:00 AM - 10:00 PM',
    friday: '10:00 AM - 11:00 PM',
    saturday: '11:00 AM - 11:00 PM',
    sunday: '11:00 AM - 9:00 PM',
  },
  phoneNumber: '+1 (555) 123-4567',
  minimumOrder: 50,
  description:
    'Tokyo Kitchen brings authentic Japanese flavors with fresh sushi, ramen, and grilled specialties prepared by experienced chefs.',
};

const sushiPlatterOptions: MenuItem['options'] = [
  {
    id: 'size',
    title: 'Size',
    required: true,
    type: 'single',
    options: [
      { id: 'small', name: 'Small', price: 0 },
      { id: 'medium', name: 'Medium', price: 5 },
      { id: 'large', name: 'Large', price: 10 },
    ],
  },
  {
    id: 'drink',
    title: 'Drink',
    required: true,
    type: 'single',
    options: [
      { id: 'coke', name: 'Coke', price: 0 },
      { id: 'sprite', name: 'Sprite', price: 0 },
      { id: 'water', name: 'Water', price: 0 },
    ],
  },
  {
    id: 'extras',
    title: 'Extras',
    required: false,
    type: 'multiple',
    maxSelections: 4,
    options: [
      { id: 'extra_sauce', name: 'Extra Sauce', price: 1 },
      { id: 'extra_cheese', name: 'Extra Cheese', price: 2 },
      { id: 'extra_rice', name: 'Extra Rice', price: 3 },
    ],
  },
  {
    id: 'sauces',
    title: 'Sauces',
    required: false,
    type: 'multiple',
    maxSelections: 3,
    options: [
      { id: 'soy_sauce', name: 'Soy Sauce', price: 0 },
      { id: 'spicy_mayo', name: 'Spicy Mayo', price: 0 },
      { id: 'wasabi', name: 'Wasabi', price: 0 },
    ],
  },
];

const menuItems: MenuItem[] = [
  {
    id: 1,
    name: 'Sushi Platter',
    description: 'A variety of fresh sushi rolls with salmon, tuna, and avocado.',
    price: 25.99,
    originalPrice: 30.99,
    categories: ['Sushi', 'Bestseller', 'Fresh'],
    likesCount: 120,
    preparationTime: 15,
    available: true,
    stock: 10,
    restaurantId: 4,
    image: 'https://picsum.photos/400/300?1',
    options: sushiPlatterOptions,
  },
  {
    id: 2,
    name: 'Salmon Nigiri',
    description: 'Premium salmon slices over seasoned rice.',
    price: 12.99,
    categories: ['Sushi', 'Fresh'],
    likesCount: 85,
    preparationTime: 10,
    available: true,
    stock: 20,
    restaurantId: 4,
    image: 'https://picsum.photos/400/300?2',
    options: [
      {
        id: 'pieces',
        title: 'Pieces',
        required: true,
        type: 'single',
        options: [
          { id: '4pc', name: '4 Pieces', price: 0 },
          { id: '8pc', name: '8 Pieces', price: 8 },
        ],
      },
    ],
  },
  {
    id: 3,
    name: 'Spicy Tuna Roll',
    description: 'Tuna, spicy mayo, and cucumber wrapped in seaweed.',
    price: 9.99,
    categories: ['Sushi', 'Spicy'],
    likesCount: 64,
    preparationTime: 12,
    available: true,
    restaurantId: 4,
    image: 'https://picsum.photos/400/300?3',
    options: [],
  },
  {
    id: 4,
    name: 'Tonkotsu Ramen',
    description: 'Rich pork broth ramen with chashu, egg, and noodles.',
    price: 14.99,
    originalPrice: 17.99,
    categories: ['Ramen', 'Bestseller'],
    likesCount: 210,
    preparationTime: 20,
    available: true,
    restaurantId: 4,
    image: 'https://picsum.photos/400/300?4',
    options: [
      {
        id: 'noodle',
        title: 'Noodle Firmness',
        required: true,
        type: 'single',
        options: [
          { id: 'soft', name: 'Soft', price: 0 },
          { id: 'medium', name: 'Medium', price: 0 },
          { id: 'firm', name: 'Firm', price: 0 },
        ],
      },
      {
        id: 'toppings',
        title: 'Extra Toppings',
        required: false,
        type: 'multiple',
        maxSelections: 3,
        options: [
          { id: 'egg', name: 'Extra Egg', price: 2 },
          { id: 'pork', name: 'Extra Chashu', price: 4 },
          { id: 'corn', name: 'Corn', price: 1 },
        ],
      },
    ],
  },
  {
    id: 5,
    name: 'Miso Ramen',
    description: 'Savory miso broth with vegetables and tofu.',
    price: 13.49,
    categories: ['Ramen'],
    likesCount: 98,
    preparationTime: 18,
    available: true,
    restaurantId: 4,
    image: 'https://picsum.photos/400/300?5',
    options: [],
  },
  {
    id: 6,
    name: 'Chicken Katsu Curry',
    description: 'Crispy chicken cutlet with Japanese curry and rice.',
    price: 16.99,
    categories: ['Curry', 'Bestseller'],
    likesCount: 142,
    preparationTime: 22,
    available: true,
    restaurantId: 4,
    image: 'https://picsum.photos/400/300?6',
    options: [
      {
        id: 'spice',
        title: 'Spice Level',
        required: true,
        type: 'single',
        options: [
          { id: 'mild', name: 'Mild', price: 0 },
          { id: 'medium', name: 'Medium', price: 0 },
          { id: 'hot', name: 'Hot', price: 0 },
        ],
      },
    ],
  },
  {
    id: 7,
    name: 'Vegetable Tempura',
    description: 'Lightly battered seasonal vegetables with dipping sauce.',
    price: 8.99,
    categories: ['Sides', 'Fresh'],
    likesCount: 45,
    preparationTime: 14,
    available: true,
    restaurantId: 4,
    image: 'https://picsum.photos/400/300?7',
    options: [],
  },
  {
    id: 8,
    name: 'Edamame',
    description: 'Steamed soybeans with sea salt.',
    price: 4.99,
    categories: ['Sides'],
    likesCount: 33,
    preparationTime: 5,
    available: true,
    restaurantId: 4,
    image: 'https://picsum.photos/400/300?8',
    options: [],
  },
  {
    id: 9,
    name: 'Mochi Ice Cream',
    description: 'Assorted mochi-wrapped ice cream flavors.',
    price: 6.99,
    categories: ['Desserts'],
    likesCount: 77,
    preparationTime: 3,
    available: true,
    restaurantId: 4,
    image: 'https://picsum.photos/400/300?9',
    options: [
      {
        id: 'flavor',
        title: 'Flavor',
        required: true,
        type: 'single',
        options: [
          { id: 'matcha', name: 'Matcha', price: 0 },
          { id: 'mango', name: 'Mango', price: 0 },
          { id: 'strawberry', name: 'Strawberry', price: 0 },
        ],
      },
    ],
  },
  {
    id: 10,
    name: 'Green Tea',
    description: 'Hot Japanese green tea.',
    price: 2.99,
    categories: ['Drinks'],
    likesCount: 18,
    preparationTime: 2,
    available: true,
    restaurantId: 4,
    image: 'https://picsum.photos/400/300?10',
    options: [],
  },
  {
    id: 11,
    name: 'Iced Matcha Latte',
    description: 'Creamy iced matcha with oat milk.',
    price: 5.49,
    categories: ['Drinks', 'Fresh'],
    likesCount: 52,
    preparationTime: 4,
    available: false,
    restaurantId: 4,
    image: 'https://picsum.photos/400/300?11',
    options: [],
  },
];

const reviews: RestaurantReview[] = [
  {
    id: 1,
    user: { name: 'John Doe', avatar: 'https://randomuser.me/api/portraits/men/1.jpg' },
    rating: 5,
    comment: 'Amazing food and great service! The sushi platter was incredible.',
    date: '2023-08-15',
  },
  {
    id: 2,
    user: { name: 'Jane Smith', avatar: 'https://randomuser.me/api/portraits/women/2.jpg' },
    rating: 4,
    comment: 'Good food, but a bit pricey. Ramen was excellent though.',
    date: '2023-08-10',
  },
  {
    id: 3,
    user: { name: 'Mike Johnson', avatar: 'https://randomuser.me/api/portraits/men/3.jpg' },
    rating: 3,
    comment: 'Average experience, nothing special.',
    date: '2023-08-05',
  },
  {
    id: 4,
    user: { name: 'Sarah Lee', avatar: 'https://randomuser.me/api/portraits/women/4.jpg' },
    rating: 5,
    comment: 'Best Japanese restaurant in the city. Will definitely come back!',
    date: '2023-07-28',
  },
  {
    id: 5,
    user: { name: 'David Kim', avatar: 'https://randomuser.me/api/portraits/men/5.jpg' },
    rating: 4,
    comment: 'Fresh ingredients and fast delivery. Loved the tonkotsu ramen.',
    date: '2023-07-20',
  },
  {
    id: 6,
    user: { name: 'Emily Chen', avatar: 'https://randomuser.me/api/portraits/women/6.jpg' },
    rating: 5,
    comment: 'The spicy tuna roll is a must-try. Perfect spice level.',
    date: '2023-07-12',
  },
  {
    id: 7,
    user: { name: 'Alex Turner', avatar: 'https://randomuser.me/api/portraits/men/7.jpg' },
    rating: 4,
    comment: 'Great ambiance and friendly staff. Portions are generous.',
    date: '2023-07-05',
  },
  {
    id: 8,
    user: { name: 'Maria Garcia', avatar: 'https://randomuser.me/api/portraits/women/8.jpg' },
    rating: 5,
    comment: 'Every dish we ordered was delicious. Highly recommend!',
    date: '2023-06-28',
  },
  {
    id: 9,
    user: { name: 'Chris Wilson', avatar: 'https://randomuser.me/api/portraits/men/9.jpg' },
    rating: 3,
    comment: 'Food was good but delivery took longer than expected.',
    date: '2023-06-20',
  },
  {
    id: 10,
    user: { name: 'Lisa Park', avatar: 'https://randomuser.me/api/portraits/women/10.jpg' },
    rating: 5,
    comment: 'Authentic flavors that remind me of Tokyo. Outstanding!',
    date: '2023-06-15',
  },
  {
    id: 11,
    user: { name: 'Tom Baker', avatar: 'https://randomuser.me/api/portraits/men/11.jpg' },
    rating: 4,
    comment: 'Solid menu with lots of options. Mochi ice cream was delightful.',
    date: '2023-06-08',
  },
  {
    id: 12,
    user: { name: 'Nina Patel', avatar: 'https://randomuser.me/api/portraits/women/12.jpg' },
    rating: 5,
    comment: 'Consistently excellent quality. Our go-to spot for sushi night.',
    date: '2023-06-01',
  },
];

const restaurants: Record<number, RestaurantDetail> = {
  4: tokyoKitchen,
};

export function getRestaurantById(id: number): RestaurantDetail | undefined {
  return restaurants[id];
}

export function getMenuItemsByRestaurantId(restaurantId: number): MenuItem[] {
  return menuItems.filter((item) => item.restaurantId === restaurantId);
}

export function getMenuItemById(id: number): MenuItem | undefined {
  return menuItems.find((item) => item.id === id);
}

export function getReviewsByRestaurantId(restaurantId: number): RestaurantReview[] {
  if (!restaurants[restaurantId]) {
    return [];
  }

  return reviews;
}

export function getMenuCategories(items: MenuItem[]): string[] {
  const categories = new Set<string>();

  items.forEach((item) => {
    item.categories.forEach((category) => categories.add(category));
  });

  return Array.from(categories);
}
