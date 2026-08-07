import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { serverFetch } from '@/utils/server-fetch';
import { ApiResponse } from '@/types/api';
import { GroupType } from '@/types/groups';
import GroupSettingsTab from '@/components/groups/GroupSettingsTab';
import { getUserId } from '@/utils/api-helpers';
import { getTranslations } from 'next-intl/server';

type PageProps = {
  params: Promise<{ locale: string; id: string }>;
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



export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  try {
    const res = await serverFetch<ApiResponse<GroupType>>(`/groups/${id}`);
    const group = res?.data;
    if (group) {
      return {
        title: t('groupSettings.title', { group: group.name }),
        description: t('groupSettings.description', { group: group.name }),
      };
    }
  } catch (e) {
    // Fail silently
  }
  return {
    title: t('groupSettings.fallbackTitle'),
  };
}
