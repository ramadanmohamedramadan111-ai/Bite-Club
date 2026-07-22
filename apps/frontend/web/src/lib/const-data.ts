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

export const mockPosts: any[] = [];
export const mockPastOrders: any[] = [];
export const socialUsers: any[] = [];
export const rewardOffers: any[] = [];
export const mockRestaurants: any[] = [];
export const restaurantCategories: any[] = [];
export const categoryEmojis: Record<string, string> = {};
export const groupOrderItems: any[] = [];

export function getRewardOfferById(id: string): any { return undefined; }
export function getMenuCategories(): any[] { return []; }
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
