'use client';

import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { GroupTab } from '@/types/groups';

type Props = {
  groupId: number;
};

export default function GroupTabs({ groupId }: Props) {
  const t = useTranslations('groups');
  const router = useRouter();
  const pathname = usePathname();

  const activeTab = pathname.split('/').pop() as GroupTab;

  const tabs: { value: GroupTab; label: string }[] = [
    { value: 'members', label: t('members') },
    { value: 'history', label: t('history') },
    { value: 'settings', label: t('settings') },
  ];

  return (
    <Tabs value={activeTab}>
      <TabsList className="grid w-full grid-cols-3">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            onClick={() => router.push(`/groups/${groupId}/${tab.value}`)}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

