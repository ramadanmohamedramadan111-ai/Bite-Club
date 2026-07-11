import { SocialUser } from '@/types/social/friends';

export const socialUsers: SocialUser[] = [
  {
    id: '1',

    username: 'alex_rivera',

    name: 'Alex Rivera',

    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',

    relationships: {
      isFriend: true,

      hasSentRequest: false,

      hasReceivedRequest: false,

      isFollowing: true,

      isBlocked: false,
    },
  },

  {
    id: '2',

    username: 'sarah_eats_of',

    name: 'Sarah Jenkins',

    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',

    relationships: {
      isFriend: false,

      hasSentRequest: false,

      hasReceivedRequest: true,

      isFollowing: false,

      isBlocked: false,
    },
  },

  {
    id: '3',

    username: 'mikechen_eats',

    name: 'Mike Chen',

    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',

    relationships: {
      isFriend: false,

      hasSentRequest: true,

      hasReceivedRequest: false,

      isFollowing: false,

      isBlocked: false,
    },
  },

  {
    id: '4',

    username: 'emma_eats',

    name: 'Emma Rodriguez',

    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',

    relationships: {
      isFriend: false,

      hasSentRequest: false,

      hasReceivedRequest: false,

      isFollowing: true,

      isBlocked: false,
    },
  },

  {
    id: '5',

    username: 'james_foodie',

    name: 'James Wilson',

    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',

    relationships: {
      isFriend: true,

      hasSentRequest: false,

      hasReceivedRequest: false,

      isFollowing: true,

      isBlocked: false,
    },
  },

  {
    id: '6',

    username: 'blocked_user',

    name: 'Blocked User',

    avatar: null,

    relationships: {
      isFriend: false,

      hasSentRequest: false,

      hasReceivedRequest: false,

      isFollowing: false,

      isBlocked: true,
    },
  },
];

