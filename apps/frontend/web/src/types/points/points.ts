export type PointsTab = 'history' | 'referrals';

export interface ReferralItem {
  id: number;
  referred_user: {
    id: number;
    name: string;
    username: string;
    profile_image_url: null | string;
  };
  status: 'pending' | 'completed';
  completed_at: null | string;
  created_at: string;
}

export interface WalletDetails {
  id: number;
  user_id: number;
  balance: number;
  balance_in_egp: number;
  created_at: string;
  updated_at: string;
}

export interface StreakDetails {
  week_start_date: string;
  completed_orders_count: number;
  next_tier: null | {
    target_orders: number;
    orders_needed: number;
    reward_points: number;
    badge_type: string;
  };
  badges: [];
}

export interface WalletHistory {
  id: number;
  points: number;
  type: 'earn' | 'redeem';
  source: 'referral' | 'redemption' | 'leaderboard' | 'weekly_streak' | 'gift';
  reference_id: number;
  created_at: string;
}

