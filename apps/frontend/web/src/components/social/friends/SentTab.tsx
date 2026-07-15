import { ApiResponse } from '@/types/api/api-response';
import { FriendResponseType } from '@/types/social/friends';
import { buildQueryString, getUserId } from '@/utils/api-helpers';
import { serverFetch } from '@/utils/server-fetch';
import React from 'react';
import UserCard from './UserCard';
import UsersFallback from './UsersFallback';

export default async function SentTab({ search }: { search: string }) {
  const query = buildQueryString({ search });
  const userId = getUserId();

  const data = await serverFetch<ApiResponse<FriendResponseType[]>>(
    `/friends/requests/sent${query}`,
    'GET',
    {
      next: {
        tags: ['friends-sent', `friends-sent-${userId}`],
      },
    },
  );
  const users = data.data;

  if (!users.length) {
    return <UsersFallback />;
  }

  return (
    <div className="space-y-3">
      {users.map((user) => (
        <UserCard key={user.id} user={user} tab={'sent'} />
      ))}
    </div>
  );
}

