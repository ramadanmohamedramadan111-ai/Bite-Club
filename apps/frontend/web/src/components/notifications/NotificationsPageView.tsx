'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useNotificationsStore } from '@/stores/notifications';
import NotificationCard from './NotificationCard';
import NotificationsPagination from './NotificationsPagination';

const NOTIFICATIONS_PER_PAGE = 4;

export default function NotificationsPageView() {
  const searchParams = useSearchParams();
  const currentPage = Math.max(1, Number(searchParams.get('page') ?? '1'));

  const notifications = useNotificationsStore((state) => state.notifications);
  const markAsRead = useNotificationsStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationsStore((state) => state.markAllAsRead);

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
    <div className="container mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="mt-2 text-muted-foreground">
            Stay updated on orders, friends, and rewards.
          </p>
        </div>

        {hasUnread && (
          <Button variant="outline" onClick={markAllAsRead}>
            Mark all as read
          </Button>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        {sortedNotifications.length} notification
        {sortedNotifications.length === 1 ? '' : 's'}
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
            <p className="text-muted-foreground">No notifications yet</p>
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
