import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';

import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { useNotificationsStore } from '@/stores/notifications';
import { useCartStore } from '@/stores/cart';
import {
  toRating,
  type Cart,
  type CheckoutPreview,
  type MenuSection,
  type PaginatedItems,
  type PlaceOrderResponse,
  type Restaurant,
  type RestaurantCategoryItem,
  type RestaurantDetail,
  type RestaurantReview,
  type TopRestaurant,
  type Wallet,
  type WalletTransaction,
  type GiftFriend,
  type PointGift,
  type ReferralItem,
  type AppNotification,
  type UserOrder,
  type OrderDetails,
  type SocialUser,
  type ReceivedFriendRequest,
  type SentFriendRequest,
  type Post,
  type LeaderboardItem,
  type FormDataImage,
  type GroupStatus,
  type GroupRole,
  type GroupMember,
  type GroupType,
  type GroupTypeSimplified,
  type GroupOrderHistory,
  type GroupOrderCartSession,
  type CheckoutPreviewResponse,
  type CheckoutPaymentResponse,
  type ActiveGroupOrderSession,
  type StreakDetails,
  type UserResponse,
} from '@/lib/types';

export const queryKeys = {
  homeCategories: ['home', 'categories'] as const,
  topRestaurants: ['home', 'top-restaurants'] as const,
  restaurants: ['restaurants', 'list'] as const,
  restaurantCategories: ['restaurant', 'categories'] as const,
  restaurantDetail: (id: number) => ['restaurant', 'detail', id] as const,
  restaurantMenu: (id: number) => ['restaurant', 'menu', id] as const,
  restaurantReviews: (id: number) => ['restaurant', 'reviews', id] as const,
  cart: ['cart'] as const,
  wallet: ['wallet'] as const,
  walletTransactions: (page: number, perPage: number) =>
    ['wallet', 'transactions', page, perPage] as const,
  walletReferrals: (page: number, perPage: number) =>
    ['wallet', 'referrals', page, perPage] as const,
  walletGiftFriends: ['wallet', 'gift', 'friends'] as const,
  walletGifts: ['wallet', 'gifts'] as const,
  notifications: ['notifications'] as const,
  notificationsPage: (page: number, perPage: number) =>
    ['notifications', 'list', page, perPage] as const,
  notificationsUnreadCount: ['notifications', 'unread-count'] as const,
  activeOrders: ['orders', 'active'] as const,
  pastOrders: (page: number, perPage: number) => ['orders', 'past', page, perPage] as const,
  orderDetails: (id: number) => ['orders', 'details', id] as const,
  friendList: ['friends', 'list'] as const,
  friendRequests: ['friends', 'requests'] as const,
  sentFriendRequests: ['friends', 'sent'] as const,
  discoverUsers: ['friends', 'discover'] as const,
  posts: ['posts', 'list'] as const,
  postDetail: (id: number) => ['posts', 'detail', id] as const,
  shareableOrders: ['posts', 'shareable-orders'] as const,
  leaderboard: ['leaderboard'] as const,
  groups: ['groups', 'list'] as const,
  groupDetail: (id: number) => ['groups', 'detail', id] as const,
  groupOrderHistory: (groupId: number, page: number, perPage: number) => ['groups', 'history', groupId, page, perPage] as const,
  inviteGroupDetail: (token: string) => ['groups', 'invite', token] as const,
  groupOrderSession: (id: number) => ['group-order', 'session', id] as const,
  groupOrderMenu: (restaurantId: number) => ['group-order', 'menu', restaurantId] as const,
  activeGroupOrders: ['group-orders', 'active'] as const,
  streak: ['wallet', 'streak'] as const,
  profile: ['profile', 'me'] as const,
};

function toRestaurant(raw: TopRestaurant): Restaurant {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    logo_url: raw.logo_url,
    cover_image_url: raw.cover_image_url,
    average_rating: toRating(raw.average_rating),
    reviews_count: raw.reviews_count,
    is_open_now: raw.settings?.is_open,
    delivery_enabled: raw.settings?.delivery_enabled,
    pickup_enabled: raw.settings?.pickup_enabled,
    distance: raw.distance != null ? Number(raw.distance) : null,
  };
}

function fetchHomeCategories(): Promise<RestaurantCategoryItem[]> {
  return api
    .get<{ data: { items: RestaurantCategoryItem[] } }>('/user/restaurant-categories')
    .then((res) => res.data?.items ?? []);
}

