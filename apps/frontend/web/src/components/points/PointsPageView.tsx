'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';

import { rewardOffers } from '@/lib/const-data';
import type { GiftHistoryFilter, PointsTab } from '@/types/points/points';
import { usePointsStore } from '@/lib/const-data';
import PointsBalanceCard from './PointsBalanceCard';
import PointsTabs from './PointsTabs';
import RewardOfferCard from './RewardOfferCard';
import RedemptionCard from './RedemptionCard';
import GiftCard from './GiftCard';
import PointsPagination from './PointsPagination';
import GiftHistoryFilters from './GiftHistoryFilters';
import ReferralsSection from './ReferralsSection';
import { paginateItems } from './points-utils';

const HISTORY_PER_PAGE = 5;

type Props = {
  defaultTab?: PointsTab;
};

export default function PointsPageView({ defaultTab = 'rewards' }: Props) {
  const t = useTranslations('points');
  const searchParams = useSearchParams();
  const tab = (searchParams.get('tab') ?? defaultTab) as PointsTab;
  const giftFilter = (searchParams.get('giftFilter') ??
    'all') as GiftHistoryFilter;
  const currentPage = Math.max(1, Number(searchParams.get('page') ?? '1'));

  const redemptions = usePointsStore((state) => state.redemptions);
  const gifts = usePointsStore((state) => state.gifts);

  const activeRedemptions = useMemo(
    () =>
      redemptions
        .filter((entry) => entry.status === 'active')
        .sort(
          (a, b) =>
            new Date(b.redeemedAt).getTime() - new Date(a.redeemedAt).getTime(),
        ),
    [redemptions],
  );

  const redeemHistory = useMemo(
    () =>
      [...redemptions].sort(
        (a, b) =>
          new Date(b.redeemedAt).getTime() - new Date(a.redeemedAt).getTime(),
      ),
    [redemptions],
  );

  const myGifts = useMemo(
    () =>
      gifts
        .filter(
          (gift) => gift.direction === 'received' && gift.status === 'available',
        )
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
    [gifts],
  );

  const giftHistory = useMemo(() => {
    const sorted = [...gifts].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    if (giftFilter === 'sent') {
      return sorted.filter((gift) => gift.direction === 'sent');
    }

    if (giftFilter === 'received') {
      return sorted.filter((gift) => gift.direction === 'received');
    }

    return sorted;
  }, [gifts, giftFilter]);

  const paginatedRedeemHistory = paginateItems(
    redeemHistory,
    currentPage,
    HISTORY_PER_PAGE,
  );
  const paginatedGiftHistory = paginateItems(
    giftHistory,
    currentPage,
    HISTORY_PER_PAGE,
  );

  return (
    <div className="container mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="mt-2 text-muted-foreground">
          {t('subtitle')}
        </p>
      </div>

      <PointsBalanceCard />

      <PointsTabs defaultTab={defaultTab} />

      {tab === 'rewards' && (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">{t('rewardsGifts')}</h2>
            <p className="text-sm text-muted-foreground">
              {t('rewardsGiftsDesc')}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {rewardOffers.map((offer) => (
              <RewardOfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        </section>
      )}

      {tab === 'active-redeems' && (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">{t('activeRedeems')}</h2>
            <p className="text-sm text-muted-foreground">
              {activeRedemptions.length} {activeRedemptions.length === 1 ? t('activeOffer') : t('activeOffers')}
            </p>
          </div>
          {activeRedemptions.length > 0 ? (
            <div className="space-y-3">
              {activeRedemptions.map((redemption) => (
                <RedemptionCard
                  key={redemption.id}
                  redemption={redemption}
                  showUseAction
                />
              ))}
            </div>
          ) : (
            <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
              <p className="text-muted-foreground">{t('noActiveRedeems')}</p>
            </div>
          )}
        </section>
      )}

      {tab === 'redeem-history' && (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">{t('redeemHistory')}</h2>
            <p className="text-sm text-muted-foreground">
              {redeemHistory.length} {redeemHistory.length === 1 ? t('redeemCount') : t('redeemCounts')}
            </p>
          </div>
          {paginatedRedeemHistory.items.length > 0 ? (
            <>
              <div className="space-y-3">
                {paginatedRedeemHistory.items.map((redemption) => (
                  <RedemptionCard key={redemption.id} redemption={redemption} />
                ))}
              </div>
              <PointsPagination
                currentPage={paginatedRedeemHistory.safePage}
                totalPages={paginatedRedeemHistory.totalPages}
              />
            </>
          ) : (
            <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
              <p className="text-muted-foreground">{t('noRedeemHistory')}</p>
            </div>
          )}
        </section>
      )}

      {tab === 'my-gifts' && (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">{t('myGifts')}</h2>
            <p className="text-sm text-muted-foreground">
              {t('myGiftsDesc')}
            </p>
          </div>
          {myGifts.length > 0 ? (
            <div className="space-y-3">
              {myGifts.map((gift) => (
                <GiftCard key={gift.id} gift={gift} showClaimAction />
              ))}
            </div>
          ) : (
            <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
              <p className="text-muted-foreground">{t('noGiftsToClaim')}</p>
            </div>
          )}
        </section>
      )}

      {tab === 'gift-history' && (
        <section className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">{t('giftHistory')}</h2>
              <p className="text-sm text-muted-foreground">
                {giftHistory.length} {giftHistory.length === 1 ? t('giftItem') : t('giftItems')}
              </p>
            </div>
            <GiftHistoryFilters />
          </div>
          {paginatedGiftHistory.items.length > 0 ? (
            <>
              <div className="space-y-3">
                {paginatedGiftHistory.items.map((gift) => (
                  <GiftCard key={gift.id} gift={gift} />
                ))}
              </div>
              <PointsPagination
                currentPage={paginatedGiftHistory.safePage}
                totalPages={paginatedGiftHistory.totalPages}
              />
            </>
          ) : (
            <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
              <p className="text-muted-foreground">{t('noGiftsHistory')}</p>
            </div>
          )}
        </section>
      )}

      {tab === 'referrals' && <ReferralsSection />}
    </div>
  );
}
