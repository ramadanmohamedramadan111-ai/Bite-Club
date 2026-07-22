// Static const data — replace with real API calls when ready

// Static const data — replace with real API calls when ready

// ── Types ──────────────────────────────────────────────

export type CartItem = {
  cartItemId: string;
  itemId: string;
  name: string;
  image?: string;
  quantity: number;
  basePrice: number;
  unitPrice: number;
  totalPrice: number;
  configurationKey: string;
  selectedOptions: Array<{
    groupId: string;
    groupName: string;
    optionId: string;
    optionName: string;
    price: number;
  }>;
  specialInstructions?: string;
  addedBy?: CartMemberReference;
};

export type CartMemberReference = {
  sessionId?: string;
  userId?: string;
  name?: string;
};

export type CartMember = {
  id: string;
  sessionId?: string;
  userId?: string;
  name?: string;
  isOwner: boolean;
  isReady: boolean;
};

export type CartSummary = {
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
  appliedRedemptionTitle?: string;
};

export type Cart = {
  id: string;
  type: 'individual' | 'group';
  restaurantId: string;
  restaurantName: string;
  restaurantImage?: string;
  restaurantDeliveryFee?: number;
  userId?: string;
  sessionId?: string;
  members: CartMember[];
  items: CartItem[];
  appliedRedemptionId?: string | null;
  groupSession?: { id: string };
};

export type PastOrder = {
  id: string;
  restaurantId: string;
  restaurantName: string;
  restaurantAddress: string;
  restaurantImage: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  totalPrice: number;
  orderedAt: string;
  image: string;
};

// ── Mock data ──────────────────────────────────────────

import type { ActiveGroupSession } from '@/types/groups/groups';
import type { RestaurantType } from '@/types/restaurant/restaurant';
import type { MenuItem as RestaurantMenuItem, ItemOption } from '@/types/restaurant/restaurantItem';

export const mockPosts: any[] = [];
export const mockPastOrders: any[] = [];
export const socialUsers: any[] = [];
export const rewardOffers: any[] = [];
export const mockRestaurants: any[] = [];
export const restaurantCategories: any[] = [];
export const categoryEmojis: Record<string, string> = {};
export const groupOrderItems: any[] = [];

export const mockGroupSession: ActiveGroupSession = {
  id: 'mock-session-1',
  restaurantId: '1',
  restaurantName: 'Pizza Palace',
  restaurantImage: '/placeholder.svg',
  code: 'PIZZA42',
  type: 'fixed',
  groupId: 'group-1',
  groupName: 'Friday Lunch',
  ownerSessionId: 'owner-session-1',
  ownerName: 'Ahmed',
  expiresAt: new Date(Date.now() + 3600000).toISOString(),
  createdAt: new Date().toISOString(),
};

export const mockGroupRestaurant: RestaurantType = {
  id: 1,
  name: 'Pizza Palace',
  description: 'Best pizza in town with fresh ingredients.',
  logo_url: '/placeholder.svg',
  cover_image_url: '/placeholder.svg',
  average_rating: 4.5,
  reviews_count: 128,
  delivery_enabled: true,
  pickup_enabled: true,
  is_open_now: true,
  minimum_order: 50,
  delivery_fee_per_km: 5,
  latitude: 30.0444,
  longitude: 31.2357,
};

export const mockGroupMenuItems: RestaurantMenuItem[] = [
  {
    id: 101,
    name: 'Margherita Pizza',
    description: 'Classic tomato sauce, mozzarella, and basil.',
    price: 120,
    originalPrice: 150,
    categories: ['Pizza'],
    likesCount: 45,
    preparationTime: 20,
    available: true,
    stock: 10,
    restaurantId: 1,
    image: '/placeholder.svg',
    options: [
      {
        id: 'size',
        title: 'Size',
        type: 'single',
        required: true,
        options: [
          { id: 'small', name: 'Small', price: 0 },
          { id: 'large', name: 'Large', price: 30 },
        ],
      },
    ],
  },
  {
    id: 102,
    name: 'Pepperoni Pizza',
    description: 'Pepperoni, mozzarella, and tomato sauce.',
    price: 140,
    categories: ['Pizza'],
    likesCount: 32,
    preparationTime: 20,
    available: true,
    stock: 8,
    restaurantId: 1,
    image: '/placeholder.svg',
    options: [],
  },
  {
    id: 103,
    name: 'Garlic Bread',
    description: 'Toasted bread with garlic butter and herbs.',
    price: 45,
    categories: ['Sides'],
    likesCount: 18,
    preparationTime: 10,
    available: true,
    stock: 20,
    restaurantId: 1,
    image: '/placeholder.svg',
    options: [],
  },
];

export const mockGroupCartMembers: CartMember[] = [
  { id: 'member-1', sessionId: 'owner-session-1', name: 'Ahmed', isOwner: true, isReady: true },
  { id: 'member-2', sessionId: 'guest-session-1', name: 'Sara', isOwner: false, isReady: true },
  { id: 'member-3', sessionId: 'guest-session-2', name: 'Omar', isOwner: false, isReady: false },
];

