import { serverFetch } from '@/utils/server-fetch';
import { ApiResponse } from '@/types/api/api-response';
import { GroupType } from '@/types/groups/groups';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import GroupMembersTab from '@/components/groups/GroupMembersTab';

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    search?: string;
    page?: string;
    per_page?: string;
  }>;
};

export default async function GroupMembersPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { search = '', page = '1', per_page = '1' } = await searchParams;

  const data = await serverFetch<ApiResponse<GroupType>>(`/groups/${id}`, 'GET', {
    next: { tags: ['groups', `groups-${id}`] },
  });
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
