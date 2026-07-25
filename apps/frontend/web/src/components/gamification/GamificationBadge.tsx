'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Shield, Award, Crown, Star, Swords, ArrowUp, Coins } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export type BadgeDefinition = {
  id: string;
  nameKey: string;
  descKey: string;
  icon: LucideIcon;
  tier: BadgeTier;
  targetOrders: number;
  rewardPoints: number;
};

export const BADGES: BadgeDefinition[] = [
  {
    id: 'trailblazer',
    nameKey: 'badges.trailblazer.name',
    descKey: 'badges.trailblazer.desc',
    icon: Swords,
    tier: 'bronze',
    targetOrders: 3,
    rewardPoints: 50,
  },
  {
    id: 'food-champion',
    nameKey: 'badges.foodChampion.name',
    descKey: 'badges.foodChampion.desc',
    icon: Crown,
    tier: 'gold',
    targetOrders: 5,
    rewardPoints: 120,
  },
];

const tierConfig: Record<
  BadgeTier,
  {
    bg: string;
    border: string;
    text: string;
    glow: string;
    iconColor: string;
  }
> = {
  bronze: {
    bg: 'bg-gradient-to-br from-amber-800/40 to-amber-700/20',
    border: 'border-amber-700/50',
    text: 'text-amber-700 dark:text-amber-400',
    glow: 'shadow-amber-700/30',
    iconColor: 'text-amber-700 dark:text-amber-400',
  },
  silver: {
    bg: 'bg-gradient-to-br from-slate-400/40 to-slate-300/20',
    border: 'border-slate-400/50',
    text: 'text-slate-700 dark:text-slate-300',
    glow: 'shadow-slate-400/30',
    iconColor: 'text-slate-700 dark:text-slate-300',
  },
  gold: {
    bg: 'bg-gradient-to-br from-yellow-600/40 to-amber-500/20',
    border: 'border-yellow-500/50',
    text: 'text-yellow-700 dark:text-yellow-400',
    glow: 'shadow-yellow-500/30',
    iconColor: 'text-yellow-700 dark:text-yellow-400',
  },
  platinum: {
    bg: 'bg-gradient-to-br from-cyan-400/40 to-blue-400/20',
    border: 'border-cyan-400/50',
    text: 'text-cyan-700 dark:text-cyan-300',
    glow: 'shadow-cyan-400/30',
    iconColor: 'text-cyan-700 dark:text-cyan-300',
  },
};

type Props = {
  badge: BadgeDefinition;
  earned: boolean;
  isTarget?: boolean;
  compact?: boolean;
};

export default function GamificationBadge({ badge, earned, isTarget, compact }: Props) {
  const t = useTranslations('gamification');
  const config = tierConfig[badge.tier];
  const Icon = badge.icon;

  if (compact) {
    if (isTarget) {
      return (
        <div className="relative flex items-center gap-1 rounded-lg border-2 border-dashed border-amber-500/60 bg-amber-500/10 dark:bg-amber-500/20 px-1.5 py-1">
          <Icon className="size-3 text-amber-600 dark:text-amber-400" />
          <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 whitespace-nowrap">
            +{badge.rewardPoints}
          </span>
          <span className="absolute -top-1.5 -end-1.5 flex size-3 items-center justify-center">
            <svg viewBox="0 0 12 12" fill="none" className="size-2.5 text-amber-500">
              <path d="M6 0L7.35 4.65L12 6L7.35 7.35L6 12L4.65 7.35L0 6L4.65 4.65Z" fill="currentColor"/>
            </svg>
          </span>
        </div>
      );
    }

    if (!earned) return null;

    return (
      <div
        className={cn(
          'relative flex items-center gap-1 rounded-lg border px-1.5 py-1',
          config.bg,
          config.border,
        )}>
        <Icon className={cn('size-3', config.iconColor)} />
        <span className={cn('text-[9px] font-bold whitespace-nowrap', config.text)}>
          +{badge.rewardPoints}
        </span>
        {earned && (
          <span
            className={cn(
              'absolute inset-0 rounded-lg blur-sm opacity-50 animate-badge-glow',
              config.glow,
            )}
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative flex items-center gap-3 rounded-xl border p-3 transition-all duration-500',
        earned
          ? cn(config.bg, config.border)
          : isTarget
            ? 'border-amber-500/40 bg-amber-500/5'
            : 'bg-muted/30 border-border opacity-60',
      )}>
      <div
        className={cn(
          'relative flex size-12 shrink-0 items-center justify-center rounded-xl border-2',
          earned
            ? cn(config.border, config.bg)
            : isTarget
              ? 'border-dashed border-amber-500/50 bg-amber-500/10'
              : 'border-muted-foreground/20 bg-muted/50',
        )}>
        <Icon
          className={cn(
            'size-6',
            earned
              ? config.iconColor
              : isTarget
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-muted-foreground/50',
          )}
        />

        {earned && (
          <>
            <span
              className={cn(
                'absolute inset-0 rounded-xl blur-md opacity-60 animate-badge-glow',
                config.glow,
              )}
            />
            <span
              className={cn(
                'absolute -top-1 -end-1 flex size-4 items-center justify-center rounded-full bg-green-500',
              )}>
              <Award className="size-3 text-white" />
            </span>
          </>
        )}

        {isTarget && (
          <div className="absolute -top-2 -end-2 flex items-center gap-0.5 rounded-full border border-amber-500/30 bg-amber-500/20 px-1.5 py-0.5">
            <ArrowUp className="size-2.5 text-amber-600 dark:text-amber-400" />
            <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 leading-none">{t('nextBadgeLabel')}</span>
          </div>
        )}

        {!earned && !isTarget && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/40 backdrop-blur-[1px]">
            <LockIcon className="size-4 text-muted-foreground/60" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'text-sm font-bold',
            earned ? config.text : isTarget ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground',
          )}>
          {t(badge.nameKey, { count: badge.targetOrders })}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {t(badge.descKey, { count: badge.targetOrders })}
        </p>

        <div className="mt-1.5 flex items-center gap-1 rounded-md bg-amber-500/10 px-1.5 py-0.5 w-fit">
          <Coins className={cn('size-3.5', earned || isTarget ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground/50')} />
          <span className={cn(
            'text-xs font-bold',
            earned || isTarget ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground/50',
          )}>
            {t('earnedPoints', { count: badge.rewardPoints })}
          </span>
        </div>
      </div>
    </div>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
