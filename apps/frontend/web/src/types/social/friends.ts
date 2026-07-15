export interface SocialUser {
  id: string;

  username: string;

  name: string;

  avatar: string | null;

  relationships: {
    isFriend: boolean;

    hasSentRequest: boolean;

    hasReceivedRequest: boolean;

    isFollowing: boolean;

    isBlocked: boolean;
  };
}

export const FRIENDS_TABS = [
  'friends',
  'received',
  'sent',
  'following',
  'blocked',
  'discover',
] as const;

export type FriendsTabType = (typeof FRIENDS_TABS)[number];
export interface FriendResponseType {
  id: number;
  username: string;
  full_name: string;
  profile_image: string;
}

