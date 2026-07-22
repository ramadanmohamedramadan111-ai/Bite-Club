'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

type Tab = 'menu' | 'reviews' | 'info';

type Props = {
  restaurantId: number;
};

function getActiveTab(pathname: string, restaurantId: number): Tab {
  if (pathname.endsWith(`/restaurants/${restaurantId}/reviews`)) {
    return 'reviews';
  }

  if (pathname.endsWith(`/restaurants/${restaurantId}/info`)) {
    return 'info';
  }

  return 'menu';
}

export default function RestaurantDetailTabs({ restaurantId }: Props) {
  const t = useTranslations('restaurants');
  const pathname = usePathname();
  const activeTab = getActiveTab(pathname, restaurantId);

  const tabs: { id: Tab; label: string; href: (id: number) => string }[] = [
    { id: 'menu', label: t('menu'), href: (id) => `/restaurants/${id}` },
    { id: 'reviews', label: t('reviews'), href: (id) => `/restaurants/${id}/reviews` },
    { id: 'info', label: t('info'), href: (id) => `/restaurants/${id}/info` },
  ];

  return (
    <nav className="flex gap-1 rounded-lg border bg-muted/40 p-1">
      {tabs.map((tab) => (
        <Link
          key={tab.id}
          href={tab.href(restaurantId)}
          className={cn(
            'flex-1 rounded-md px-4 py-2 text-center text-sm font-medium transition',
            activeTab === tab.id
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}>
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
