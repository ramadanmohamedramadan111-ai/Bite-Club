'use client';

import { useFCM } from '@/hooks/use-fcm';

export default function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useFCM();

  return children;
}
