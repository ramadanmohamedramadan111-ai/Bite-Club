'use client';

import { useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { FavoritesTab } from '@/types/favorites/favorites';

const tabs: { value: FavoritesTab; label: string }[] = [
  { value: 'restaurants', label: 'Restaurants' },
  { value: 'items', label: 'Items' },
];

export default function FavoritesTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = (searchParams.get('tab') ?? 'restaurants') as FavoritesTab;

  function changeTab(tab: FavoritesTab) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.replace(`/favorites?${params.toString()}`);
  }

  return (
    <Tabs value={activeTab}>
      <TabsList className="grid w-full grid-cols-2">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            onClick={() => changeTab(tab.value)}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