function fetchTopRestaurants(): Promise<Restaurant[]> {
  return api
    .get<{ data: TopRestaurant[] }>('/user/restaurants/nearest?limit=5')
    .then((res) => (res.data ?? []).map(toRestaurant));
}

type RestaurantListItem = {
  id: number;
  name: string;
  logo_url: string;
  cover_image_url: string;
  average_rating: number;
  reviews_count: number;
  delivery_enabled: boolean;
  pickup_enabled: boolean;
  is_open_now: boolean;
};

function toRestaurantListItem(raw: RestaurantListItem): Restaurant {
  return {
    id: raw.id,
    name: raw.name,
    description: '',
    logo_url: raw.logo_url,
    cover_image_url: raw.cover_image_url,
    average_rating: toRating(raw.average_rating),
    reviews_count: raw.reviews_count,
    is_open_now: raw.is_open_now,
    delivery_enabled: raw.delivery_enabled,
    pickup_enabled: raw.pickup_enabled,
    distance: null,
  };
}

function fetchRestaurants(): Promise<Restaurant[]> {
  return api
    .get<{ data: { items: RestaurantListItem[] } }>('/user/restaurants?limit=50')
    .then((res) => (res.data?.items ?? []).map(toRestaurantListItem));
}

export type RestaurantCategory = { id: number; name: string };

function fetchRestaurantCategories(): Promise<RestaurantCategory[]> {
  return api
    .get<{ data: { items: RestaurantCategory[] } }>('/restaurant/categories?all=true')
    .then((res) => res.data?.items ?? []);
}

export function useHomeCategories() {
  return useQuery({ queryKey: queryKeys.homeCategories, queryFn: fetchHomeCategories });
}

export function useTopRestaurants() {
  return useQuery({ queryKey: queryKeys.topRestaurants, queryFn: fetchTopRestaurants });
}

export function useRestaurantsList() {
  return useQuery({ queryKey: queryKeys.restaurants, queryFn: fetchRestaurants });
}

export type RestaurantListParams = {
  page?: number;
  perPage?: number;
  search?: string;
  category?: string;
  minRating?: number;
  delivery?: boolean;
  pickup?: boolean;
  availableOnly?: boolean;
  sort?: 'rating' | 'name';
};

export type RestaurantListResult = {
  items: Restaurant[];
  currentPage: number;
  lastPage: number;
  total: number;
};

type RestaurantMeta = {
  current_page?: number;
  last_page?: number;
  total?: number;
};

function buildRestaurantsQuery(params: RestaurantListParams): string {
  const q = new URLSearchParams();
  q.set('page', String(params.page ?? 1));
  q.set('per_page', String(params.perPage ?? 8));
  if (params.search) q.set('name', params.search);
  if (params.category) q.set('category', params.category);
  if (params.minRating && params.minRating >= 1) q.set('min_rating', String(params.minRating));
  if (params.delivery) q.set('delivery_enabled', 'true');
  if (params.pickup) q.set('pickup_enabled', 'true');
  if (params.availableOnly) q.set('accept_orders', 'true');
  q.set('sort_by', params.sort === 'name' ? 'alphabetical' : 'rating');
  return q.toString();
}

export function useRestaurants(params: RestaurantListParams) {
  const queryKey = ['restaurants', 'filtered', params] as const;
  return useQuery({
    queryKey,
    queryFn: async (): Promise<RestaurantListResult> => {
      const res = await api.get<{ data: { items: RestaurantListItem[]; meta?: RestaurantMeta } }>(
        `/user/restaurants?${buildRestaurantsQuery(params)}`,
      );
      const items = (res.data?.items ?? []).map(toRestaurantListItem);
      const meta = res.data?.meta ?? {};
      return {
        items,
        currentPage: meta.current_page ?? (params.page ?? 1),
        lastPage: meta.last_page ?? 1,
        total: meta.total ?? items.length,
      };
    },
  });
}

export function useRestaurantCategories() {
  return useQuery({ queryKey: queryKeys.restaurantCategories, queryFn: fetchRestaurantCategories });
}

function toDetail(raw: any): RestaurantDetail {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description ?? '',
    logo_url: raw.logo_url,
    cover_image_url: raw.cover_image_url,
    category: raw.category,
    category_name: raw.category_name,
    address: raw.address,
    phone_number: raw.phone_number,
    average_rating: toRating(raw.average_rating),
    reviews_count: raw.reviews_count ?? 0,
    delivery_enabled: raw.delivery_enabled ?? false,
    pickup_enabled: raw.pickup_enabled ?? false,
    delivery_fee_per_km: raw.delivery_fee_per_km,
    is_open_now: raw.is_open_now ?? false,
    opening_hours: raw.opening_hours,
    latitude: raw.latitude,
    longitude: raw.longitude,
    minimum_order: raw.minimum_order ?? 0,
  };
}

