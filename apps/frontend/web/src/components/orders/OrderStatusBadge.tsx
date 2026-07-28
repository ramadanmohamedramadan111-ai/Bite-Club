'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400',
  active: 'bg-sky-500/10 border-sky-500/20 text-sky-600 dark:text-sky-400',
  preparing: 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400',
  ready: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400',
  out_for_delivery: 'bg-sky-500/10 border-sky-500/20 text-sky-600 dark:text-sky-400',
  completed: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
  cancelled: 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400',
};

function statusLabelKey(status: string): string {
  const map: Record<string, string> = {
    pending: 'pending',
    active: 'active',
    preparing: 'preparing',
    ready: 'ready',
    out_for_delivery: 'outForDelivery',
    completed: 'completed',
    cancelled: 'cancelled',
  };
  return map[status] ?? status;
}

export function OrderStatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const t = useTranslations('orderStatus');

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold shadow-xs',
        statusStyles[status] ?? 'bg-muted border-border/40 text-muted-foreground',
        className,
      )}
    >
      {t(statusLabelKey(status))}
    </span>
  );
}
