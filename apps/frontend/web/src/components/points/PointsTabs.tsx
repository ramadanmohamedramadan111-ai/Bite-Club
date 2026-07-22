'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { PointsTab } from '@/types/points/points';

const tabKeys: { value: PointsTab; labelKey: string }[] = [
  { value: 'rewards', labelKey: 'rewardsGifts' },
  { value: 'active-redeems', labelKey: 'activeRedeems' },
  { value: 'redeem-history', labelKey: 'redeemHistory' },
  { value: 'my-gifts', labelKey: 'myGifts' },
  { value: 'gift-history', labelKey: 'giftHistory' },
  { value: 'referrals', labelKey: 'referrals' },
];

type Props = {
  defaultTab?: PointsTab;
};

export default function PointsTabs({ defaultTab = 'rewards' }: Props) {
  const t = useTranslations('points');
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
        {tabKeys.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            onClick={() => changeTab(tab.value)}
            className="text-xs sm:text-sm"
          >
            {t(tab.labelKey)}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
