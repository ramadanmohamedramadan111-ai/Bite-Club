import { ApiResponse, PaginatedResponse } from '@/types/api/api-response';
import { FriendResponseType, FriendsTabProps } from '@/types/social/friends';
import { buildQueryString, getUserId } from '@/utils/api-helpers';
import { serverFetch } from '@/utils/server-fetch';
import React from 'react';
import UserCard from './UserCard';
import UsersFallback from './UsersFallback';
import { Pagination } from '@/components/ui/pagination';
import AppPagination from '@/components/shared/AppPagination';

export default async function DiscoverTab({
  search,
  page,
  perPage,
}: FriendsTabProps) {
  const query = buildQueryString({ search, page, per_page: perPage });
  const userId = getUserId();

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