export function useRestaurantDetail(id: number | string) {
  const restaurantId = typeof id === 'string' ? Number(id) : id;
  return useQuery({
    queryKey: queryKeys.restaurantDetail(restaurantId),
    queryFn: async () => {
      const res = await api.get<{ data: RestaurantDetail }>(`/user/restaurants/${restaurantId}`);
      return toDetail(res.data);
    },
  });
}

export function useRestaurantMenu(id: number | string) {
  const restaurantId = typeof id === 'string' ? Number(id) : id;
  return useQuery({
    queryKey: queryKeys.restaurantMenu(restaurantId),
    queryFn: async () => {
      const res = await api.get<{ data: { items: MenuSection[] } }>(
        `/user/restaurants/${restaurantId}/menu`,
      );
      return res.data?.items ?? [];
    },
  });
}

export function useRestaurantReviews(id: number | string) {
  const restaurantId = typeof id === 'string' ? Number(id) : id;
  return useQuery({
    queryKey: queryKeys.restaurantReviews(restaurantId),
    queryFn: async () => {
      const res = await api.get<{ data: { items: RestaurantReview[] } }>(
        `/user/restaurants/${restaurantId}/reviews`,
      );
      return res.data?.items ?? [];
    },
  });
}

export type MyReview = {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
};

export function useMyReview(id: number | string) {
  const restaurantId = typeof id === 'string' ? Number(id) : id;
  return useQuery({
    queryKey: ['restaurant', 'reviews', restaurantId, 'me'],
    queryFn: async () => {
      const res = await api.get<{ data: MyReview }>(`/user/restaurants/${restaurantId}/reviews/me`);
      return res.data;
    },
    retry: false,
  });
}

export function useReviewMutation() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();

  return useMutation({
    mutationFn: async ({
      restaurantId,
      rating,
      comment,
      isUpdate,
    }: {
      restaurantId: number;
      rating: number;
      comment: string;
      isUpdate: boolean;
    }) => {
      if (!isAuthenticated) throw new Error('Unauthorized');
      if (isUpdate) {
        return api.put(`/user/restaurants/${restaurantId}/reviews`, { rating, comment });
      }
      return api.post(`/user/restaurants/${restaurantId}/reviews`, { rating, comment });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.restaurantReviews(variables.restaurantId) });
    },
  });
}

export function useDeleteReviewMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (restaurantId: number) => api.del(`/user/restaurants/${restaurantId}/reviews`),
    onSuccess: (_data, restaurantId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.restaurantReviews(restaurantId) });
    },
  });
}

export function useCart() {
  const { isAuthenticated } = useAuthStore();
  const guestCart = useCartStore((s) => s.cart);

  const apiCartQuery = useQuery({
    queryKey: queryKeys.cart,
    queryFn: async () => {
      const res = await api.get<{ data?: Cart | null }>('/user/cart');
      // The API omits `data` when the user's cart has been cleared after checkout.
      // React Query query functions must never resolve to undefined.
      return res.data ?? null;
    },
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return {
      data: guestCart,
      isLoading: false,
      isSuccess: true,
      refetch: () => Promise.resolve(),
    } as unknown as UseQueryResult<Cart | null, Error>;
  }

  return apiCartQuery;
}

export function useAddCartItem() {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const addGuestItem = useCartStore((s) => s.addItem);

  return useMutation({
    mutationFn: async (payload: {
      restaurant_id: number;
      restaurant_name?: string;
      item_id: number;
      item_name?: string;
      unit_price?: number;
      quantity: number;
      notes?: string;
    }) => {
      if (!isAuthenticated) {
        addGuestItem(
          payload.restaurant_id,
          payload.restaurant_name ?? 'Restaurant',
          {
            id: payload.item_id,
            title: payload.item_name ?? 'Item',
            price: payload.unit_price ?? 0,
            description: '',
            is_available: true,
            image_url: '',
          },
          payload.quantity,
          payload.notes
        );
        return null;
      }
      return api.post('/user/cart/items', {
        restaurant_id: payload.restaurant_id,
        item_id: payload.item_id,
        quantity: payload.quantity,
        notes: payload.notes,
      });
    },
    onSuccess: () => {
      if (isAuthenticated) {
        queryClient.invalidateQueries({ queryKey: queryKeys.cart });
      }
    },
  });
}

export function useUpdateCartItemQuantity() {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const updateGuestQty = useCartStore((s) => s.updateQuantity);

  return useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      if (!isAuthenticated) {
        updateGuestQty(id, quantity);
        return null;
      }
      return api.put(`/user/cart/items/${id}`, { quantity });
    },
    onSuccess: () => {
      if (isAuthenticated) {
        queryClient.invalidateQueries({ queryKey: queryKeys.cart });
      }
    },
  });
}

