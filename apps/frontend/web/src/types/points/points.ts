export type RedemptionStatus = 'active' | 'used' | 'expired';

export type GiftStatus = 'available' | 'claimed' | 'expired';

export type GiftDirection = 'received' | 'sent';

export type PointsTab =
  | 'rewards'
  | 'active-redeems'
  | 'redeem-history'
  | 'my-gifts'
  | 'gift-history'
  | 'referrals';

export type GiftHistoryFilter = 'all' | 'sent' | 'received';

export type RewardDiscountType =
  | 'percent_subtotal'
  | 'free_delivery'
  | 'flat_subtotal';

export interface RewardOffer {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  discountLabel: string;
  image: string;
  validForDays: number;
  discountType: RewardDiscountType;
  discountValue: number;
  minSubtotal?: number;
}

export interface Redemption {
  id: string;
  offerId: string;
  offerTitle: string;
  pointsSpent: number;
  status: RedemptionStatus;
  redeemedAt: string;
  expiresAt: string;
  code: string;
}

export interface Gift {
  id: string;
  offerId: string;
  offerTitle: string;
  pointsCost: number;
  status: GiftStatus;
  direction: GiftDirection;
  fromUserId: string;
  fromUsername: string;
  fromName: string;
  toUserId: string;
  toUsername: string;
  toName: string;
  message?: string;
  createdAt: string;
  expiresAt: string;
}
