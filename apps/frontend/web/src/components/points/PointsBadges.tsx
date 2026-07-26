'use client';

import { Swords, Crown } from 'lucide-react';
import GamificationBadge from '@/components/gamification/GamificationBadge';
import type { BadgeDefinition } from '@/components/gamification/GamificationBadge';
import type { BadgeType } from '@/types/points/points';

const badgeDefs: Record<BadgeType, BadgeDefinition> = {
  weekly_3_orders: {
    id: 'trailblazer',
    nameKey: 'badges.trailblazer.name',
    descKey: 'badges.trailblazer.desc',
    icon: Swords,
    tier: 'bronze',
    targetOrders: 3,
    rewardPoints: 50,
  },
  weekly_5_orders: {
    id: 'food-champion',
    nameKey: 'badges.foodChampion.name',
    descKey: 'badges.foodChampion.desc',
    icon: Crown,
    tier: 'gold',
    targetOrders: 5,
    rewardPoints: 120,
  },
};

export default function PointsBadges({
  earnedBadges,
}: {
  earnedBadges: [BadgeType, number][];
}) {
  if (earnedBadges.length === 0) return null;

  return (
    <div className="flex items-center gap-3">
      {earnedBadges.map(([type, count]) => {
        const badgeDef = badgeDefs[type];
        return (
          <div key={type} className="flex flex-col items-center gap-1">
            <div className="animate-badge-glow rounded-xl">
              <GamificationBadge badge={badgeDef} earned />
            </div>
            <span className="flex size-6 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-[10px] font-black text-white shadow-lg shadow-amber-500/30">
              x{count}
            </span>
          </div>
        );
      })}
    </div>
  );
}
