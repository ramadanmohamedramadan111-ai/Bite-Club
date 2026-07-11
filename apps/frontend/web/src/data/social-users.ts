import { SocialUser } from '@/types/social/friends';

export const socialUsers: SocialUser[] = [
  {
    id: '1',

    username: 'johnsmith',

    name: 'John Smith',

    avatar: null,

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

    username: 'sarahahmed',

    name: 'Sarah Ahmed',

    avatar: null,

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

    username: 'mikebrown',

    name: 'Mike Brown',

    avatar: null,

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

    username: 'alex',

    name: 'Alex Johnson',

    avatar: null,

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

    username: 'blockeduser',

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

