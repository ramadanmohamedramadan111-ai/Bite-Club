'use client';

import { useEffect } from 'react';
import { useGamificationStore } from '@/stores/gamification';
import type { WalletDetails, StreakDetails } from '@/types/points';

type Props = {
  wallet: WalletDetails | null;
  streak: StreakDetails | null;
};

export default function GamificationInitializer({ wallet, streak }: Props) {
  const setWallet = useGamificationStore((s) => s.setWallet);
  const setStreak = useGamificationStore((s) => s.setStreak);

  useEffect(() => {
    setWallet(wallet);
    setStreak(streak);
  }, [wallet, streak, setWallet, setStreak]);

  return null;
}

