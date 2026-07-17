'use client';

import { useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { GroupTab } from '@/types/groups/groups';

const tabs: { value: GroupTab; label: string }[] = [
  { value: 'members', label: 'Members' },
  { value: 'history', label: 'History' },
  { value: 'settings', label: 'Settings' },
];

type Props = {
  groupId: number;
};

export default function GroupTabs({ groupId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = (searchParams.get('tab') ?? 'members') as GroupTab;

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

