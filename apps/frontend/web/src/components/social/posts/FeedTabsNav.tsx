'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const tabs = ['posts', 'leaderboard'] as const;

export default function FeedTabsNav() {
  const t = useTranslations('feed');
  const pathname = usePathname();

  const activeTab = tabs.find((tab) => pathname.endsWith(`/${tab}`)) ?? 'posts';

  return (
    <Tabs value={activeTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 bg-muted/60 rounded-xl">
        <TabsTrigger value="posts" className="rounded-lg transition-all" asChild>
          <Link href="/feed/posts">{t('postsFeed')}</Link>
        </TabsTrigger>
        <TabsTrigger
          value="leaderboard"
          className="rounded-lg transition-all flex items-center justify-center gap-2"
          asChild
        >
          <Link href="/feed/leaderboard">{t('leaderboard')}</Link>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
