'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const tabs = [
  { value: 'active', label: 'Active Orders' },
  { value: 'past', label: 'Past Orders' },
] as const;

export default function OrdersTabs({
  currentTab,
}: {
  currentTab: 'active' | 'past';
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

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

