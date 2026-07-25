import { create } from 'zustand';
import type { WalletDetails, StreakDetails } from '@/types/points/points';

type GamificationStore = {
  wallet: WalletDetails | null;
  streak: StreakDetails | null;
  setWallet: (wallet: WalletDetails | null) => void;
  setStreak: (streak: StreakDetails | null) => void;
};

export const useGamificationStore = create<GamificationStore>((set) => ({
  wallet: null,
  streak: null,
  setWallet: (wallet) => set({ wallet }),
  setStreak: (streak) => set({ streak }),
}));
