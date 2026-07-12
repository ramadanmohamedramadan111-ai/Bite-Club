'use client';

import { useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { PointsTab } from '@/types/points/points';

const tabs: { value: PointsTab; label: string }[] = [
  { value: 'rewards', label: 'Rewards' },
  { value: 'active-redeems', label: 'Active redeems' },
  { value: 'redeem-history', label: 'Redeem history' },
  { value: 'my-gifts', label: 'My gifts' },
  { value: 'gift-history', label: 'Gift history' },
  { value: 'referrals', label: 'Referrals' },
];

type Props = {
  defaultTab?: PointsTab;
};

export default function PointsTabs({ defaultTab = 'rewards' }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = (searchParams.get('tab') ?? defaultTab) as PointsTab;

  function changeTab(tab: PointsTab) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    params.delete('page');
    router.replace(`/points?${params.toString()}`);
  }

  return (
    <Tabs value={activeTab}>
      <TabsList className="grid h-auto w-full grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-6">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            onClick={() => changeTab(tab.value)}
            className="text-xs sm:text-sm"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
