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
    <Card className="border-emerald-500/20 bg-emerald-500/5 shadow-[0_4px_20px_rgba(16,185,129,0.02)]">
      <CardHeader className="flex flex-row items-center justify-between border-b border-emerald-500/10 pb-4">
        <div className="flex items-center gap-2">
          {/* Glowing Green Pulse Dot */}
          <span className="relative flex h-2 w-2 mr-0.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <CardTitle className="text-base font-bold text-emerald-800 dark:text-emerald-300">
            {t('activeGroupOrders')}
          </CardTitle>
        </div>
        <span className="rounded-full bg-emerald-500/15 border border-emerald-500/25 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
          {displayedSessions.length}
        </span>
      </CardHeader>
      
      <CardContent className="pt-4 space-y-2.5">
        {displayedSessions.map((session) => (
          <Link
            key={session.id}
            href={`/group-order/${session.id}`}
            className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-background/80 hover:bg-background p-3.5 transition-all duration-300 shadow-xs hover:shadow-sm hover:border-emerald-500/40 group cursor-pointer"
          >
            <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
              <ShoppingCart className="size-4.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {session.restaurant_name}
              </p>
              <p className="truncate text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                <Users className="inline size-3.5" />
                <span>{session.group_name}</span>
              </p>
            </div>
            <ArrowRight className="size-4.5 shrink-0 text-muted-foreground/80 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
