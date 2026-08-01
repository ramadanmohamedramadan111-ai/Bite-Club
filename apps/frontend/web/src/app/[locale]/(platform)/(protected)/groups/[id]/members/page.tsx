import type { Metadata } from 'next';
import { serverFetch } from '@/utils/server-fetch';
import { ApiResponse } from '@/types/api';
import { GroupType } from '@/types/groups';
import { notFound } from 'next/navigation';
import GroupMembersTab from '@/components/groups/GroupMembersTab';
import { parseSearchParams, SearchPaginatedParams } from '@/utils/validate-search-params';
import InvalidSearchParams from '@/components/errors/InvalidSearchParams';

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    search?: string;
    page?: string;
    per_page?: string;
  }>;
};

export default async function GroupMembersPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const raw = await searchParams;
  const parsed = parseSearchParams(SearchPaginatedParams, raw);
  if (!parsed.success) return <InvalidSearchParams />;
  const { search = '', page = '1', per_page = '1' } = parsed.data;

  const data = await serverFetch<ApiResponse<GroupType>>(
    `/groups/${id}`,
    'GET',
    {
      next: { tags: ['groups', `groups-${id}`] },
    },
  );
  const group = data.data;

  if (!group) notFound();

  return (
    <GroupMembersTab
      group={group}
      search={search}
      page={page}
      per_page={per_page}
    />
  );
}



export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await serverFetch<ApiResponse<GroupType>>(`/groups/${id}`);
    const group = res?.data;
    if (group) {
      return {
        title: `${group.name} Members | Bite Club`,
        description: `View members of the food group ${group.name} on Bite Club.`,
      };
    }
  } catch (e) {
    // Fail silently
  }
  return {
    title: "Group Members | Bite Club",
  };
}
