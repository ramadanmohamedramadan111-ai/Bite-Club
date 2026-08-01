'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function OrdersTabs() {
  const t = useTranslations('common');
  const pathname = usePathname();

  const tabs = [
    { value: 'active' as const, href: '/orders', label: t('activeOrders') },
    { value: 'past' as const, href: '/orders/past', label: t('pastOrders') },
  ];

  const activeTab = pathname === '/orders' ? 'active' : 'past';

  return (
    <Tabs value={activeTab} className="mb-6">
      <TabsList className="grid w-full grid-cols-2 max-w-md">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} asChild>
            <Link href={tab.href}>{tab.label}</Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
