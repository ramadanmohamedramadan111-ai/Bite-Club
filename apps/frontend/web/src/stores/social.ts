import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { mockPosts } from '@/data/mock-posts';
import { mockPastOrders } from '@/data/mock-past-orders';
import { socialUsers } from '@/data/social-users';
import type { PastOrder } from '@/types/social/orders';
import type { SocialUser } from '@/types/social/friends';
import type { Post } from '@/types/social/posts';
import { normalizePost } from '@/types/social/posts';

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  email: string;
  bio: string;
  phone: string;
  avatar: string | null;
  privateProfile: boolean;
  showInSearch: boolean;
}

const defaultProfile: UserProfile = {
  id: 'current-user',
  username: 'currentuser',
  name: 'Your Name',
  email: 'user@example.com',
  bio: 'Food enthusiast. Always looking for the best spicy noodles in town.',
  phone: '+1 (555) 123-4567',
  avatar:
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
  privateProfile: false,
  showInSearch: true,
};

type SocialStore = {
  posts: Post[];
  profile: UserProfile;
  users: SocialUser[];
  pastOrders: PastOrder[];
  likedPostIds: string[];

  getPostById: (postId: string) => Post | undefined;
  getPostsByAuthorId: (authorId: string) => Post[];
  getGlobalPosts: () => Post[];
  getFollowingPosts: () => Post[];
  getUserByUsername: (username: string) => SocialUser | undefined;
  getPastOrderById: (orderId: string) => PastOrder | undefined;
  isPostLiked: (postId: string) => boolean;

  addPostFromOrder: (orderId: string, caption: string, images: string[]) => Post;
  toggleLike: (postId: string) => void;
  updateProfile: (data: Partial<UserProfile>) => void;

  addFriend: (userId: string) => void;
  removeFriend: (userId: string) => void;
  sendFriendRequest: (userId: string) => void;
  cancelFriendRequest: (userId: string) => void;
  acceptFriendRequest: (userId: string) => void;
  rejectFriendRequest: (userId: string) => void;
  followUser: (userId: string) => void;
  unfollowUser: (userId: string) => void;
  blockUser: (userId: string) => void;
  unblockUser: (userId: string) => void;

  resetSocial: () => void;
};

function updateUser(
  users: SocialUser[],
  userId: string,
  updater: (user: SocialUser) => SocialUser,
) {
  return users.map((user) => (user.id === userId ? updater(user) : user));
}

