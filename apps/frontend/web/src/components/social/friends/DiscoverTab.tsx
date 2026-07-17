import { ApiResponse, PaginatedResponse } from '@/types/api/api-response';
import { FriendResponseType } from '@/types/social/friends';
import { buildQueryString, getUserId } from '@/utils/api-helpers';
import { serverFetch } from '@/utils/server-fetch';
import React from 'react';
import UserCard from './UserCard';
import UsersFallback from './UsersFallback';
import AppPagination from '@/components/shared/AppPagination';
import { SearchPaginatedType } from '@/types/common';

export default async function DiscoverTab({
  search,
  page,
  per_page,
}: SearchPaginatedType) {
  const query = buildQueryString({ search, page, per_page });
  const userId = await getUserId();

  const data = await serverFetch<
    ApiResponse<PaginatedResponse<FriendResponseType>>
  >(`/users/search${query}`, 'GET', {
    next: {
      tags: ['friends-discover', `friends-discover-${userId}`],
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
          <UserCard key={user.id} user={user} tab={'discover'} />
        ))}
      </div>
      <AppPagination
        currentPage={meta.current_page}
        totalPages={meta.last_page}
      />
    </>
  );
}

