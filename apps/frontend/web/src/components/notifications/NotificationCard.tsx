'use client';

import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Notification } from '@/types/notifications';
import { Link } from '@/i18n/navigation';

type Props = {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  compact?: boolean;
  isMarking?: boolean;
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
  isMarking = false,
}: Props) {
  const t = useTranslations('notifications');
  const isRead = !!notification.read_at;

  return (
    <Card
      className={cn(
        !isRead && 'border-primary/30 bg-primary/5',
        compact && 'shadow-none',
      )}
    >
      <CardContent className={cn('space-y-2', compact ? 'p-3' : 'p-4')}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            {notification.data.action_url ? (
              <Link href={notification.data.action_url} className="hover:underline">
                <p className="font-semibold leading-snug">{notification.data.title}</p>
              </Link>
            ) : (
              <p className="font-semibold leading-snug">{notification.data.title}</p>
            )}
            <p className="text-sm text-muted-foreground">
              {notification.data.body}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatNotificationDate(notification.created_at)}
            </p>
          </div>
          {!isRead && (
            <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
          )}
        </div>

        {!isRead && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isMarking}
            onClick={() => onMarkAsRead(notification.id)}
          >
            {isMarking && <Loader2 className="animate-spin" />}
            {isMarking ? t('markingAsRead') : t('markAsRead')}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
