'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Notification } from '@/types/notification';
import { Bell } from 'lucide-react';

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
  const t = useTranslations('notifications');
  return (
    <Card
      className={cn(
        "rounded-2xl border transition-all duration-300 shadow-3xs overflow-hidden",
        !notification.read ? 'border-primary/25 bg-primary/5' : 'border-border/60 bg-card/50',
        compact && 'shadow-none',
      )}
    >
      <CardContent className={cn('flex items-start gap-4', compact ? 'p-3' : 'p-4 sm:p-5')}>
        
        {/* Left: Notification Icon Badge */}
        <div className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl border transition-colors",
          !notification.read 
            ? "border-primary/20 bg-primary/10 text-primary" 
            : "border-border/60 bg-muted/40 text-muted-foreground"
        )}>
          <Bell className="size-4.5" />
        </div>

        {/* Center: Details */}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center justify-between gap-3">
            <p className="font-bold text-sm text-foreground leading-snug">{notification.title}</p>
            {!notification.read && (
              <span className="size-2 shrink-0 rounded-full bg-primary" />
            )}
          </div>
          <p className="text-sm text-muted-foreground leading-normal">
            {notification.description}
          </p>
          <div className="flex items-center gap-3 pt-1">
            <span className="text-3xs text-muted-foreground font-medium uppercase tracking-wider">
              {formatNotificationDate(notification.createdAt)}
            </span>
            {!notification.read && (
              <>
                <span className="w-1 h-1 rounded-full bg-border" />
                <button
                  type="button"
                  onClick={() => onMarkAsRead(notification.id)}
                  className="text-xs font-bold text-primary hover:underline cursor-pointer"
                >
                  {t('markAsRead')}
                </button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
