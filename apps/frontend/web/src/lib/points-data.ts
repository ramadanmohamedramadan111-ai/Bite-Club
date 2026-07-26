import type { PointsData, RewardOffer, Redemption, Gift } from '@/types/points/points';

const mockOffers: RewardOffer[] = [];

const mockRedemptions: Redemption[] = [];

const mockGifts: Gift[] = [];

export async function getPointsData(): Promise<PointsData> {
  return {
    pointsBalance: 0,
    offers: mockOffers,
    redemptions: mockRedemptions,
    gifts: mockGifts,
  };
}
