import { ApiResponse, PaginatedResponse } from '@/types/api/api-response';
import { FriendResponseType, FriendsTabProps } from '@/types/social/friends';
import { buildQueryString, getUserId } from '@/utils/api-helpers';
import { serverFetch } from '@/utils/server-fetch';
import React from 'react';
import UserCard from './UserCard';
import UsersFallback from './UsersFallback';
import AppPagination from '@/components/shared/AppPagination';

export default async function SentTab({
  search,
  page,
  perPage,
}: FriendsTabProps) {
  const query = buildQueryString({ search });
  const userId = getUserId();

  const data = await serverFetch<
    ApiResponse<PaginatedResponse<FriendResponseType>>
  >(`/friends/requests/sent${query}`, 'GET', {
    next: {
      tags: ['friends-sent', `friends-sent-${userId}`],
    },
  });
  const { items: users, meta } = data.data;

  if (!users.length) {
    return <UsersFallback />;
  }

  return (
    <>
      <div className="space-y-3">
        {users.map((user) => (
          <UserCard key={user.id} user={user} tab={'sent'} />
        ))}
      </div>
      <AppPagination
        currentPage={meta.current_page}
        totalPages={meta.last_page}
      />
    </>
  );
}

