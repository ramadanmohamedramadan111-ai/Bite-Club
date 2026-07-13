import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import {
  getRewardOfferById,
  initialGifts,
  initialRedemptions,
} from '@/data/mock-rewards';
import type { Gift, Redemption } from '@/types/points/points';

type SendGiftInput = {
  offerId: string;
  toUsername: string;
  toName: string;
  toUserId: string;
  message?: string;
  fromUserId: string;
  fromUsername: string;
  fromName: string;
};

type PointsStore = {
  pointsBalance: number;
  redemptions: Redemption[];
  gifts: Gift[];

  redeemOffer: (offerId: string) => { success: boolean; error?: string };
  sendGift: (input: SendGiftInput) => { success: boolean; error?: string };
  claimGift: (giftId: string) => { success: boolean; error?: string };
  useRedemption: (redemptionId: string) => void;
};

function generateCode() {
  return `BC-RED-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result.toISOString();
}

export const usePointsStore = create<PointsStore>()(
  persist(
    (set, get) => ({
      pointsBalance: 2450,
      redemptions: initialRedemptions,
      gifts: initialGifts,

      redeemOffer: (offerId) => {
        const offer = getRewardOfferById(offerId);

        if (!offer) {
          return { success: false, error: 'Offer not found' };
        }

        const { pointsBalance } = get();

        if (pointsBalance < offer.pointsCost) {
          return { success: false, error: 'Not enough points' };
        }

        const now = new Date();
        const redemption: Redemption = {
          id: crypto.randomUUID(),
          offerId: offer.id,
          offerTitle: offer.title,
          pointsSpent: offer.pointsCost,
          status: 'active',
          redeemedAt: now.toISOString(),
          expiresAt: addDays(now, offer.validForDays),
          code: generateCode(),
        };

        set((state) => ({
          pointsBalance: state.pointsBalance - offer.pointsCost,
          redemptions: [redemption, ...state.redemptions],
        }));

        return { success: true };
      },

      sendGift: (input) => {
        const offer = getRewardOfferById(input.offerId);

        if (!offer) {
          return { success: false, error: 'Offer not found' };
        }

        const { pointsBalance } = get();

        if (pointsBalance < offer.pointsCost) {
          return { success: false, error: 'Not enough points' };
        }

        const now = new Date();
        const gift: Gift = {
          id: crypto.randomUUID(),
          offerId: offer.id,
          offerTitle: offer.title,
          pointsCost: offer.pointsCost,
          status: 'available',
          direction: 'sent',
          fromUserId: input.fromUserId,
          fromUsername: input.fromUsername,
          fromName: input.fromName,
          toUserId: input.toUserId,
          toUsername: input.toUsername,
          toName: input.toName,
          message: input.message?.trim() || undefined,
          createdAt: now.toISOString(),
          expiresAt: addDays(now, offer.validForDays),
        };

        set((state) => ({
          pointsBalance: state.pointsBalance - offer.pointsCost,
          gifts: [gift, ...state.gifts],
        }));

        return { success: true };
      },

      claimGift: (giftId) => {
        const gift = get().gifts.find((entry) => entry.id === giftId);

        if (!gift) {
          return { success: false, error: 'Gift not found' };
        }

        if (gift.status !== 'available') {
          return { success: false, error: 'Gift is no longer available' };
        }

        if (gift.direction !== 'received') {
          return { success: false, error: 'Cannot claim this gift' };
        }

        set((state) => ({
          gifts: state.gifts.map((entry) =>
            entry.id === giftId ? { ...entry, status: 'claimed' } : entry,
          ),
          redemptions: [
            {
              id: crypto.randomUUID(),
              offerId: gift.offerId,
              offerTitle: gift.offerTitle,
              pointsSpent: 0,
              status: 'active',
              redeemedAt: new Date().toISOString(),
              expiresAt: gift.expiresAt,
              code: generateCode(),
            },
            ...state.redemptions,
          ],
        }));

        return { success: true };
      },

      useRedemption: (redemptionId) => {
        set((state) => ({
          redemptions: state.redemptions.map((entry) =>
            entry.id === redemptionId && entry.status === 'active'
              ? { ...entry, status: 'used' }
              : entry,
          ),
        }));
      },
    }),
    { name: 'biteclub-points' },
  ),
);