export const useSocialStore = create<SocialStore>()(
  persist(
    (set, get) => ({
      posts: mockPosts.map(normalizePost),
      profile: defaultProfile,
      users: socialUsers,
      pastOrders: mockPastOrders,
      likedPostIds: [],

      getPostById: (postId) => get().posts.find((post) => post.id === postId),

      getPostsByAuthorId: (authorId) =>
        get().posts.filter((post) => post.authorId === authorId),

      getGlobalPosts: () => get().posts,

      getFollowingPosts: () => {
        const { posts, users } = get();
        const followingIds = new Set(
          users
            .filter((user) => user.relationships.isFollowing)
            .map((user) => user.id),
        );

        return posts.filter((post) => followingIds.has(post.authorId));
      },

      getUserByUsername: (username) =>
        get().users.find((user) => user.username === username),

      getPastOrderById: (orderId) =>
        get().pastOrders.find((order) => order.id === orderId),

      isPostLiked: (postId) => get().likedPostIds.includes(postId),

      addPostFromOrder: (orderId, caption, images) => {
        const order = get().getPastOrderById(orderId);
        const profile = get().profile;

        if (!order) {
          throw new Error('Order not found');
        }

        if (images.length === 0) {
          throw new Error('At least one image is required');
        }

        const newPost: Post = {
          id: `post-${Date.now()}`,
          authorId: profile.id,
          author: {
            id: profile.id,
            name: profile.name,
            username: profile.username,
            avatar: profile.avatar,
          },
          restaurantId: order.restaurantId,
          restaurant: {
            id: order.restaurantId,
            name: order.restaurantName,
            address: order.restaurantAddress,
            image: order.restaurantImage,
          },
          items: order.items,
          caption: caption.trim(),
          images,
          likeCount: 0,
          commentCount: 0,
          createdAt: new Date().toISOString(),
          isLiked: false,
        };

        set((state) => ({
          posts: [newPost, ...state.posts],
        }));

        return newPost;
      },

      toggleLike: (postId) =>
        set((state) => {
          const isLiked = state.likedPostIds.includes(postId);

          return {
            likedPostIds: isLiked
              ? state.likedPostIds.filter((id) => id !== postId)
              : [...state.likedPostIds, postId],
            posts: state.posts.map((post) =>
              post.id === postId
                ? {
                    ...post,
                    isLiked: !isLiked,
                    likeCount: isLiked
                      ? Math.max(0, post.likeCount - 1)
                      : post.likeCount + 1,
                  }
                : post,
            ),
          };
        }),

      updateProfile: (data) =>
        set((state) => ({
          profile: { ...state.profile, ...data },
          posts: state.posts.map((post) =>
            post.authorId === state.profile.id
              ? {
                  ...post,
                  author: {
                    ...post.author,
                    name: data.name ?? post.author.name,
                    username: data.username ?? post.author.username,
                    avatar:
                      data.avatar !== undefined
                        ? data.avatar
                        : post.author.avatar,
                  },
                }
              : post,
          ),
        })),

      addFriend: (userId) =>
        set((state) => ({
          users: updateUser(state.users, userId, (user) => ({
            ...user,
            relationships: {
              ...user.relationships,
              isFriend: true,
              hasSentRequest: false,
              hasReceivedRequest: false,
            },
          })),
        })),

      removeFriend: (userId) =>
        set((state) => ({
          users: updateUser(state.users, userId, (user) => ({
            ...user,
            relationships: {
              ...user.relationships,
              isFriend: false,
            },
          })),
        })),

      sendFriendRequest: (userId) =>
        set((state) => ({
          users: updateUser(state.users, userId, (user) => ({
            ...user,
            relationships: {
              ...user.relationships,
              hasSentRequest: true,
            },
          })),
        })),

      cancelFriendRequest: (userId) =>
        set((state) => ({
          users: updateUser(state.users, userId, (user) => ({
            ...user,
            relationships: {
              ...user.relationships,
              hasSentRequest: false,
            },
          })),
        })),

      acceptFriendRequest: (userId) =>
        set((state) => ({
          users: updateUser(state.users, userId, (user) => ({
            ...user,
            relationships: {
              ...user.relationships,
              isFriend: true,
              hasReceivedRequest: false,
            },
          })),
        })),

      rejectFriendRequest: (userId) =>
        set((state) => ({
          users: updateUser(state.users, userId, (user) => ({
            ...user,
            relationships: {
              ...user.relationships,
              hasReceivedRequest: false,
            },
          })),
        })),

      followUser: (userId) =>
        set((state) => ({
          users: updateUser(state.users, userId, (user) => ({
            ...user,
            relationships: {
              ...user.relationships,
              isFollowing: true,
            },
          })),
        })),

      unfollowUser: (userId) =>
        set((state) => ({
          users: updateUser(state.users, userId, (user) => ({
            ...user,
            relationships: {
              ...user.relationships,
              isFollowing: false,
            },
          })),
        })),

      blockUser: (userId) =>
        set((state) => ({
          users: updateUser(state.users, userId, (user) => ({
            ...user,
            relationships: {
              isFriend: false,
              hasSentRequest: false,
              hasReceivedRequest: false,
              isFollowing: false,
              isBlocked: true,
            },
          })),
        })),

      unblockUser: (userId) =>
        set((state) => ({
          users: updateUser(state.users, userId, (user) => ({
            ...user,
            relationships: {
              ...user.relationships,
              isBlocked: false,
            },
          })),
        })),

      resetSocial: () =>
        set({
          posts: mockPosts.map(normalizePost),
          profile: defaultProfile,
          users: socialUsers,
          pastOrders: mockPastOrders,
          likedPostIds: [],
        }),
    }),
    {
      name: 'bite-club-social',
      merge: (persistedState, currentState) => {
        const merged = {
          ...currentState,
          ...(persistedState as Partial<typeof currentState>),
        };

        return {
          ...merged,
          posts: (merged.posts ?? []).map((post) =>
            normalizePost(post as Post & { image?: string }),
          ),
        };
      },
    },
  ),
);
