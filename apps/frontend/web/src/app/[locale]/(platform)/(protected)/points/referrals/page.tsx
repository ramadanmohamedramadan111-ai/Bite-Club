import AppPagination from '@/components/shared/AppPagination';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ApiResponse, PaginatedResponse } from '@/types/api';
import { ReferralItem } from '@/types/points';
import { buildQueryString, getUserId } from '@/utils/api-helpers';
import { serverFetch } from '@/utils/server-fetch';
import { getTranslations } from 'next-intl/server';
import { Calendar } from 'lucide-react';
import { parseSearchParams, PaginatedParams } from '@/utils/validate-search-params';
import InvalidSearchParams from '@/components/errors/InvalidSearchParams';
import { cn } from '@/lib/utils';

export default async function ReferralsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; per_page?: string }>;
}) {
  const t = await getTranslations('points');
  const raw = await searchParams;
  const parsed = parseSearchParams(PaginatedParams, raw);
  if (!parsed.success) return <InvalidSearchParams />;
  const { page = '1', per_page = '10' } = parsed.data;
  const query = buildQueryString({ page, per_page });

  const userId = await getUserId();

  const referrals = await serverFetch<
    ApiResponse<PaginatedResponse<ReferralItem>>
  >(`/wallet/referrals?${query}`, 'GET', {
    next: {
      tags: ['referrals', `referrals-${userId}`],
    },
  });

  const { items, meta } = referrals.data;

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">{t('referredUsers')}</h2>
          <p className="text-sm text-muted-foreground">
            {t('referredUsersDesc')}
          </p>
        </div>

        {items.length === 0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
            <p className="text-muted-foreground">{t('referralNoUsers')}</p>
          </div>
        ) : (
          <>
            <div className="space-y-3.5">
              {items.map((referral) => (
                <Card key={referral.id} className="rounded-2xl border border-border/60 bg-card p-0 transition-all duration-300 shadow-3xs overflow-hidden">
                  <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <Avatar className="h-10 w-10 border border-border/30 shrink-0">
                        <AvatarImage
                          src={
                            referral.referred_user.profile_image_url ??
                            undefined
                          }
                        />
                        <AvatarFallback className="font-bold text-sm bg-muted/40">
                          {referral.referred_user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-foreground leading-tight truncate">
                          {referral.referred_user.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          @{referral.referred_user.username}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-start gap-4 border-t border-border/10 pt-3 sm:border-t-0 sm:pt-0 w-full sm:w-auto">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{new Date(referral.created_at).toLocaleDateString()}</span>
                      </div>

                      <Badge
                        variant={
                          referral.status === 'completed'
                            ? 'default'
                            : 'secondary'
                        }
                        className={cn(
                          "rounded-xl px-2.5 py-0.5 text-xs font-bold shadow-3xs border",
                          referral.status === 'completed'
                            ? 'bg-emerald-100/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                            : 'bg-amber-100/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
                        )}>
                        {referral.status === 'completed'
                          ? t('referralCompleted')
                          : t('referralPending')}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <AppPagination
              currentPage={meta.current_page}
              totalPages={meta.last_page}
            />
          </>
        )}
      </section>
    </div>
  );
}
