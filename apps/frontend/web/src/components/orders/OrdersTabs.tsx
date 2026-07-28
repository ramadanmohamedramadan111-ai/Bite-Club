'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function OrdersTabs() {
  const t = useTranslations('common');
  const pathname = usePathname();

  const tabs = [
    { value: 'active' as const, label: t('activeOrders') },
    { value: 'past' as const, label: t('pastOrders') },
  ];

  const activeTab = tabs.find((tab) => pathname.endsWith(`/${tab.value}`))?.value ?? 'active';

  return (
    <Tabs value={activeTab} className="mb-6">
      <TabsList className="grid w-full grid-cols-2 max-w-md">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} asChild>
            <Link href={`/orders/${tab.value}`}>{tab.label}</Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
