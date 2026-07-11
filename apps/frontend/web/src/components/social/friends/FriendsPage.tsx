'use client';

import { useSearchParams } from 'next/navigation';

import { socialUsers } from '@/data/social-users';

import { FriendsTab } from '@/types/social/friends';

import FriendsTabs from './FriendsTabs';

import SearchUsers from './SearchUsers';

import UserList from './UserList';

export default function FriendsPage() {
  const searchParams = useSearchParams();

  const tab = (searchParams.get('tab') ?? 'friends') as FriendsTab;

  const search = searchParams.get('search') ?? '';

  const users = socialUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.username.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) {
      return false;
    }

    switch (tab) {
      case 'friends':
        return user.relationships.isFriend;

      case 'received':
        return user.relationships.hasReceivedRequest;

      case 'sent':
        return user.relationships.hasSentRequest;

      case 'following':
        return user.relationships.isFollowing;

      case 'blocked':
        return user.relationships.isBlocked;

      case 'discover':
        return true;

      default:
        return false;
    }
  });

  return (
    <div className="space-y-6 container mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Friends</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your friends, follow users, and discover new connections.
        </p>
      </div>

      <FriendsTabs />

      <SearchUsers />

      <UserList users={users} tab={tab} />
    </div>
  );
}

