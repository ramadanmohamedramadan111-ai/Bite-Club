export type RestaurantCategoryItem = {
  id: number;
  name: string;
  slug: string;
  image_url?: string;
};

export type TopRestaurant = {
  id: number;
  name: string;
  description: string;
  logo_url: string;
  cover_image_url: string;
  distance: number | string;
  average_rating: number | string;
  reviews_count: number;
  settings: {
    is_open: boolean;
    accept_orders: boolean;
    delivery_enabled: boolean;
    pickup_enabled: boolean;
    latitude: string;
    longitude: string;
  };
};

export type Restaurant = {
  id: number;
  name: string;
  description?: string;
  logo_url: string;
  cover_image_url: string;
  average_rating: number;
  reviews_count: number;
  is_open_now: boolean;
  delivery_enabled: boolean;
  pickup_enabled: boolean;
  distance?: number | null;
};

export type RestaurantDetail = {
  id: number;
  name: string;
  description: string;
  logo_url: string;
  cover_image_url: string;
  category?: { id: number; name: string; slug: string };
  category_name?: string;
  address?: string;
  phone_number?: string;
  average_rating: number;
  reviews_count: number;
  delivery_enabled: boolean;
  pickup_enabled: boolean;
  delivery_fee_per_km?: number;
  is_open_now: boolean;
  opening_hours?: OpeningHour[];
  latitude: number;
  longitude: number;
  minimum_order: number;
};

export type OpeningHour = {
  day_of_week: number;
  opens_at: string;
  closes_at: string;
  is_closed: boolean;
};

export type MenuItem = {
  id: number;
  title: string;
  description: string;
  price: number;
  is_available: boolean;
  image_url: string;
};

export type MenuSection = {
  id: number;
  title: string;
  items_count: number;
  items: MenuItem[];
};

export type RestaurantReview = {
  id: number;
  user: { id: number; name: string; profile_image: string | null };
  rating: number;
  comment: string;
  created_at: string;
};

export type CartItem = {
  id: number;
  item_id: number;
  quantity: number;
  notes?: string;
  item_name: string;
  unit_price: number;
  total_price: number;
};

export type Cart = {
  id: number;
  restaurant: { id: number; name: string };
  subtotal: number;
  items: CartItem[];
};

export type CheckoutPaymentOption = {
  id: string;
  title: string;
  description: string;
  required_now: {
    type: string;
    method: string;
    amount: number;
  };
  remaining_upon_delivery?: {
    type: string;
    method: string;
    amount: number;
  };
};

export type CheckoutPreview = {
  cart_id: number;
  order_type: 'delivery' | 'pickup';
  financials: {
    subtotal: number;
    delivery_fee: number;
    service_fee: number;
    discount_amount: number;
    points_redeemed: number;
    total: number;
  };
  deposit_rules: {
    requires_deposit: boolean;
    deposit_percentage: number;
    deposit_amount: number;
    remaining_amount: number;
  };
  available_payment_options: CheckoutPaymentOption[];
};

export type PlaceOrderResponse = {
  order_id: number;
  status: string;
  payment_url: string | null;
  message?: string;
};

export type Wallet = {
  id: number;
  user_id: number;
  balance: number;
  balance_in_egp: number;
  created_at?: string;
  updated_at?: string;
};

export type WalletTransaction = {
  id: number;
  points: number;
  type: string;
  source: string;
  reference_id: number | null;
  reference_type: string | null;
  created_at?: string;
};

export type ReferralItem = {
  id: number;
  referred_user: {
    id: number;
    name: string | null;
    username: string;
    profile_image_url: string | null;
  };
  status: 'pending' | 'completed';
  completed_at: string | null;
  created_at?: string;
};

export type GiftFriend = {
  id: number;
  full_name: string | null;
  username: string;
  profile_image_url: string | null;
};

export type PointGift = {
  id: number;
  type: 'sent' | 'received';
  user: {
    id: number;
    full_name: string | null;
    username: string;
    profile_image_url: string | null;
  };
  points: number;
  note: string | null;
  created_at?: string;
};

export type AppNotification = {
  id: string;
  notifiable_id: number;
  data: {
    type: string;
    title: string;
    body: string;
    action_url: string;
    order_id?: number | null;
    restaurant_name?: string | null;
  };
  read_at: null | string;
  created_at: string;
  updated_at: string;
};

export type RealtimeNotification = {
  id: number;
  type: string;
  title?: string;
  body?: string;
  action_url?: string;
  order_id?: number | null;
  restaurant_name?: string | null;
  data?: {
    type: string;
    title: string;
    body: string;
    action_url: string;
    order_id?: number | null;
    restaurant_name?: string | null;
  };
};

export type OrderItem = {
  id: number;
  item_id: number;
  item_name: string;
  quantity: number;
  price: number;
  total_price: number;
  notes: string | null;
};

export type OrderPayment = {
  id: number;
  payment_type: string;
  payment_method: string;
  amount: number;
  status: string;
};

export type OrderRestaurant = {
  id: number | null;
  name: string | null;
  logo_url: string | null;
  address?: string | null;
};

export type UserOrder = {
  id: number;
  order_type: 'delivery' | 'pickup';
  status: string;
  restaurant: OrderRestaurant;
  financials: {
    subtotal: number;
    delivery_fee: number;
    service_fee: number;
    total: number;
  };
  items: OrderItem[];
  payments: OrderPayment[];
  created_at: string;
  time_ago: string;
};

export type TrackingStep = {
  status: string;
  label: string;
  state: 'active' | 'pending' | 'completed';
};

export type OrderTracking = {
  is_cancelled: boolean;
  current_step?: number;
  total_steps?: number;
  steps: TrackingStep[];
};

