'use client';

import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function OrdersTabs({
  currentTab,
}: {
  currentTab: 'active' | 'past';
}) {
  const t = useTranslations('common');
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabs = [
    { value: 'active' as const, label: t('activeOrders') },
    { value: 'past' as const, label: t('pastOrders') },
  ];

  const onTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', value);
    params.delete('page');
    router.push(`/orders?${params.toString()}`);
  };

  return (
    <Tabs value={currentTab} onValueChange={onTabChange} className="mb-6">
      <TabsList className=" w-full">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

