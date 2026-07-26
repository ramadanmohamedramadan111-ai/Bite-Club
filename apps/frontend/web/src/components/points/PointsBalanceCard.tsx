import { getTranslations } from 'next-intl/server';
import { Coins } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { serverFetch } from '@/utils/server-fetch';
import { ApiResponse } from '@/types/api/api-response';
import {
  StreakDetails,
  WalletDetails,
  type BadgeType,
} from '@/types/points/points';
import { getUserId } from '@/utils/api-helpers';
import PointsBadges from './PointsBadges';

export default async function PointsBalanceCard() {
  const t = await getTranslations('points');
  const userId = await getUserId();

  const [walletRes, streakRes] = await Promise.all([
    serverFetch<ApiResponse<WalletDetails>>('/wallet', 'GET', {
      next: { tags: ['wallet', `wallet-${userId}`] },
    }),
    serverFetch<ApiResponse<StreakDetails>>('/wallet/streak', 'GET', {
      next: { tags: ['streak', `streak-${userId}`] },
    }),
  ]);

  const badgeCounts: Partial<Record<BadgeType, number>> = {};
  for (const badge of streakRes.data.badges) {
    const t = badge.badge_type as BadgeType;
    badgeCounts[t] = (badgeCounts[t] || 0) + 1;
  }

  const earnedBadges = Object.entries(badgeCounts) as [BadgeType, number][];

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="flex items-center gap-4 ">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Coins className="h-7 w-7 text-primary" />
        </div>
        <div className="flex-1 py-4">
          <p className="text-sm text-muted-foreground">{t('pointsBalance')}</p>
          <p className="text-3xl font-bold">
            {walletRes.data.balance.toLocaleString()}
          </p>
        </div>
        <PointsBadges earnedBadges={earnedBadges} />
      </CardContent>
    </Card>
  );
}

