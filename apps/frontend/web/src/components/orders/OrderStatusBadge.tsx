'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  active: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  preparing: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  ready: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  out_for_delivery: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
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
        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
        statusStyles[status] ?? 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
        className,
      )}
    >
      {t(statusLabelKey(status))}
    </span>
  );
}
