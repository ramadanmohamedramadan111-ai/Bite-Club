import { getTranslations } from 'next-intl/server';
import { Coins } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { serverFetch } from '@/utils/server-fetch';
import { ApiResponse } from '@/types/api/api-response';
import { WalletDetails } from '@/types/points/points';
import { getUserId } from '@/utils/api-helpers';

export default async function PointsBalanceCard() {
  const t = await getTranslations('points');
  const userId = await getUserId();
  const res = await serverFetch<ApiResponse<WalletDetails>>('/wallet', 'GET', {
    next: {
      tags: ['wallet', `wallet-${userId}`],
    },
  });

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="flex items-center gap-4 p-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Coins className="h-7 w-7 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{t('pointsBalance')}</p>
          <p className="text-3xl font-bold">
            {res.data.balance.toLocaleString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

