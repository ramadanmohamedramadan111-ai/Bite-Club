import ReferralLinkSection from '@/components/profile/ReferralLinkSection';
import AppPagination from '@/components/shared/AppPagination';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ApiResponse, PaginatedResponse } from '@/types/api/api-response';
import { UserMeResponse } from '@/types/auth/auth';
import { ReferralItem } from '@/types/points/points';
import { buildQueryString, getUserId } from '@/utils/api-helpers';
import { serverFetch } from '@/utils/server-fetch';
import { getTranslations } from 'next-intl/server';
import { Calendar } from 'lucide-react';

export default async function ReferralsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; per_page?: string }>;
}) {
  const t = await getTranslations('points');
  const pageParams = await searchParams;
  const page = pageParams.page ? parseInt(pageParams.page) : 1;
  const per_page = pageParams.per_page ? parseInt(pageParams.per_page) : 10;
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
            <div className="space-y-3">
              {items.map((referral) => (
                <Card key={referral.id}>
                  <CardContent className="flex items-center justify-between ">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage
                          src={
                            referral.referred_user.profile_image_url ??
                            undefined
                          }
                        />
                        <AvatarFallback>
                          {referral.referred_user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {referral.referred_user.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          @{referral.referred_user.username}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(referral.created_at).toLocaleDateString()}
                      </div>

                      <Badge
                        variant={
                          referral.status === 'completed'
                            ? 'default'
                            : 'secondary'
                        }
                        className={
                          referral.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300'
                        }>
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

