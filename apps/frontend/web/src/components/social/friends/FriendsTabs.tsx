'use client';

import { useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { FriendsTab } from '@/types/social/friends';

const tabs: {
  value: FriendsTab;
  label: string;
}[] = [
  {
    value: 'friends',
    label: 'Friends',
  },

  {
    value: 'received',
    label: 'Received Requests',
  },

  {
    value: 'sent',
    label: 'Sent Requests',
  },

  {
    value: 'following',
    label: 'Following',
  },

  {
    value: 'blocked',
    label: 'Blocked',
  },

  {
    value: 'discover',
    label: 'Discover Users',
  },
];

export default function SocialTabs() {
  const router = useRouter();

  const searchParams = useSearchParams();
  const activeTab = (searchParams.get('tab') ?? 'friends') as FriendsTab;

  function changeTab(tab: FriendsTab) {
    const params = new URLSearchParams(searchParams.toString());

    params.set('tab', tab);

    router.replace(`/friends?${params.toString()}`);
  }

  return (
    <Tabs value={activeTab}>
      <TabsList
        className="
          grid
          grid-cols-3
          lg:grid-cols-6
        ">
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

