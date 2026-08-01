import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { serverFetch } from '@/utils/server-fetch';
import { ApiResponse } from '@/types/api';
import { GroupType } from '@/types/groups';
import GroupSettingsTab from '@/components/groups/GroupSettingsTab';
import { getUserId } from '@/utils/api-helpers';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function GroupSettingsPage({ params }: PageProps) {
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

  const userId = await getUserId();
  const isOwner = userId === group.owner.id;

  return <GroupSettingsTab group={group} isOwner={isOwner} />;
}



export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await serverFetch<ApiResponse<GroupType>>(`/groups/${id}`);
    const group = res?.data;
    if (group) {
      return {
        title: `${group.name} Settings | Bite Club`,
        description: `Manage settings for the food group ${group.name} on Bite Club.`,
      };
    }
  } catch (e) {
    // Fail silently
  }
  return {
    title: "Group Settings | Bite Club",
  };
}
