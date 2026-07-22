'use client';

import { useMemo } from 'react';
import { BellIcon } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  useNotificationsStore,
  useUnreadNotificationCount,
} from '@/lib/const-data';
import NotificationCard from '@/components/notifications/NotificationCard';

export default function NotificationPopover() {
  const unreadCount = useUnreadNotificationCount();
  const notifications = useNotificationsStore((state) => state.notifications);
  const markAsRead = useNotificationsStore((state) => state.markAsRead);

  const recentNotifications = useMemo(
    () =>
      [...notifications]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 3),
    [notifications],
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        >
          <BellIcon className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0">
        <PopoverHeader className="border-b px-4 py-3">
          <PopoverTitle>Notifications</PopoverTitle>
        </PopoverHeader>

        <div className="max-h-96 space-y-2 overflow-y-auto p-2">
          {recentNotifications.length > 0 ? (
            recentNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
                compact
              />
            ))
          ) : (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">
              No notifications yet
            </p>
          )}
        </div>

        <div className="border-t p-2">
          <Button asChild variant="ghost" className="w-full" size="sm">
            <Link href="/notifications">Show all</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
