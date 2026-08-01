'use client';
import { useTranslations } from 'next-intl';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link, usePathname } from '@/i18n/navigation';

const tabKeys = [
  { value: 'friends', href: '/friends', labelKey: 'friends' },
  { value: 'received', href: '/friends/received', labelKey: 'receivedRequests' },
  { value: 'sent', href: '/friends/sent', labelKey: 'sentRequests' },
  { value: 'discover', href: '/friends/discover', labelKey: 'discover' },
];

export default function FriendsTabsNavigation() {
  const t = useTranslations('friends');
  const pathname = usePathname();

  const activeTab = pathname === '/friends'
    ? 'friends'
    : (tabKeys.find((tab) => pathname.endsWith(`/${tab.value}`))?.value ?? 'friends');

  return (
    <Tabs value={activeTab}>
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 max-w-2xl">
        {tabKeys.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} asChild>
            <Link href={tab.href}>{t(tab.labelKey)}</Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

