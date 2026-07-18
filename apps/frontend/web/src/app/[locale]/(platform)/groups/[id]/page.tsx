import InvalidSearchParams from '@/components/errors/InvalidSearchParams';
import { GroupDetailContent } from '@/components/groups/GroupDetailContent';
import GroupHeader from '@/components/groups/GroupHeader';
import { groupUrlSchema } from '@/schemas/groups/group-url-schema';
import { ApiResponse } from '@/types/api/api-response';
import { GroupTab, GroupType } from '@/types/groups/groups';
import { serverFetch } from '@/utils/server-fetch';
import { Suspense } from 'react';

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    tab?: GroupTab;
  }>;
};

export default async function Page({ params, searchParams }: PageProps) {
  const { id } = await params;
  const searchParamsValue = await searchParams;
  const {
    tab = 'members',
    search = '',
    per_page = '1',
    page = '1',
  } = searchParamsValue;

  const result = groupUrlSchema.safeParse(searchParamsValue);

  if (!result) {
    return <InvalidSearchParams />;
  }

  const data = await serverFetch<ApiResponse<GroupType>>(
    `/groups/${id}`,
    'GET',
    {
      next: {
        tags: ['groups', `groups-${id}`],
      },
    },
  );
  const group = data.data;

  if (!group) {
    return (
      <div className="container mx-auto py-16 text-center">
        <h1 className="text-2xl font-bold">Group not found</h1>
        <p className="mt-2 text-muted-foreground">
          This group does not exist or you do not have access.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6">
      <GroupHeader group={group} />
      <GroupDetailContent
        group={group}
        tab={tab}
        search={search}
        page={page}
        per_page={per_page}
      />
    </div>
  );
}