export function useRemoveCartItem() {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const removeGuestItem = useCartStore((s) => s.removeItem);

  return useMutation({
    mutationFn: async (id: number) => {
      if (!isAuthenticated) {
        removeGuestItem(id);
        return null;
      }
      return api.del(`/user/cart/items/${id}`);
    },
    onSuccess: () => {
      if (isAuthenticated) {
        queryClient.invalidateQueries({ queryKey: queryKeys.cart });
      }
    },
  });
}

export function useCheckoutPreview() {
  return useMutation({
    mutationFn: (payload: {
      order_type: 'delivery' | 'pickup';
      lat?: number;
      long?: number;
      points?: number;
    }) => api.post<{ data: CheckoutPreview }>('/user/checkout/preview', payload),
  });
}

export function usePlaceOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      order_type: 'delivery' | 'pickup';
      payment_option_id: string;
      lat?: number;
      long?: number;
      points?: number;
    }) => api.post<{ data: PlaceOrderResponse }>('/user/checkout/place', payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.cart }),
  });
}

export function useWallet() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: queryKeys.wallet,
    queryFn: async () => {
      const res = await api.get<{ data: Wallet }>('/wallet');
      return res.data;
    },
    enabled: isAuthenticated,
  });
}

export function useWalletTransactions(page = 1, perPage = 15) {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: queryKeys.walletTransactions(page, perPage),
    queryFn: async () => {
      const res = await api.get<{
        data: {
          items: WalletTransaction[];
          meta: {
            current_page: number;
            per_page: number;
            total: number;
            last_page: number;
          };
        };
      }>(`/wallet/transactions?page=${page}&per_page=${perPage}`);
      return res.data;
    },
    enabled: isAuthenticated,
  });
}

export function useReferrals(page = 1, perPage = 15) {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: queryKeys.walletReferrals(page, perPage),
    queryFn: async () => {
      const res = await api.get<{
        data: {
          items: ReferralItem[];
          meta: {
            current_page: number;
            per_page: number;
            total: number;
            last_page: number;
          };
        };
      }>(`/wallet/referrals?page=${page}&per_page=${perPage}`);
      return res.data;
    },
    enabled: isAuthenticated,
  });
}

export function useGiftFriends() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: queryKeys.walletGiftFriends,
    queryFn: async () => {
      const res = await api.get<GiftFriend[]>('/wallet/gift/friends');
      return res;
    },
    enabled: isAuthenticated,
  });
}

export function useGifts() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: queryKeys.walletGifts,
    queryFn: async () => {
      const res = await api.get<{ data: { items: PointGift[] } }>('/wallet/gifts');
      return res.data;
    },
    enabled: isAuthenticated,
  });
}

export function useSendGift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { receiver_id: number; points: number; note?: string }) =>
      api.post<{ message?: string }>('/wallet/gift', payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.wallet });
      void queryClient.invalidateQueries({ queryKey: queryKeys.walletGifts });
      void queryClient.invalidateQueries({ queryKey: ['wallet', 'transactions'] });
    },
  });
}

export function useNotifications(page = 1, perPage = 15) {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: queryKeys.notificationsPage(page, perPage),
    queryFn: async () => {
      const res = await api.get<{
        data: {
          items: AppNotification[];
          meta: {
            current_page: number;
            per_page: number;
            total: number;
            last_page: number;
          };
        };
      }>(`/user/notifications?page=${page}&per_page=${perPage}`);
      return res.data;
    },
    enabled: isAuthenticated,
  });
}

