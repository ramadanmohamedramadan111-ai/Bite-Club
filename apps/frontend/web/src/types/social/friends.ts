export interface SocialUser {
  id: string;

  username: string;

  full_name: string;

  profile_image: string | null;
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

export interface SentFriendResponse {
  id: number;
  recipient_id: number;
  username: string;
  full_name: string;
  profile_image?: string;
}

export interface sendFriendRequestResponse {
  id: number;
  requester_id: number;
  addressee_id: number;
  status: string;
}

export interface cancelFriendRequestResponse {
  id: number;
  status: string;
}

