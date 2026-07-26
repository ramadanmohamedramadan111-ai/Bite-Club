import { getTranslations } from 'next-intl/server';
import { Coins, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppPagination from '@/components/shared/AppPagination';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ApiResponse, PaginatedResponse } from '@/types/api/api-response';
import { WalletHistory } from '@/types/points/points';
import { buildQueryString } from '@/utils/api-helpers';
import { serverFetch } from '@/utils/server-fetch';
import { cn } from '@/lib/utils';

type PageProps = {
  searchParams: Promise<{ page?: string; per_page?: string }>;
};

const sourceMeta: Record<
  WalletHistory['source'],
  { icon: string; labelKey: string }
> = {
  referral: { icon: '👥', labelKey: 'sourceReferral' },
  redemption: { icon: '🛍️', labelKey: 'sourceRedemption' },
  leaderboard: { icon: '🏆', labelKey: 'sourceLeaderboard' },
  weekly_streak: { icon: '🔥', labelKey: 'sourceWeeklyStreak' },
  gift: { icon: '🎁', labelKey: 'sourceGift' },
};

export default async function HistoryPage({ searchParams }: PageProps) {
  const t = await getTranslations('points');
  const params = await searchParams;
  const page = params.page ? parseInt(params.page) : 1;
  const per_page = params.per_page ? parseInt(params.per_page) : 10;
  const query = buildQueryString({ page, per_page });

  const res = await serverFetch<ApiResponse<PaginatedResponse<WalletHistory>>>(
    `/wallet/transactions?${query}`,
    'GET',
  );

  const { items, meta } = res.data;

  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
          <Coins className="size-10 text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">{t('historyEmpty')}</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {items.map((tx) => {
              const meta = sourceMeta[tx.source];
              const isEarn = tx.type === 'earn';
              return (
                <Card key={tx.id}>
                  <CardContent className="flex items-center gap-4 p-4">
                    <Avatar className="size-10 shrink-0">
                      <AvatarFallback
                        className={cn(
                          isEarn
                            ? 'bg-green-500/15 text-green-600'
                            : 'bg-red-500/15 text-red-600',
                        )}>
                        {meta.icon}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{t(meta.labelKey)}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Calendar className="size-3" />
                        {new Date(tx.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p
                        className={cn(
                          'text-sm font-bold tabular-nums',
                          isEarn ? 'text-green-600' : 'text-red-600',
                        )}>
                        {isEarn ? '+' : ''}
                        {tx.points}
                      </p>
                      <Badge
                        variant="outline"
                        className={cn(
                          'mt-1 text-[10px] px-1.5 py-0 font-normal',
                          isEarn
                            ? 'border-green-500/20 text-green-600'
                            : 'border-red-500/20 text-red-600',
                        )}>
                        {isEarn ? t('earned') : t('redeemed')}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <AppPagination
            currentPage={meta.current_page}
            totalPages={meta.last_page}
          />
        </>
      )}
    </div>
  );
}