export function useUnreadNotificationsCount() {
  const { isAuthenticated } = useAuthStore();
  const setUnreadCount = useNotificationsStore((s) => s.setUnreadCount);
  return useQuery({
    queryKey: queryKeys.notificationsUnreadCount,
    queryFn: async () => {
      const res = await api.get<{ data: { count: number } }>('/user/notifications/unread-count');
      setUnreadCount(res.data.count);
      return res.data.count;
    },
    enabled: isAuthenticated,
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  const decrementUnread = useNotificationsStore((s) => s.decrementUnread);
  return useMutation({
    mutationFn: (id: string) => api.patch(`/user/notifications/${id}/mark-as-read`),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
      void queryClient.invalidateQueries({ queryKey: queryKeys.notificationsUnreadCount });
      decrementUnread();
      void id;
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();
  const setUnreadCount = useNotificationsStore((s) => s.setUnreadCount);
  return useMutation({
    mutationFn: () => api.post('/user/notifications/mark-all-as-read'),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
      void queryClient.invalidateQueries({ queryKey: queryKeys.notificationsUnreadCount });
      setUnreadCount(0);
    },
  });
}

export function useActiveOrders() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: queryKeys.activeOrders,
    queryFn: async () => {
      const res = await api.get<{ data: UserOrder[] }>('/user/orders/active');
      return res.data ?? [];
    },
    enabled: isAuthenticated,
  });
}

export function usePastOrders(page = 1, perPage = 15) {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: queryKeys.pastOrders(page, perPage),
    queryFn: async () => {
      const res = await api.get<{
        data: {
          items: UserOrder[];
          meta: {
            current_page: number;
            per_page: number;
            total: number;
            last_page: number;
          };
        };
      }>(`/user/orders/past?page=${page}&per_page=${perPage}`);
      return res.data;
    },
    enabled: isAuthenticated,
  });
}

export function useOrderDetails(id: number) {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: queryKeys.orderDetails(id),
    queryFn: async () => {
      const res = await api.get<{ data: OrderDetails }>(`/user/orders/${id}`);
      return res.data;
    },
    enabled: isAuthenticated,
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.post(`/user/orders/${id}/cancel`),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.activeOrders });
      void queryClient.invalidateQueries({ queryKey: queryKeys.orderDetails(id) });
    },
  });
}

function fetchFriends(page: number, perPage: number, search?: string): Promise<PaginatedItems<SocialUser>> {
  return api
    .get<{ data: PaginatedItems<SocialUser> }>(
      `/friends?page=${page}&per_page=${perPage}${search ? `&search=${encodeURIComponent(search)}` : ''}`,
    )
    .then((res) => res.data);
}

function fetchFriendRequests(
  page: number,
  perPage: number,
  search?: string,
): Promise<PaginatedItems<ReceivedFriendRequest>> {
  return api
    .get<{ data: PaginatedItems<ReceivedFriendRequest> }>(
      `/friends/requests?page=${page}&per_page=${perPage}${search ? `&search=${encodeURIComponent(search)}` : ''}`,
    )
    .then((res) => res.data);
}

function fetchSentFriendRequests(
  page: number,
  perPage: number,
  search?: string,
): Promise<PaginatedItems<SentFriendRequest>> {
  return api
    .get<{ data: PaginatedItems<SentFriendRequest> }>(
      `/friends/requests/sent?page=${page}&per_page=${perPage}${search ? `&search=${encodeURIComponent(search)}` : ''}`,
    )
    .then((res) => res.data);
}

function fetchDiscoverUsers(
  page: number,
  perPage: number,
  search?: string,
): Promise<PaginatedItems<SocialUser>> {
  return api
    .get<{ data: PaginatedItems<SocialUser> }>(
      `/users/search?page=${page}&per_page=${perPage}${search ? `&search=${encodeURIComponent(search)}` : ''}`,
    )
    .then((res) => res.data);
}

export function useFriends(page = 1, perPage = 15, search?: string) {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: [...queryKeys.friendList, page, perPage, search ?? ''] as const,
    queryFn: () => fetchFriends(page, perPage, search),
    enabled: isAuthenticated,
  });
}

export function useFriendRequests(page = 1, perPage = 15, search?: string) {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: [...queryKeys.friendRequests, page, perPage, search ?? ''] as const,
    queryFn: () => fetchFriendRequests(page, perPage, search),
    enabled: isAuthenticated,
  });
}

export function useSentFriendRequests(page = 1, perPage = 15, search?: string) {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: [...queryKeys.sentFriendRequests, page, perPage, search ?? ''] as const,
    queryFn: () => fetchSentFriendRequests(page, perPage, search),
    enabled: isAuthenticated,
  });
}

export function useDiscoverUsers(page = 1, perPage = 15, search?: string) {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: [...queryKeys.discoverUsers, page, perPage, search ?? ''] as const,
    queryFn: () => fetchDiscoverUsers(page, perPage, search),
    enabled: isAuthenticated,
  });
}

