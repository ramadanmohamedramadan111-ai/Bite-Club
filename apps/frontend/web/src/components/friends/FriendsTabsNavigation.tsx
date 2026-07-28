'use client';
import { useTranslations } from 'next-intl';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link, usePathname } from '@/i18n/navigation';
import { FriendsTabType } from '@/types/friends';

const tabKeys: { value: FriendsTabType; labelKey: string }[] = [
  { value: 'friends', labelKey: 'friends' },
  { value: 'received', labelKey: 'receivedRequests' },
  { value: 'sent', labelKey: 'sentRequests' },
  { value: 'discover', labelKey: 'discover' },
];

export default function FriendsTabsNavigation() {
  const t = useTranslations('friends');
  const pathname = usePathname();

  const activeTab =
    tabKeys.find((tab) => pathname.endsWith(`/${tab.value}`))?.value ??
    'friends';

  return (
    <Tabs value={activeTab}>
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 max-w-2xl">
        {tabKeys.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} asChild>
            <Link href={`/friends/${tab.value}`}>{t(tab.labelKey)}</Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

