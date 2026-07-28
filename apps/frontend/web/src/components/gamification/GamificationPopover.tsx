'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Coins, ArrowUp, Calendar } from 'lucide-react';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useGamificationStore } from '@/stores/gamification';
import PointsDisplay from './PointsDisplay';
import StreakProgress from './StreakProgress';
import GamificationBadge, { BADGES } from './GamificationBadge';
import { Link } from '@/i18n/navigation';

export function GamificationTrigger() {
  const wallet = useGamificationStore((s) => s.wallet);
  const streak = useGamificationStore((s) => s.streak);
  const earnedBadges = streak
    ? BADGES.filter((b) => streak.completed_orders_count >= b.targetOrders)
    : [];
  const targetBadge = streak
    ? BADGES.find((b) => streak.completed_orders_count < b.targetOrders)
    : null;

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1.5 border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 h-8 px-2.5">
      {wallet && <PointsDisplay balance={wallet.balance} compact />}
      ssssssssssssssss {streak && <StreakProgress streak={streak} compact />}
      {earnedBadges.length > 0 &&
        earnedBadges.map((badge) => (
          <GamificationBadge key={badge.id} badge={badge} earned compact />
        ))}
      {targetBadge && (
        <GamificationBadge
          badge={targetBadge}
          earned={false}
          isTarget
          compact
        />
      )}
    </Button>
  );
}

export function GamificationPanel() {
  const t = useTranslations('gamification');
  const locale = useLocale();
  const wallet = useGamificationStore((s) => s.wallet);
  const streak = useGamificationStore((s) => s.streak);

  if (!wallet && !streak) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
        <Coins className="size-8 text-muted-foreground/50 mb-2" />
        <p className="text-sm text-muted-foreground">{t('signInToTrack')}</p>
      </div>
    );
  }

  const targetBadge = streak
    ? BADGES.find((b) => streak.completed_orders_count < b.targetOrders)
    : null;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold">{t('yourRewards')}</h3>
        <span className="relative">
          <Coins className="size-4 text-amber-500" />
          <span className="absolute -inset-1.5 rounded-full bg-amber-500/20 blur-sm" />
        </span>
      </div>

      {streak?.week_start_date && (
        <DateRangeBadge startDate={streak.week_start_date} locale={locale} />
      )}

      {wallet && <PointsDisplay balance={wallet.balance} />}

      {streak && (
        <>
          <Separator />
          <StreakProgress streak={streak} />
        </>
      )}

      {streak && targetBadge && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2">
          <div className="flex items-center gap-2">
            <ArrowUp className="size-4 text-amber-400" />
            <span className="text-xs font-semibold text-amber-400">
              {t('nextTarget')}
            </span>
          </div>
          <div className="mt-2">
            <GamificationBadge badge={targetBadge} earned={false} isTarget />
          </div>
        </div>
      )}

      {streak && (
        <>
          <Separator />

          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t('allBadges')}
            </h4>

            <div className="grid gap-2">
              {BADGES.map((badge) => (
                <GamificationBadge
                  key={badge.id}
                  badge={badge}
                  earned={streak.completed_orders_count >= badge.targetOrders}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function MobileGamificationButton() {
  const wallet = useGamificationStore((s) => s.wallet);

  return (
    <div className="flex items-center gap-1">
      {wallet && (
        <span className="text-xs font-bold tabular-nums text-amber-500">
          {wallet.balance.toLocaleString()}
        </span>
      )}
      <Coins className="size-4 text-amber-500" />
    </div>
  );
}

function DateRangeBadge({
  startDate,
  locale,
}: {
  startDate: string;
  locale: string;
}) {
  const start = new Date(startDate);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  const fmt = (d: Date) =>
    d.toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Calendar className="size-3.5 shrink-0" />
      <span>
        {fmt(start)} – {fmt(end)}
      </span>
    </div>
  );
}

export function DesktopGamificationTrigger() {
  const wallet = useGamificationStore((s) => s.wallet);
  const streak = useGamificationStore((s) => s.streak);
  const earnedBadges = streak
    ? BADGES.filter((b) => streak.completed_orders_count >= b.targetOrders)
    : [];
  const targetBadge = streak
    ? BADGES.find((b) => streak.completed_orders_count < b.targetOrders)
    : null;

  const hasContent = streak && (earnedBadges.length > 0 || targetBadge);

  return (
    <>
      {/* Points — always visible */}
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 h-8 px-2.5">
        {wallet && <PointsDisplay balance={wallet.balance} compact />}
        {!wallet && (
          <>
            <Coins className="size-4 text-amber-500" />
            <span className="text-xs font-bold text-amber-500">0</span>
          </>
        )}
      </Button>

      {/* Badges & progress — only when data exists */}
      {hasContent && (
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 h-8 px-2.5">
          {streak && <StreakProgress streak={streak} compact />}

          {earnedBadges.length > 0 &&
            earnedBadges.map((badge) => (
              <GamificationBadge key={badge.id} badge={badge} earned compact />
            ))}

          {targetBadge && (
            <GamificationBadge
              badge={targetBadge}
              earned={false}
              isTarget
              compact
            />
          )}
        </Button>
      )}
    </>
  );
}

export default function GamificationPopover() {
  const t = useTranslations('gamification');
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="flex items-center gap-2 cursor-pointer">
          <DesktopGamificationTrigger />
        </div>
      </PopoverTrigger>

      <PopoverContent
        side="bottom"
        align="end"
        className="w-80 p-0 max-h-[80vh] overflow-y-auto scrollbar-none"
        sideOffset={8}>
        <GamificationPanel />

        <div className="border-t p-3">
          <Button variant="ghost" size="sm" className="w-full text-xs" asChild>
            <Link href="/points">{t('viewAllRewards')}</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