export function useSendFriendRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => api.post('/friends/request', { user_id: userId }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.discoverUsers });
      void queryClient.invalidateQueries({ queryKey: queryKeys.sentFriendRequests });
    },
  });
}

export function useCancelFriendRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: number) => api.del(`/friends/requests/${requestId}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.sentFriendRequests });
      void queryClient.invalidateQueries({ queryKey: queryKeys.discoverUsers });
    },
  });
}

export function useAcceptFriendRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: number) => api.post(`/friends/requests/${requestId}/accept`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.friendRequests });
      void queryClient.invalidateQueries({ queryKey: queryKeys.friendList });
    },
  });
}

export function useRejectFriendRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: number) => api.post(`/friends/requests/${requestId}/reject`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.friendRequests });
    },
  });
}

export function useRemoveFriend() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => api.del(`/friends/${userId}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.friendList });
    },
  });
}

export function usePosts(page = 1, perPage = 10) {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: [...queryKeys.posts, page, perPage] as const,
    queryFn: async () => {
      const res = await api.get<{ data: PaginatedItems<Post> }>(
        `/posts?page=${page}&per_page=${perPage}`,
      );
      return res.data;
    },
    enabled: isAuthenticated,
  });
}

export function usePostDetail(id: number) {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: queryKeys.postDetail(id),
    queryFn: async () => {
      const res = await api.get<{ data: Post }>(`/posts/${id}`);
      return res.data;
    },
    enabled: isAuthenticated && Number.isFinite(id),
  });
}

export function useShareableOrders() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: queryKeys.shareableOrders,
    queryFn: async () => {
      const res = await api.get<{ data?: UserOrder[] }>('/user/posts/shareable-orders');
      return res.data ?? [];
    },
    enabled: isAuthenticated,
  });
}

export function useLeaderboard() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: queryKeys.leaderboard,
    queryFn: async () => {
      const res = await api.get<{ data: PaginatedItems<LeaderboardItem> }>(
        '/leaderboards?type=weekly',
      );
      return res.data?.items ?? [];
    },
    enabled: isAuthenticated,
  });
}

export function useLikePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: number) => api.post(`/posts/${postId}/like`),
    onSuccess: (_data, postId) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.postDetail(postId) });
    },
  });
}

export function useUnlikePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: number) => api.del(`/posts/${postId}/like`),
    onSuccess: (_data, postId) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.postDetail(postId) });
    },
  });
}

export function useCopyPostOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: number) => api.post(`/posts/${postId}/copy`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart });
    },
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { order_id: number; caption: string; images: FormDataImage[] }) => {
      const formData = new FormData();
      formData.append('order_id', String(payload.order_id));
      if (payload.caption.trim()) formData.append('caption', payload.caption);
      payload.images.forEach((image) => {
        formData.append('images[]', image as unknown as Blob);
      });
      return api.post('/posts', formData);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.posts });
      void queryClient.invalidateQueries({ queryKey: queryKeys.shareableOrders });
    },
  });
}

export function useGroups(page = 1, perPage = 15, search?: string) {
  return useQuery({
    queryKey: [...queryKeys.groups, page, perPage, search ?? ''] as const,
    queryFn: () =>
      api
        .get<{ data: PaginatedItems<GroupTypeSimplified> }>(
          `/groups?page=${page}&per_page=${perPage}${search ? `&search=${encodeURIComponent(search)}` : ''}`
        )
        .then((res) => res.data),
  });
}

export function useGroupDetail(id: number) {
  return useQuery({
    queryKey: queryKeys.groupDetail(id),
    queryFn: () =>
      api.get<{ data: GroupType }>(`/groups/${id}`).then((res) => res.data),
  });
}

export function useGroupOrderHistory(groupId: number, page = 1, perPage = 10) {
  return useQuery({
    queryKey: queryKeys.groupOrderHistory(groupId, page, perPage),
    queryFn: () =>
      api
        .get<{ data: PaginatedItems<GroupOrderHistory> }>(
          `/user/group-orders/history?group_id=${groupId}&page=${page}&per_page=${perPage}`
        )
        .then((res) => res.data),
  });
}

export function useInviteGroupDetail(token: string) {
  return useQuery({
    queryKey: queryKeys.inviteGroupDetail(token),
    queryFn: () =>
      api.get<{ data: GroupTypeSimplified }>(`/groups/invite/${token}`).then((res) => res.data),
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; description: string; image?: FormDataImage | null }) => {
      const formData = new FormData();
      formData.append('name', payload.name);
      formData.append('description', payload.description);
      if (payload.image) {
        formData.append('image', payload.image as unknown as Blob);
      }
      return api.post<{ data: GroupType }>('/groups', formData);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.groups });
    },
  });
}

