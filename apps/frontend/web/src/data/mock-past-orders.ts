import { PastOrder } from '@/types/social/orders';

export const mockPastOrders: PastOrder[] = [
  {
    id: 'order-1',
    restaurantId: 'rest-1',
    restaurantName: 'The Rustic Grill',
    restaurantAddress: 'Downtown, Cairo',
    restaurantImage:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop',
    items: [
      { id: 'item-1', name: 'Classic Smash Burger', price: 185, quantity: 1 },
      { id: 'item-2', name: 'Truffle Fries', price: 80, quantity: 2 },
    ],
    totalPrice: 345,
    orderedAt: '2026-07-10T18:30:00Z',
    image:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=800&fit=crop',
  },
  {
    id: 'order-2',
    restaurantId: 'rest-2',
    restaurantName: 'Omakase Room',
    restaurantAddress: 'Zamalek, Cairo',
    restaurantImage:
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=200&h=200&fit=crop',
    items: [
      { id: 'item-3', name: 'Assorted Sushi Platter', price: 480, quantity: 1 },
      { id: 'item-4', name: 'Spicy Tuna Roll', price: 120, quantity: 2 },
    ],
    totalPrice: 720,
    orderedAt: '2026-07-09T20:15:00Z',
    image:
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=800&fit=crop',
  },
  {
    id: 'order-3',
    restaurantId: 'rest-3',
    restaurantName: 'Pizzeria Napoletana',
    restaurantAddress: 'Maadi, Cairo',
    restaurantImage:
      'https://images.unsplash.com/photo-1595521624481-10ee8944813d?w=200&h=200&fit=crop',
    items: [
      { id: 'item-6', name: 'Margherita Pizza', price: 220, quantity: 1 },
      { id: 'item-7', name: 'Garlic Bread', price: 60, quantity: 1 },
    ],
    totalPrice: 280,
    orderedAt: '2026-07-08T14:00:00Z',
    image:
      'https://images.unsplash.com/photo-1595521624481-10ee8944813d?w=800&h=800&fit=crop',
  },
];
