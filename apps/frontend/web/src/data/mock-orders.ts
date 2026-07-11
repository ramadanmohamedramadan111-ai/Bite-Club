import type { Order, OrdersFilterParams } from '@/types/orders/order';

const cairoRestaurant = {
  address: 'Downtown, Cairo',
  latitude: 30.0444,
  longitude: 31.2357,
};

const zamalekRestaurant = {
  address: 'Zamalek, Cairo',
  latitude: 30.0626,
  longitude: 31.2197,
};

const maadiRestaurant = {
  address: 'Maadi, Cairo',
  latitude: 29.9602,
  longitude: 31.2569,
};

const deliveryHome = {
  address: '15 Nile Corniche, Garden City, Cairo',
  latitude: 30.0425,
  longitude: 31.2242,
};

const deliveryOffice = {
  address: '42 Smart Village, 6th of October',
  latitude: 30.0735,
  longitude: 30.9753,
};

export const mockOrders: Order[] = [
  {
    id: 'order-001',
    orderNumber: 'BC-240701',
    restaurantId: '4',
    restaurantName: 'The Rustic Grill',
    restaurantImage:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop',
    restaurantAddress: cairoRestaurant.address,
    restaurantLocation: cairoRestaurant,
    status: 'in_progress',
    type: 'individual',
    fulfillmentType: 'delivery',
    paymentMethod: 'cod',
    orderedAt: '2026-07-11T12:30:00Z',
    items: [
      { id: 'i-1', name: 'Classic Smash Burger', price: 185, quantity: 1 },
      { id: 'i-2', name: 'Truffle Fries', price: 80, quantity: 2 },
    ],
    subtotal: 345,
    deliveryFee: 25,
    tax: 3,
    total: 373,
    deliveryAddress: deliveryHome.address,
    deliveryLocation: deliveryHome,
  },
  {
    id: 'order-002',
    orderNumber: 'BC-240702',
    restaurantId: '4',
    restaurantName: 'Omakase Room',
    restaurantImage:
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=200&h=200&fit=crop',
    restaurantAddress: zamalekRestaurant.address,
    restaurantLocation: zamalekRestaurant,
    status: 'in_progress',
    type: 'group',
    fulfillmentType: 'delivery',
    paymentMethod: 'visa',
    orderedAt: '2026-07-11T11:15:00Z',
    items: [
      { id: 'i-3', name: 'Assorted Sushi Platter', price: 480, quantity: 1 },
      { id: 'i-4', name: 'Spicy Tuna Roll', price: 120, quantity: 2 },
      { id: 'i-5', name: 'Miso Soup', price: 45, quantity: 2 },
    ],
    groupMembers: [
      {
        memberName: 'Alex Rivera',
        items: [
          { id: 'i-3', name: 'Assorted Sushi Platter', price: 480, quantity: 1 },
        ],
      },
      {
        memberName: 'Sarah Jenkins',
        items: [
          { id: 'i-4', name: 'Spicy Tuna Roll', price: 120, quantity: 2 },
          { id: 'i-5', name: 'Miso Soup', price: 45, quantity: 2 },
        ],
      },
    ],
    subtotal: 810,
    deliveryFee: 30,
    tax: 3,
    total: 843,
    deliveryAddress: deliveryOffice.address,
    deliveryLocation: deliveryOffice,
  },
  {
    id: 'order-003',
    orderNumber: 'BC-240703',
    restaurantId: '4',
    restaurantName: 'Pizzeria Napoletana',
    restaurantImage:
      'https://images.unsplash.com/photo-1595521624481-10ee8944813d?w=200&h=200&fit=crop',
    restaurantAddress: maadiRestaurant.address,
    restaurantLocation: maadiRestaurant,
    status: 'delivered',
    type: 'individual',
    fulfillmentType: 'pickup',
    paymentMethod: 'cod',
    orderedAt: '2026-07-10T19:45:00Z',
    items: [
      { id: 'i-6', name: 'Margherita Pizza', price: 220, quantity: 1 },
      { id: 'i-7', name: 'Garlic Bread', price: 60, quantity: 1 },
    ],
    subtotal: 280,
    deliveryFee: 0,
    tax: 3,
    total: 283,
  },
  {
    id: 'order-004',
    orderNumber: 'BC-240704',
    restaurantId: '4',
    restaurantName: 'Tokyo Kitchen',
    restaurantImage: 'https://picsum.photos/200/200?4',
    restaurantAddress: '123 Main St, Cityville',
    restaurantLocation: {
      address: '123 Main St, Cityville',
      latitude: 37.7749,
      longitude: -122.4194,
    },
    status: 'delivered',
    type: 'group',
    fulfillmentType: 'pickup',
    paymentMethod: 'visa',
    orderedAt: '2026-07-10T14:20:00Z',
    items: [
      { id: 'i-8', name: 'Sushi Platter', price: 320, quantity: 1 },
      { id: 'i-9', name: 'Chicken Ramen', price: 180, quantity: 2 },
    ],
    groupMembers: [
      {
        memberName: 'Mike Chen',
        items: [{ id: 'i-8', name: 'Sushi Platter', price: 320, quantity: 1 }],
      },
      {
        memberName: 'Emma Rodriguez',
        items: [
          { id: 'i-9', name: 'Chicken Ramen', price: 180, quantity: 2 },
        ],
      },
    ],
    subtotal: 680,
    deliveryFee: 0,
    tax: 3,
    total: 683,
  },
  {
    id: 'order-005',
    orderNumber: 'BC-240705',
    restaurantId: '4',
    restaurantName: 'The Rustic Grill',
    restaurantImage:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop',
    restaurantAddress: cairoRestaurant.address,
    restaurantLocation: cairoRestaurant,
    status: 'cancelled',
    type: 'individual',
    fulfillmentType: 'delivery',
    paymentMethod: 'visa',
    orderedAt: '2026-07-09T21:00:00Z',
    items: [
      { id: 'i-10', name: 'BBQ Ribs', price: 320, quantity: 1 },
      { id: 'i-11', name: 'Coleslaw', price: 45, quantity: 1 },
    ],
    subtotal: 365,
    deliveryFee: 25,
    tax: 3,
    total: 393,
    deliveryAddress: deliveryHome.address,
    deliveryLocation: deliveryHome,
  },
  {
    id: 'order-006',
    orderNumber: 'BC-240706',
    restaurantId: '4',
    restaurantName: 'Omakase Room',
    restaurantImage:
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=200&h=200&fit=crop',
    restaurantAddress: zamalekRestaurant.address,
    restaurantLocation: zamalekRestaurant,
    status: 'delivered',
    type: 'individual',
    fulfillmentType: 'delivery',
    paymentMethod: 'cod',
    orderedAt: '2026-07-09T18:30:00Z',
    items: [
      { id: 'i-12', name: 'Dragon Roll', price: 195, quantity: 2 },
      { id: 'i-13', name: 'Edamame', price: 55, quantity: 1 },
    ],
    subtotal: 445,
    deliveryFee: 30,
    tax: 3,
    total: 478,
    deliveryAddress: deliveryOffice.address,
    deliveryLocation: deliveryOffice,
  },
  {
    id: 'order-007',
    orderNumber: 'BC-240707',
    restaurantId: '4',
    restaurantName: 'Pizzeria Napoletana',
    restaurantImage:
      'https://images.unsplash.com/photo-1595521624481-10ee8944813d?w=200&h=200&fit=crop',
    restaurantAddress: maadiRestaurant.address,
    restaurantLocation: maadiRestaurant,
    status: 'in_progress',
    type: 'individual',
    fulfillmentType: 'pickup',
    paymentMethod: 'cod',
    orderedAt: '2026-07-09T13:10:00Z',
    items: [
      { id: 'i-14', name: 'Pepperoni Pizza', price: 240, quantity: 1 },
      { id: 'i-15', name: 'Caesar Salad', price: 90, quantity: 1 },
    ],
    subtotal: 330,
    deliveryFee: 0,
    tax: 3,
    total: 333,
  },
  {
    id: 'order-008',
    orderNumber: 'BC-240708',
    restaurantId: '4',
    restaurantName: 'The Rustic Grill',
    restaurantImage:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop',
    restaurantAddress: cairoRestaurant.address,
    restaurantLocation: cairoRestaurant,
    status: 'delivered',
    type: 'group',
    fulfillmentType: 'delivery',
    paymentMethod: 'visa',
    orderedAt: '2026-07-08T20:00:00Z',
    items: [
      { id: 'i-16', name: 'Chicken Wings', price: 150, quantity: 2 },
      { id: 'i-17', name: 'Onion Rings', price: 70, quantity: 1 },
      { id: 'i-18', name: 'Milkshake', price: 85, quantity: 2 },
    ],
    groupMembers: [
      {
        memberName: 'James Wilson',
        items: [
          { id: 'i-16', name: 'Chicken Wings', price: 150, quantity: 2 },
        ],
      },
      {
        memberName: 'Your Name',
        items: [
          { id: 'i-17', name: 'Onion Rings', price: 70, quantity: 1 },
          { id: 'i-18', name: 'Milkshake', price: 85, quantity: 2 },
        ],
      },
    ],
    subtotal: 540,
    deliveryFee: 25,
    tax: 3,
    total: 568,
    deliveryAddress: deliveryHome.address,
    deliveryLocation: deliveryHome,
  },
  {
    id: 'order-009',
    orderNumber: 'BC-240709',
    restaurantId: '4',
    restaurantName: 'Omakase Room',
    restaurantImage:
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=200&h=200&fit=crop',
    restaurantAddress: zamalekRestaurant.address,
    restaurantLocation: zamalekRestaurant,
    status: 'cancelled',
    type: 'group',
    fulfillmentType: 'delivery',
    paymentMethod: 'cod',
    orderedAt: '2026-07-08T12:45:00Z',
    items: [
      { id: 'i-19', name: 'Salmon Nigiri', price: 220, quantity: 1 },
      { id: 'i-20', name: 'Tempura Udon', price: 160, quantity: 1 },
    ],
    groupMembers: [
      {
        memberName: 'Alex Rivera',
        items: [{ id: 'i-19', name: 'Salmon Nigiri', price: 220, quantity: 1 }],
      },
      {
        memberName: 'Sarah Jenkins',
        items: [{ id: 'i-20', name: 'Tempura Udon', price: 160, quantity: 1 }],
      },
    ],
    subtotal: 380,
    deliveryFee: 30,
    tax: 3,
    total: 413,
    deliveryAddress: deliveryOffice.address,
    deliveryLocation: deliveryOffice,
  },
  {
    id: 'order-010',
    orderNumber: 'BC-240710',
    restaurantId: '4',
    restaurantName: 'Pizzeria Napoletana',
    restaurantImage:
      'https://images.unsplash.com/photo-1595521624481-10ee8944813d?w=200&h=200&fit=crop',
    restaurantAddress: maadiRestaurant.address,
    restaurantLocation: maadiRestaurant,
    status: 'delivered',
    type: 'individual',
    fulfillmentType: 'delivery',
    paymentMethod: 'visa',
    orderedAt: '2026-07-07T17:30:00Z',
    items: [
      { id: 'i-21', name: 'Quattro Formaggi', price: 260, quantity: 1 },
      { id: 'i-22', name: 'Tiramisu', price: 85, quantity: 1 },
    ],
    subtotal: 345,
    deliveryFee: 20,
    tax: 3,
    total: 368,
    deliveryAddress: deliveryHome.address,
    deliveryLocation: deliveryHome,
  },
  {
    id: 'order-011',
    orderNumber: 'BC-240711',
    restaurantId: '4',
    restaurantName: 'The Rustic Grill',
    restaurantImage:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop',
    restaurantAddress: cairoRestaurant.address,
    restaurantLocation: cairoRestaurant,
    status: 'in_progress',
    type: 'group',
    fulfillmentType: 'pickup',
    paymentMethod: 'cod',
    orderedAt: '2026-07-07T11:00:00Z',
    items: [
      { id: 'i-23', name: 'Steak Sandwich', price: 210, quantity: 2 },
      { id: 'i-24', name: 'Sweet Potato Fries', price: 75, quantity: 1 },
    ],
    groupMembers: [
      {
        memberName: 'Mike Chen',
        items: [
          { id: 'i-23', name: 'Steak Sandwich', price: 210, quantity: 2 },
        ],
      },
      {
        memberName: 'Emma Rodriguez',
        items: [
          { id: 'i-24', name: 'Sweet Potato Fries', price: 75, quantity: 1 },
        ],
      },
    ],
    subtotal: 495,
    deliveryFee: 0,
    tax: 3,
    total: 498,
  },
  {
    id: 'order-012',
    orderNumber: 'BC-240712',
    restaurantId: '4',
    restaurantName: 'Tokyo Kitchen',
    restaurantImage: 'https://picsum.photos/200/200?4',
    restaurantAddress: '123 Main St, Cityville',
    restaurantLocation: {
      address: '123 Main St, Cityville',
      latitude: 37.7749,
      longitude: -122.4194,
    },
    status: 'delivered',
    type: 'individual',
    fulfillmentType: 'pickup',
    paymentMethod: 'cod',
    orderedAt: '2026-07-06T16:15:00Z',
    items: [
      { id: 'i-25', name: 'Teriyaki Bowl', price: 175, quantity: 1 },
      { id: 'i-26', name: 'Green Tea', price: 40, quantity: 2 },
    ],
    subtotal: 255,
    deliveryFee: 0,
    tax: 3,
    total: 258,
  },
];


export function getOrderById(orderId: string) {
  return mockOrders.find((order) => order.id === orderId);
}

export function filterOrders({
  tab,
  fulfillment,
  type,
}: OrdersFilterParams) {
  return mockOrders.filter((order) => {
    if (tab !== 'all' && order.status !== tab) return false;
    if (fulfillment !== 'all' && order.fulfillmentType !== fulfillment) {
      return false;
    }
    if (type !== 'all' && order.type !== type) return false;
    return true;
  });
}

/** @deprecated Use filterOrders instead */
export function filterOrdersByTab(tab: string) {
  return filterOrders({
    tab: tab as OrdersFilterParams['tab'],
    fulfillment: 'all',
    type: 'all',
  });
}
