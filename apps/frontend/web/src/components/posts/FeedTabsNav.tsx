'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const tabs = ['posts', 'leaderboard'] as const;

export default function FeedTabsNav() {
  const t = useTranslations('feed');
  const pathname = usePathname();

  const activeTab = pathname.startsWith('/posts/leaderboard') ? 'leaderboard' : 'posts';

  return (
    <Tabs value={activeTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 max-w-md">
        <TabsTrigger value="posts" asChild>
          <Link href="/posts">{t('postsFeed')}</Link>
        </TabsTrigger>
        <TabsTrigger
          value="leaderboard"
          asChild
        >
          <Link href="/posts/leaderboard">{t('leaderboard')}</Link>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
