import FriendsTabsNavigation from '@/components/friends/FriendsTabsNavigation';
import SearchUsers from '@/components/friends/SearchUsers';
import { getTranslations } from 'next-intl/server';

export default async function FriendsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations('friends');

  return (
    <div className="container mx-auto space-y-8">
      {/* Page Title & Subtitle */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          {t('title')}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{t('subtitle')}</p>
      </div>

      {/* Top Header Row for Navigation and Search */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between border-b border-border/30 pb-6">
        <div className="flex-1">
          <FriendsTabsNavigation />
        </div>
        <div className="w-full md:w-80 shrink-0">
          <SearchUsers />
        </div>
      </div>

      {/* Inner page content */}
      <div className="min-w-0">{children}</div>
    </div>
  );
}