export function useUpdateGroup(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; description: string; image?: FormDataImage | null }) => {
      const formData = new FormData();
      formData.append('name', payload.name);
      formData.append('description', payload.description);
      if (payload.image) {
        formData.append('image', payload.image as unknown as Blob);
      }
      return api.post<{ data: GroupType }>(`/groups/${id}`, formData);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.groups });
      void queryClient.invalidateQueries({ queryKey: queryKeys.groupDetail(id) });
    },
  });
}

export function useToggleGroupInvite(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (allowJoinByLink: boolean) =>
      api.patch<{ data: GroupType }>(`/groups/${id}/join-settings`, {
        allow_join_by_link: allowJoinByLink,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.groupDetail(id) });
    },
  });
}

export function useDeleteGroup(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.del(`/groups/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.groups });
      void queryClient.invalidateQueries({ queryKey: queryKeys.groupDetail(id) });
    },
  });
}

export function useLeaveGroup(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post(`/groups/${id}/leave`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.groups });
      void queryClient.invalidateQueries({ queryKey: queryKeys.groupDetail(id) });
    },
  });
}

export function useRemoveGroupMember(groupId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => api.del(`/groups/${groupId}/members/${userId}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.groupDetail(groupId) });
    },
  });
}

export function usePromoteGroupMember(groupId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) =>
      api.patch(`/groups/${groupId}/members/${userId}`, { role: 'admin' }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.groupDetail(groupId) });
    },
  });
}

export function useDemoteGroupMember(groupId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) =>
      api.patch(`/groups/${groupId}/members/${userId}`, { role: 'member' }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.groupDetail(groupId) });
    },
  });
}

export function useAddGroupMember(groupId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) =>
      api.post(`/groups/${groupId}/members`, { user_id: userId }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.groupDetail(groupId) });
    },
  });
}

export function useJoinGroupByLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (token: string) => api.post(`/groups/invite/${token}`),
    onSuccess: (_, token) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.groups });
      void queryClient.invalidateQueries({ queryKey: queryKeys.inviteGroupDetail(token) });
    },
  });
}

export function useGroupOrderSession(id: number) {
  const { isAuthenticated } = useAuthStore();
  const url = isAuthenticated
    ? `/user/group-orders/${id}`
    : `/user/group-orders/${id}/guest/cart`;
  return useQuery({
    queryKey: queryKeys.groupOrderSession(id),
    queryFn: () =>
      api.get<{ data: GroupOrderCartSession }>(url).then((res) => res.data),
  });
}

export function useGroupOrderDetail(id: number) {
  return useQuery({
    queryKey: ['group-order', 'detail', id] as const,
    queryFn: () =>
      api
        .get<{ data: GroupOrderCartSession }>(`/user/group-orders/${id}/detail`)
        .then((res) => res.data),
  });
}

export function useAddGuestGroupCartItem(sessionId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      user_id: string;
      user_name: string;
      item_id: number;
      quantity: number;
      notes?: string;
    }) => api.post(`/user/group-orders/${sessionId}/guest/items`, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.groupOrderSession(sessionId) });
    },
  });
}

export function useUpdateGuestGroupCartItemQuantity(sessionId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { user_id: string; item_id: number; quantity: number }) =>
      api.put(`/user/group-orders/${sessionId}/guest/items/${payload.item_id}`, {
        user_id: payload.user_id,
        quantity: payload.quantity,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.groupOrderSession(sessionId) });
    },
  });
}

export function useRemoveGuestGroupCartItem(sessionId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { user_id: string; item_id: number }) =>
      api.del(`/user/group-orders/${sessionId}/guest/items/${payload.item_id}`, {
        body: { user_id: payload.user_id },
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.groupOrderSession(sessionId) });
    },
  });
}

export function useClearGuestGroupCartItems(sessionId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (user_id: string) =>
      api.del(`/user/group-orders/${sessionId}/guest/items`, { body: { user_id } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.groupOrderSession(sessionId) });
    },
  });
}

export function useMergeGuestItems() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      group_orders: { id: number; name: string }[];
      user_id: string;
    }) => api.post('/user/group-orders/guest/merge', payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.activeGroupOrders });
    },
  });
}

