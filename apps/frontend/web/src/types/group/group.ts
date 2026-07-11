export type GroupTab = 'members' | 'history' | 'settings';

export type GroupMember = {
  id: string;
  userId: string;
  name: string;
  username: string;
  avatar?: string | null;
  isOwner: boolean;
};

export type Group = {
  id: string;
  name: string;
  description: string;
  image?: string | null;
  inviteToken: string;
  invitationsOpen: boolean;
  members: GroupMember[];
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
