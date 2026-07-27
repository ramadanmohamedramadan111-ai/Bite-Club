'use client';

import { useEffect } from 'react';
import { useFriendsStore } from '@/stores/friends';

type Props = {
  count: number;
};

export default function FriendsInitializer({ count }: Props) {
  const setCount = useFriendsStore((state) => state.setCount);

  useEffect(() => {
    setCount(count);
  }, [count, setCount]);

  return null;
}

