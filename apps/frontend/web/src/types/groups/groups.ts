import { SocialUser } from '../social/friends';

export const GROUP_TABS = ['members', 'history', 'settings'] as const;
export const GROUP_ROLES = ['owner', 'admin', 'member'] as const;
export const GROUP_STATUS = ['active', 'archived'] as const;

export type GroupTab = (typeof GROUP_TABS)[number];
export type GroupRole = (typeof GROUP_ROLES)[number];
export type GroupStatus = (typeof GROUP_STATUS)[number];

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
  status: GroupStatus;
  owner: SocialUser;
  members_count: number;
  createdAt: string;
};

export type GroupOrderSessionType = 'fixed' | 'anonymous';