export type OrderDetails = UserOrder & {
  tracking: OrderTracking;
};

export type SocialUser = {
  id: number;
  username: string;
  full_name: string;
  profile_image: string | null;
};

export type ReceivedFriendRequest = SocialUser & {
  sender_id: number;
};

export type SentFriendRequest = SocialUser & {
  recipient_id: number;
};

export type PaginatedItems<T> = {
  items: T[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
};

export type PostUser = {
  id: number;
  name: string | null;
  username: string;
  profile_image_url: string | null;
};

export type PostRestaurant = {
  id: number;
  name: string;
  logo_url: string | null;
};

export type PostImage = {
  id: number;
  image_url: string | null;
  position: number;
};

export type PostOrder = {
  id: number;
  order_type: string;
  subtotal: number;
  delivery_fee: number;
  service_fee: number;
  total: number;
  items: {
    id: number;
    item_id: number;
    item_name: string;
    quantity: number;
    price: number;
    notes?: string | null;
  }[];
};

export type Post = {
  id: number;
  user: PostUser;
  restaurant: PostRestaurant;
  images: PostImage[];
  order: PostOrder;
  caption: string;
  likes_count: number;
  copy_count: number;
  is_liked_by_user: boolean;
  status: 'approved' | 'pending';
  published_at: string | null;
  expires_at: string | null;
  created_at: string;
};

export type LeaderboardItem = {
  id: number;
  rank: number;
  user: PostUser;
  copies: number;
  reward_points: number;
  type: 'weekly';
  period_start: string;
  period_end: string;
};

export type FormDataImage = {
  uri: string;
  name?: string;
  type?: string;
};

export function toRating(value: number | string): number {
  const n = typeof value === 'string' ? Number(value) : value;
  return Number.isFinite(n) ? Number(n.toFixed(1)) : 0;
}

export type GroupStatus = 'active' | 'archived';
export type GroupRole = 'owner' | 'admin' | 'member';

export type GroupMember = SocialUser & {
  role: GroupRole;
  status: GroupStatus;
  joined_at: string;
  left_at: string | null;
};

export type GroupType = {
  id: number;
  name: string;
  description: string;
  image_url?: string | null;
  invite_token: string;
  allow_join_by_link: boolean;
  allow_guests_for_orders: boolean;
  my_role?: GroupRole;
  status: GroupStatus;
  owner: SocialUser;
  members: GroupMember[];
  createdAt: string;
};

export type GroupTypeSimplified = {
  id: number;
  name: string;
  description: string;
  image_url?: string | null;
  invite_token: string;
  allow_join_by_link: boolean;
  allow_guests_for_orders: boolean;
  status: GroupStatus;
  owner: SocialUser;
  members_count: number;
  createdAt: string;
};

export interface GroupOrderHistory {
  id: number;
  status: 'completed' | 'cancelled';
  restaurant: {
    id: number;
    name: string;
    image_url: null | string;
  };
  host: {
    id: number;
    name: string;
  };
  total_amount: number;
  members_summary: {
    user: {
      id: number | string;
      name: string;
      profile_image: string | null;
      is_guest?: boolean;
    };
    user_total: number;
    items: {
      id: number;
      item: {
        id: number;
        title: string;
        image_url: string | null;
        price: number;
      };
      quantity: number;
      unit_price: number;
      notes: null | string;
      total_price: number;
    }[];
  }[];
  created_at: string;
  updated_at: string;
}

export interface GroupOrderCartSession {
  id: number;
  status: 'open' | 'cancelled' | 'locked' | 'completed';
  allow_guests?: boolean;
  restaurant: {
    id: number;
    name: string;
    image_url: null | string;
  };
  host: {
    id: number;
    name: string;
  };
  total_amount: number;
  members_summary: {
    user: {
      id: number | string;
      name: string;
      profile_image: string | null;
      is_guest?: boolean;
    };
    user_total: number;
    items: {
      id: number;
      item: {
        id: number;
        title: string;
        image_url: string | null;
        price: number;
      };
      quantity: number;
      unit_price: number;
      notes: null | string;
      total_price: number;
    }[];
  }[];
  created_at: string;
  updated_at: string;
}

export type CheckoutPreviewResponse = {
  cart_id: number;
  order_type: 'delivery' | 'pickup';
  financials: {
    subtotal: number;
    delivery_fee: number;
    service_fee: number;
    discount_amount: number;
    points_redeemed: number;
    total: number;
  };
  deposit_rules: {
    requires_deposit: boolean;
    deposit_percentage: number;
    deposit_amount: number;
    remaining_amount: number;
  };
  internal_data: {
    system_commission: number;
  };
};

export type CheckoutPaymentResponse = {
  order_id: number;
  status: 'pending';
  payment_url: string | null;
  message: string;
};

export interface ActiveGroupOrderSession {
  id: number;
  status: 'open' | 'cancelled' | 'locked' | 'completed';
  group_id: number;
  group_name: string;
  restaurant_id: number;
  restaurant_name: string;
}

export type BadgeType = 'weekly_3_orders' | 'weekly_5_orders';

export interface StreakDetails {
  week_start_date: string;
  completed_orders_count: number;
  next_tier: null | {
    target_orders: number;
    orders_needed: number;
    reward_points: number;
    badge_type: BadgeType | null;
  };
  badges:
    | {
        id: number;
        badge_type: BadgeType;
        week_start_date: string;
        created_at: string;
      }[]
    | [];
}

export interface UserResponse {
  id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  username: string;
  email: string;
  phone_number: string;
  profile_image: null | string;
  gender: 'male' | 'female';
  status: 'active';
  referral_code: string;
  last_login_at: string;
  posts_count: number;
  friends_count: number;
}