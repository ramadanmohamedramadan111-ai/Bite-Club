import type { GroupType } from '@/types/groups/groups';

export const mockGroups: GroupType[] = [
  {
    id: '1',
    name: 'Office Lunch Crew',
    description: 'Daily lunch orders from the team',
    image_url: null,
    invite_token: 'office-lunch-abc123',
    allow_join_by_link: true,
    status: 'active',
    owner: {
      full_name: 'Amr Shoukry',
      profile_image: null,
      username: 'amr',
      id: '1',
    },
    members: [
      {
        id: '1',
        full_name: 'John Smith',
        username: 'johnsmith',
        profile_image: null,
        role: 'owner',
        joined_at: '1',
        left_at: '1',
        status: 'active',
      },
      {
        id: '2',
        full_name: 'John Smith',
        username: 'johnsmith',
        profile_image: null,
        role: 'owner',
        joined_at: '1',
        left_at: '1',
        status: 'active',
      },
    ],
    createdAt: '2025-12-01T10:00:00.000Z',
  },
];

