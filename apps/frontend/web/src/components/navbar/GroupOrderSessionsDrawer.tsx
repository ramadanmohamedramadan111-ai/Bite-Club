'use client';

import { useLocale, useTranslations } from 'next-intl';
import { getLangDir } from 'rtl-detect';
import { X, ShoppingCart, Users } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useGroupOrderSessionsStore } from '@/stores/group-order-sessions';

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function GroupOrderSessionsDrawer({ open, onClose }: Props) {
  const t = useTranslations('groups');
  const locale = useLocale();
  const direction = getLangDir(locale);
  const isRtl = direction === 'rtl';
  const sessions = useGroupOrderSessionsStore((state) => state.sessions);

  return (
    <aside
      className={`
        fixed top-[64px] z-50
        ${isRtl ? 'left-0' : 'right-0'}
        flex h-[calc(100vh-64px)] w-[320px] sm:w-[400px] flex-col
        ${isRtl ? 'border-r' : 'border-l'} border-border
        bg-background text-foreground
        shadow-xl
        transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : isRtl ? '-translate-x-full' : 'translate-x-full'}
      `}>
      <div className="flex shrink-0 items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-3">
          <ShoppingCart className="size-5" />
          <div>
            <h2>{t('activeGroupOrders')}</h2>
            <p className="text-xs text-muted-foreground">
            {t('noActiveGroupOrders')}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="rounded-md p-2 hover:bg-accent hover:text-accent-foreground">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {sessions.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            {t('activeGroupOrdersDesc')}
          </p>
        ) : (
          <div className="space-y-2">
            {sessions.map((session) => (
              <Link
                key={session.id}
                href={`/group-order/${session.id}`}
                onClick={onClose}
                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
                <div className="flex size-9 items-center justify-center rounded-full bg-primary/10">
                  <Users className="size-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {session.restaurant_name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {session.group_name}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
