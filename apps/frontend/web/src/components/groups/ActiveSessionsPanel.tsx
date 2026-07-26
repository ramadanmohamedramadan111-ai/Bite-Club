'use client';

import { useTranslations } from 'next-intl';
import { ShoppingCart, Users, ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGroupOrderSessionsStore } from '@/stores/group-order-sessions';

type Props = {
  currentSessionId?: string | number;
};

export default function ActiveSessionsPanel({ currentSessionId }: Props) {
  const t = useTranslations('groups');
  const sessions = useGroupOrderSessionsStore((state) => state.sessions);
  const displayedSessions = currentSessionId
    ? sessions.filter((s) => String(s.id) !== String(currentSessionId))
    : sessions;

  if (displayedSessions.length === 0) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">{t('activeGroupOrders')}</CardTitle>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {displayedSessions.length}
        </span>
      </CardHeader>
      <CardContent className="space-y-2">
        {displayedSessions.map((session) => (
          <Link
            key={session.id}
            href={`/group-order/${session.id}`}
            className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
            <div className="flex size-9 items-center justify-center rounded-full bg-primary/10">
              <ShoppingCart className="size-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {session.restaurant_name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                <Users className="mr-1 inline size-3" />
                {session.group_name}
              </p>
            </div>
            <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
