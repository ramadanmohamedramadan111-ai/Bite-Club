export type GroupType = 'temporary' | 'fixed';

export type CartStatus = 'active' | 'checkout_started';

export type Cart = IndividualCart | GroupCart;

// ======================
// Individual Cart
// ======================

export type IndividualCart = {
  id: string;

  type: 'individual';

  status: CartStatus;

  restaurantId: string;
  restaurantName: string;
  restaurantImage?: string;
  restaurantDeliveryFee?: number;

  // Owner
  userId?: string; // Auth user
  sessionId?: string; // Guest user

  items: CartItem[];

  members: [];

  appliedRedemptionId?: string | null;
};

// ======================
// Group Cart
// ======================

export type GroupCart = {
  id: string;

  type: 'group';

  status: CartStatus;

  restaurantId: string;
  restaurantName: string;
  restaurantImage?: string;
  restaurantDeliveryFee?: number;

  // Owner
  userId?: string;
  sessionId?: string;

  groupSession: GroupSession;

  members: CartMember[];

  items: CartItem[];
};

// ======================
// Group Session
// ======================

export type GroupSession = {
  id: string;

  type: GroupType;

  // Always exists
  code: string;

  // Exists only for fixed groups
  groupId?: string;

  expiresAt?: Date;
};

// ======================
// Group Members
// ======================

export type CartMember = {
  id: string;

  userId?: string;

  sessionId?: string;

  name?: string;

  isOwner: boolean;

  isReady?: boolean;
};

// ======================
// Cart Items
// ======================

export type CartItem = {
  cartItemId: string;

  itemId: string;

  name: string;

  image?: string;

  quantity: number;

  // Price snapshot
  basePrice: number;

  unitPrice: number;

  totalPrice: number;

  // Same item + same options = same cart line
  configurationKey: string;

  selectedOptions: SelectedOption[];

  specialInstructions?: string;

  // Required for knowing who added the item
  // Especially important for group carts
  addedBy?: CartMemberReference;
};

export type CartMemberReference = {
  userId?: string;

  sessionId?: string;

  name?: string;
};

// ======================
// Item Options
// ======================

export type SelectedOption = {
  groupId: string;

  groupName: string;

  optionId: string;

  optionName: string;

  price: number;
};

// ======================
// Calculated Values
// ======================

export type CartSummary = {
  subtotal: number;

  deliveryFee: number;

  tax: number;

  discount: number;

  total: number;

  appliedRedemptionTitle?: string;
};

