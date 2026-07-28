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
      <TabsList className="flex items-center gap-1.5 w-full overflow-x-auto scrollbar-none p-1.5 bg-muted/45 border border-border/40 rounded-2xl h-auto flex-nowrap justify-start max-w-2xl">
        {tabKeys.map((tab) => (
          <TabsTrigger 
            key={tab.value} 
            value={tab.value} 
            className="rounded-xl py-2 px-3.5 text-xs sm:text-sm font-bold transition-all duration-300 shrink-0 cursor-pointer"
            asChild
          >
            <Link href={`/friends/${tab.value}`}>{t(tab.labelKey)}</Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
