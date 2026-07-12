'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Notification } from '@/types/notifications/notification';

type Props = {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  compact?: boolean;
};

function formatNotificationDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(date));
}

export default function NotificationCard({
  notification,
  onMarkAsRead,
  compact = false,
}: Props) {
  return (
    <Card
      className={cn(
        !notification.read && 'border-primary/30 bg-primary/5',
        compact && 'shadow-none',
      )}
    >
      <CardContent className={cn('space-y-2', compact ? 'p-3' : 'p-4')}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className="font-semibold leading-snug">{notification.title}</p>
            <p className="text-sm text-muted-foreground">
              {notification.description}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatNotificationDate(notification.createdAt)}
            </p>
          </div>
          {!notification.read && (
            <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
          )}
        </div>

        {!notification.read && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onMarkAsRead(notification.id)}
          >
            Mark as read
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
