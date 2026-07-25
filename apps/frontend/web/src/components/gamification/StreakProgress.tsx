'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Gift } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StreakDetails } from '@/types/points/points';

type Props = {
  streak: StreakDetails;
  compact?: boolean;
};

function progressHue(progress: number) {
  if (progress < 0.33) {
    const t = progress / 0.33;
    return Math.round(0 + t * (30 - 0));
  }
  if (progress < 0.66) {
    const t = (progress - 0.33) / 0.33;
    return Math.round(30 + t * (60 - 30));
  }
  if (progress < 1) {
    const t = (progress - 0.66) / 0.34;
    return Math.round(60 + t * (120 - 60));
  }
  return 120;
}

export default function StreakProgress({ streak, compact }: Props) {
  const t = useTranslations('gamification');
  const { completed_orders_count, next_tier } = streak;

  // 1. Safe extraction with fallback values (prevents destructuring crash)
  const target_orders = next_tier?.target_orders ?? 1;
  const orders_needed = next_tier?.orders_needed ?? 0;
  const reward_points = next_tier?.reward_points ?? 0;

  const progress = next_tier
    ? Math.min(completed_orders_count / Math.max(target_orders, 1), 1)
    : 1;

  // 2. ALL HOOKS AT THE VERY TOP (Always execute in the same order)
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setBarWidth(progress), 100);
    return () => clearTimeout(timer);
  }, [progress]);

  // 3. Early returns now safely sit AFTER all hook declarations
  if (!next_tier) {
    if (compact) {
      return (
        <div className="flex items-center gap-1.5">
          <div className="relative h-2 w-10 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400" />
          </div>
          <span className="text-[10px] font-bold text-green-500 whitespace-nowrap">
            {t('maxTier')}
          </span>
        </div>
      );
    }
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            {t('weeklyProgress')}
          </span>
          <span className="text-xs font-bold tabular-nums text-green-500">
            {t('complete')}
          </span>
        </div>
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full w-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-1000" />
          <div className="absolute inset-0 rounded-full animate-pulse bg-green-400/10" />
        </div>
        <div className="flex items-center justify-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-2">
          <StarCheck className="size-4 text-green-400" />
          <span className="text-xs font-bold text-green-400">
            {t('allBadgesEarned')}
          </span>
        </div>
      </div>
    );
  }

  // 4. Render main progress UI when next_tier exists
  const hue = progressHue(progress);
  const isTargetReached = completed_orders_count >= target_orders;

  const glowStyle = {
    boxShadow: `0 0 6px hsl(${hue}, 100%, 60%, 0.6), 0 0 12px hsl(${hue}, 100%, 60%, 0.3)`,
  };

  const fillClass = 'h-full rounded-full transition-all duration-1000 ease-out';

  const fillStyle: React.CSSProperties = {
    width: `${Math.min(barWidth * 100, 100)}%`,
    backgroundImage: `linear-gradient(90deg, hsl(${hue}, 85%, 50%), hsl(${Math.min(hue + 15, 130)}, 85%, 60%), hsl(${Math.min(hue + 30, 140)}, 85%, 70%))`,
    backgroundSize: '200% 100%',
    animation:
      barWidth > 0
        ? 'hue-pulse 6s ease-in-out infinite alternate, bar-sweep 4s ease-in-out infinite alternate'
        : 'none',
    transition: 'background-image 0.8s ease',
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="relative h-2 w-16 overflow-hidden rounded-full bg-muted">
          <div className={fillClass} style={fillStyle} />
          <div
            className={cn(
              'absolute inset-0 rounded-full border-[1px] border-muted-foreground/30',
              barWidth > 0 && 'animate-progress-glow',
            )}
            style={glowStyle}
          />
        </div>
        <span className="text-xs font-medium tabular-nums text-muted-foreground">
          {completed_orders_count}/{target_orders}
          <span className="ms-0.5">{t('orders')}</span>
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          {t('weeklyProgress')}
        </span>

        <span className="text-xs font-bold tabular-nums">
          {completed_orders_count}
          <span className="text-muted-foreground">/{target_orders}</span>
          <span className="ms-0.5 text-xs font-normal text-muted-foreground">
            {t('orders')}
          </span>
        </span>
      </div>

      <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
        <div className={fillClass} style={fillStyle} />

        <div
          className={cn(
            'absolute inset-0 rounded-full',
            barWidth > 0 && 'animate-progress-glow',
          )}
          style={{
            background: `linear-gradient(90deg, transparent ${barWidth * 100 - 8}%, hsl(${hue}, 100%, 70%, 0.4) ${barWidth * 100}%, transparent ${barWidth * 100 + 8}%)`,
          }}
        />
      </div>

      {!isTargetReached && orders_needed > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="relative">
              <Gift className="size-4 text-amber-400 animate-reward-float" />
              <span className="absolute -inset-1 rounded-full bg-amber-400/20 blur-sm" />
            </span>

            <span className="text-xs text-muted-foreground">
              {t('ordersToEarn', { count: orders_needed })}
            </span>
          </div>

          <span className="text-sm font-extrabold bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
            {t('earnedPoints', { count: reward_points })}
          </span>
        </div>
      )}

      {isTargetReached && (
        <div className="flex items-center justify-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-2">
          <StarCheck className="size-4 text-green-400" />
          <span className="text-xs font-bold text-green-400">
            {t('targetReached')}
          </span>
        </div>
      )}
    </div>
  );
}

function StarCheck({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

