'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import NotificationCard from './NotificationCard';
import NotificationsPagination from './NotificationsPagination';
import type { Notification } from '@/types/notification';

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'Order Ready',
    description: 'Your order from Pizza Place is ready for pickup!',
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'New Restaurant',
    description: 'A new restaurant just opened near you.',
    read: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '3',
    title: 'Welcome!',
    description: 'Welcome to Bite Club! Enjoy your first meal.',
    read: true,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

const NOTIFICATIONS_PER_PAGE = 4;

export default function NotificationsPageView() {
  const t = useTranslations('notifications');
  const tc = useTranslations('common');
  const searchParams = useSearchParams();
  const currentPage = Math.max(1, Number(searchParams.get('page') ?? '1'));

  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const sortedNotifications = useMemo(
    () =>
      [...notifications].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [notifications],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(sortedNotifications.length / NOTIFICATIONS_PER_PAGE),
  );
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * NOTIFICATIONS_PER_PAGE;
  const paginatedNotifications = sortedNotifications.slice(
    startIndex,
    startIndex + NOTIFICATIONS_PER_PAGE,
  );

  const hasUnread = notifications.some((notification) => !notification.read);

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{t('title')}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        {hasUnread && (
          <Button 
            variant="outline" 
            className="rounded-xl font-bold text-xs h-9 cursor-pointer border-border bg-background/50 hover:bg-accent/40 shadow-3xs"
            onClick={markAllAsRead}
          >
            {t('markAllAsRead')}
          </Button>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        {sortedNotifications.length} {sortedNotifications.length === 1 ? tc('notification') : tc('notifications')}
      </p>

      <div className="space-y-3">
        {paginatedNotifications.length > 0 ? (
          paginatedNotifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkAsRead={markAsRead}
            />
          ))
        ) : (
          <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
            <p className="text-muted-foreground">{t('noNotifications')}</p>
          </div>
        )}
      </div>

      <NotificationsPagination
        currentPage={safePage}
        totalPages={totalPages}
      />
    </div>
  );
}
