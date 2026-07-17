import { SocialUser } from '../social/friends';

export type GroupTab = 'members' | 'history' | 'settings';

export type GroupMember = SocialUser & {
  role: 'owner';
  status: 'active';
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
  status: 'active';
  owner: SocialUser;
  members: GroupMember[];
  createdAt: string;
};

export type GroupTypeSimplified = {
  id: string;
  name: string;
  description: string;
  image_url?: string | null;
  invite_token: string;
  allow_join_by_link: boolean;
  status: 'active';
  owner: SocialUser;
  members_count: number;
  createdAt: string;
};

export type GroupOrderSessionType = 'fixed' | 'anonymous';

export type ActiveGroupSession = {
  id: string;
  restaurantId: string;
  restaurantName: string;
  restaurantImage?: string;
  code: string;
  type: GroupOrderSessionType;
  groupId?: string;
  groupName?: string;
  ownerSessionId: string;
  ownerName: string;
  expiresAt?: string;
  createdAt: string;
};

