import { ApiResponse, PaginatedResponse } from '@/types/api/api-response';
import { SearchPaginatedType } from '@/types/common';
import { GroupTypeSimplified } from '@/types/groups/groups';
import { buildQueryString, getUserId } from '@/utils/api-helpers';
import { serverFetch } from '@/utils/server-fetch';
import React from 'react';
import GroupCard from './GroupCard';
import AppPagination from '../shared/AppPagination';

export default async function YourGroupsFetching({
  search,
  page,
  per_page,
}: SearchPaginatedType) {
  const query = buildQueryString({ search, page, per_page });
  const userId = await getUserId();

  const data = await serverFetch<
    ApiResponse<PaginatedResponse<GroupTypeSimplified>>
  >(`/groups${query}`, 'GET', {
    next: {
      tags: ['groups', `groups-${userId}`],
    },
  });
  const { items: groups, meta } = data.data;

  return (
    <>
      {groups.length === 0 ? (
        <p className="text-muted-foreground">No groups.</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
          <AppPagination
            currentPage={meta.current_page}
            totalPages={meta.last_page}
          />
        </>
      )}
    </>
  );
}

