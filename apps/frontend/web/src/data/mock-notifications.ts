import type { Notification } from '@/types/notifications/notification';

export const initialNotifications: Notification[] = [
  {
    id: 'notif-001',
    title: 'Order delivered',
    description:
      'Your order from Tokyo Kitchen has been delivered. Enjoy your meal!',
    read: false,
    createdAt: '2026-07-11T14:30:00Z',
  },
  {
    id: 'notif-002',
    title: 'Friend request accepted',
    description: 'Alex Rivera accepted your friend request.',
    read: false,
    createdAt: '2026-07-11T12:15:00Z',
  },
  {
    id: 'notif-003',
    title: 'Points earned',
    description: 'You earned 120 points from your last order.',
    read: false,
    createdAt: '2026-07-11T10:00:00Z',
  },
  {
    id: 'notif-004',
    title: 'Group order invite',
    description: 'Mike Chen invited you to a group order at Burger Town.',
    read: false,
    createdAt: '2026-07-10T20:45:00Z',
  },
  {
    id: 'notif-005',
    title: 'Gift received',
    description: 'Sarah Jenkins sent you a Free Delivery offer.',
    read: true,
    createdAt: '2026-07-10T16:20:00Z',
  },
  {
    id: 'notif-006',
    title: 'Order in progress',
    description: 'Your order from Big Burger is being prepared.',
    read: true,
    createdAt: '2026-07-10T13:00:00Z',
  },
  {
    id: 'notif-007',
    title: 'New post from a friend',
    description: 'Emma Rodriguez shared a new meal on the feed.',
    read: true,
    createdAt: '2026-07-09T18:30:00Z',
  },
  {
    id: 'notif-008',
    title: 'Redeem expiring soon',
    description: 'Your 20% Off Next Order redeem expires in 2 days.',
    read: false,
    createdAt: '2026-07-09T09:00:00Z',
  },
];
