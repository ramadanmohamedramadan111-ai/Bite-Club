'use client';

import { useSearchParams } from 'next/navigation';

import { FriendsTab } from '@/types/social/friends';

import FriendsTabs from './FriendsTabs';

import SearchUsers from './SearchUsers';

import UserList from './UserList';
import { useSocialStore } from '@/stores/social';

export default function FriendsPage() {
  const searchParams = useSearchParams();
  const users = useSocialStore((state) => state.users);

  const tab = (searchParams.get('tab') ?? 'friends') as FriendsTab;

  const search = searchParams.get('search') ?? '';

  const filteredUsers = users.filter((user) => {
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
        return !user.relationships.isBlocked;

      default:
        return false;
    }
  });

  return (
    <div className="container mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Friends</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your friends, follow users, and discover new connections.
        </p>
      </div>

      <FriendsTabs />

      <SearchUsers />

      <UserList users={filteredUsers} tab={tab} />
    </div>
  );
}
