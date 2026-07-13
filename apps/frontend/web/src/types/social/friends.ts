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

export type FriendsTab =
  | 'friends'
  | 'received'
  | 'sent'
  | 'following'
  | 'blocked'
  | 'discover';

