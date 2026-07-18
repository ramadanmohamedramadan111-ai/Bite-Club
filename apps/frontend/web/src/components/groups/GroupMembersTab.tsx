import { GroupMember, GroupType } from '@/types/groups/groups';
import AddMemberDialog from './AddMemberDialog';
import { SearchPaginatedType } from '@/types/common';
import { buildQueryString, getUserId } from '@/utils/api-helpers';
import { serverFetch } from '@/utils/server-fetch';
import { ApiResponse, PaginatedResponse } from '@/types/api/api-response';
import AppPagination from '../shared/AppPagination';
import GroupMemberCard from './GroupMemberCard';
import AppSearch from '../shared/AppSearch';

type Props = SearchPaginatedType & {
  group: GroupType;
};

export default async function GroupMembersTab({
  group,
  search,
  page,
  per_page,
}: Props) {
  const query = buildQueryString({ search, page, per_page });
  const userId = await getUserId();

  const data = await serverFetch<ApiResponse<PaginatedResponse<GroupMember>>>(
    `/groups/${group.id}/members${query}`,
    'GET',
    {
      next: {
        tags: ['groups-members', `groups-members-${userId}`],
      },
    },
  );
  const { items: members, meta } = data.data;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {members.length} of {meta.total} member
          {meta.total !== 1 ? 's' : ''}
        </p>
        <div className="flex gap-4 items-center">
          <AppSearch route={`/groups/${group.id}`} />
          <AddMemberDialog group={group} />
        </div>
      </div>

      <div className="space-y-2">
        {members.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            No members found.
          </p>
        ) : (
          members.map((member) => {
            if (member.id === userId)
              return (
                <GroupMemberCard
                  type="me"
                  group={group}
                  member={member}
                  key={member.id}
                />
              );
            return (
              <GroupMemberCard
                type="others"
                group={group}
                member={member}
                key={member.id}
              />
            );
          })
        )}
      </div>

      <AppPagination
        currentPage={meta.current_page}
        totalPages={meta.last_page}
      />
    </div>
  );
}

