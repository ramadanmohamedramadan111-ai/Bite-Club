'use client';

import { useEffect } from 'react';

import { useSessionStore } from '@/stores/session';

export default function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const initializeSession = useSessionStore((state) => state.initializeSession);

  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  return <>{children}</>;
}

