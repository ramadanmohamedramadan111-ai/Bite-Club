'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { GroupTab } from '@/types/groups/groups';

type Props = {
  groupId: number;
};

export default function GroupTabs({ groupId }: Props) {
  const t = useTranslations('groups');
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = (searchParams.get('tab') ?? 'members') as GroupTab;

  const tabs: { value: GroupTab; label: string }[] = [
    { value: 'members', label: t('members') },
    { value: 'history', label: t('history') },
    { value: 'settings', label: t('settings') },
  ];

  function changeTab(tab: GroupTab) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.replace(`/groups/${groupId}?${params.toString()}`);
  }

  return (
    <Tabs value={activeTab}>
      <TabsList className="grid w-full grid-cols-3">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            onClick={() => changeTab(tab.value)}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