export function useToggleGroupGuests(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (allow_guests_for_orders: boolean) =>
      api.post<{ data: GroupType }>(`/groups/${id}`, { allow_guests_for_orders }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.groupDetail(id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.groups });
    },
  });
}

export function useAddGroupCartItem(sessionId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { item_id: number; quantity: number; notes?: string }) =>
      api.post(`/user/group-orders/${sessionId}/items`, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.groupOrderSession(sessionId) });
    },
  });
}

export function useRemoveGroupCartItem(sessionId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: number) =>
      api.del(`/user/group-orders/${sessionId}/items/${itemId}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.groupOrderSession(sessionId) });
    },
  });
}

export function useUpdateGroupCartItemQuantity(sessionId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { item_id: number; quantity: number }) =>
      api.put(`/user/group-orders/${sessionId}/items/${payload.item_id}`, { quantity: payload.quantity }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.groupOrderSession(sessionId) });
    },
  });
}

export function useClearMyGroupCartItems(sessionId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.del(`/user/group-orders/${sessionId}/items`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.groupOrderSession(sessionId) });
    },
  });
}

export function useUnlockGroupOrder(sessionId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post(`/user/group-orders/${sessionId}/unlock`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.groupOrderSession(sessionId) });
    },
  });
}

export function useCancelGroupOrder(sessionId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post(`/user/group-orders/${sessionId}/cancel`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.groupOrderSession(sessionId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.activeGroupOrders });
    },
  });
}

export function useCheckoutGroupPreviewDelivery(sessionId: number) {
  return useMutation({
    mutationFn: (payload: { lat: number; long: number }) =>
      api.post<{ data: CheckoutPreviewResponse }>(`/user/group-orders/${sessionId}/preview`, {
        order_type: 'delivery',
        lat: payload.lat,
        long: payload.long,
      }).then((res) => res.data),
  });
}

export function useCheckoutGroupPreviewPickup(sessionId: number) {
  return useMutation({
    mutationFn: () =>
      api.post<{ data: CheckoutPreviewResponse }>(`/user/group-orders/${sessionId}/preview`, {
        order_type: 'pickup',
      }).then((res) => res.data),
  });
}

export function useCheckoutGroupPay(sessionId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      payment_option_id: string;
      order_type: 'delivery' | 'pickup';
      lat?: number;
      long?: number;
      notes?: string;
    }) => api.post<{ data: CheckoutPaymentResponse }>(`/user/group-orders/${sessionId}/place`, payload).then((res) => res.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.groupOrderSession(sessionId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.wallet });
    },
  });
}

export function useCreateGroupOrderSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      group_id?: number | null;
      restaurant_id: number;
      is_anonymous?: boolean;
    }) =>
      api
        .post<{ data: { group_order_id: number } }>('/user/group-orders', payload)
        .then((res) => res.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.activeGroupOrders });
    },
  });
}

export function useActiveGroupOrders() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: queryKeys.activeGroupOrders,
    queryFn: () =>
      api.get<{ data: ActiveGroupOrderSession[] }>('/user/group-orders/active-sessions').then((res) => {
        const list = res.data ?? [];
        return list.filter((s) => s.status === 'open' || s.status === 'locked');
      }),
    enabled: isAuthenticated,
  });
}

export function useStreak() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: queryKeys.streak,
    queryFn: () =>
      api.get<{ data: StreakDetails }>('/wallet/streak').then((res) => res.data),
    enabled: isAuthenticated,
  });
}

export function useProfile() {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: () =>
      api.get<{ data: UserResponse }>('/user/me').then((res) => res.data),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      first_name: string;
      last_name: string;
      username: string;
      profile_image?: FormDataImage | null;
    }) => {
      const formData = new FormData();
      formData.append('first_name', payload.first_name);
      formData.append('last_name', payload.last_name);
      formData.append('username', payload.username);
      if (payload.profile_image) {
        formData.append('profile_image', {
          uri: payload.profile_image.uri,
          name: payload.profile_image.name,
          type: payload.profile_image.type,
        } as any);
      }
      return api
        .post<{ data: UserResponse }>('/user/profile', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then((res) => res.data);
    },
    onSuccess: (res) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    },
  });
}

export function useUserPosts(page = 1, perPage = 10) {
  return useQuery({
    queryKey: ['posts', 'user', page, perPage] as const,
    queryFn: () =>
      api
        .get<{ data: PaginatedItems<Post> }>(
          `/user/posts?page=${page}&per_page=${perPage}`
        )
        .then((res) => res.data),
  });
}
