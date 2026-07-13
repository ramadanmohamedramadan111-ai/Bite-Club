import type { Group } from '@/types/group/group';

export const mockGroups: Group[] = [
  {
    id: 'group-1',
    name: 'Office Lunch Crew',
    description: 'Daily lunch orders from the team',
    image: null,
    inviteToken: 'office-lunch-abc123',
    invitationsOpen: true,
    members: [
      {
        id: 'member-1',
        userId: '1',
        name: 'John Smith',
        username: 'johnsmith',
        avatar: null,
        isOwner: true,
      },
      {
        id: 'member-2',
        userId: '2',
        name: 'Sarah Ahmed',
        username: 'sarahahmed',
        avatar: null,
        isOwner: false,
      },
      {
        id: 'member-3',
        userId: '3',
        name: 'Ahmed Hassan',
        username: 'ahmedhassan',
        avatar: null,
        isOwner: false,
      },
    ],
    createdAt: '2025-12-01T10:00:00.000Z',
  },
  {
    id: 'group-2',
    name: 'Weekend Foodies',
    description: 'Exploring new restaurants every weekend',
    image: null,
    inviteToken: 'weekend-foodies-xyz789',
    invitationsOpen: false,
    members: [
      {
        id: 'member-4',
        userId: '1',
        name: 'John Smith',
        username: 'johnsmith',
        avatar: null,
        isOwner: true,
      },
      {
        id: 'member-5',
        userId: '4',
        name: 'Emily Chen',
        username: 'emilychen',
        avatar: null,
        isOwner: false,
      },
    ],
    createdAt: '2026-01-15T14:30:00.000Z',
  },
];
