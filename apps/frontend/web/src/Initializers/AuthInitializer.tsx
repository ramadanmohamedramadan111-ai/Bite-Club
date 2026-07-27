'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth';

type Props = {
  isAuthenticated: boolean;
};

export default function AuthInitializer({ isAuthenticated }: Props) {
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);

  useEffect(() => {
    setAuthenticated(isAuthenticated);
  }, [isAuthenticated, setAuthenticated]);

  return null;
}
