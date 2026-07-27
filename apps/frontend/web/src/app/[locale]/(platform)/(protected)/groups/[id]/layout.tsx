import { notFound } from 'next/navigation';

import GroupHeader from '@/components/groups/GroupHeader';
import GroupTabs from '@/components/groups/GroupTabs';
import { ApiResponse } from '@/types/api';
import { GroupType } from '@/types/groups';
import { serverFetch } from '@/utils/server-fetch';

type Props = {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
};

export default async function GroupLayout({ params, children }: Props) {
  const { id } = await params;

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
    <div className="container mx-auto space-y-6">
      <GroupHeader group={group} />
      <GroupTabs groupId={group.id} />
      <div className="mt-6">{children}</div>
    </div>
  );
}