export const mockGroupCart: Cart = {
  id: 'mock-cart-1',
  type: 'group',
  restaurantId: '1',
  restaurantName: 'Pizza Palace',
  restaurantImage: '/placeholder.svg',
  members: mockGroupCartMembers,
  items: [
    {
      cartItemId: 'item-1',
      itemId: '101',
      name: 'Margherita Pizza',
      quantity: 2,
      basePrice: 120,
      unitPrice: 120,
      totalPrice: 240,
      configurationKey: 'large',
      selectedOptions: [
        { groupId: 'size', groupName: 'Size', optionId: 'large', optionName: 'Large', price: 30 },
      ],
      specialInstructions: 'Extra cheese please',
      addedBy: { sessionId: 'owner-session-1', name: 'Ahmed' },
    },
    {
      cartItemId: 'item-2',
      itemId: '103',
      name: 'Garlic Bread',
      quantity: 1,
      basePrice: 45,
      unitPrice: 45,
      totalPrice: 45,
      configurationKey: 'default',
      selectedOptions: [],
      addedBy: { sessionId: 'guest-session-1', name: 'Sara' },
    },
    {
      cartItemId: 'item-3',
      itemId: '102',
      name: 'Pepperoni Pizza',
      quantity: 1,
      basePrice: 140,
      unitPrice: 140,
      totalPrice: 140,
      configurationKey: 'default',
      selectedOptions: [],
      addedBy: { sessionId: 'guest-session-2', name: 'Omar' },
    },
  ],
  groupSession: { id: 'mock-session-1' },
};

export function getRewardOfferById(id: string): any { return undefined; }
export function getMenuCategories(items?: any[]): string[] {
  if (!items || items.length === 0) return [];
  const cats = new Set<string>();
  for (const item of items) {
    if (Array.isArray(item.categories)) {
      for (const c of item.categories) cats.add(c);
    }
  }
  return Array.from(cats);
}
export function getRestaurantById(id: string): any { return null; }
export function getMenuItemById(id: string): any { return null; }
export function getReviewsByRestaurantId(id: string): any[] { return []; }
export function getMenuItemsByRestaurantId(id: string): any[] { return []; }
export function getFavoriteMenuItems(): any[] { return []; }
export function getFavoriteRestaurants(): any[] { return []; }
export function getRestaurantListItemById(id: string): any { return null; }
export function getGroupOrderItems(): any[] { return []; }
export function createMockGroupMember(data?: any): any { return {}; }
export function createMockGroupOrderItems(data?: any): any[] { return []; }

// ── Store-like hooks (static) ──────────────────────────

const defaultCart: Cart = {
  id: '',
  type: 'individual',
  restaurantId: '',
  restaurantName: '',
  members: [],
  items: [],
};

export function useCartStore(selector?: any): any {
  const state = {
    cart: null as Cart | null,
    setCart: () => {},
    createIndividualCart: () => {},
    createGroupCart: () => {},
    addItem: () => {},
    removeItem: () => {},
    updateQuantity: () => {},
    clearCart: () => {},
    setMemberReady: () => {},
    applyRedemption: () => {},
    addMember: () => {},
    cloneUserOrder: () => {},
    getSummary: () => ({ subtotal: 0, deliveryFee: 0, tax: 0, discount: 0, total: 0 }),
  };
  if (typeof selector === 'function') return selector(state);
  return state;
}

useCartStore.getState = () => ({
  cart: null,
  setCart: () => {},
  createIndividualCart: () => {},
  createGroupCart: () => {},
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  setMemberReady: () => {},
  applyRedemption: () => {},
  addMember: () => {},
  cloneUserOrder: () => {},
  getSummary: () => ({ subtotal: 0, deliveryFee: 0, tax: 0, discount: 0, total: 0 }),
});

export function useGroupSessionsStore(selector?: any): any {
  const state = { sessions: [], addSession: () => {} };
  if (typeof selector === 'function') return selector(state);
  return state;
}

export function useGroupsStore(selector?: any): any {
  const state = { groups: [] };
  if (typeof selector === 'function') return selector(state);
  return state;
}

export function useNotificationsStore(selector?: any): any {
  const state = {
    notifications: [],
    markAsRead: () => {},
    markAllAsRead: () => {},
  };
  if (typeof selector === 'function') return selector(state);
  return state;
}

export function useUnreadNotificationCount(): number {
  return 0;
}

export function usePointsStore(selector?: any): any {
  const state = {
    pointsBalance: 0,
    redemptions: [],
    gifts: [],
    redeemOffer: () => ({ success: false, error: 'Not implemented' }),
    sendGift: () => ({ success: false, error: 'Not implemented' }),
    claimGift: () => ({ success: false, error: 'Not implemented' }),
    useRedemption: () => {},
  };
  if (typeof selector === 'function') return selector(state);
  return state;
}

export function useAddToIndividualCart() {
  return {
    addFromPost: () => {},
    dialog: null,
  };
}
