'use client';

import { useMemo } from 'react';
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
        <h1 className="text-3xl font-bold">Points & Rewards</h1>
        <p className="mt-2 text-muted-foreground">
          Earn points, redeem offers, and send gifts to friends.
        </p>
      </div>

      <PointsBalanceCard />

      <PointsTabs defaultTab={defaultTab} />

      {tab === 'rewards' && (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Rewards & Gifts</h2>
            <p className="text-sm text-muted-foreground">
              Redeem points for yourself or send an offer as a gift.
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
            <h2 className="text-xl font-semibold">Active redeems</h2>
            <p className="text-sm text-muted-foreground">
              {activeRedemptions.length} active offer
              {activeRedemptions.length === 1 ? '' : 's'}
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
              <p className="text-muted-foreground">No active redeems</p>
            </div>
          )}
        </section>
      )}

      {tab === 'redeem-history' && (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Redeem history</h2>
            <p className="text-sm text-muted-foreground">
              {redeemHistory.length} total redemption
              {redeemHistory.length === 1 ? '' : 's'}
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
              <p className="text-muted-foreground">No redemption history yet</p>
            </div>
          )}
        </section>
      )}

      {tab === 'my-gifts' && (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">My gifts</h2>
            <p className="text-sm text-muted-foreground">
              Gifts you received and can still claim.
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
              <p className="text-muted-foreground">No gifts to claim</p>
            </div>
          )}
        </section>
      )}

      {tab === 'gift-history' && (
        <section className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Gift history</h2>
              <p className="text-sm text-muted-foreground">
                {giftHistory.length} gift
                {giftHistory.length === 1 ? '' : 's'}
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
              <p className="text-muted-foreground">No gifts found</p>
            </div>
          )}
        </section>
      )}

      {tab === 'referrals' && <ReferralsSection />}
    </div>
  );
}
